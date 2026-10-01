/* ==========================================================================
   CXPulse AI Response Composer Module
   Dynamic AI tone adjustment, live edits, working action triggers
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

  setTone(tone) {
    this.activeTone = tone;
    const textarea = document.getElementById('composer-text-input');
    if (!textarea || !this.currentCustomer) return;

    const suggested = this.currentCustomer.suggestedResponses;
    const newText = (suggested && suggested[tone]) ? suggested[tone] : suggested.default;

    // Simulate AI rapid re-generation effect
    textarea.style.opacity = '0.4';
    setTimeout(() => {
      textarea.value = newText;
      textarea.style.opacity = '1';
      CXPulseApp.showToast(`AI tone adapted: ${tone.toUpperCase()}`, 'ai');
    }, 180);

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
  },

  regenerate() {
    const textarea = document.getElementById('composer-text-input');
    if (!textarea) return;

    textarea.style.opacity = '0.3';
    CXPulseApp.showToast("Synthesizing fresh AI response with updated context...", "ai");
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

  sendResponse() {
    const textarea = document.getElementById('composer-text-input');
    if (!textarea || !this.currentCustomer) return;

    const btn = document.getElementById('btn-send-response');
    if (btn) btn.disabled = true;

    CXPulseApp.showToast(`Sending AI response to ${this.currentCustomer.email}...`, "ai");
    setTimeout(() => {
      CXPulseApp.showToast(`✓ Response sent successfully to ${this.currentCustomer.name}`, "success");
      if (btn) btn.disabled = false;
      // Close drawer after short delay
      setTimeout(() => {
        CXPulseApp.closeDrawer();
      }, 700);
    }, 600);
  },

  escalateTicket() {
    if (!this.currentCustomer) return;
    CXPulseApp.showToast(`⚡ Ticket #${this.currentCustomer.id} escalated to Executive Incident Commander`, "error");
    setTimeout(() => {
      CXPulseApp.closeDrawer();
    }, 600);
  },

  render() {
    const container = document.getElementById('composer-container');
    if (!container || !this.currentCustomer) return;

    const defaultText = this.currentCustomer.suggestedResponses?.default || "Drafting intelligent response...";

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
