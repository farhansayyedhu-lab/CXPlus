/* ==========================================================================
   CXPulse REST API Client Adapter
   Seamlessly communicates with backend API (Node/Express/Supabase/Gemini)
   with auto-fallback to mock data store when offline.
   ========================================================================== */

const CX_API = (() => {
  const API_BASE = 'http://localhost:5000/api/v1';
  let isBackendOnline = false;
  let authToken = localStorage.getItem('cxpulse_token') || null;

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        isBackendOnline = true;
        console.log('⚡ [CXPulse] Connected to Live Backend API (localhost:5000)');
      }
    } catch (e) {
      isBackendOnline = false;
      console.log('💡 [CXPulse] Backend offline — using embedded high-fidelity data engine');
    }
    return isBackendOnline;
  }

  // Initial ping
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

    // Auth
    async login(email, password) {
      if (!isBackendOnline) return null;
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
        }
        return data;
      } catch (e) {
        return null;
      }
    },

    // Metrics
    async getMetrics() {
      if (!isBackendOnline) return CX_DATA.metrics;
      try {
        const res = await fetch(`${API_BASE}/metrics/overview`, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : CX_DATA.metrics;
      } catch (e) {
        return CX_DATA.metrics;
      }
    },

    // Priority Queue
    async getPriorityQueue(filter = '') {
      if (!isBackendOnline) return CX_DATA.priorityQueue;
      try {
        const url = `${API_BASE}/tickets/priority-queue${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`;
        const res = await fetch(url, { headers: getHeaders() });
        const json = await res.json();
        return json.success ? json.data : CX_DATA.priorityQueue;
      } catch (e) {
        return CX_DATA.priorityQueue;
      }
    },

    // AI Composer Generation
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
          console.warn('Backend AI generation failed, falling back to local heuristic');
        }
      }
      return null;
    }
  };
})();
