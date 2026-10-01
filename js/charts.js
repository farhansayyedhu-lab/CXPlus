/* ==========================================================================
   CXPulse High-DPI Canvas Charts
   Smooth Bezier Splines, Dynamic Gradients, Zero External Dependencies
   ========================================================================== */

const CXCharts = {
  // Sparkline renderer for Metric Cards
  renderSparkline(canvasId, dataPoints, colorHex, isPositive) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = (max - min) || 1;
    const padding = 4;
    const width = rect.width - padding * 2;
    const height = rect.height - padding * 2;

    const points = dataPoints.map((val, idx) => {
      const x = padding + (idx / (dataPoints.length - 1)) * width;
      const y = padding + height - ((val - min) / range) * height;
      return { x, y };
    });

    // Area fill gradient
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, rect.height);
    ctx.lineTo(points[0].x, rect.height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, colorHex + '33');
    gradient.addColorStop(1, colorHex + '00');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Final point dot
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
  },

  // Interactive Sentiment Chart
  sentimentData: {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      positive: [68, 72, 70, 75, 71, 79, 84],
      neutral: [22, 18, 19, 15, 17, 13, 10],
      negative: [10, 10, 11, 10, 12, 8, 6]
    },
    '24h': {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
      positive: [70, 68, 74, 80, 77, 82, 86],
      neutral: [20, 22, 16, 12, 14, 11, 9],
      negative: [10, 10, 10, 8, 9, 7, 5]
    },
    '30d': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      positive: [62, 69, 76, 84],
      neutral: [26, 20, 15, 10],
      negative: [12, 11, 9, 6]
    }
  },

  activePeriod: '7d',
  hoveredIndex: -1,

  initSentimentChart(canvasId, tooltipId) {
    const canvas = document.getElementById(canvasId);
    const tooltip = document.getElementById(tooltipId);
    if (!canvas) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const data = this.sentimentData[this.activePeriod];
      const count = data.labels.length;
      const paddingLeft = 40;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 30;

      const plotW = rect.width - paddingLeft - paddingRight;
      const plotH = rect.height - paddingTop - paddingBottom;

      // Draw horizontal grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const y = paddingTop + (i / steps) * plotH;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(rect.width - paddingRight, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${100 - i * 25}%`, paddingLeft - 8, y + 3);
      }

      // Draw X axis labels
      for (let i = 0; i < count; i++) {
        const x = paddingLeft + (i / (count - 1)) * plotW;
        ctx.fillStyle = '#64748B';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.labels[i], x, rect.height - 10);
      }

      const drawSpline = (values, strokeColor, fillColor) => {
        const pts = values.map((val, idx) => ({
          x: paddingLeft + (idx / (count - 1)) * plotW,
          y: paddingTop + plotH - (val / 100) * plotH
        }));

        // Fill under curve
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(pts[pts.length - 1].x, paddingTop + plotH);
        ctx.lineTo(pts[0].x, paddingTop + plotH);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + plotH);
        grad.addColorStop(0, fillColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Points
        pts.forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, idx === this.hoveredIndex ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = strokeColor;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#0B0F19';
          ctx.stroke();
        });
      };

      // Draw Positive (Emerald), Neutral (Slate/Blue), Negative (Rose)
      drawSpline(data.negative, '#F43F5E', 'rgba(244, 63, 94, 0.08)');
      drawSpline(data.neutral, '#64748B', 'rgba(100, 116, 139, 0.08)');
      drawSpline(data.positive, '#10B981', 'rgba(16, 185, 129, 0.15)');

      // Draw hover line if hovered
      if (this.hoveredIndex >= 0 && this.hoveredIndex < count) {
        const hoverX = paddingLeft + (this.hoveredIndex / (count - 1)) * plotW;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(hoverX, paddingTop);
        ctx.lineTo(hoverX, paddingTop + plotH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    render();
    window.addEventListener('resize', render);

    // Mouse hover handler
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const paddingLeft = 40;
      const paddingRight = 20;
      const plotW = rect.width - paddingLeft - paddingRight;

      const data = this.sentimentData[this.activePeriod];
      const count = data.labels.length;

      let closestIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < count; i++) {
        const x = paddingLeft + (i / (count - 1)) * plotW;
        const dist = Math.abs(mouseX - x);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      this.hoveredIndex = closestIdx;
      render();

      if (tooltip && closestIdx !== -1) {
        const x = paddingLeft + (closestIdx / (count - 1)) * plotW;
        tooltip.style.display = 'block';
        tooltip.style.left = `${rect.left + x}px`;
        tooltip.style.top = `${rect.top + 30}px`;
        tooltip.innerHTML = `
          <div style="font-weight:700; margin-bottom:4px; font-size:11px; color:#94A3B8;">${data.labels[closestIdx]}</div>
          <div style="display:flex; justify-content:space-between; gap:12px; color:#10B981;"><span>Positive:</span> <b>${data.positive[closestIdx]}%</b></div>
          <div style="display:flex; justify-content:space-between; gap:12px; color:#94A3B8;"><span>Neutral:</span> <b>${data.neutral[closestIdx]}%</b></div>
          <div style="display:flex; justify-content:space-between; gap:12px; color:#F43F5E;"><span>Negative:</span> <b>${data.negative[closestIdx]}%</b></div>
        `;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      this.hoveredIndex = -1;
      render();
      if (tooltip) tooltip.style.display = 'none';
    });
  },

  setPeriod(period, canvasId, tooltipId) {
    if (this.sentimentData[period]) {
      this.activePeriod = period;
      this.initSentimentChart(canvasId, tooltipId);
    }
  }
};
