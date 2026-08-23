// ==========================================================================
// 2026 Fintech Mobile App - Main Application Bootstrapper & Device Controller
// ==========================================================================

const App = {
  isAdminMode: false,

  init() {
    // 1. Initialize Mobile Router
    if (typeof MobileRouter !== 'undefined') {
      MobileRouter.init();
    }

    // 2. Initialize Admin Controllers if present
    if (typeof AdminNav !== 'undefined') {
      AdminNav.init();
    }

    // 3. Start Live Phone Clock
    this.startPhoneClock();

    // 4. Set Initial Mobile Screen
    MobileRouter.navigate('home');

    // 5. Connect Screen Jump Picker
    Store.on('mobileScreenChanged', ({ screen }) => {
      const picker = document.getElementById('screen-jump-picker');
      if (picker && screen) {
        picker.value = screen;
      }
    });

    console.log("⚡ AURA WEALTH 2026 Mobile Fintech Application initialized.");
  },

  startPhoneClock() {
    const clockEl = document.getElementById('phone-clock');
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      if (clockEl) clockEl.innerText = `${hours}:${minutes}`;
    };
    updateTime();
    setInterval(updateTime, 30000);
  },

  setDeviceMode(mode) {
    Haptics.tick();
    const frame = document.getElementById('phone-device-frame');
    const wrapper = document.getElementById('mobile-app-wrapper');
    const notch = document.getElementById('device-notch');

    document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));

    if (mode === 'pixel9') {
      document.getElementById('btn-device-pixel')?.classList.add('active');
      if (frame) {
        frame.className = 'phone-simulator-frame device-pixel';
      }
      if (wrapper) wrapper.parentElement?.classList.remove('full-mobile-mode');
    } else if (mode === 'full') {
      document.getElementById('btn-device-full')?.classList.add('active');
      if (wrapper) wrapper.parentElement?.classList.add('full-mobile-mode');
    } else {
      document.getElementById('btn-device-iphone')?.classList.add('active');
      if (frame) {
        frame.className = 'phone-simulator-frame device-iphone16';
      }
      if (wrapper) wrapper.parentElement?.classList.remove('full-mobile-mode');
    }

    Store.setDeviceType(mode);
  },

  toggleTheme() {
    Haptics.tap();
    const current = Store.state.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    Store.setTheme(next);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerText = next === 'dark' ? '🌙' : '☀️';
  },

  toggleHaptics() {
    const enabled = Haptics.toggle();
    const btn = document.getElementById('haptics-toggle-btn');
    if (btn) btn.innerText = enabled ? '🔊' : '🔇';
    alert(enabled ? 'Haptic sound synthesis ENABLED' : 'Haptic sound synthesis MUTED');
  },

  toggleAdminMode() {
    Haptics.tap();
    this.isAdminMode = !this.isAdminMode;
    const mobileWrapper = document.getElementById('mobile-app-wrapper');
    const adminWrapper = document.getElementById('admin-app-wrapper');
    const toggleBtn = document.getElementById('view-mode-toggle-btn');

    if (this.isAdminMode) {
      if (mobileWrapper) mobileWrapper.style.display = 'none';
      if (adminWrapper) adminWrapper.style.display = 'flex';
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>📱</span> Mobile App`;
        toggleBtn.className = 'btn btn-primary btn-sm';
      }
      if (typeof AdminNav !== 'undefined') {
        AdminNav.setActiveTab(Store.state.currentAdminTab || 'dashboard');
      }
    } else {
      if (mobileWrapper) mobileWrapper.style.display = 'flex';
      if (adminWrapper) adminWrapper.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>🖥️</span> Admin Panel`;
        toggleBtn.className = 'btn btn-secondary btn-sm';
      }
      MobileRouter.navigate(Store.state.currentMobileScreen || 'home');
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
