/* ==========================================================================
   CXPulse AI Response Composer Module
   Dynamic AI tone adjustment via Gemini AI, live edits, working action triggers
   ========================================================================== */

const CXComposer = {
  currentCustomer: null,
  activeTone: 'default',
  drafts: {},

  init(customer) {
    this.currentCustomer = customer;
    this.activeTone = 'default';
    this.render();
  },

  async setTone(tone) {
    this.activeTone = tone;
    const textarea = document.getElementById('composer-text-input');
    if (!textarea || !this.currentCustomer) return;

    // Update tone button active states
    document.querySelectorAll('.tone-btn').forEach(b => {
      if (b.dataset.tone === tone) {
        b.style.borderColor = 'var(--primary-500)';
        b.style.color = '#FFFFFF';
        b.style.background = 'var(--bg-active)';
      } else {
        b.style.borderColor = 'var(--border-subtle)';
        b.style.color = 'var(--text-secondary)';
        b.style.background = 'transparent';
      }
    });

    // Rapid visual cue
    textarea.style.opacity = '0.4';
    CXPulseApp.showToast(`AI calibrating tone: ${tone.toUpperCase()}...`, 'ai');

    // 1. Try Live Gemini API call via Backend
    const backendText = await CX_API.regenerateResponse(this.currentCustomer.id, tone);
    if (backendText) {
      textarea.value = backendText;
      textarea.style.opacity = '1';
      CXPulseApp.showToast(`✨ Response calibrated with Gemini AI (${tone.toUpperCase()})`, 'ai');
      return;
    }

    // 2. Local heuristic fallback
    const suggested = this.currentCustomer.suggestedResponses;
    const newText = (suggested && suggested[tone]) ? suggested[tone] : (suggested?.default || `Hi ${this.currentCustomer.name.split(' ')[0]},\n\nWe are actively working on resolving this.`);

    setTimeout(() => {
      textarea.value = newText;
      textarea.style.opacity = '1';
      CXPulseApp.showToast(`AI tone adapted: ${tone.toUpperCase()}`, 'ai');
    }, 180);
  },

  async regenerate() {
    const textarea = document.getElementById('composer-text-input');
    if (!textarea || !this.currentCustomer) return;

    textarea.style.opacity = '0.3';
    CXPulseApp.showToast("Synthesizing fresh AI response with Gemini...", "ai");

    const liveText = await CX_API.regenerateResponse(this.currentCustomer.id, this.activeTone || 'default');
    if (liveText) {
      textarea.value = liveText;
      textarea.style.opacity = '1';
      CXPulseApp.showToast("✨ Fresh Gemini AI Response Synthesized", "ai");
      return;
    }

    // Heuristic fallback
    setTimeout(() => {
      const variations = [
        `Dear ${this.currentCustomer.name.split(' ')[0]},\n\nThank you for holding. I have directly bypassed standard escalation channels to resolve your issue. We have applied a complimentary service credit and dispatched a dedicated engineer to assist you immediately.\n\nWarm regards,\nAlex Morgan | Head of CX`,
        `Hi ${this.currentCustomer.name.split(' ')[0]},\n\nI want to personally ensure this is taken care of with zero delay. The refund and transaction anomalies have been submitted for priority clearance, and our engineering leadership has been notified.\n\nBest,\nAlex Morgan`
      ];
      const randomText = variations[Math.floor(Math.random() * variations.length)];
      textarea.value = randomText;
      textarea.style.opacity = '1';
      CXPulseApp.showToast("✨ AI Response Regenerated", "ai");
    }, 350);
  },

  saveDraft() {
    const textarea = document.getElementById('composer-text-input');
    if (!textarea || !this.currentCustomer) return;

    this.drafts[this.currentCustomer.id] = textarea.value;
    CXPulseApp.showToast(`Draft saved for ${this.currentCustomer.name}`, "success");
  },

  async sendResponse() {
    const textarea = document.getElementById('composer-text-input');
    if (!textarea || !this.currentCustomer) return;

    const btn = document.getElementById('btn-send-response');
    if (btn) btn.disabled = true;

    const responseText = textarea.value;
    CXPulseApp.showToast(`Dispatching AI response to ${this.currentCustomer.email}...`, "ai");

    // Send through backend API
    await CX_API.useAiResponse(this.currentCustomer.id, responseText, 'Alex Morgan');

    setTimeout(() => {
      CXPulseApp.showToast(`✓ Response dispatched to ${this.currentCustomer.name}`, "success");
      if (btn) btn.disabled = false;
      setTimeout(() => {
        CXPulseApp.closeDrawer();
      }, 700);
    }, 500);
  },

  async escalateTicket() {
    if (!this.currentCustomer) return;
    CXPulseApp.showToast(`⚡ Escalating #${this.currentCustomer.id} to Executive Commander...`, "error");

    await CX_API.escalateTicket(this.currentCustomer.id, 'Escalated by Head of CX');

    setTimeout(() => {
      CXPulseApp.showToast(`🚨 Ticket escalated to Tier-1 Executive Response`, "error");
      setTimeout(() => {
        CXPulseApp.closeDrawer();
      }, 600);
    }, 500);
  },

  render() {
    const container = document.getElementById('composer-container');
    if (!container || !this.currentCustomer) return;

    const defaultText = this.currentCustomer.suggestedResponses?.default || this.currentCustomer.ai_response || "Drafting intelligent response...";

    container.innerHTML = `
      <div class="response-composer">
        <div class="composer-header">
          <div class="composer-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            ✨ AI Suggested Response
          </div>
          <div class="tone-toggles">
            <button class="tone-btn" onclick="CXComposer.regenerate()">↻ Regenerate</button>
            <button class="tone-btn" data-tone="shorter" onclick="CXComposer.setTone('shorter')">Shorter</button>
            <button class="tone-btn" data-tone="empathetic" onclick="CXComposer.setTone('empathetic')">Empathetic</button>
            <button class="tone-btn" data-tone="professional" onclick="CXComposer.setTone('professional')">Professional</button>
          </div>
        </div>

        <textarea id="composer-text-input" class="composer-textarea">${defaultText}</textarea>

        <div class="composer-actions">
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="CXComposer.saveDraft()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Draft
            </button>
            <button class="btn btn-danger btn-sm" onclick="CXComposer.escalateTicket()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Escalate
            </button>
          </div>
          <button id="btn-send-response" class="btn btn-ai btn-sm" onclick="CXComposer.sendResponse()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Send Response
          </button>
        </div>
      </div>
    `;
  }
};
