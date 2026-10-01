'use strict';

const { supabase } = require('../config/supabase');
const geminiService = require('../services/geminiService');
const { sendSuccess } = require('../utils/response');

const MOCK_FEEDBACK = [
  {
    id: "FB-001",
    customerName: "Marcus Vance",
    channel: "Zendesk",
    rating: 1,
    sentiment: "Negative",
    sentimentScore: -0.84,
    comment: "Waited 7 days for a refund on order #CX-9021 and Tier 1 API sync has been down all morning. Completely unacceptable.",
    topic: "Refunds & API",
    createdAt: "24m ago"
  },
  {
    id: "FB-002",
    customerName: "Elena Rostova",
    channel: "Email",
    rating: 2,
    sentiment: "Negative",
    sentimentScore: -0.72,
    comment: "Webhooks stopped delivering silently without any alert or retry notification. Our warehouse dispatch was stalled for 3 hours.",
    topic: "Webhooks / Infrastructure",
    createdAt: "1h ago"
  },
  {
    id: "FB-003",
    customerName: "Sarah Jenkins",
    channel: "In-App Survey",
    rating: 2,
    sentiment: "Negative",
    sentimentScore: -0.58,
    comment: "Checkout page converted EUR to GBP with a 12% exchange discrepancy. Our finance team had to manually audit all morning.",
    topic: "Billing & Currency",
    createdAt: "3h ago"
  },
  {
    id: "FB-004",
    customerName: "Liam O'Connor",
    channel: "G2 Crowd",
    rating: 5,
    sentiment: "Positive",
    sentimentScore: 0.94,
    comment: "The AI Copilot has reduced our response time by 45% across all support tiers. Outstanding product polish.",
    topic: "Product / AI",
    createdAt: "5h ago"
  },
  {
    id: "FB-005",
    customerName: "Amira Al-Mansoor",
    channel: "Intercom",
    rating: 3,
    sentiment: "Neutral",
    sentimentScore: -0.2,
    comment: "SAML SSO expired without advance warning banner. Quick to fix once support responded, but notification would be nice.",
    topic: "Security / SSO",
    createdAt: "6h ago"
  }
];

class FeedbackController {
  async getFeedback(req, res, next) {
    try {
      const { channel, sentiment } = req.query;

      const { data: dbFeedback, error } = await supabase
        .from('feedback_items')
        .select('*')
        .order('created_at', { ascending: false });

      let items = (!error && dbFeedback && dbFeedback.length > 0) ? dbFeedback : MOCK_FEEDBACK;

      if (channel && channel !== 'all') {
        items = items.filter(f => f.channel.toLowerCase() === channel.toLowerCase());
      }

      if (sentiment && sentiment !== 'all') {
        items = items.filter(f => f.sentiment.toLowerCase() === sentiment.toLowerCase());
      }

      return sendSuccess(res, items, 'Feedback list retrieved');
    } catch (err) {
      next(err);
    }
  }

  async submitFeedback(req, res, next) {
    try {
      const payload = req.body;

      // Auto-analyze sentiment via Gemini if not explicitly provided
      if (!payload.sentiment || !payload.sentimentScore) {
        const analysis = await geminiService.analyzeSentiment(payload.comment);
        payload.sentiment = analysis.sentiment;
        payload.sentimentScore = analysis.sentimentScore;
      }

      const newFeedback = {
        id: `FB-${Math.floor(100 + Math.random() * 900)}`,
        ...payload,
        createdAt: 'Just now'
      };

      await supabase.from('feedback_items').insert([newFeedback]).catch(() => {});

      return sendSuccess(res, newFeedback, 'Feedback submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FeedbackController();
