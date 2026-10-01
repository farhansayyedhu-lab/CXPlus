/* ==========================================================================
   CXPulse Signature Feature: CX Radar Engine
   Interactive 2D Customer Experience Scatter Map & Segment Filter
   ========================================================================== */

const CXRadar = {
  canvas: null,
  ctx: null,
  customers: [],
  filteredCustomers: [],
  selectedSegment: 'All',
  filters: {
    sentiment: 'all',
    risk: 'all',
    value: 'all',
    ticketCount: 'all'
  },
  hoveredCustomer: null,
  animationFrameId: null,
  pulseAngle: 0,

  colors: {
    'Happy': { fill: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', stroke: '#34D399' },
    'Satisfied': { fill: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)', stroke: '#22D3EE' },
    'Neutral': { fill: '#64748B', glow: 'rgba(100, 116, 139, 0.3)', stroke: '#94A3B8' },
    'At Risk': { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', stroke: '#FBBF24' },
    'Critical': { fill: '#E11D48', glow: 'rgba(225, 29, 72, 0.5)', stroke: '#FB7185' }
  },

  init(canvasId, customersData) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.customers = [...customersData];
    this.applyFilters();

    this.setupEvents();
    this.startAnimationLoop();
  },

  setSegment(segment) {
    this.selectedSegment = segment;
    this.applyFilters();
  },

  setFilter(key, value) {
    this.filters[key] = value;
    this.applyFilters();
  },

  applyFilters() {
    this.filteredCustomers = this.customers.filter(c => {
      // Segment filter
      if (this.selectedSegment !== 'All' && c.segment !== this.selectedSegment) return false;

      // Sentiment filter
      if (this.filters.sentiment === 'positive' && c.sentiment <= 0.2) return false;
      if (this.filters.sentiment === 'neutral' && (c.sentiment < -0.2 || c.sentiment > 0.2)) return false;
      if (this.filters.sentiment === 'negative' && c.sentiment >= -0.2) return false;

      // Risk filter
      if (this.filters.risk === 'critical' && c.risk < 80) return false;
      if (this.filters.risk === 'at-risk' && (c.risk < 60 || c.risk >= 80)) return false;
      if (this.filters.risk === 'low' && c.risk >= 60) return false;

      // Value filter
      if (this.filters.value === 'enterprise' && c.value < 50000) return false;
      if (this.filters.value === 'mid' && (c.value < 25000 || c.value >= 50000)) return false;
      if (this.filters.value === 'smb' && c.value >= 25000) return false;

      // Ticket count
      if (this.filters.ticketCount === '0' && c.tickets !== 0) return false;
      if (this.filters.ticketCount === '1-2' && (c.tickets < 1 || c.tickets > 2)) return false;
      if (this.filters.ticketCount === '3+' && c.tickets < 3) return false;

      return true;
    });

    this.renderCustomerList();
  },

  startAnimationLoop() {
    const loop = () => {
      this.pulseAngle += 0.02;
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(loop);
  },

  draw() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (this.canvas.width !== rect.width * dpr || this.canvas.height !== rect.height * dpr) {
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
    }

    const ctx = this.ctx;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw background concentric radar rings
    const maxRadius = Math.min(cx, cy) * 0.88;
    const rings = [0.25, 0.5, 0.75, 1];

    rings.forEach((rRatio, idx) => {
      const radius = maxRadius * rRatio;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash(idx === 3 ? [] : [4, 6]);
      ctx.stroke();

      // Ring Zone Label
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      const label = idx === 0 ? 'Optimal' : idx === 1 ? 'Satisfied' : idx === 2 ? 'At Risk' : 'Critical Perimeter';
      ctx.fillText(label, cx + 8, cy - radius + 12);
    });
    ctx.setLineDash([]);

    // Draw radar crosshairs / axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();

    // Draw rotating radar scan line
    const scanAngle = this.pulseAngle % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(scanAngle);
    const scanGrad = ctx.createLinearGradient(0, 0, maxRadius, 0);
    scanGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    scanGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = scanGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -0.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Map and Draw Customer Nodes
    this.filteredCustomers.forEach(customer => {
      // Map Sentiment (-1 to +1) to X (-1 to 1) and Risk (0 to 100) to Y/Radius
      // Center = Safe / Happy, Outer = High Risk
      const riskRatio = customer.risk / 100;
      const angle = (customer.sentiment * Math.PI * 0.75) - Math.PI / 2; // spreads from -pi to 0
      const dist = riskRatio * maxRadius * 0.9 + 25;

      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      // Store mapped coords on customer object for hit testing
      customer._x = x;
      customer._y = y;

      const isHovered = this.hoveredCustomer && this.hoveredCustomer.id === customer.id;
      const baseRadius = isHovered ? 8 : (customer.value > 50000 ? 6 : 4.5);
      const conf = this.colors[customer.segment] || this.colors['Neutral'];

      // Glow aura
      ctx.beginPath();
      ctx.arc(x, y, baseRadius + (isHovered ? 6 : 2), 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? conf.glow : 'rgba(255,255,255,0.04)';
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = conf.fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = conf.stroke;
      ctx.stroke();

      // Target reticle if hovered
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, baseRadius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  },

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found = null;
      for (const c of this.filteredCustomers) {
        if (c._x && c._y) {
          const dx = mx - c._x;
          const dy = my - c._y;
          if (Math.sqrt(dx * dx + dy * dy) < 14) {
            found = c;
            break;
          }
        }
      }

      this.hoveredCustomer = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';

      const tooltip = document.getElementById('radar-tooltip');
      if (tooltip) {
        if (found) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.clientX + 16}px`;
          tooltip.style.top = `${e.clientY - 20}px`;
          tooltip.innerHTML = `
            <div style="font-weight:700; color:#FFFFFF; font-size:13px; margin-bottom:2px;">${found.name}</div>
            <div style="color:#94A3B8; font-size:11px; margin-bottom:8px;">${found.company}</div>
            <div style="display:flex; justify-content:space-between; gap:12px; font-size:12px; margin-bottom:4px;">
              <span style="color:#64748B;">Segment:</span>
              <span style="font-weight:600; color:${this.colors[found.segment]?.fill || '#FFF'};">${found.segment}</span>
            </div>
            <div style="display:flex; justify-content:space-between; gap:12px; font-size:12px; margin-bottom:4px;">
              <span style="color:#64748B;">Churn Risk:</span>
              <span style="font-weight:700; color:${found.risk >= 80 ? '#F43F5E' : found.risk >= 60 ? '#F59E0B' : '#10B981'};">${found.risk}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; gap:12px; font-size:12px;">
              <span style="color:#64748B;">Annual ARR:</span>
              <span style="font-weight:600; color:#F8FAFC;">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(found.value)}</span>
            </div>
            <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.08); font-size:11px; color:#A855F7;">
              Click node to open AI Profile →
            </div>
          `;
        } else {
          tooltip.style.display = 'none';
        }
      }
    });

    this.canvas.addEventListener('click', () => {
      if (this.hoveredCustomer) {
        // Open customer profile modal/drawer
        if (window.CXPulseApp && window.CXPulseApp.openCustomerDetail) {
          window.CXPulseApp.openCustomerDetail(this.hoveredCustomer.id);
        }
      }
    });
  },

  renderCustomerList() {
    const listContainer = document.getElementById('radar-matched-customers');
    if (!listContainer) return;

    if (this.filteredCustomers.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">No customers match these radar filters</div>
          <div class="empty-subtitle">Try resetting the sentiment or risk thresholds to view active accounts.</div>
          <button class="btn btn-secondary btn-sm" onclick="CXRadar.resetFilters()">Reset Radar Filters</button>
        </div>
      `;
      return;
    }

    const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    listContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-tertiary);">
          Matched Accounts (${this.filteredCustomers.length})
        </span>
        <span style="font-size:12px; color:var(--text-secondary);">
          Total ARR: <b>${formatINR(this.filteredCustomers.reduce((acc, c) => acc + c.value, 0))}</b>
        </span>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:12px;">
        ${this.filteredCustomers.map(c => `
          <div class="card clickable-row" onclick="CXPulseApp.openCustomerDetail('${c.id}')" style="padding:14px; border-radius:var(--radius-sm);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="avatar" style="width:28px; height:28px; font-size:11px;">${c.name.split(' ').map(n=>n[0]).join('')}</div>
                <div>
                  <div style="font-weight:600; font-size:13px; color:var(--text-primary);">${c.name}</div>
                  <div style="font-size:11px; color:var(--text-tertiary);">${c.company}</div>
                </div>
              </div>
              <span class="badge ${c.risk >= 80 ? 'badge-critical' : c.risk >= 60 ? 'badge-warning' : 'badge-positive'}">${c.segment}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-top:8px; border-top:1px solid var(--border-subtle); padding-top:6px;">
              <span>ARR: <b>${formatINR(c.value)}</b></span>
              <span>Risk: <b style="color:${c.risk >= 80 ? '#F43F5E' : c.risk >= 60 ? '#F59E0B' : '#10B981'};">${c.risk}%</b></span>
              <span>Open Tickets: <b>${c.tickets}</b></span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  resetFilters() {
    this.selectedSegment = 'All';
    this.filters = { sentiment: 'all', risk: 'all', value: 'all', ticketCount: 'all' };
    document.querySelectorAll('.radar-segment-tag').forEach(t => t.classList.remove('active'));
    document.querySelector('.radar-segment-tag[data-segment="All"]')?.classList.add('active');
    this.applyFilters();
  }
};
