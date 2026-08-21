// ==========================================================================
// Main Application Controller & View Mode Switcher
// ==========================================================================

const App = {
  init() {
    // 1. Initialize Sub-Routers & Nav
    MobileRouter.init();
    AdminNav.init();

    // 2. Setup Mode Switching
    this.setupViewModeTabs();
    this.setupUserPicker();
    this.setupAdminPicker();
    this.setupThemeToggle();

    // 3. Initial View Rendering
    this.applyViewMode(Store.state.viewMode);
    Store.refreshAllData();

    // 4. Initial Screen Routing
    MobileRouter.navigate(Store.state.currentMobileScreen);
    AdminNav.setActiveTab(Store.state.currentAdminTab);

    // 5. Global live sync listener: when data refreshes, update active screens
    Store.on('dataRefreshed', () => {
      if (Store.state.viewMode === 'split_sync' || Store.state.viewMode === 'mobile_frame' || Store.state.viewMode === 'mobile_full') {
        MobileRouter.navigate(Store.state.currentMobileScreen, MobileRouter.screenParams);
      }
      if (Store.state.viewMode === 'split_sync' || Store.state.viewMode === 'admin_panel') {
        AdminNav.setActiveTab(Store.state.currentAdminTab);
      }
    });

    console.log("Antigravity Fintech Platform 2.4 Pro initialized.");
  },

  setupViewModeTabs() {
    document.querySelectorAll('.view-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        if (mode) {
          Store.setViewMode(mode);
        }
      });
    });

    Store.on('viewModeChanged', (mode) => {
      this.applyViewMode(mode);
    });
  },

  applyViewMode(mode) {
    // Update active tab buttons
    document.querySelectorAll('.view-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const mobileContainer = document.getElementById('mobile-app-wrapper');
    const adminContainer = document.getElementById('admin-app-wrapper');
    const workspace = document.getElementById('workspace-view-container');

    if (!mobileContainer || !adminContainer || !workspace) return;

    workspace.className = 'workspace-container';

    if (mode === 'mobile_frame') {
      mobileContainer.style.display = 'flex';
      adminContainer.style.display = 'none';
      mobileContainer.style.flex = '1';
      workspace.classList.remove('full-mobile-mode');
    } else if (mode === 'mobile_full') {
      mobileContainer.style.display = 'flex';
      adminContainer.style.display = 'none';
      mobileContainer.style.flex = '1';
      workspace.classList.add('full-mobile-mode');
    } else if (mode === 'admin_panel') {
      mobileContainer.style.display = 'none';
      adminContainer.style.display = 'flex';
      adminContainer.style.flex = '1';
    } else if (mode === 'split_sync') {
      mobileContainer.style.display = 'flex';
      adminContainer.style.display = 'flex';
      mobileContainer.style.flex = '0 0 440px';
      adminContainer.style.flex = '1';
      workspace.classList.remove('full-mobile-mode');
    }

    // Refresh active views
    MobileRouter.navigate(Store.state.currentMobileScreen, MobileRouter.screenParams);
    AdminNav.setActiveTab(Store.state.currentAdminTab);
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
          Store.showToast(`Switched active mobile user to ${res.user.full_name}`, 'info');
        }
      } catch (err) {
        Store.showToast('Error switching user', 'error');
      }
    });
  },

  setupAdminPicker() {
    const adminSelect = document.getElementById('admin-role-picker');
    if (!adminSelect) return;

    adminSelect.addEventListener('change', (e) => {
      const role = e.target.value;
      Store.setAdminRole(role);
      Store.showToast(`Switched admin identity to ${Store.state.currentAdmin.full_name} (${Store.state.currentAdmin.role_title})`, 'info');
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
});
