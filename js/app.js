/* ==========================================================================
   CXPulse Main Application Controller
   Routes, View Management, Modals, Drawers, AI Progressive Simulation
   ========================================================================== */

const CXPulseApp = {
  currentView: 'landing', // 'landing', 'login', 'app'
  activeSubView: 'dashboard', // 'dashboard', 'customers', 'tickets', 'radar', 'insights', 'settings'
  theme: 'dark',
  activeCustomerId: null,
  isSidebarCollapsed: false,

  init() {
    this.applyTheme(this.theme);
    this.setupNavigation();
    this.setupShortcuts();
    this.setupSearch();
    this.renderCurrentView();

    // Initialize Lucide icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // ------------------------------------------------------------------------
  // Theme Management
  // ------------------------------------------------------------------------
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.theme);
    this.showToast(`Switched to ${this.theme.toUpperCase()} mode`, 'ai');
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  },

  // ------------------------------------------------------------------------
  // Navigation & View Routing
  // ------------------------------------------------------------------------
  navigateTo(view, subView = 'dashboard') {
    this.currentView = view;
    this.activeSubView = subView;
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setSubView(subView) {
    this.activeSubView = subView;
    this.renderAppContent();

    // Update active class in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.view === subView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (subView === 'radar') {
      setTimeout(() => {
        CXRadar.init('radar-main-canvas', CX_DATA.radarCustomers);
      }, 50);
    } else if (subView === 'dashboard') {
      setTimeout(() => {
        this.initDashboardCharts();
      }, 50);
    }

    if (window.lucide) window.lucide.createIcons();
  },

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
    }
  },

  // ------------------------------------------------------------------------
  // Master View Renderer
  // ------------------------------------------------------------------------
  renderCurrentView() {
    const landingEl = document.getElementById('view-landing');
    const loginEl = document.getElementById('view-login');
    const appEl = document.getElementById('view-app');

    if (!landingEl || !loginEl || !appEl) return;

    landingEl.style.display = this.currentView === 'landing' ? 'block' : 'none';
    loginEl.style.display = this.currentView === 'login' ? 'flex' : 'none';
    appEl.style.display = this.currentView === 'app' ? 'flex' : 'none';

    if (this.currentView === 'app') {
      this.renderAppContent();
      setTimeout(() => {
        if (this.activeSubView === 'dashboard') this.initDashboardCharts();
        if (this.activeSubView === 'radar') CXRadar.init('radar-main-canvas', CX_DATA.radarCustomers);
      }, 60);
    }

    if (window.lucide) window.lucide.createIcons();
  },

  // ------------------------------------------------------------------------
  // App Content Switcher
  // ------------------------------------------------------------------------
  renderAppContent() {
    const container = document.getElementById('app-main-content');
    if (!container) return;

    switch (this.activeSubView) {
      case 'dashboard':
        container.innerHTML = this.getDashboardHTML();
        break;
      case 'customers':
        container.innerHTML = this.getCustomersHTML();
        break;
      case 'tickets':
        container.innerHTML = this.getTicketsHTML();
        break;
      case 'radar':
        container.innerHTML = this.getRadarHTML();
        break;
      case 'insights':
        container.innerHTML = this.getInsightsHTML();
        break;
      case 'settings':
        container.innerHTML = this.getSettingsHTML();
        break;
      default:
        container.innerHTML = this.getDashboardHTML();
    }
  },

  // ------------------------------------------------------------------------
  // Dashboard View Generator
  // ------------------------------------------------------------------------
  getDashboardHTML() {
    const m = CX_DATA.metrics;
    const hero = CX_DATA.aiHeroInsight;

    return `
      <div class="animate-fade-in">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 24px; flex-wrap:wrap; gap:16px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
              Good morning, Alex.
            </h1>
            <p style="font-size: 14px; color: var(--text-secondary);">
              Here's what's happening across your customer experience.
            </p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span class="badge badge-ai" style="padding: 6px 12px;">
              <span class="pulse-dot ai"></span>
              Autonomous Radar: Active
            </span>
            <button class="btn btn-secondary btn-sm" onclick="CXPulseApp.triggerAIScan()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
              Run AI Scan
            </button>
            <button class="btn btn-ai btn-sm" onclick="CXPulseApp.openSimulateModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Simulate Incoming Ticket
            </button>
          </div>
        </div>

        <!-- Top Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <!-- Card 1: Total Customers -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Total Customers</span>
              <span class="metric-trend up-good">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                ${m.totalCustomers.change}
              </span>
            </div>
            <div class="metric-value-container">
              <span class="metric-value">${m.totalCustomers.value}</span>
            </div>
            <canvas id="sparkline-customers" class="sparkline-canvas"></canvas>
          </div>

          <!-- Card 2: Open Tickets -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Open Tickets</span>
              <span class="metric-trend down-good">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
                ${m.openTickets.change}
              </span>
            </div>
            <div class="metric-value-container">
              <span class="metric-value">${m.openTickets.value}</span>
            </div>
            <canvas id="sparkline-tickets" class="sparkline-canvas"></canvas>
          </div>

          <!-- Card 3: At Risk Customers -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">At Risk Customers</span>
              <span class="metric-trend up-bad">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                ${m.atRiskCustomers.change}
              </span>
            </div>
            <div class="metric-value-container">
              <span class="metric-value" style="color:#F43F5E;">${m.atRiskCustomers.value}</span>
            </div>
            <canvas id="sparkline-risk" class="sparkline-canvas"></canvas>
          </div>

          <!-- Card 4: CX Score -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">CX Score (NPS Normalized)</span>
              <span class="metric-trend up-good">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
                ${m.cxScore.change}
              </span>
            </div>
            <div class="metric-value-container">
              <span class="metric-value" style="color:#10B981;">${m.cxScore.value}</span>
              <span style="font-size:13px; color:var(--text-tertiary);">/ 100</span>
            </div>
            <canvas id="sparkline-cxscore" class="sparkline-canvas"></canvas>
          </div>
        </div>

        <!-- AI Insight Hero Card (Signature Focal Point) -->
        <div class="ai-hero-card" style="margin-bottom: 24px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
            <div>
              <div class="ai-hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
                ${hero.tag}
              </div>
              <h2 class="ai-hero-title">"${hero.title}"</h2>
            </div>
            <span class="badge ${hero.impactBadge}">Potential Impact: ${hero.impact}</span>
          </div>

          <div class="ai-hero-grid">
            <div>
              <div class="ai-hero-stat-label">AI Confidence</div>
              <div class="ai-hero-stat-value" style="color:#C084FC;">${hero.confidence}</div>
            </div>
            <div>
              <div class="ai-hero-stat-label">Affected Scope</div>
              <div class="ai-hero-stat-value">${hero.affectedCount}</div>
            </div>
            <div style="grid-column: span 2;">
              <div class="ai-hero-stat-label">Recommended Autonomous Action</div>
              <div class="ai-hero-stat-value" style="font-size:13px; font-weight:500; color:var(--text-secondary);">
                "${hero.recommendation}"
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-ai" onclick="CXPulseApp.filterAffectedCustomers()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              View affected customers
            </button>
          </div>
        </div>

        <!-- Two Column Layout: Sentiment Chart & Quick Stats -->
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
          <!-- Customer Sentiment Chart -->
          <div class="card" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <div>
                <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:2px;">
                  Customer Sentiment Trends
                </h3>
                <p style="font-size:12px; color:var(--text-tertiary);">Interactive real-time sentiment distribution over time</p>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-ghost btn-sm" onclick="CXCharts.setPeriod('24h', 'sentiment-canvas', 'sentiment-tooltip')">24h</button>
                <button class="btn btn-secondary btn-sm" onclick="CXCharts.setPeriod('7d', 'sentiment-canvas', 'sentiment-tooltip')">7d</button>
                <button class="btn btn-ghost btn-sm" onclick="CXCharts.setPeriod('30d', 'sentiment-canvas', 'sentiment-tooltip')">30d</button>
              </div>
            </div>

            <!-- Sentiment Chart Legend -->
            <div style="display:flex; gap:18px; margin-bottom:12px; font-size:12px;">
              <span style="display:flex; align-items:center; gap:6px; color:var(--positive);">
                <span style="width:8px; height:8px; border-radius:50%; background:var(--positive);"></span>
                Positive (84%)
              </span>
              <span style="display:flex; align-items:center; gap:6px; color:var(--text-tertiary);">
                <span style="width:8px; height:8px; border-radius:50%; background:var(--neutral);"></span>
                Neutral (10%)
              </span>
              <span style="display:flex; align-items:center; gap:6px; color:var(--negative);">
                <span style="width:8px; height:8px; border-radius:50%; background:var(--negative);"></span>
                Negative (6%)
              </span>
            </div>

            <div style="position:relative; width:100%; height:240px;">
              <canvas id="sentiment-canvas" style="width:100%; height:100%; display:block;"></canvas>
              <div id="sentiment-tooltip" style="position:fixed; display:none; background:rgba(15,23,42,0.95); border:1px solid var(--border-card); border-radius:8px; padding:10px 14px; font-size:12px; pointer-events:none; z-index:100; box-shadow:0 10px 25px rgba(0,0,0,0.5);"></div>
            </div>
          </div>

          <!-- Mini Intelligence Widget -->
          <div class="card" style="padding: 20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
              <span style="font-size:14px; font-weight:700; color:var(--text-primary);">Autonomous Actions Today</span>
              <span class="badge badge-ai" style="margin-left:auto;">Live Feed</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px; font-size:12px;">
              <div style="padding:10px 12px; background:rgba(255,255,255,0.02); border-left:3px solid var(--positive); border-radius:var(--radius-xs);">
                <div style="font-weight:600; color:var(--text-primary); margin-bottom:2px;">Proactively Re-routed 42 Tickets</div>
                <div style="color:var(--text-tertiary);">Directly assigned to Tier-3 infrastructure engineers based on error codes.</div>
              </div>
              <div style="padding:10px 12px; background:rgba(255,255,255,0.02); border-left:3px solid #8B5CF6; border-radius:var(--radius-xs);">
                <div style="font-weight:600; color:var(--text-primary); margin-bottom:2px;">Generated 18 Courtesy Credits</div>
                <div style="color:var(--text-tertiary);">Averaged $120/account to prevent churn on delayed logistics shipments.</div>
              </div>
              <div style="padding:10px 12px; background:rgba(255,255,255,0.02); border-left:3px solid var(--warning); border-radius:var(--radius-xs);">
                <div style="font-weight:600; color:var(--text-primary); margin-bottom:2px;">SLA Breach Pre-Warning</div>
                <div style="color:var(--text-tertiary);">Flagged 3 accounts approaching 1-hour resolution window.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Priority Queue ("Needs attention") -->
        <div class="card" style="overflow:hidden;">
          <div class="card-header">
            <div>
              <div class="card-title">
                <span class="pulse-dot critical"></span>
                Needs Attention — High Priority Queue
              </div>
              <div style="font-size:12px; color:var(--text-tertiary); margin-top:2px;">
                5 customer accounts flagged with high churn probability and urgent resolution needs. Click row to inspect AI analysis.
              </div>
            </div>
            <span class="badge badge-critical">5 Accounts Escalated</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="priority-queue-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Issue Summary</th>
                  <th>Sentiment</th>
                  <th>Priority</th>
                  <th>Time Waiting</th>
                  <th>AI Recommended Action</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${CX_DATA.priorityQueue.map(item => `
                  <tr class="clickable-row" onclick="CXPulseApp.openCustomerDetail('${item.id}')">
                    <td>
                      <div class="user-cell">
                        <div class="avatar" style="background:${item.avatarBg};">${item.avatar}</div>
                        <div>
                          <div class="user-meta-name">${item.name}</div>
                          <div class="user-meta-email">${item.company}</div>
                        </div>
                      </div>
                    </td>
                    <td style="max-width:240px; font-weight:500; color:var(--text-primary);">
                      ${item.issue}
                    </td>
                    <td>
                      <span class="badge ${item.sentiment === 'Negative' ? 'badge-negative' : item.sentiment === 'Positive' ? 'badge-positive' : 'badge-neutral'}">
                        ${item.sentiment}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${item.priority.includes('Critical') ? 'badge-critical' : 'badge-warning'}">
                        ${item.priority}
                      </span>
                    </td>
                    <td style="font-family:var(--font-mono); font-size:12px;">${item.waitingTime}</td>
                    <td style="font-size:12px; color:#C084FC;">
                      ✨ ${item.aiRecommendation}
                    </td>
                    <td style="text-align:right;">
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); CXPulseApp.openCustomerDetail('${item.id}')">
                        Inspect
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ------------------------------------------------------------------------
  // Customers Directory View
  // ------------------------------------------------------------------------
  getCustomersHTML() {
    return `
      <div class="animate-fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
              Customer Directory & Health Scores
            </h1>
            <p style="font-size: 14px; color: var(--text-secondary);">
              Monitor accounts by churn risk, lifetime ARR, and real-time sentiment telemetry.
            </p>
          </div>
          <div style="display:flex; gap:10px;">
            <input type="text" id="cust-filter-search" placeholder="Search customer or company..." class="form-input" style="width:240px;" oninput="CXPulseApp.filterCustomersTable(this.value)">
            <select class="form-input" style="width:160px;" onchange="CXPulseApp.filterCustomersBySegment(this.value)">
              <option value="All">All Health Segments</option>
              <option value="Critical">Critical Risk</option>
              <option value="At Risk">At Risk</option>
              <option value="Satisfied">Satisfied</option>
              <option value="Happy">Happy</option>
            </select>
          </div>
        </div>

        <div class="card" style="overflow:hidden;">
          <table class="priority-queue-table" id="customers-master-table">
            <thead>
              <tr>
                <th>Customer / Account</th>
                <th>Health Segment</th>
                <th>Sentiment Score</th>
                <th>Churn Risk</th>
                <th>Lifetime ARR</th>
                <th>Open Issues</th>
                <th style="text-align:right;">Inspect</th>
              </tr>
            </thead>
            <tbody>
              ${CX_DATA.radarCustomers.map(c => `
                <tr class="clickable-row" onclick="CXPulseApp.openCustomerDetail('${c.id}')">
                  <td>
                    <div class="user-cell">
                      <div class="avatar">${c.name.split(' ').map(n=>n[0]).join('')}</div>
                      <div>
                        <div class="user-meta-name">${c.name}</div>
                        <div class="user-meta-email">${c.company}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${c.segment === 'Critical' ? 'badge-critical' : c.segment === 'At Risk' ? 'badge-warning' : 'badge-positive'}">
                      ${c.segment}
                    </span>
                  </td>
                  <td style="font-family:var(--font-mono); font-size:12px; font-weight:600; color:${c.sentiment < 0 ? '#F43F5E' : '#10B981'};">
                    ${c.sentiment > 0 ? '+' : ''}${c.sentiment.toFixed(2)}
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="flex:1; width:80px; height:6px; background:rgba(255,255,255,0.08); border-radius:99px; overflow:hidden;">
                        <div style="height:100%; width:${c.risk}%; background:${c.risk >= 80 ? '#E11D48' : c.risk >= 60 ? '#F59E0B' : '#10B981'};"></div>
                      </div>
                      <span style="font-family:var(--font-mono); font-size:12px; font-weight:700;">${c.risk}%</span>
                    </div>
                  </td>
                  <td style="font-family:var(--font-mono); font-weight:600; color:var(--text-primary);">$${c.value.toLocaleString()}</td>
                  <td><b>${c.tickets}</b> active</td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); CXPulseApp.openCustomerDetail('${c.id}')">
                      View Profile
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ------------------------------------------------------------------------
  // Tickets View
  // ------------------------------------------------------------------------
  getTicketsHTML() {
    return `
      <div class="animate-fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
              Intelligent Ticket Operations
            </h1>
            <p style="font-size: 14px; color: var(--text-secondary);">
              AI-triaged customer requests with autonomous sentiment extraction and routing.
            </p>
          </div>
          <button class="btn btn-ai" onclick="CXPulseApp.openSimulateModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Simulate Live Incoming Conversation
          </button>
        </div>

        <div class="card" style="overflow:hidden;">
          <div class="card-header">
            <div class="card-title">Live Active Inquiries</div>
            <span class="badge badge-ai">Auto-Triaged by CX-Neural</span>
          </div>

          <table class="priority-queue-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Requester</th>
                <th>Subject & Channel</th>
                <th>AI Emotion Analysis</th>
                <th>Priority</th>
                <th>Status</th>
                <th style="text-align:right;">Execute</th>
              </tr>
            </thead>
            <tbody>
              ${CX_DATA.priorityQueue.map((item, idx) => `
                <tr class="clickable-row" onclick="CXPulseApp.openCustomerDetail('${item.id}')">
                  <td style="font-family:var(--font-mono); font-weight:600; color:#818CF8;">#TKT-${9020 + idx}</td>
                  <td>
                    <div style="font-weight:600; color:var(--text-primary);">${item.name}</div>
                    <div style="font-size:11px; color:var(--text-tertiary);">${item.company}</div>
                  </td>
                  <td>
                    <div style="font-weight:500; color:var(--text-primary);">${item.issue}</div>
                    <div style="font-size:11px; color:var(--text-tertiary);">Channel: Enterprise Email & API Webhook</div>
                  </td>
                  <td>
                    <span class="badge badge-ai">${item.emotion}</span>
                  </td>
                  <td>
                    <span class="badge ${item.priority.includes('Critical') ? 'badge-critical' : 'badge-warning'}">${item.priority}</span>
                  </td>
                  <td>
                    <span class="badge badge-neutral"><span class="pulse-dot online"></span> In Progress</span>
                  </td>
                  <td style="text-align:right;">
                    <button class="btn btn-ai btn-sm" onclick="event.stopPropagation(); CXPulseApp.openCustomerDetail('${item.id}')">
                      AI Assist
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ------------------------------------------------------------------------
  // Signature CX Radar View
  // ------------------------------------------------------------------------
  getRadarHTML() {
    return `
      <div class="animate-fade-in">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
                CX Radar™ — Customer Experience Orbital Map
              </h1>
              <span class="badge badge-ai">Signature Hackathon Feature</span>
            </div>
            <p style="font-size: 14px; color: var(--text-secondary);">
              Autonomous multi-dimensional customer health topology mapping Sentiment (Angle) against Churn Risk (Radius).
            </p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="CXRadar.resetFilters()">
              Reset Radar
            </button>
          </div>
        </div>

        <!-- Radar Canvas Container -->
        <div class="radar-container" style="margin-bottom: 24px;">
          <!-- Segment Tabs Overlay -->
          <div class="radar-segments-legend">
            <span class="radar-segment-tag active" data-segment="All" onclick="CXPulseApp.selectRadarSegment(this, 'All')">
              All Accounts
            </span>
            <span class="radar-segment-tag" data-segment="Happy" onclick="CXPulseApp.selectRadarSegment(this, 'Happy')">
              <span style="width:8px; height:8px; border-radius:50%; background:#10B981;"></span>
              Happy
            </span>
            <span class="radar-segment-tag" data-segment="Satisfied" onclick="CXPulseApp.selectRadarSegment(this, 'Satisfied')">
              <span style="width:8px; height:8px; border-radius:50%; background:#06B6D4;"></span>
              Satisfied
            </span>
            <span class="radar-segment-tag" data-segment="Neutral" onclick="CXPulseApp.selectRadarSegment(this, 'Neutral')">
              <span style="width:8px; height:8px; border-radius:50%; background:#64748B;"></span>
              Neutral
            </span>
            <span class="radar-segment-tag" data-segment="At Risk" onclick="CXPulseApp.selectRadarSegment(this, 'At Risk')">
              <span style="width:8px; height:8px; border-radius:50%; background:#F59E0B;"></span>
              At Risk
            </span>
            <span class="radar-segment-tag" data-segment="Critical" onclick="CXPulseApp.selectRadarSegment(this, 'Critical')">
              <span style="width:8px; height:8px; border-radius:50%; background:#E11D48;"></span>
              Critical
            </span>
          </div>

          <canvas id="radar-main-canvas" class="radar-canvas"></canvas>

          <!-- Interactive Tooltip Overlay -->
          <div id="radar-tooltip" style="position:fixed; display:none; background:rgba(10,14,26,0.95); backdrop-filter:blur(16px); border:1px solid rgba(139,92,246,0.4); border-radius:var(--radius-md); padding:14px 18px; pointer-events:none; z-index:1200; box-shadow:0 15px 40px rgba(0,0,0,0.8);"></div>

          <!-- Bottom Control Bar inside Radar -->
          <div class="radar-stats-overlay">
            <div style="display:flex; align-items:center; gap:16px;">
              <span style="font-size:12px; color:var(--text-tertiary); font-weight:600; text-transform:uppercase;">Radar Filters:</span>
              
              <select class="form-input" style="padding:4px 8px; font-size:12px; width:130px;" onchange="CXRadar.setFilter('sentiment', this.value)">
                <option value="all">Sentiment: All</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>

              <select class="form-input" style="padding:4px 8px; font-size:12px; width:130px;" onchange="CXRadar.setFilter('risk', this.value)">
                <option value="all">Risk: All</option>
                <option value="critical">Critical (80%+)</option>
                <option value="at-risk">At Risk (60-80%)</option>
                <option value="low">Healthy (<60%)</option>
              </select>

              <select class="form-input" style="padding:4px 8px; font-size:12px; width:130px;" onchange="CXRadar.setFilter('value', this.value)">
                <option value="all">ARR Value: All</option>
                <option value="enterprise">Enterprise ($50k+)</option>
                <option value="mid">Mid-Market ($25k-$50k)</option>
                <option value="smb">SMB (<$25k)</option>
              </select>

              <select class="form-input" style="padding:4px 8px; font-size:12px; width:130px;" onchange="CXRadar.setFilter('ticketCount', this.value)">
                <option value="all">Tickets: All</option>
                <option value="0">0 Tickets</option>
                <option value="1-2">1 - 2 Tickets</option>
                <option value="3+">3+ Tickets</option>
              </select>
            </div>

            <div style="font-size:12px; color:var(--text-secondary);">
              <span class="pulse-dot ai"></span> Real-time Orbital Mesh
            </div>
          </div>
        </div>

        <!-- Matched Customer Cards under Radar -->
        <div id="radar-matched-customers"></div>
      </div>
    `;
  },

  selectRadarSegment(el, segment) {
    document.querySelectorAll('.radar-segment-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    CXRadar.setSegment(segment);
  },

  // ------------------------------------------------------------------------
  // Executive AI Insights Page
  // ------------------------------------------------------------------------
  getInsightsHTML() {
    return `
      <div class="animate-fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
              AI Customer Intelligence
            </h1>
            <p style="font-size: 14px; color: var(--text-secondary);">
              Executive intelligence synthesis across conversations, delivery signals, and retention dynamics.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="CXPulseApp.showToast('Executive Intelligence PDF exported', 'success')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Briefing
          </button>
        </div>

        <!-- Metric Highlights Banner -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:24px;">
          <div class="card" style="padding:18px;">
            <div style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); font-weight:600; margin-bottom:4px;">Active Anomalies</div>
            <div style="font-size:24px; font-weight:800; color:#F43F5E;">3 Detected</div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">1 High Severity | 2 Medium</div>
          </div>
          <div class="card" style="padding:18px;">
            <div style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); font-weight:600; margin-bottom:4px;">ARR Protected by AI</div>
            <div style="font-size:24px; font-weight:800; color:#10B981;">$380,000</div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Through proactive courtesy resolution</div>
          </div>
          <div class="card" style="padding:18px;">
            <div style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); font-weight:600; margin-bottom:4px;">Autonomous Auto-Resolve</div>
            <div style="font-size:24px; font-weight:800; color:#C084FC;">74.2%</div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Low-risk routine inquiries resolved</div>
          </div>
        </div>

        <!-- Intelligence Cards Stream -->
        <div style="display:flex; flex-direction:column; gap:18px; margin-bottom:28px;">
          ${CX_DATA.insights.map(item => `
            <div class="card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span class="badge ${item.badgeClass}">${item.type}</span>
                <span style="font-size:12px; color:var(--text-tertiary);">Confidence: <b style="color:#C084FC;">${item.confidence}</b></span>
              </div>
              <h3 style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">
                ${item.title}
              </h3>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:12px 16px; margin:14px 0;">
                <div>
                  <div style="font-size:11px; color:var(--text-tertiary); text-transform:uppercase;">Affected Scope</div>
                  <div style="font-size:13px; font-weight:600; color:var(--text-primary);">${item.affectedCustomers} Customers</div>
                </div>
                <div>
                  <div style="font-size:11px; color:var(--text-tertiary); text-transform:uppercase;">Revenue Impact</div>
                  <div style="font-size:13px; font-weight:600; color:#FDA4AF;">${item.impact}</div>
                </div>
                <div>
                  <div style="font-size:11px; color:var(--text-tertiary); text-transform:uppercase;">Root Cause</div>
                  <div style="font-size:13px; color:var(--text-secondary);">${item.rootCause}</div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; flex-wrap:wrap; gap:12px;">
                <div style="font-size:13px; color:var(--text-secondary); max-width:650px;">
                  <b>AI Recommendation:</b> ${item.recommendation}
                </div>
                <button class="btn btn-ai btn-sm" onclick="CXPulseApp.showToast('Initiating: ${item.cta}', 'ai')">
                  ${item.cta} →
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Top Customer Complaints Breakdown -->
        <div class="card" style="padding:24px;">
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:16px;">
            Top Customer Complaints Breakdown
          </h3>
          <div style="display:flex; flex-direction:column; gap:14px;">
            ${CX_DATA.topComplaints.map(c => `
              <div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
                  <span style="font-weight:600; color:var(--text-primary);">${c.category}</span>
                  <span style="color:var(--text-secondary);"><b>${c.count} complaints</b> (${c.percentage}%) <span style="color:${c.trend.startsWith('+') ? '#F43F5E' : '#10B981'};">${c.trend}</span></span>
                </div>
                <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden;">
                  <div style="height:100%; width:${c.percentage}%; background:linear-gradient(90deg, #6366F1, #8B5CF6);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ------------------------------------------------------------------------
  // Settings View
  // ------------------------------------------------------------------------
  getSettingsHTML() {
    return `
      <div class="animate-fade-in" style="max-width:800px;">
        <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
          Platform & AI Model Settings
        </h1>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom:24px;">
          Configure autonomous sensitivity, webhooks, and executive alert thresholds.
        </p>

        <div class="card" style="padding:24px; margin-bottom:20px;">
          <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:16px;">AI Engine Configuration</h3>
          <div class="form-group">
            <label class="form-label">Active Neural Intelligence Model</label>
            <select class="form-input">
              <option selected>CX-Neural Pro v4.2 (Fine-tuned Customer Retention LLM)</option>
              <option>Claude 3.5 Sonnet Integration</option>
              <option>GPT-4o Enterprise Gateway</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Churn Risk Detection Sensitivity</label>
            <input type="range" min="1" max="100" value="78" style="width:100%; accent-color:#6366F1;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-tertiary); margin-top:4px;">
              <span>Conservative</span>
              <span>Balanced (Default 78%)</span>
              <span>Aggressive</span>
            </div>
          </div>
        </div>

        <div class="card" style="padding:24px;">
          <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:16px;">Notification Webhooks</h3>
          <div class="form-group">
            <label class="form-label">Slack Incident Channel</label>
            <input type="text" class="form-input" value="#cx-critical-incidents" readonly>
          </div>
          <button class="btn btn-primary btn-sm" onclick="CXPulseApp.showToast('Settings saved successfully', 'success')">Save Changes</button>
        </div>
      </div>
    `;
  },

  // ------------------------------------------------------------------------
  // Customer Detail Drawer Opener
  // ------------------------------------------------------------------------
  openCustomerDetail(id) {
    this.activeCustomerId = id;
    let customer = CX_DATA.priorityQueue.find(c => c.id === id);
    if (!customer) {
      const radarC = CX_DATA.radarCustomers.find(c => c.id === id);
      if (radarC) {
        // Construct complete mock customer profile
        customer = {
          id: radarC.id,
          name: radarC.name,
          email: `${radarC.name.toLowerCase().replace(' ', '.')}@${radarC.company.toLowerCase()}.com`,
          company: radarC.company,
          avatar: radarC.name.split(' ').map(n=>n[0]).join(''),
          avatarBg: '#6366F1',
          issue: `Delayed support query regarding enterprise quota in ${radarC.company}`,
          sentiment: radarC.sentiment > 0.2 ? 'Positive' : radarC.sentiment < -0.2 ? 'Negative' : 'Neutral',
          sentimentScore: radarC.sentiment,
          priority: radarC.risk >= 80 ? 'P1 - Critical' : radarC.risk >= 60 ? 'P2 - High' : 'P3 - Standard',
          waitingTime: '35m ago',
          riskScore: radarC.risk,
          riskLevel: radarC.segment,
          ltv: `$${radarC.value.toLocaleString()} ARR`,
          since: '2023',
          aiRecommendation: 'Schedule proactive executive review and verify API uptime SLA.',
          intent: 'Subscription Audit / Performance Review',
          emotion: radarC.sentiment < 0 ? 'Concern & Frustration' : 'Constructive Collaboration',
          whyRisk: [
            `${radarC.tickets} active tickets without first-touch resolution`,
            `Sentiment drift observed over recent interactions`,
            `Key stakeholder renewal is pending`
          ],
          nextActions: [
            "Proactively ping customer success engineer.",
            "Dispatch automated satisfaction survey."
          ],
          journey: [
            { label: "Onboarded", time: "2023", status: "completed" },
            { label: "Active Usage", time: "2024", status: "completed" },
            { label: "Incident Raised", time: "Yesterday", status: "completed" },
            { label: "AI Monitored", time: "Now", status: "active" }
          ],
          suggestedResponses: {
            default: `Hi ${radarC.name.split(' ')[0]},\n\nThank you for reaching out. I've reviewed your inquiry regarding your integration at ${radarC.company}. We are prioritizing this with our team right now.\n\nBest,\nAlex Morgan`,
            shorter: `Hi ${radarC.name.split(' ')[0]}, we are on this immediately and will provide an update within the hour.\n\nAlex`,
            empathetic: `Dear ${radarC.name.split(' ')[0]},\n\nI understand how important this is for ${radarC.company}, and we appreciate your patience while we verify the details.\n\nWarmly,\nAlex`,
            professional: `Dear ${radarC.name.split(' ')[0]},\n\nWe have logged your request and assigned our technical specialist to review the specifications.\n\nAlex Morgan`
          }
        };
      }
    }

    if (!customer) return;

    const drawer = document.getElementById('customer-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const content = document.getElementById('drawer-body-content');

    if (!drawer || !backdrop || !content) return;

    // Render Drawer Content
    content.innerHTML = `
      <!-- Customer Header -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="avatar" style="width:48px; height:48px; font-size:16px; background:${customer.avatarBg || '#6366F1'};">
            ${customer.avatar}
          </div>
          <div>
            <h2 style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:2px;">${customer.name}</h2>
            <div style="font-size:12px; color:var(--text-tertiary);">${customer.email} • ${customer.company}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="badge ${customer.riskScore >= 80 ? 'badge-critical' : customer.riskScore >= 60 ? 'badge-warning' : 'badge-positive'}">
            Risk: ${customer.riskScore}%
          </span>
          <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">Customer since ${customer.since}</div>
        </div>
      </div>

      <!-- Customer Health Visualization Strip -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:10px; margin-bottom:20px;">
        <div class="intel-pill-box">
          <div class="intel-pill-label">Satisfaction</div>
          <div class="intel-pill-val" style="color:${customer.sentimentScore < 0 ? '#F43F5E' : '#10B981'};">
            ${customer.sentimentScore < 0 ? '62% (Declining)' : '94% (Stable)'}
          </div>
        </div>
        <div class="intel-pill-box">
          <div class="intel-pill-label">Sentiment Index</div>
          <div class="intel-pill-val">${customer.sentimentScore > 0 ? '+' : ''}${customer.sentimentScore}</div>
        </div>
        <div class="intel-pill-box">
          <div class="intel-pill-label">Lifetime Value</div>
          <div class="intel-pill-val" style="color:#818CF8;">${customer.ltv}</div>
        </div>
        <div class="intel-pill-box">
          <div class="intel-pill-label">Resolution History</div>
          <div class="intel-pill-val">8 Resolved / 2 Esc</div>
        </div>
      </div>

      <!-- Horizontal Customer Journey Timeline -->
      <div style="margin-bottom:24px;">
        <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--text-tertiary); margin-bottom:8px;">
          Customer Journey Timeline
        </div>
        <div class="journey-timeline">
          ${customer.journey.map(j => `
            <div class="journey-step ${j.status}">
              <div class="journey-node">
                ${j.status === 'completed' ? '✓' : j.status === 'critical' ? '!' : '●'}
              </div>
              <div class="journey-label">${j.label}</div>
              <div class="journey-time">${j.time}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Customer Intelligence Panel (Signature Component) -->
      <div class="ai-intelligence-panel" style="margin-bottom:20px;">
        <div class="ai-intel-header">
          <div class="ai-intel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            ✨ AI Customer Intelligence
          </div>
          <span class="badge badge-ai">Neural Analysis</span>
        </div>

        <div class="ai-intel-pills">
          <div class="intel-pill-box">
            <div class="intel-pill-label">Intent</div>
            <div class="intel-pill-val" style="font-size:12px;">${customer.intent}</div>
          </div>
          <div class="intel-pill-box">
            <div class="intel-pill-label">Sentiment</div>
            <div class="intel-pill-val" style="color:${customer.sentiment === 'Negative' ? '#F43F5E' : '#10B981'};">${customer.sentiment}</div>
          </div>
          <div class="intel-pill-box">
            <div class="intel-pill-label">Emotion</div>
            <div class="intel-pill-val" style="font-size:12px;">${customer.emotion}</div>
          </div>
          <div class="intel-pill-box">
            <div class="intel-pill-label">Priority</div>
            <div class="intel-pill-val" style="color:#F59E0B;">${customer.priority}</div>
          </div>
          <div class="intel-pill-box">
            <div class="intel-pill-label">Customer Risk</div>
            <div class="intel-pill-val" style="color:${customer.riskScore >= 80 ? '#F43F5E' : '#F59E0B'};">${customer.riskScore}% Churn Probability</div>
          </div>
        </div>

        <!-- "Why this risk?" structured factors -->
        <div class="risk-factors-container">
          <div class="risk-factors-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Why this risk? (AI Structured Causality)
          </div>
          ${customer.whyRisk.map(factor => `
            <div class="risk-factor-item">
              <span style="color:#F43F5E; font-weight:700;">+</span>
              <span>${factor}</span>
            </div>
          `).join('')}
        </div>

        <!-- "Next Best Action" numbered steps -->
        <div class="next-action-container">
          <div class="next-action-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Next Best Action (Recommended Sequence)
          </div>
          ${customer.nextActions.map((action, idx) => `
            <div class="next-action-step">
              <div class="step-num">${idx + 1}</div>
              <div>${action}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Response Composer Container -->
      <div id="composer-container"></div>
    `;

    // Initialize the AI Composer
    CXComposer.init(customer);

    backdrop.classList.add('open');
    drawer.classList.add('open');
  },

  closeDrawer() {
    const drawer = document.getElementById('customer-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  },

  // ------------------------------------------------------------------------
  // Progressive AI Analysis Loading Experience
  // ------------------------------------------------------------------------
  openSimulateModal() {
    const modal = document.getElementById('ai-loading-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    const step1 = document.getElementById('sim-step-1');
    const step2 = document.getElementById('sim-step-2');
    const step3 = document.getElementById('sim-step-3');
    const step4 = document.getElementById('sim-step-4');

    // Reset steps
    [step1, step2, step3, step4].forEach(s => {
      s.className = 'ai-step-row';
      s.querySelector('.ai-step-indicator').textContent = '';
    });

    step1.classList.add('current');

    setTimeout(() => {
      step1.className = 'ai-step-row done';
      step1.querySelector('.ai-step-indicator').textContent = '✓';
      step2.classList.add('current');
    }, 700);

    setTimeout(() => {
      step2.className = 'ai-step-row done';
      step2.querySelector('.ai-step-indicator').textContent = '✓';
      step3.classList.add('current');
    }, 1400);

    setTimeout(() => {
      step3.className = 'ai-step-row done';
      step3.querySelector('.ai-step-indicator').textContent = '✓';
      step4.classList.add('current');
    }, 2100);

    setTimeout(() => {
      step4.className = 'ai-step-row done';
      step4.querySelector('.ai-step-indicator').textContent = '✓';
    }, 2800);

    setTimeout(() => {
      modal.style.display = 'none';
      this.openCustomerDetail('CUST-001');
      this.showToast('✨ Autonomous Customer Telemetry synthesized!', 'ai');
    }, 3200);
  },

  closeSimulateModal() {
    const modal = document.getElementById('ai-loading-modal');
    if (modal) modal.style.display = 'none';
  },

  triggerAIScan() {
    this.showToast("Initiating system-wide AI Customer Sentiment Scan...", "ai");
    setTimeout(() => {
      this.showToast("✓ Scan Complete: 14,820 customer conversations evaluated. 0 SLA breaches.", "success");
    }, 1200);
  },

  filterAffectedCustomers() {
    this.setSubView('radar');
    setTimeout(() => {
      CXRadar.setSegment('Critical');
      this.showToast("Filtered CX Radar to affected delivery delay accounts", "ai");
    }, 100);
  },

  // ------------------------------------------------------------------------
  // Charts Initialization
  // ------------------------------------------------------------------------
  initDashboardCharts() {
    const m = CX_DATA.metrics;
    CXCharts.renderSparkline('sparkline-customers', m.totalCustomers.sparkline, '#6366F1', true);
    CXCharts.renderSparkline('sparkline-tickets', m.openTickets.sparkline, '#10B981', true);
    CXCharts.renderSparkline('sparkline-risk', m.atRiskCustomers.sparkline, '#F43F5E', false);
    CXCharts.renderSparkline('sparkline-cxscore', m.cxScore.sparkline, '#10B981', true);

    CXCharts.initSentimentChart('sentiment-canvas', 'sentiment-tooltip');
  },

  // ------------------------------------------------------------------------
  // Toast Notifications
  // ------------------------------------------------------------------------
  showToast(message, type = 'ai') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="flex:1;">${message}</div>
      <button style="background:none; border:none; color:var(--text-tertiary); cursor:pointer; font-size:16px;" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ------------------------------------------------------------------------
  // Search Modal
  // ------------------------------------------------------------------------
  setupSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('global-search-input');
    const results = document.getElementById('search-results-list');

    if (!input || !results) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        results.innerHTML = `
          <div style="padding:12px; font-size:12px; color:var(--text-tertiary);">
            Type to search across customers, tickets, and AI pattern alerts...
          </div>
        `;
        return;
      }

      const matches = CX_DATA.radarCustomers.filter(c => 
        c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        results.innerHTML = `
          <div style="padding:16px; text-align:center; color:var(--text-tertiary); font-size:13px;">
            No accounts matching "<b>${q}</b>"
          </div>
        `;
        return;
      }

      results.innerHTML = matches.map(m => `
        <div class="search-result-item" onclick="CXPulseApp.closeSearch(); CXPulseApp.openCustomerDetail('${m.id}')">
          <div class="avatar" style="width:28px; height:28px; font-size:11px;">${m.name.split(' ').map(n=>n[0]).join('')}</div>
          <div style="flex:1;">
            <div style="font-weight:600; color:var(--text-primary); font-size:13px;">${m.name}</div>
            <div style="font-size:11px; color:var(--text-tertiary);">${m.company} • $${m.value.toLocaleString()} ARR</div>
          </div>
          <span class="badge ${m.risk >= 80 ? 'badge-critical' : m.risk >= 60 ? 'badge-warning' : 'badge-positive'}">${m.segment}</span>
        </div>
      `).join('');
    });
  },

  openSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('global-search-input');
    if (modal) {
      modal.classList.add('open');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
      }
    }
  },

  closeSearch() {
    const modal = document.getElementById('search-modal');
    if (modal) modal.classList.remove('open');
  },

  // ------------------------------------------------------------------------
  // Shortcuts & Events
  // ------------------------------------------------------------------------
  setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearch();
      }
      if (e.key === 'Escape') {
        this.closeSearch();
        this.closeDrawer();
        this.closeSimulateModal();
      }
    });
  },

  setupNavigation() {
    // Top-level tabs & buttons
    document.querySelectorAll('[data-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.dataset.route;
        const sub = el.dataset.subview || 'dashboard';
        this.navigateTo(route, sub);
      });
    });
  },

  // ------------------------------------------------------------------------
  // Filtering helpers
  // ------------------------------------------------------------------------
  filterCustomersTable(searchVal) {
    const table = document.getElementById('customers-master-table');
    if (!table) return;
    const q = searchVal.toLowerCase();
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  },

  filterCustomersBySegment(segment) {
    const table = document.getElementById('customers-master-table');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(r => {
      if (segment === 'All') {
        r.style.display = '';
      } else {
        const badge = r.querySelector('.badge');
        r.style.display = (badge && badge.textContent.trim() === segment) ? '' : 'none';
      }
    });
  }
};

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CXPulseApp.init();
});
