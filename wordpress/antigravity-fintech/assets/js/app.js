// ==========================================================================
// Antigravity Fintech — Main Web Portal & Admin App Controller
// ==========================================================================

const App = {
  isAdminMode: false,

  init() {
    // 1. Initialize Web Portal & Admin Nav
    if (typeof WebPortal !== 'undefined') {
      WebPortal.init();
    }
    if (typeof AdminNav !== 'undefined') {
      AdminNav.init();
    }

    // 2. Setup Pickers & Theme
    this.setupUserPicker();
    this.setupThemeToggle();

    // 3. Initial View Rendering
    WebPortal.setActiveTab('dashboard');
    Store.refreshAllData();

    // 4. Data Refresh Listener
    Store.on('dataRefreshed', () => {
      if (!this.isAdminMode && typeof WebPortal !== 'undefined') {
        WebPortal.setActiveTab(WebPortal.activeTab);
      } else if (this.isAdminMode && typeof AdminNav !== 'undefined') {
        AdminNav.setActiveTab(Store.state.currentAdminTab);
      }
    });

    console.log("Antigravity Fintech Desktop Web Portal 2.5 Pro initialized.");
  },

  toggleAdminMode() {
    this.isAdminMode = !this.isAdminMode;
    const webViewport = document.getElementById('web-content-viewport');
    const adminWrapper = document.getElementById('admin-app-wrapper');
    const toggleBtn = document.getElementById('web-admin-toggle-btn');
    const navMenu = document.getElementById('web-nav-links-menu');

    if (this.isAdminMode) {
      if (webViewport) webViewport.style.display = 'none';
      if (adminWrapper) adminWrapper.style.display = 'flex';
      if (navMenu) navMenu.style.opacity = '0.4';
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>👤</span> Customer Web Portal`;
        toggleBtn.className = 'btn btn-primary btn-sm';
      }
      AdminNav.setActiveTab(Store.state.currentAdminTab || 'dashboard');
      Store.showToast('Switched to Administrative Control Center', 'info');
    } else {
      if (webViewport) webViewport.style.display = 'flex';
      if (adminWrapper) adminWrapper.style.display = 'none';
      if (navMenu) navMenu.style.opacity = '1';
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>🖥️</span> Admin Panel`;
        toggleBtn.className = 'btn btn-secondary btn-sm';
      }
      WebPortal.setActiveTab(WebPortal.activeTab || 'dashboard');
      Store.showToast('Switched to Customer Investment Portal', 'info');
    }
  },

  setupUserPicker() {
    const picker = document.getElementById('global-user-picker');
    if (!picker) return;

    picker.addEventListener('change', async (e) => {
      const userId = parseInt(e.target.value);
      try {
        const res = await API.get(`/api/user/profile/${userId}`);
        if (res.success) {
          Store.setUser(res.user);
          Store.showToast(`Switched active user to ${res.user.full_name}`, 'info');
          await Store.refreshAllData();
          if (!this.isAdminMode) {
            WebPortal.setActiveTab(WebPortal.activeTab);
          }
        }
      } catch (err) {
        Store.showToast('Error switching user', 'error');
      }
    });
  },

  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const newTheme = Store.state.theme === 'dark' ? 'light' : 'dark';
      Store.state.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      toggleBtn.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
      Store.showToast(`Theme switched to ${newTheme} mode`, 'info');
    });
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Register Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  }
});
