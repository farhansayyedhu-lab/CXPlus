/* ==========================================================================
   CXPulse REST API Client Adapter (Frontend)
   Connects React / Vanilla frontend to Express REST Backend & Supabase & Gemini.
   Includes offline fallback store for 100% resilient hackathon presentation.
   ========================================================================== */

const CX_API = (() => {
  const API_BASE = 'http://localhost:5000/api'; // Override via VITE_API_URL env if needed
  let isBackendOnline = false;
  let authToken = localStorage.getItem('cxpulse_token') || null;

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        isBackendOnline = true;
        console.log('⚡ [CXPulse] Connected to Live Backend API at http://localhost:5000');
        const badge = document.querySelector('.live-badge');
        if (badge) {
          badge.textContent = 'LIVE API CONNECTED';
          badge.style.background = 'rgba(16, 185, 129, 0.15)';
          badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          badge.style.color = '#10B981';
        }
      }
    } catch (e) {
      isBackendOnline = false;
      console.log('💡 [CXPulse] Backend offline — using embedded high-fidelity data engine');
    }
    return isBackendOnline;
  }

  // Initial health check
  checkHealth();

  function getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  return {
    isOnline: () => isBackendOnline,
    checkHealth,

    // ==========================================
    // 1. AUTHENTICATION
    // ==========================================
    async login(email, password) {
      if (!isBackendOnline) {
        const savedUser = localStorage.getItem('cxpulse_user');
        const user = savedUser ? JSON.parse(savedUser) : CX_DATA.currentUser;
        return { success: true, data: { user, token: 'demo-token-123' } };
      }
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.data?.token) {
          authToken = data.data.token;
          localStorage.setItem('cxpulse_token', authToken);
          if (data.data?.user) {
            CX_DATA.currentUser = data.data.user;
            localStorage.setItem('cxpulse_user', JSON.stringify(data.data.user));
          }
        }
        return data;
      } catch (e) {
        return { success: false, message: e.message || 'Unable to connect to login service' };
      }
    },

    async register(userData) {
      if (!isBackendOnline) {
        const initials = (userData.name || 'User').trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
        const newUser = {
          id: 'usr-' + Date.now().toString().slice(-6),
          name: userData.name || 'Support Agent',
          email: (userData.email || '').toLowerCase(),
          role: userData.role || 'support_agent',
          avatar: userData.avatar || initials,
          status: 'Active'
        };
        CX_DATA.currentUser = newUser;
        localStorage.setItem('cxpulse_user', JSON.stringify(newUser));
        localStorage.setItem('cxpulse_token', 'demo-token-' + Date.now());
        return { success: true, data: { user: newUser, token: 'demo-token-' + Date.now() }, message: 'User registered successfully' };
      }
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (data.success && data.data?.token) {
          authToken = data.data.token;
          localStorage.setItem('cxpulse_token', authToken);
          if (data.data?.user) {
            CX_DATA.currentUser = data.data.user;
            localStorage.setItem('cxpulse_user', JSON.stringify(data.data.user));
          }
        }
        return data;
      } catch (e) {
        return { success: false, message: e.message || 'Unable to connect to registration service' };
      }
    },

    async getMe() {
      const cached = localStorage.getItem('cxpulse_user');
      if (cached) {
        try { CX_DATA.currentUser = JSON.parse(cached); } catch(e){}
      }
      if (!isBackendOnline) return { success: true, data: { user: CX_DATA.currentUser } };
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
        const data = await res.json();
        if (data.success && data.data?.user) {
          CX_DATA.currentUser = data.data.user;
          localStorage.setItem('cxpulse_user', JSON.stringify(data.data.user));
        }
        return data;
      } catch (e) {
        return { success: true, data: { user: CX_DATA.currentUser } };
      }
    },

    async logout() {
      localStorage.removeItem('cxpulse_token');
      authToken = null;
      if (isBackendOnline) {
        try {
          await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: getHeaders() });
        } catch (e) {}
      }
      return { success: true };
    },

    // ==========================================
    // 2. DASHBOARD & ANALYTICS
    // ==========================================
    async getDashboard() {
      if (!isBackendOnline) {
        return { success: true, data: CX_DATA.metrics };
      }
      try {
        const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : CX_DATA.metrics;
      } catch (e) {
        return CX_DATA.metrics;
      }
    },

    async getMetrics() {
      if (!isBackendOnline) return CX_DATA.metrics;
      try {
        const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() });
        const json = await res.json();
        if (json.success && json.data?.metrics) {
          return json.data.metrics;
        }
        return CX_DATA.metrics;
      } catch (e) {
        return CX_DATA.metrics;
      }
    },

    // ==========================================
    // 3. PRIORITY QUEUE & TICKETS
    // ==========================================
    async getPriorityQueue(filter = '') {
      if (!isBackendOnline) return CX_DATA.priorityQueue;
      try {
        const url = `${API_BASE}/tickets/priority-queue${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`;
        const res = await fetch(url, { headers: getHeaders() });
        const json = await res.json();
        return json.success && json.data && json.data.length > 0 ? json.data : CX_DATA.priorityQueue;
      } catch (e) {
        return CX_DATA.priorityQueue;
      }
    },

    async getTickets(params = {}) {
      if (!isBackendOnline) return { tickets: CX_DATA.priorityQueue, total: CX_DATA.priorityQueue.length };
      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/tickets?${query}`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : { tickets: CX_DATA.priorityQueue, total: CX_DATA.priorityQueue.length };
      } catch (e) {
        return { tickets: CX_DATA.priorityQueue, total: CX_DATA.priorityQueue.length };
      }
    },

    async getTicketById(id) {
      if (!isBackendOnline) {
        const found = CX_DATA.priorityQueue.find(t => t.id === id);
        return found || CX_DATA.priorityQueue[0];
      }
      try {
        const res = await fetch(`${API_BASE}/tickets/${id}`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : CX_DATA.priorityQueue[0];
      } catch (e) {
        return CX_DATA.priorityQueue[0];
      }
    },

    async resolveTicket(ticketId, resolutionNotes = '') {
      if (!isBackendOnline) {
        return { success: true, message: 'Ticket resolved (offline mode)' };
      }
      try {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/resolve`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ resolutionNotes })
        });
        return await res.json();
      } catch (e) {
        return { success: false, message: e.message };
      }
    },

    async escalateTicket(ticketId, reason = '') {
      if (!isBackendOnline) {
        return { success: true, message: 'Ticket escalated (offline mode)' };
      }
      try {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/escalate`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ reason })
        });
        return await res.json();
      } catch (e) {
        return { success: false, message: e.message };
      }
    },

    async useAiResponse(ticketId, responseText, senderName = 'Alex Morgan') {
      if (!isBackendOnline) return { success: true };
      try {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/use-ai-response`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ response: responseText, sender_name: senderName })
        });
        return await res.json();
      } catch (e) {
        return { success: false, message: e.message };
      }
    },

    // ==========================================
    // 4. CUSTOMERS
    // ==========================================
    async getCustomers(params = {}) {
      if (!isBackendOnline) return { customers: CX_DATA.radarCustomers, total: CX_DATA.radarCustomers.length };
      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/customers?${query}`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : { customers: CX_DATA.radarCustomers, total: CX_DATA.radarCustomers.length };
      } catch (e) {
        return { customers: CX_DATA.radarCustomers, total: CX_DATA.radarCustomers.length };
      }
    },

    async getCustomerById(id) {
      if (!isBackendOnline) {
        const found = CX_DATA.priorityQueue.find(c => c.id === id) || CX_DATA.priorityQueue[0];
        return found;
      }
      try {
        const res = await fetch(`${API_BASE}/customers/${id}`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : null;
      } catch (e) {
        return null;
      }
    },

    async getCustomerAnalytics(id) {
      if (!isBackendOnline) return null;
      try {
        const res = await fetch(`${API_BASE}/customers/${id}/analytics`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : null;
      } catch (e) {
        return null;
      }
    },

    // ==========================================
    // 5. GEMINI AI INFERENCE
    // ==========================================
    async analyzeTicket(ticketId) {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_BASE}/ai/analyze-ticket`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ticketId })
          });
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        } catch (e) {
          console.warn('AI analysis API fallback:', e.message);
        }
      }
      return null;
    },

    async regenerateResponse(ticketId, tone = 'default') {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_BASE}/ai/regenerate-response`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ticketId, tone })
          });
          const json = await res.json();
          if (json.success && json.data?.text) {
            return json.data.text;
          }
        } catch (e) {
          console.warn('AI tone regeneration fallback:', e.message);
        }
      }
      return null;
    },

    async generateResponse(params) {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_BASE}/ai/generate-response`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(params)
          });
          const json = await res.json();
          if (json.success && json.data?.text) {
            return json.data.text;
          }
        } catch (e) {
          console.warn('AI composer fallback:', e.message);
        }
      }
      return null;
    },

    async generateInsights() {
      if (isBackendOnline) {
        try {
          const res = await fetch(`${API_BASE}/ai/generate-insights`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
          });
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        } catch (e) {
          console.warn('AI insights API fallback');
        }
      }
      return CX_DATA.insights;
    }
  };
})();
