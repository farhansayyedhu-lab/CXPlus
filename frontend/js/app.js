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

  async init() {
    this.applyTheme(this.theme);
    this.setupNavigation();
    this.setupShortcuts();
    this.setupSearch();

    // Render current view immediately (0 delay)
    this.renderCurrentView();

    // Initialize Lucide icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Initialize WebGL Shader Lines & 3D Globe Telemetry immediately without delay
    this.initShaderLines();
    this.initGlobe();

    // Asynchronously update live dashboard data & active user profile in background
    this.loadLiveData();
    this.initCurrentUser();
  },

  isImmersiveNavOpen: false,

  toggleImmersiveNav() {
    this.isImmersiveNavOpen = !this.isImmersiveNavOpen;
    const overlay = document.getElementById('immersive-fullscreen-nav-overlay');
    const toggleBtn = document.getElementById('immersive-nav-toggle-btn');
    const links = document.querySelectorAll('#immersive-nav-links .immersive-nav-link-item');
    const cards = document.querySelectorAll('#immersive-nav-cards .immersive-nav-media-card');

    if (!overlay) return;

    if (toggleBtn) toggleBtn.classList.toggle('open', this.isImmersiveNavOpen);
    overlay.classList.toggle('open', this.isImmersiveNavOpen);

    if (window.gsap) {
      if (this.isImmersiveNavOpen) {
        gsap.killTweensOf(overlay);
        gsap.set(overlay, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' });
        gsap.to(overlay, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 0.5,
          ease: 'power3.inOut'
        });

        if (links.length) {
          gsap.fromTo(links, 
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
          );
        }

        if (cards.length) {
          gsap.fromTo(cards,
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.25 }
          );
        }
      } else {
        gsap.killTweensOf(overlay);
        gsap.to(overlay, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          duration: 0.4,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(overlay, { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' });
          }
        });
      }
    }
  },

  initShaderLines() {
    const container = document.getElementById('shader-lines-hero-canvas-container');
    if (!container) return;

    const startThreeShader = (THREE) => {
      container.innerHTML = '';

      const camera = new THREE.Camera();
      camera.position.z = 1;

      const scene = new THREE.Scene();
      const geometry = new THREE.PlaneBufferGeometry ? new THREE.PlaneBufferGeometry(2, 2) : new THREE.PlaneGeometry(2, 2);

      const uniforms = {
        time: { type: 'f', value: 1.0 },
        resolution: { type: 'v2', value: new THREE.Vector2() }
      };

      const vertexShader = `
        void main() {
          gl_Position = vec4( position, 1.0 );
        }
      `;

      const fragmentShader = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        #define FC gl_FragCoord.xy
        #define R resolution
        #define T (time * 0.45)
        #define MN min(R.x, R.y)

        float pattern(vec2 uv) {
          float d = 0.0;
          for (float i = 0.0; i < 3.0; i++) {
            uv.x += sin(T * (0.8 + i * 0.4) + uv.y * 1.4) * 0.22;
            d += 0.0055 / max(abs(uv.x), 0.0001);
          }
          return d;
        }

        vec3 scene(vec2 uv) {
          vec3 col = vec3(0.0);
          uv = vec2(atan(uv.x, uv.y) * 2.0 / 6.28318, -log(length(uv) + 0.0001) + T * 0.35);
          for (float i = 0.0; i < 3.0; i++) {
            float pat = pattern(uv + i * 6.0 / MN);
            if (i < 0.5) col.r += pat * 0.55;
            else if (i < 1.5) col.g += pat * 0.70;
            else col.b += pat * 1.05;
          }
          return col;
        }

        void main(void) {
          vec2 uv = (FC - 0.5 * R) / MN;
          vec3 col = vec3(0.0);
          float s = 12.0, e = 0.0009;
          col += e / (abs(sin(uv.x * s) * cos(uv.y * s)) + 0.001);
          uv.y += R.x > R.y ? 0.5 : 0.5 * (R.y / R.x);
          col += scene(uv);

          vec3 finalColor = vec3(col.r * 0.55 + col.b * 0.35, col.g * 0.65 + col.b * 0.25, col.b * 1.1);
          gl_FragColor = vec4(finalColor, min(1.0, length(finalColor) * 1.25));
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      const onWindowResize = () => {
        const landingView = document.getElementById('view-landing');
        const w = landingView ? landingView.offsetWidth : (container.offsetWidth || window.innerWidth);
        const h = landingView ? landingView.offsetHeight : (container.offsetHeight || window.innerHeight);
        if (w > 0 && h > 0) {
          renderer.setSize(w, h);
          uniforms.resolution.value.x = renderer.domElement.width;
          uniforms.resolution.value.y = renderer.domElement.height;
        }
      };

      onWindowResize();
      window.addEventListener('resize', onWindowResize, false);

      const landingEl = document.getElementById('view-landing');
      if (landingEl && window.ResizeObserver) {
        const ro = new ResizeObserver(() => onWindowResize());
        ro.observe(landingEl);
      }

      const animate = () => {
        requestAnimationFrame(animate);
        uniforms.time.value += 0.035;
        renderer.render(scene, camera);
      };

      animate();
    };

    if (window.THREE) {
      startThreeShader(window.THREE);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        if (window.THREE) startThreeShader(window.THREE);
      };
      document.head.appendChild(script);
    }
  },

  initGlobe() {
    const canvas = document.getElementById('cobe-globe-canvas');
    if (!canvas) return;

    import('https://cdn.jsdelivr.net/npm/cobe@0.6.3/+esm').then(module => {
      const createGlobe = module.default || module;
      let phi = 0;
      let width = canvas.offsetWidth || 360;

      createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.2,
        dark: 1,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 8,
        baseColor: [0.1, 0.14, 0.28],
        markerColor: [0.39, 0.4, 0.95],
        glowColor: [0.39, 0.4, 0.95],
        markerElevation: 0.05,
        markers: [
          { location: [40.71, -74.01], size: 0.07 }, // New York
          { location: [51.51, -0.13], size: 0.07 },  // London
          { location: [35.68, 139.65], size: 0.07 }, // Tokyo
          { location: [48.86, 2.35], size: 0.05 },   // Paris
          { location: [-33.87, 151.21], size: 0.05 },// Sydney
          { location: [52.52, 13.41], size: 0.05 },  // Berlin
        ],
        onRender: (state) => {
          state.phi = phi;
          phi += 0.009;
        }
      });
    }).catch(err => {
      console.warn('Globe cobe fallback render:', err);
    });
  },

  async initCurrentUser() {
    try {
      const res = await CX_API.getMe();
      if (res && res.data?.user) {
        CX_DATA.currentUser = res.data.user;
      }
    } catch(e) {}
    this.updateCurrentUserUI(CX_DATA.currentUser);
  },

  updateCurrentUserUI(user) {
    if (!user) return;
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');

    const initials = user.avatar || (user.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'AM');
    const roleTitle = user.role === 'admin' ? 'System Administrator' : (user.role === 'Head of Customer Experience' ? 'Head of CX' : (user.role === 'support_agent' ? 'Support Agent' : user.role));

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = user.name || 'Alex Morgan';
    if (roleEl) roleEl.textContent = `${roleTitle} • Online`;
  },

  // ------------------------------------------------------------------------
  // Auth & Account Creation Management
  // ------------------------------------------------------------------------
  switchAuthTab(tab = 'signin') {
    const signinTabBtn = document.getElementById('tab-btn-signin');
    const registerTabBtn = document.getElementById('tab-btn-register');
    const signinPane = document.getElementById('auth-signin-pane');
    const registerPane = document.getElementById('auth-register-pane');
    const signinErr = document.getElementById('signin-error');
    const regErr = document.getElementById('register-error');
    const regSucc = document.getElementById('register-success');

    if (signinErr) signinErr.style.display = 'none';
    if (regErr) regErr.style.display = 'none';
    if (regSucc) regSucc.style.display = 'none';

    if (tab === 'register') {
      if (signinTabBtn) signinTabBtn.classList.remove('active');
      if (registerTabBtn) registerTabBtn.classList.add('active');
      if (signinPane) signinPane.style.display = 'none';
      if (registerPane) registerPane.style.display = 'block';
      setTimeout(() => document.getElementById('reg-name')?.focus(), 50);
    } else {
      if (signinTabBtn) signinTabBtn.classList.add('active');
      if (registerTabBtn) registerTabBtn.classList.remove('active');
      if (signinPane) signinPane.style.display = 'block';
      if (registerPane) registerPane.style.display = 'none';
      setTimeout(() => document.getElementById('login-email')?.focus(), 50);
    }
  },

  updatePasswordStrength(val = '') {
    const value = val || '';
    const rules = [
      { id: 'length', el: document.getElementById('ps-rule-length'), met: value.length >= 12 },
      { id: 'case', el: document.getElementById('ps-rule-case'), met: /[a-z]/.test(value) && /[A-Z]/.test(value) },
      { id: 'digit', el: document.getElementById('ps-rule-digit'), met: /\d/.test(value) },
      { id: 'symbol', el: document.getElementById('ps-rule-symbol'), met: /[!-/:-@[-`{-~]/.test(value) }
    ];

    const COMMON = /^(?:password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|monkey|dragon|abc123|111111|123123|123456)/i;
    const RUN = /(.)\1{3,}/;
    const RUN_UP = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf)/i;

    const passed = rules.reduce((acc, r) => acc + (r.met ? 1 : 0), 0);
    const guessable = value.length > 0 && (COMMON.test(value) || RUN.test(value) || RUN_UP.test(value));
    const score = value.length === 0 ? 0 : (guessable ? 1 : Math.min(4, Math.max(1, passed)));

    const labels = ['Empty', 'Weak', 'Fair', 'Good', 'Strong'];
    const label = labels[Math.min(score, labels.length - 1)] || 'Empty';

    let toneClass = 'tone-none';
    if (score > 0) {
      const ratio = score / 4;
      if (ratio <= 0.34) toneClass = 'tone-danger';
      else if (ratio <= 0.67) toneClass = 'tone-caution';
      else toneClass = 'tone-safe';
    }

    // Update Bars
    for (let i = 0; i < 4; i++) {
      const bar = document.getElementById(`ps-bar-${i}`);
      if (bar) {
        bar.className = `ps-bar-fill ps-bar-${toneClass}`;
        if (i < score) {
          bar.classList.add('active');
        } else {
          bar.classList.remove('active');
        }
      }
    }

    // Update Label
    const labelEl = document.getElementById('ps-label');
    if (labelEl) {
      labelEl.textContent = label;
      labelEl.className = `ps-label-text ps-label-${toneClass}`;
    }

    // Update Guessable Indicator
    const guessableEl = document.getElementById('ps-guessable');
    if (guessableEl) {
      guessableEl.classList.toggle('show', guessable);
    }

    // Update Rule Items
    rules.forEach(r => {
      if (r.el) {
        r.el.classList.toggle('met', r.met);
        const badge = r.el.querySelector('.ps-rule-badge');
        if (badge) badge.classList.toggle('met', r.met);
      }
    });

    // Update meter accessibility attributes
    const meterEl = document.getElementById('ps-meter-bars');
    if (meterEl) {
      meterEl.setAttribute('aria-valuenow', score);
      meterEl.setAttribute('aria-valuetext', label);
    }
  },

  // ------------------------------------------------------------------------
  // Scroll Expansion Hero Controller
  // ------------------------------------------------------------------------
  scrollHeroExpanded: false,
  scrollHeroType: 'video',

  setScrollHeroMedia(type) {
    this.scrollHeroType = type;
    const videoBtn = document.getElementById('scroll-hero-btn-video');
    const imageBtn = document.getElementById('scroll-hero-btn-image');
    const videoEl = document.getElementById('scroll-hero-video');
    const imageEl = document.getElementById('scroll-hero-image');

    if (type === 'video') {
      if (videoBtn) videoBtn.classList.add('active');
      if (imageBtn) imageBtn.classList.remove('active');
      if (videoEl) videoEl.style.display = 'block';
      if (imageEl) imageEl.style.display = 'none';
    } else {
      if (videoBtn) videoBtn.classList.remove('active');
      if (imageBtn) imageBtn.classList.add('active');
      if (videoEl) videoEl.style.display = 'none';
      if (imageEl) imageEl.style.display = 'block';
    }
  },

  toggleScrollHeroExpansion() {
    this.scrollHeroExpanded = !this.scrollHeroExpanded;
    const box = document.getElementById('scroll-hero-box');
    const btn = document.getElementById('scroll-hero-expand-toggle');
    const firstWord = document.getElementById('scroll-hero-first-word');
    const restTitle = document.getElementById('scroll-hero-rest-title');

    if (box) {
      box.classList.toggle('expanded', this.scrollHeroExpanded);
    }

    if (firstWord && restTitle) {
      if (this.scrollHeroExpanded) {
        firstWord.style.transform = 'translateX(-30px)';
        restTitle.style.transform = 'translateX(30px)';
      } else {
        firstWord.style.transform = 'translateX(0)';
        restTitle.style.transform = 'translateX(0)';
      }
    }

    if (btn) {
      btn.textContent = this.scrollHeroExpanded ? 'Collapse Viewport ↙' : 'Expand Viewport ↗';
    }
  },

  async handleQuickDemoLogin(email, password) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = password;
    await this.handleLogin();
  },

  async handleLogin(event) {
    if (event) event.preventDefault();

    const email = document.getElementById('login-email')?.value?.trim() || 'alex.morgan@cxpulse.ai';
    const password = document.getElementById('login-password')?.value || 'cxpulse2026';
    const errorEl = document.getElementById('signin-error');
    const submitBtn = document.getElementById('signin-submit-btn');

    if (errorEl) errorEl.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="pulse-dot ai"></span> Authenticating...';
    }

    try {
      const res = await CX_API.login(email, password);
      if (res && res.success && res.data?.user) {
        this.updateCurrentUserUI(res.data.user);
        this.showToast(`Welcome back, ${res.data.user.name || 'Alex'}!`, 'success');
        this.navigateTo('app', 'dashboard');
      } else {
        if (errorEl) {
          errorEl.textContent = res?.message || 'Invalid email or password. Please try again.';
          errorEl.style.display = 'flex';
        } else {
          this.showToast(res?.message || 'Login failed', 'critical');
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Login connection failed';
        errorEl.style.display = 'flex';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Dashboard';
      }
    }
  },

  async handleRegister(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('reg-name')?.value?.trim();
    const email = document.getElementById('reg-email')?.value?.trim();
    const role = document.getElementById('reg-role')?.value || 'support_agent';
    const password = document.getElementById('reg-password')?.value;
    const errorEl = document.getElementById('register-error');
    const succEl = document.getElementById('register-success');
    const submitBtn = document.getElementById('register-submit-btn');

    if (errorEl) errorEl.style.display = 'none';
    if (succEl) succEl.style.display = 'none';

    if (!name || name.length < 2) {
      if (errorEl) {
        errorEl.textContent = 'Please enter your full name (minimum 2 characters)';
        errorEl.style.display = 'flex';
      }
      return;
    }

    if (!email || !email.includes('@')) {
      if (errorEl) {
        errorEl.textContent = 'Please provide a valid work email address';
        errorEl.style.display = 'flex';
      }
      return;
    }

    if (!password || password.length < 6) {
      if (errorEl) {
        errorEl.textContent = 'Password must be at least 6 characters long';
        errorEl.style.display = 'flex';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="pulse-dot ai"></span> Creating Account...';
    }

    try {
      const res = await CX_API.register({ name, email, role, password });
      if (res && res.success && res.data?.user) {
        if (succEl) {
          succEl.textContent = `Account created successfully! Welcome to CXPulse, ${res.data.user.name}.`;
          succEl.style.display = 'flex';
        }
        this.updateCurrentUserUI(res.data.user);
        this.showToast(`Account created! Welcome, ${res.data.user.name}!`, 'ai');
        setTimeout(() => {
          this.navigateTo('app', 'dashboard');
        }, 600);
      } else {
        if (errorEl) {
          errorEl.textContent = res?.message || 'Unable to create account. Please verify your details.';
          errorEl.style.display = 'flex';
        } else {
          this.showToast(res?.message || 'Account creation failed', 'critical');
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'An unexpected error occurred during account creation';
        errorEl.style.display = 'flex';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> Create Account & Launch CXPulse →`;
      }
    }
  },

  async handleLogout() {
    await CX_API.logout();
    CX_DATA.currentUser = {
      name: 'Alex Morgan',
      role: 'Head of Customer Experience',
      avatar: 'AM',
      email: 'alex.morgan@cxpulse.ai'
    };
    this.updateCurrentUserUI(CX_DATA.currentUser);
    this.showToast('You have been logged out', 'info');
    this.navigateTo('landing');
  },

  async loadLiveData() {
    try {
      const isOnline = await CX_API.checkHealth();
      if (isOnline) {
        const dashboard = await CX_API.getDashboard();
        if (dashboard && dashboard.metrics) {
          CX_DATA.metrics = dashboard.metrics;
        }
        const queue = await CX_API.getPriorityQueue();
        if (queue && queue.length > 0) {
          CX_DATA.priorityQueue = queue;
        }
      }
    } catch (e) {
      console.warn('Initial live data sync fallback:', e.message);
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

    if (view === 'login') {
      this.switchAuthTab(subView === 'register' ? 'register' : 'signin');
    }

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
      this.updateCurrentUserUI(CX_DATA.currentUser);
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
    const firstName = CX_DATA.currentUser?.name ? CX_DATA.currentUser.name.split(' ')[0] : 'Alex';

    return `
      <div class="animate-fade-in">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 24px; flex-wrap:wrap; gap:16px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 4px;">
              Good morning, ${firstName}.
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
          ltv: `${this.formatINR(radarC.value)} ARR`,
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
  openSimulateModal(ticketId = 'CUST-001') {
    const modal = document.getElementById('ai-loading-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    const step1 = document.getElementById('sim-step-1');
    const step2 = document.getElementById('sim-step-2');
    const step3 = document.getElementById('sim-step-3');
    const step4 = document.getElementById('sim-step-4');

    // Reset steps
    [step1, step2, step3, step4].forEach(s => {
      if (s) {
        s.className = 'ai-step-row';
        const ind = s.querySelector('.ai-step-indicator');
        if (ind) ind.textContent = '';
      }
    });

    if (step1) step1.classList.add('current');

    // Trigger real Gemini AI analysis in background
    const aiPromise = CX_API.analyzeTicket(ticketId);

    setTimeout(() => {
      if (step1) {
        step1.className = 'ai-step-row done';
        const ind = step1.querySelector('.ai-step-indicator');
        if (ind) ind.textContent = '✓';
      }
      if (step2) step2.classList.add('current');
    }, 120);

    setTimeout(() => {
      if (step2) {
        step2.className = 'ai-step-row done';
        const ind = step2.querySelector('.ai-step-indicator');
        if (ind) ind.textContent = '✓';
      }
      if (step3) step3.classList.add('current');
    }, 240);

    setTimeout(() => {
      if (step3) {
        step3.className = 'ai-step-row done';
        const ind = step3.querySelector('.ai-step-indicator');
        if (ind) ind.textContent = '✓';
      }
      if (step4) step4.classList.add('current');
    }, 360);

    setTimeout(async () => {
      if (step4) {
        step4.className = 'ai-step-row done';
        const ind = step4.querySelector('.ai-step-indicator');
        if (ind) ind.textContent = '✓';
      }

      const aiResult = await aiPromise;
      if (aiResult) {
        const cust = CX_DATA.priorityQueue.find(c => c.id === ticketId) || CX_DATA.priorityQueue[0];
        if (cust) {
          cust.intent = aiResult.intent || cust.intent;
          cust.sentiment = aiResult.sentiment || cust.sentiment;
          cust.emotion = aiResult.emotion || cust.emotion;
          cust.priority = aiResult.priority || cust.priority;
          cust.riskLevel = aiResult.customerRisk || cust.riskLevel;
          cust.aiRecommendation = aiResult.recommendedAction || cust.aiRecommendation;
          if (aiResult.suggestedResponse) {
            cust.suggestedResponses = cust.suggestedResponses || {};
            cust.suggestedResponses.default = aiResult.suggestedResponse;
          }
        }
      }

      setTimeout(() => {
        modal.style.display = 'none';
        this.openCustomerDetail(ticketId);
        this.showToast('✨ Gemini Autonomous Telemetry synthesized!', 'ai');
      }, 150);
    }, 480);
  },

  closeSimulateModal() {
    const modal = document.getElementById('ai-loading-modal');
    if (modal) modal.style.display = 'none';
  },

  triggerAIScan() {
    this.showToast("Initiating system-wide AI Customer Sentiment Scan...", "ai");
    setTimeout(() => {
      this.showToast("✓ Scan Complete: 14,820 customer conversations evaluated. 0 SLA breaches.", "success");
    }, 300);
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
            <div style="font-size:11px; color:var(--text-tertiary);">${m.company} • ${CXPulseApp.formatINR(m.value)} ARR</div>
          </div>
          <span class="badge ${m.risk >= 80 ? 'badge-critical' : m.risk >= 60 ? 'badge-warning' : 'badge-positive'}">${m.segment}</span>
        </div>
      `).join('');
    });
  },

  openSearchWithQuery(query = '') {
    this.openSearch();
    const input = document.getElementById('global-search-input');
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    }
  },

  handleHeroBeamSearch(val) {
    if (val && val.length > 2) {
      this.openSearchWithQuery(val);
    }
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
  },

  // ------------------------------------------------------------------------
  // Currency Formatter — INR (Indian Rupee ₹)
  // ------------------------------------------------------------------------
  formatINR(amount) {
    if (typeof amount !== 'number') {
      const num = parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
      if (isNaN(num)) return '₹0';
      amount = num;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
};

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CXPulseApp.init();
});
