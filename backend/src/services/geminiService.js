'use strict';

const env = require('../config/env');

/**
 * Service to interface with Google Gemini API via @google/genai or REST
 */
class GeminiService {
  constructor() {
    this.apiKey = env.geminiApiKey || process.env.GEMINI_API_KEY || '';
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey !== 'your-gemini-api-key-here');
  }

  /**
   * Helper to make a request to Gemini API (models/gemini-1.5-flash or gemini-2.0-flash)
   */
  async generateContent(prompt, systemInstruction = '') {
    if (!this.hasApiKey()) {
      return null;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn('[Gemini API Warning]:', response.status, errText);
        return null;
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.error('[Gemini Service Error]:', err.message);
      return null;
    }
  }

  /**
   * Generate contextual customer support responses tailored by tone
   */
  async generateCustomerResponse({ customerName, issue, tone = 'default', intent = '', ltv = '', riskScore = 0, customInstructions = '' }) {
    const toneInstructions = {
      default: 'Balanced, authoritative yet warm, solution-oriented executive support tone.',
      shorter: 'Ultra-concise, direct to the point, zero fluff, under 4 sentences.',
      empathetic: 'Deeply apologetic, validating the customer\'s stress, reassuring, high warmth and commitment.',
      professional: 'Formal, precise, structured, corporate SLA adherence tone.',
      firm: 'Polite but clear regarding policy boundaries while offering constructive alternatives.'
    };

    const toneDesc = toneInstructions[tone] || toneInstructions.default;

    const systemPrompt = `You are CXPulse AI, an executive-level Customer Experience Copilot.
Your job is to draft a world-class customer service response for an enterprise CX leader (Alex Morgan).
Address the customer directly, cite specific details, offer concrete resolution steps (e.g. credits, SLA escalations, direct hotfixes), and maintain the requested tone.
Tone: ${toneDesc}
Return only the email/message response body with no meta-chat.`;

    const userPrompt = `Customer: ${customerName}
Issue: ${issue}
Intent: ${intent || 'Unspecified'}
Account Value: ${ltv || 'Enterprise'}
Churn Risk Score: ${riskScore}/100
Additional instructions: ${customInstructions || 'None'}`;

    const geminiText = await this.generateContent(userPrompt, systemPrompt);

    if (geminiText) {
      return {
        tone,
        text: geminiText.trim(),
        model: 'gemini-1.5-flash',
        source: 'gemini_api'
      };
    }

    // High-fidelity fallback if API key is not yet set
    return this.getMockResponse(customerName, issue, tone, ltv);
  }

  /**
   * Analyze sentiment, emotion, and churn indicators from text
   */
  async analyzeSentiment(text, context = '') {
    const prompt = `Analyze this customer message and provide JSON output:
Message: "${text}"
Context: "${context}"

Return JSON matching this exact structure:
{
  "sentiment": "Positive" | "Neutral" | "Negative" | "Critical",
  "sentimentScore": number between -1.0 and 1.0,
  "emotion": string (e.g. "Extreme Frustration & Urgency", "Delighted", "Cautious"),
  "intent": string (e.g. "Cancel Subscription", "Feature Request", "Billing Query"),
  "riskScore": number between 0 and 100,
  "keyDrivers": [string, string],
  "recommendedAction": string
}`;

    const raw = await this.generateContent(prompt, 'You are an AI sentiment and intent classifier. Output raw JSON only.');
    if (raw) {
      try {
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        console.warn('Failed to parse Gemini JSON output, falling back');
      }
    }

    // Fallback heuristic
    const lower = text.toLowerCase();
    let sentiment = 'Neutral';
    let sentimentScore = 0.0;
    let riskScore = 25;
    let emotion = 'Inquiry';
    let intent = 'General Assistance';

    if (lower.includes('refund') || lower.includes('cancel') || lower.includes('broken') || lower.includes('terrible') || lower.includes('unacceptable') || lower.includes('offline') || lower.includes('down')) {
      sentiment = 'Critical';
      sentimentScore = -0.85;
      riskScore = 88;
      emotion = 'Extreme Frustration & Urgency';
      intent = 'Churn / Escalation Risk';
    } else if (lower.includes('delay') || lower.includes('slow') || lower.includes('issue') || lower.includes('problem') || lower.includes('fail')) {
      sentiment = 'Negative';
      sentimentScore = -0.45;
      riskScore = 65;
      emotion = 'Concerned & Impatient';
      intent = 'Technical / Billing Dispute';
    } else if (lower.includes('love') || lower.includes('great') || lower.includes('amazing') || lower.includes('thanks') || lower.includes('excellent')) {
      sentiment = 'Positive';
      sentimentScore = 0.92;
      riskScore = 5;
      emotion = 'Delighted & Satisfied';
      intent = 'Appreciation / Expansion';
    }

    return {
      sentiment,
      sentimentScore,
      emotion,
      intent,
      riskScore,
      keyDrivers: ['Automated keyword extraction', 'Syntactic sentiment evaluation'],
      recommendedAction: riskScore > 70 ? 'Immediate executive outreach and credit issue' : 'Standard SLA routing'
    };
  }

  /**
   * Summarize a customer ticket / multi-turn conversation
   */
  async summarizeTicket(conversationHistory) {
    const formatted = conversationHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `Summarize this customer support thread in 3 concise bullet points followed by the next recommended step.\n\n${formatted}`;

    const result = await this.generateContent(prompt, 'You are a CRM conversation summarization agent.');
    if (result) {
      return { summary: result.trim(), source: 'gemini' };
    }

    return {
      summary: `• Customer reported urgent friction across active services.\n• Support acknowledged SLA escalation.\n• Pending final verification from core engineering.`,
      source: 'fallback'
    };
  }

  /**
   * Realistic fallback response generator when Gemini key is offline
   */
  getMockResponse(customerName, issue, tone, ltv) {
    const firstName = customerName.split(' ')[0] || customerName;

    const templates = {
      default: `Hi ${firstName},\n\nI sincerely apologize for the disruption regarding: "${issue}". I have personally prioritized your ticket with our senior engineering team and applied a courtesy account credit to ensure zero downtime impact on your ${ltv || 'tier'}.\n\nI will monitor this case directly until full resolution.\n\nBest regards,\nAlex Morgan | Head of CX`,
      shorter: `${firstName},\n\nDeeply sorry for the issue with "${issue}". I've personally expedited your ticket to our lead engineer and applied an immediate credit to your balance.\n\nAlex Morgan`,
      empathetic: `Dear ${firstName},\n\nI completely understand how critical this is for your operations, and I am genuinely sorry for letting you down regarding "${issue}". You deserve immediate, flawless service, not delays.\n\nI have taken direct personal ownership of this issue and assigned our Senior Solutions Architect to resolve it right away.\n\nWarm regards,\nAlex Morgan`,
      professional: `${firstName},\n\nThank you for bringing the matter regarding "${issue}" to our attention. Our incident response team has initiated manual clearance today, and the case has been elevated to Tier-3 SLA support.\n\nA courtesy adjustment has been applied to your ledger.\n\nSincerely,\nAlex Morgan`,
      firm: `Dear ${firstName},\n\nThank you for following up regarding "${issue}". We have reviewed the terms of your current SLA and while standard clearance takes 48 hours, we have authorized an expedited review for your account today.\n\nBest regards,\nAlex Morgan`
    };

    return {
      tone,
      text: templates[tone] || templates.default,
      model: 'cxpulse-smart-heuristic',
      source: 'fallback'
    };
  }
}

module.exports = new GeminiService();
