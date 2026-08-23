// ==========================================================================
// 2026 Fintech Mobile App - Settings & Legal Pages (Screen 26)
// ==========================================================================

const MobileSettings = {
  render(container) {
    const theme = Store.state.theme;
    const currency = Store.state.currency;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Settings</h2>
            <span class="subpage-step-indicator">App Preferences</span>
          </div>
          <div></div>
        </div>

        <!-- Appearance Section -->
        <div class="section-card">
          <h4 class="section-card-title">Appearance Theme</h4>
          <div class="theme-selector-chips-row" style="margin-top: 10px;">
            <button class="theme-chip ${theme === 'dark' ? 'active' : ''}" onclick="Store.setTheme('dark'); MobileSettings.render(document.getElementById('mobile-screen-content'));">
              🌙 Dark Navy
            </button>
            <button class="theme-chip ${theme === 'light' ? 'active' : ''}" onclick="Store.setTheme('light'); MobileSettings.render(document.getElementById('mobile-screen-content'));">
              ☀️ Crisp Light
            </button>
          </div>
        </div>

        <!-- Currency & Locale -->
        <div class="section-card">
          <h4 class="section-card-title">Display Currency</h4>
          <div class="currency-selector-chips-row" style="margin-top: 10px;">
            <button class="curr-chip ${currency === 'INR' ? 'active' : ''}" onclick="Store.setCurrency('INR'); MobileSettings.render(document.getElementById('mobile-screen-content'));">
              INR (₹)
            </button>
            <button class="curr-chip ${currency === 'USD' ? 'active' : ''}" onclick="Store.setCurrency('USD'); MobileSettings.render(document.getElementById('mobile-screen-content'));">
              USD ($)
            </button>
            <button class="curr-chip ${currency === 'EUR' ? 'active' : ''}" onclick="Store.setCurrency('EUR'); MobileSettings.render(document.getElementById('mobile-screen-content'));">
              EUR (€)
            </button>
          </div>
        </div>

        <!-- Haptic Sound Synthesis -->
        <div class="section-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 class="section-card-title" style="margin: 0;">Tactile Haptic Audio</h4>
              <small style="color: var(--text-muted);">Synthesized audio feedback on touch</small>
            </div>
            <input type="checkbox" id="haptics-toggle-check" ${Haptics.enabled ? 'checked' : ''} onchange="Haptics.toggle(this.checked)" />
          </div>
        </div>

        <!-- Legal & Compliance Links -->
        <div class="section-card">
          <h4 class="section-card-title">Legal & Compliance</h4>
          <div class="profile-menu-group" style="margin-top: 8px;">
            <div class="profile-menu-item" onclick="Store.setMobileScreen('terms')">
              <span>Terms & Conditions</span>
              <span class="menu-chevron">→</span>
            </div>
            <div class="profile-menu-item" onclick="Store.setMobileScreen('privacy')">
              <span>Privacy Policy</span>
              <span class="menu-chevron">→</span>
            </div>
            <div class="profile-menu-item" onclick="Store.setMobileScreen('risk')">
              <span>Risk Disclosure</span>
              <span class="menu-chevron">→</span>
            </div>
          </div>
        </div>

        <!-- Error & Empty States Testbench -->
        <div class="section-card">
          <h4 class="section-card-title">Error & Empty Testbench</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
            <button class="btn btn-outline btn-sm" onclick="Store.setMobileScreen('error_network')">Network Error</button>
            <button class="btn btn-outline btn-sm" onclick="Store.setMobileScreen('error_payment')">Payment Failed</button>
            <button class="btn btn-outline btn-sm" onclick="Store.setMobileScreen('empty_investments')">Empty State</button>
          </div>
        </div>

        <!-- Logout -->
        <button class="btn btn-outline btn-full btn-lg" style="margin-top: 20px; border-color: rgba(239, 68, 68, 0.4); color: #EF4444;" onclick="MobileProfile.handleLogout()">
          <span>Log Out</span>
        </button>
      </div>
    `;
  },

  renderLegal(container, page) {
    const titles = {
      'terms': 'Terms & Conditions',
      'privacy': 'Privacy Policy',
      'risk': 'Risk Disclosure'
    };

    const contents = {
      'terms': `
        <h3>1. Platform Nature</h3>
        <p>AURA WEALTH provides institutional asset management and algorithmic quantitative strategies. All user balances are recorded via double-entry financial accounting ledgers.</p>
        <h3>2. Eligibility & KYC</h3>
        <p>Users must complete Tier-1 identity verification (PAN / Aadhaar / Passport) before executing withdrawals or subscribing to high-yield strategies.</p>
      `,
      'privacy': `
        <h3>Data Protection & DPDP Act</h3>
        <p>We implement AES-256 encryption at rest and TLS 1.3 in transit. Financial identity credentials and biometric keys are stored in secure enclaves and never transmitted in plain text.</p>
      `,
      'risk': `
        <h3>Market & Liquidity Risk</h3>
        <p>Investment returns are subject to applicable terms, conditions and investment risks. Indicative returns represent target quantitative projections and do not constitute guaranteed profits.</p>
      `
    };

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('settings')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">${titles[page] || 'Legal'}</h2>
          </div>
          <div></div>
        </div>

        <div class="legal-prose-card">
          ${contents[page] || contents['terms']}
        </div>
      </div>
    `;
  }
};

window.MobileSettings = MobileSettings;
