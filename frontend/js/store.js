// ==========================================================================
// Global Reactive State Store & Event Bus
// ==========================================================================

const Store = {
  state: {
    // Current Active Mobile User
    currentUser: {
      id: 5,
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '+91 98111 22233',
      role: 'user',
      status: 'active',
      kyc_status: 'approved',
      is_2fa_enabled: 1,
      referral_code: 'RAHUL77'
    },

    // Current Active Admin User
    currentAdmin: {
      id: 1,
      full_name: 'Vikramaditya Singhania',
      role: 'super_admin',
      role_title: 'Super Administrator'
    },

    // UI Configuration
    viewMode: 'split_sync', // 'mobile_frame', 'mobile_full', 'admin_panel', 'split_sync'
    theme: 'dark',
    currentMobileScreen: 'home', // 'splash', 'onboarding', 'signup', 'login', 'otp', 'forgot_password', 'kyc', 'kyc_status', 'home', 'invest_plans', 'plan_details', 'my_investments', 'earnings', 'wallet', 'deposit', 'withdrawal', 'transactions', 'crypto', 'referrals', 'profile', 'bank_accounts', 'security', 'support', 'terms', 'privacy', 'risk'
    currentAdminTab: 'dashboard', // 'dashboard', 'users', 'kyc', 'investments', 'earnings', 'deposits', 'withdrawals', 'crypto', 'ledger', 'reports', 'tickets', 'audit', 'settings'

    // Cached Data
    wallet: null,
    plans: [],
    investments: [],
    cryptoConfig: null,
    cryptoBalances: [],
    notifications: [],
    adminMetrics: null
  },

  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  },

  setUser(user) {
    this.state.currentUser = user;
    this.emit('userChanged', user);
    this.refreshAllData();
  },

  setAdminRole(role) {
    const roles = {
      'super_admin': { id: 1, full_name: 'Vikramaditya Singhania', role_title: 'Super Administrator' },
      'finance_admin': { id: 2, full_name: 'Meera Nambiar', role_title: 'Finance Administrator' },
      'kyc_admin': { id: 3, full_name: 'Suresh Iyer', role_title: 'KYC Compliance Admin' },
      'ops_admin': { id: 4, full_name: 'Ananya Sen', role_title: 'Operations Admin' }
    };
    const admin = roles[role] || roles['super_admin'];
    this.state.currentAdmin = { ...admin, role };
    this.emit('adminChanged', this.state.currentAdmin);
  },

  setViewMode(mode) {
    this.state.viewMode = mode;
    this.emit('viewModeChanged', mode);
  },

  setMobileScreen(screen, params = null) {
    this.state.currentMobileScreen = screen;
    this.emit('mobileScreenChanged', { screen, params });
  },

  setAdminTab(tab) {
    this.state.currentAdminTab = tab;
    this.emit('adminTabChanged', tab);
  },

  async refreshAllData() {
    try {
      if (this.state.currentUser) {
        const uid = this.state.currentUser.id;
        const [wRes, pRes, iRes, nRes] = await Promise.all([
          API.get(`/api/wallet/summary/${uid}`).catch(() => null),
          API.get(`/api/invest/plans`).catch(() => null),
          API.get(`/api/invest/my-investments/${uid}`).catch(() => null),
          API.get(`/api/user/notifications/${uid}`).catch(() => null)
        ]);

        if (wRes && wRes.success) this.state.wallet = wRes.wallet;
        if (pRes && pRes.success) this.state.plans = pRes.plans;
        if (iRes && iRes.success) this.state.investments = iRes.investments;
        if (nRes && nRes.success) this.state.notifications = nRes.notifications;
      }
      this.emit('dataRefreshed', this.state);
    } catch (err) {
      console.warn('Error refreshing data:', err);
    }
  },

  showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div style="font-weight: 800; font-size: 1.1rem;">${icons[type] || 'ℹ'}</div>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        ${title ? `<strong style="font-size: 0.85rem;">${title}</strong>` : ''}
        <span style="font-size: 0.8rem; color: var(--text-secondary);">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};
