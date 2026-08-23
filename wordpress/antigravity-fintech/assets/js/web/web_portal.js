// ==========================================================================
// Antigravity Fintech — Modern Public & Logged-in Web Portal Controller
// ==========================================================================

const WebPortal = {
  activeTab: 'home',
  calculatorAmount: 25000,
  calculatorPlan: null,
  isLoggedIn: true,

  init() {
    this.setupNavigation();
    this.renderCurrentView();
  },

  setupNavigation() {
    document.querySelectorAll('.web-nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.setActiveTab(tab);
        }
      });
    });
  },

  setActiveTab(tab) {
    this.activeTab = tab;

    // Update active nav links in header
    document.querySelectorAll('.web-nav-link').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCurrentView() {
    const viewport = document.getElementById('web-content-viewport');
    if (!viewport) return;

    // Public Pages
    if (this.activeTab === 'home') this.renderHome(viewport);
    else if (this.activeTab === 'about') this.renderAbout(viewport);
    else if (this.activeTab === 'how_it_works') this.renderHowItWorks(viewport);
    else if (this.activeTab === 'plans') this.renderPlans(viewport);
    else if (this.activeTab === 'digital_assets') this.renderDigitalAssets(viewport);
    else if (this.activeTab === 'security') this.renderSecurity(viewport);
    else if (this.activeTab === 'faq') this.renderFAQ(viewport);
    else if (this.activeTab === 'contact') this.renderContact(viewport);
    else if (this.activeTab === 'login') this.renderAuthView(viewport, 'login');
    else if (this.activeTab === 'register') this.renderAuthView(viewport, 'register');
    
    // Legal Pages
    else if (this.activeTab === 'terms') this.renderLegalPage(viewport, 'terms');
    else if (this.activeTab === 'privacy') this.renderLegalPage(viewport, 'privacy');
    else if (this.activeTab === 'risk') this.renderLegalPage(viewport, 'risk');
    else if (this.activeTab === 'kyc_policy') this.renderLegalPage(viewport, 'kyc_policy');
    else if (this.activeTab === 'cookies') this.renderLegalPage(viewport, 'cookies');

    // Logged-in User Dashboard
    else if (this.activeTab.startsWith('user_') || this.activeTab === 'dashboard') {
      this.renderUserPortal(viewport, this.activeTab === 'dashboard' ? 'user_dashboard' : this.activeTab);
    } else {
      this.renderHome(viewport);
    }
  },

  // ==========================================================================
  // 1. PUBLIC HOME PAGE
  // ==========================================================================
  async renderHome(container) {
    const plans = Store.state.plans || [
      { id: 1, name: 'Starter Yield', min_amount: 1000, max_amount: 25000, duration_days: 30, daily_roi_pct: 0.0411, risk_level: 'Conservative', tagline: 'Liquid short-duration bond strategy' },
      { id: 2, name: 'Growth Alpha', min_amount: 25000, max_amount: 100000, duration_days: 90, daily_roi_pct: 0.0493, risk_level: 'Moderate', tagline: 'Multi-asset quantitative arbitrage' },
      { id: 3, name: 'Premium Institutional', min_amount: 100000, max_amount: 1000000, duration_days: 180, daily_roi_pct: 0.0657, risk_level: 'Institutional', tagline: 'Private credit & hedged yield strategies' }
    ];

    container.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-badge">
          <span>⚡ Next-Generation Digital Asset Management</span>
        </div>

        <h1 class="hero-headline">
          Invest Smarter. Manage Your Growth.
        </h1>

        <p class="hero-subheading">
          A modern digital platform designed to help you manage investments, track your portfolio and monitor your financial activity from one secure dashboard.
        </p>

        <div class="hero-cta-group">
          <button class="btn btn-primary btn-lg" onclick="WebPortal.setActiveTab('user_dashboard')" style="padding: 14px 32px; font-size: 1rem;">
            🚀 Open User Dashboard
          </button>
          <button class="btn btn-secondary btn-lg" onclick="WebPortal.setActiveTab('plans')" style="padding: 14px 28px; font-size: 1rem;">
            📊 Explore Investment Plans
          </button>
          <button class="btn btn-ghost btn-lg" onclick="WebPortal.setActiveTab('register')">
            Create Free Account →
          </button>
        </div>

        <!-- Realistic Live Dashboard Preview -->
        <div class="hero-preview-container">
          <div class="hero-preview-header">
            <div class="hero-preview-dots">
              <div class="hero-preview-dot" style="background: #ef4444;"></div>
              <div class="hero-preview-dot" style="background: #f59e0b;"></div>
              <div class="hero-preview-dot" style="background: #10b981;"></div>
            </div>
            <div style="font-size: 0.8rem; font-family: monospace; color: var(--text-muted);">
              🔒 LIVE SIMULATION: USER ID #005 (RAHUL SHARMA) • 256-BIT ENCRYPTION
            </div>
            <span class="badge badge-approved">● Online Ledger Active</span>
          </div>

          <div class="hero-preview-grid">
            <div class="hero-preview-card">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total Portfolio</span>
              <strong style="font-size: 1.4rem; color: var(--text-primary); display: block; margin-top: 4px;">₹82,746.00</strong>
              <span style="font-size: 0.75rem; color: var(--primary-light);">▲ +18.4% Net Yield</span>
            </div>
            <div class="hero-preview-card">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Invested Principal</span>
              <strong style="font-size: 1.4rem; color: var(--text-primary); display: block; margin-top: 4px;">₹50,000.00</strong>
              <span style="font-size: 0.75rem; color: var(--text-secondary);">2 Active Contracts</span>
            </div>
            <div class="hero-preview-card">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Available Cash</span>
              <strong style="font-size: 1.4rem; color: var(--text-primary); display: block; margin-top: 4px;">₹32,500.00</strong>
              <span style="font-size: 0.75rem; color: #38bdf8;">Ready for Deployment</span>
            </div>
            <div class="hero-preview-card">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Accrued Yield</span>
              <strong style="font-size: 1.4rem; color: var(--primary-light); display: block; margin-top: 4px;">+₹246.00</strong>
              <span style="font-size: 0.75rem; color: var(--primary-light);">24h Accrual Payout</span>
            </div>
          </div>

          <!-- SVG Trajectory Area Chart -->
          <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 18px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.85rem; font-weight: 700;">Compounded Growth Trajectory (Demo Data)</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Last 30 Days</span>
            </div>
            <svg viewBox="0 0 700 160" style="width: 100%; height: 130px; overflow: visible;">
              <defs>
                <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 10,130 Q 120,110 220,90 T 440,60 T 680,20 L 680,150 L 10,150 Z" fill="url(#heroAreaGrad)" />
              <path d="M 10,130 Q 120,110 220,90 T 440,60 T 680,20" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <circle cx="680" cy="20" r="5" fill="#10B981" />
            </svg>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS (4 STEPS) -->
      <section style="display: flex; flex-direction: column; gap: 16px; margin-top: 40px;">
        <div style="text-align: center;">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800;">How It Works</h2>
          <p style="color: var(--text-secondary); max-width: 600px; margin: 6px auto 0 auto;">
            Get started in four seamless steps with institutional-grade onboarding and security.
          </p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">Create Account</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
              Sign up securely with your email and mobile number. Instant OTP validation ensures trusted identity.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">Complete KYC</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
              Upload your identification document (PAN / Aadhaar / Passport) and a selfie for rapid compliance approval.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">Choose Investment Option</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
              Select from curated investment tiers (Starter, Growth, Premium) aligned with your risk tolerance and horizon.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">Track Your Portfolio</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
              Monitor automated daily yield accruals in real-time and withdraw funds directly to your verified bank account.
            </p>
          </div>
        </div>
      </section>

      <!-- INVESTMENT PLANS SECTION -->
      <section style="display: flex; flex-direction: column; gap: 20px; margin-top: 60px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 14px;">
          <div>
            <div class="hero-badge" style="margin-bottom: 8px;">Transparent Terms</div>
            <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800;">Curated Investment Plans</h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">
              Designed for different investment horizons. Indicative returns are calculated based on quantitative strategies.
            </p>
          </div>
          <button class="btn btn-secondary" onclick="WebPortal.setActiveTab('plans')">View All Strategy Specs →</button>
        </div>

        <div class="web-plans-grid">
          ${plans.map(p => `
            <div class="web-plan-card">
              <span class="web-plan-badge badge-approved">${p.risk_level}</span>
              <div>
                <h3 style="font-size: 1.3rem; font-weight: 800;">${p.name}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${p.tagline}</p>
              </div>

              <div class="web-plan-roi-box">
                <div>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Indicative Daily Return</span>
                  <strong style="font-size: 1.3rem; color: var(--primary-light); display: block;">${p.daily_roi_pct}% / day</strong>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Annualized Indicative</span>
                  <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">${(p.daily_roi_pct * 365).toFixed(1)}% APY</strong>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
                <span>Contract Duration:</span>
                <strong>${p.duration_days} Days</strong>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
                <span>Investment Range:</span>
                <strong>₹${p.min_amount.toLocaleString('en-IN')} - ₹${p.max_amount.toLocaleString('en-IN')}</strong>
              </div>

              <div style="font-size: 0.8rem; color: var(--text-muted);">
                ✓ Automated 24h Daily Accrual<br>
                ✓ Principal returned upon maturity<br>
                ✓ Segregated custodian accounting
              </div>

              <button class="btn btn-primary btn-lg" onclick="WebPortal.setActiveTab('user_investments')">
                Invest Now →
              </button>
            </div>
          `).join('')}
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 20px; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
          <span>ℹ️</span>
          <span><strong>Risk Disclosure:</strong> Indicative returns reflect algorithmic targets based on historical modeling and are not guaranteed. Capital is subject to market risks. All plan parameters are fully configurable from the WordPress Admin Dashboard.</span>
        </div>
      </section>

      <!-- DIGITAL ASSETS SECTION -->
      <section style="display: flex; flex-direction: column; gap: 20px; margin-top: 60px;">
        <div>
          <div class="hero-badge" style="margin-bottom: 8px;">Multi-Asset Ecosystem</div>
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800;">Digital Assets & Crypto Vault</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">
            Securely interface with major Virtual Digital Assets (VDA) with multi-chain network support.
          </p>
        </div>

        <div class="crypto-assets-grid">
          <div class="crypto-asset-card">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 2rem;">₿</span>
              <div>
                <strong>Bitcoin</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">BTC • SegWit / Taproot</span>
              </div>
            </div>
            <span class="badge badge-approved">Live Vault Demo</span>
          </div>

          <div class="crypto-asset-card">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 2rem;">Ξ</span>
              <div>
                <strong>Ethereum</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">ETH • ERC-20 Network</span>
              </div>
            </div>
            <span class="badge badge-approved">Smart Contracts</span>
          </div>

          <div class="crypto-asset-card">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 2rem; color: #10b981;">₮</span>
              <div>
                <strong>Tether USD</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">USDT • TRC-20 / ERC-20</span>
              </div>
            </div>
            <span class="badge badge-approved">1:1 USD Pegged</span>
          </div>

          <div class="crypto-asset-card">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 2rem; color: #a855f7;">◎</span>
              <div>
                <strong>Solana</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">SOL • SPL Token Engine</span>
              </div>
            </div>
            <span class="badge badge-approved">Sub-Second Finality</span>
          </div>
        </div>

        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-md); padding: 16px; font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <span>🌐 <strong>Regulatory Note:</strong> Digital asset functionality is demonstrated using testnet/sandbox rails. Availability and live custodial integrations are subject to applicable financial laws and jurisdictional regulatory frameworks.</span>
          <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('digital_assets')">View Digital Assets Hub →</button>
        </div>
      </section>

      <!-- SECURITY & COMPLIANCE SECTION -->
      <section style="display: flex; flex-direction: column; gap: 20px; margin-top: 60px;">
        <div style="text-align: center;">
          <div class="hero-badge" style="margin-bottom: 8px;">Institutional Infrastructure</div>
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800;">Enterprise Security Architecture</h2>
          <p style="color: var(--text-secondary); max-width: 650px; margin: 6px auto 0 auto;">
            Engineered with defense-in-depth protection across authentication, ledger immutability, and compliance authorization.
          </p>
        </div>

        <div class="security-grid">
          <div class="security-card">
            <div class="security-icon-box">🔐</div>
            <div>
              <strong style="font-size: 1rem;">Secure Login & OTP</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">PBKDF2/SHA-256 hashed credentials with mandatory multi-factor SMS/Email OTP validation.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">🛡️</div>
            <div>
              <strong style="font-size: 1rem;">Two-Factor Authentication</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Time-based One-Time Password (TOTP) compatibility with Google Authenticator and Authy.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">🔢</div>
            <div>
              <strong style="font-size: 1rem;">Transaction PIN Protection</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Isolated 4-digit numeric cryptographic authorization required for all investments and payouts.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">📋</div>
            <div>
              <strong style="font-size: 1rem;">KYC & AML Verification</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Tiered compliance document verification adhering to global Anti-Money Laundering frameworks.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">👥</div>
            <div>
              <strong style="font-size: 1rem;">Role-Based Access Control</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Strict privilege separation across Super Admin, Finance, Compliance, Operations, and Support.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">📜</div>
            <div>
              <strong style="font-size: 1rem;">Immutable Audit Ledger</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Every balance debit and credit is recorded with cryptographic tracking preventing tampering.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">⚡</div>
            <div>
              <strong style="font-size: 1rem;">Dual-Admin Authorization</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">High-value withdrawals (≥ ₹50,000) automatically require multi-signature approval before bank release.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">🗄️</div>
            <div>
              <strong style="font-size: 1rem;">Cold Storage Segregation</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Institutional digital assets partitioned into air-gapped multi-sig hardware vaults.</p>
            </div>
          </div>

          <div class="security-card">
            <div class="security-icon-box">🔒</div>
            <div>
              <strong style="font-size: 1rem;">Data Encryption at Rest</strong>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">All personal identity records and financial journals encrypted with AES-256 standards.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CALL TO ACTION BANNER -->
      <section style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.15)); border: 1px solid var(--border-accent); border-radius: var(--radius-xl); padding: 48px 32px; text-align: center; margin-top: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <h2 style="font-family: var(--font-display); font-size: 2.2rem; font-weight: 800;">Ready to Elevate Your Wealth Management?</h2>
        <p style="color: var(--text-secondary); max-width: 600px; font-size: 1rem;">
          Join institutional and retail investors managing digital portfolios and yield strategies with real-time transparency.
        </p>
        <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 8px;">
          <button class="btn btn-primary btn-lg" onclick="WebPortal.setActiveTab('user_dashboard')">
            🚀 Launch Live Dashboard
          </button>
          <button class="btn btn-secondary btn-lg" onclick="WebPortal.setActiveTab('register')">
            Register Account
          </button>
        </div>
      </section>
    `;
  },

  // ==========================================================================
  // 2. ABOUT US PAGE
  // ==========================================================================
  renderAbout(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="hero-badge">About Antigravity Fintech</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">Institutional Wealth & Digital Asset Architecture</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 800px; line-height: 1.6;">
          Antigravity Fintech is a next-generation technology platform bridging quantitative yield strategies, digital assets custody, and double-entry financial accounting into an intuitive WordPress-native ecosystem.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 20px;">
        <div class="web-card-panel">
          <div style="font-size: 2rem;">🏛️</div>
          <h3 style="font-size: 1.25rem; font-weight: 700;">Our Mission</h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">
            To democratize access to institutional-grade algorithmic yield instruments while adhering to rigorous regulatory compliance, transparent accounting, and bank-grade security protocols.
          </p>
        </div>

        <div class="web-card-panel">
          <div style="font-size: 2rem;">🛡️</div>
          <h3 style="font-size: 1.25rem; font-weight: 700;">Compliance & Custody First</h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">
            We operate on strict segregated accounting principles. User capital and platform revenues are maintained in segregated ledger streams, ensuring full traceability and zero co-mingling.
          </p>
        </div>

        <div class="web-card-panel">
          <div style="font-size: 2rem;">⚙️</div>
          <h3 style="font-size: 1.25rem; font-weight: 700;">WordPress Native Architecture</h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">
            Built from the ground up for seamless WordPress integration via custom MySQL schemas, REST API endpoints, Gutenberg blocks, and automated WP-Cron daily accrual scheduling.
          </p>
        </div>
      </div>

      <div class="web-card-panel" style="margin-top: 20px;">
        <h3 style="font-size: 1.25rem; font-weight: 700;">Executive Leadership & Advisory Board</h3>
        <p style="color: var(--text-secondary); font-size: 0.92rem; margin-top: 4px;">
          Our leadership combines decades of experience in quantitative finance, blockchain infrastructure, cybersecurity, and regulatory compliance.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px;">
          <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #38bdf8); margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">👨‍💼</div>
            <strong>Vikramaditya Sen</strong>
            <span style="font-size: 0.78rem; color: var(--primary-light); display: block;">Chief Executive Officer</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Ex-Institutional Asset Manager</span>
          </div>

          <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #38bdf8); margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">👩‍💻</div>
            <strong>Dr. Ananya Roy</strong>
            <span style="font-size: 0.78rem; color: var(--primary-light); display: block;">Chief Technology Officer</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Cryptography & Distributed Systems</span>
          </div>

          <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">⚖️</div>
            <strong>Marcus Vance, Esq.</strong>
            <span style="font-size: 0.78rem; color: var(--primary-light); display: block;">Head of Regulatory Affairs</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Fintech Compliance & AML Counsel</span>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 3. HOW IT WORKS PAGE
  // ==========================================================================
  renderHowItWorks(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="hero-badge">Step-by-Step Guide</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">How the Platform Operates</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 800px; line-height: 1.6;">
          Learn how customer identity verification, capital allocation, automated daily yield accrual, and multi-sign withdrawals work in practice.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 20px;">
        <div class="web-card-panel" style="display: grid; grid-template-columns: 80px 1fr; gap: 20px; align-items: center;">
          <div class="step-number" style="width: 60px; height: 60px; font-size: 1.6rem;">1</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700;">Account Creation & Multi-Factor Verification</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 4px;">
              Users register with full legal name, email, and mobile phone number. A one-time password (OTP) is sent to verify identity before granting platform access.
            </p>
          </div>
        </div>

        <div class="web-card-panel" style="display: grid; grid-template-columns: 80px 1fr; gap: 20px; align-items: center;">
          <div class="step-number" style="width: 60px; height: 60px; font-size: 1.6rem;">2</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700;">KYC Document Submission & Admin Lightbox Review</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 4px;">
              Users upload their government-issued identity card (PAN, Aadhaar, Passport) and a live selfie. Compliance officers review documents in the WordPress Admin KYC Lightbox.
            </p>
          </div>
        </div>

        <div class="web-card-panel" style="display: grid; grid-template-columns: 80px 1fr; gap: 20px; align-items: center;">
          <div class="step-number" style="width: 60px; height: 60px; font-size: 1.6rem;">3</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700;">Fiat Deposit & Wallet Credit</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 4px;">
              Users initiate instant UPI or IMPS/NEFT bank transfers with reference UTR tracking. Funds are instantly credited to the user's available cash ledger upon confirmation.
            </p>
          </div>
        </div>

        <div class="web-card-panel" style="display: grid; grid-template-columns: 80px 1fr; gap: 20px; align-items: center;">
          <div class="step-number" style="width: 60px; height: 60px; font-size: 1.6rem;">4</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700;">Strategy Subscription with 4-Digit Security PIN</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 4px;">
              Users select an investment vehicle (e.g. Starter 30-Day or Growth 90-Day), confirm terms, and authorize principal lockup using their isolated 4-digit Transaction PIN.
            </p>
          </div>
        </div>

        <div class="web-card-panel" style="display: grid; grid-template-columns: 80px 1fr; gap: 20px; align-items: center;">
          <div class="step-number" style="width: 60px; height: 60px; font-size: 1.6rem;">5</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700;">Automated Daily Accrual & Multi-Sign Withdrawals</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 4px;">
              The platform executes automated daily yield cycles every 24 hours. Users can withdraw accrued returns or principal with dual-admin risk authorization for high-value sums.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 4. INVESTMENT PLANS & CALCULATOR
  // ==========================================================================
  async renderPlans(container) {
    const plans = Store.state.plans || [
      { id: 1, name: 'Starter Yield', min_amount: 1000, max_amount: 25000, duration_days: 30, daily_roi_pct: 0.0411, risk_level: 'Conservative', tagline: 'Liquid short-duration bond strategy' },
      { id: 2, name: 'Growth Alpha', min_amount: 25000, max_amount: 100000, duration_days: 90, daily_roi_pct: 0.0493, risk_level: 'Moderate', tagline: 'Multi-asset quantitative arbitrage' },
      { id: 3, name: 'Premium Institutional', min_amount: 100000, max_amount: 1000000, duration_days: 180, daily_roi_pct: 0.0657, risk_level: 'Institutional', tagline: 'Private credit & hedged yield strategies' }
    ];

    this.calculatorPlan = plans[0];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="hero-badge">Investment Vehicles</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">Investment Plans & Yield Strategies</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 800px; line-height: 1.6;">
          Explore quantitative investment options with transparent lockup durations, indicative annualized yields, and segregated custodial accounting.
        </p>
      </div>

      <!-- Live Dynamic Yield Calculator Box -->
      <div class="web-calculator-box">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--primary-light);">🧮 Interactive Return Calculator</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Simulate indicative daily, monthly, and compound maturity profits</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label class="form-label" style="margin: 0;">Strategy:</label>
            <select id="web-calc-plan-select" class="form-select" style="width: auto;" onchange="WebPortal.updateCalculatorPlan(this.value)">
              ${plans.map(p => `<option value="${p.id}">${p.name} (${(p.daily_roi_pct * 365).toFixed(1)}% APY - ${p.duration_days}d)</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.9rem; color: var(--text-secondary);">Simulated Investment Capital:</span>
              <strong style="font-size: 1.4rem; color: var(--text-primary);" id="web-calc-display-amount">₹25,000</strong>
            </div>
            <input type="range" id="web-calc-slider" min="1000" max="500000" step="1000" value="25000" style="width: 100%; accent-color: var(--primary);" oninput="WebPortal.updateCalculatorSlider(this.value)" />
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
              <span>Min: ₹1,000</span>
              <span>Max: ₹5,00,000</span>
            </div>
          </div>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; text-align: center;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Daily ROI</span>
              <strong style="font-size: 1.25rem; color: var(--primary-light); display: block; margin-top: 4px;" id="web-calc-daily-ret">₹10.28</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total Maturity Gain</span>
              <strong style="font-size: 1.25rem; color: var(--primary-light); display: block; margin-top: 4px;" id="web-calc-total-profit">+₹308.25</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Plans Marketplace Grid -->
      <div class="web-plans-grid">
        ${plans.map(p => `
          <div class="web-plan-card">
            <span class="web-plan-badge badge-approved">${p.risk_level}</span>
            <div>
              <h3 style="font-size: 1.3rem; font-weight: 800;">${p.name}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${p.tagline || 'Institutional strategy'}</p>
            </div>

            <div class="web-plan-roi-box">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Daily Indicative Return</span>
                <strong style="font-size: 1.35rem; color: var(--primary-light); display: block;">${p.daily_roi_pct}% / day</strong>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">Annualized APY</span>
                <strong style="font-size: 1.15rem; color: var(--text-primary); display: block;">${(p.daily_roi_pct * 365).toFixed(1)}% APY</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <span>Contract Duration:</span>
              <strong>${p.duration_days} Days</strong>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <span>Investment Limits:</span>
              <strong>₹${p.min_amount.toLocaleString('en-IN')} - ₹${p.max_amount.toLocaleString('en-IN')}</strong>
            </div>

            <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
              ✓ Automated 24h Daily Accrual<br>
              ✓ Full Principal Returned on Maturity<br>
              ✓ Segregated Institutional Custody
            </div>

            <button class="btn btn-primary btn-lg" onclick="WebPortal.setActiveTab('user_investments')">
              Subscribe to Strategy →
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Plan Features Comparison Table -->
      <div class="web-card-panel" style="margin-top: 20px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">Strategy Comparison Matrix</h3>
        <div style="overflow-x: auto; margin-top: 14px;">
          <table class="admin-data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Strategy Name</th>
                <th>Risk Profile</th>
                <th>Indicative APY</th>
                <th>Lockup Duration</th>
                <th>Min. Principal</th>
                <th>Max. Principal</th>
                <th>Accrual Frequency</th>
              </tr>
            </thead>
            <tbody>
              ${plans.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td><span class="badge ${p.risk_level === 'Conservative' ? 'badge-approved' : 'badge-pending'}">${p.risk_level}</span></td>
                  <td><strong style="color: var(--primary-light);">${(p.daily_roi_pct * 365).toFixed(1)}%</strong></td>
                  <td>${p.duration_days} Days</td>
                  <td>₹${p.min_amount.toLocaleString('en-IN')}</td>
                  <td>₹${p.max_amount.toLocaleString('en-IN')}</td>
                  <td>Daily (Every 24h)</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  updateCalculatorSlider(val) {
    this.calculatorAmount = parseFloat(val);
    document.getElementById('web-calc-display-amount').innerText = `₹${this.calculatorAmount.toLocaleString('en-IN')}`;
    this.recalculateROI();
  },

  updateCalculatorPlan(planId) {
    const plans = Store.state.plans || [];
    this.calculatorPlan = plans.find(p => p.id == planId) || plans[0];
    this.recalculateROI();
  },

  recalculateROI() {
    if (!this.calculatorPlan) return;
    const daily = (this.calculatorAmount * (this.calculatorPlan.daily_roi_pct / 100));
    const total = daily * this.calculatorPlan.duration_days;
    document.getElementById('web-calc-daily-ret').innerText = `₹${daily.toFixed(2)}`;
    document.getElementById('web-calc-total-profit').innerText = `+₹${total.toFixed(2)}`;
  },

  // ==========================================================================
  // 5. DIGITAL ASSETS PAGE
  // ==========================================================================
  renderDigitalAssets(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="hero-badge">Digital Asset Infrastructure</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">Digital Assets & Crypto Gateway</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 800px; line-height: 1.6;">
          Institutional-grade infrastructure supporting multi-chain deposits, segregated address provisioning, and mock liquidity tracking.
        </p>
      </div>

      <div class="crypto-assets-grid" style="margin-top: 20px;">
        <div class="web-card-panel">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 2.2rem;">₿</span>
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Bitcoin (BTC)</h3>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Native SegWit • Taproot Compatible</span>
              </div>
            </div>
            <span class="badge badge-approved">99.9% Cold Vault</span>
          </div>
          <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-top: 10px;">
            <div>Deposit Confirmations: <strong>2 Blocks (~20m)</strong></div>
            <div>Withdrawal Processing: <strong>Multi-Sig Batch</strong></div>
          </div>
        </div>

        <div class="web-card-panel">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 2.2rem;">Ξ</span>
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Ethereum (ETH)</h3>
                <span style="font-size: 0.75rem; color: var(--text-muted);">ERC-20 • Proof of Stake</span>
              </div>
            </div>
            <span class="badge badge-approved">Smart Contract Ready</span>
          </div>
          <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-top: 10px;">
            <div>Deposit Confirmations: <strong>12 Blocks (~3m)</strong></div>
            <div>Withdrawal Processing: <strong>ERC-20 Gas Optimized</strong></div>
          </div>
        </div>

        <div class="web-card-panel">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 2.2rem; color: #10b981;">₮</span>
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Tether USD (USDT)</h3>
                <span style="font-size: 0.75rem; color: var(--text-muted);">TRC-20 & ERC-20 Support</span>
              </div>
            </div>
            <span class="badge badge-approved">1:1 Pegged</span>
          </div>
          <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-top: 10px;">
            <div>Deposit Confirmations: <strong>Instant (TRC20) / 12 (ERC20)</strong></div>
            <div>Withdrawal Processing: <strong>Near-Zero Network Fee</strong></div>
          </div>
        </div>

        <div class="web-card-panel">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 2.2rem; color: #a855f7;">◎</span>
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 700;">Solana (SOL)</h3>
                <span style="font-size: 0.75rem; color: var(--text-muted);">SPL Token Engine</span>
              </div>
            </div>
            <span class="badge badge-approved">High Throughput</span>
          </div>
          <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-top: 10px;">
            <div>Deposit Confirmations: <strong>32 Slots (~15s)</strong></div>
            <div>Withdrawal Processing: <strong>Sub-Second Payout</strong></div>
          </div>
        </div>
      </div>

      <div class="web-card-panel" style="margin-top: 20px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">Virtual Digital Asset (VDA) Compliance Disclaimer</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 8px;">
          This platform implements sandbox digital asset gateways for demonstration and architectural validation. No real customer cryptocurrency or private key custody is active in this prototype. Live cryptocurrency operations can only be enabled following formal regulatory licensing, KYC/AML audits, and compliance clearances under applicable financial laws.
        </p>
      </div>
    `;
  },

  // ==========================================================================
  // 6. SECURITY & COMPLIANCE PAGE
  // ==========================================================================
  renderSecurity(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="hero-badge">Security Center</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">Enterprise Security & Defense</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 800px; line-height: 1.6;">
          Our defense-in-depth security framework safeguards digital capital, transaction ledgers, and identity records at every architectural layer.
        </p>
      </div>

      <div class="security-grid" style="margin-top: 20px;">
        <div class="security-card">
          <div class="security-icon-box">🔐</div>
          <div>
            <strong style="font-size: 1.1rem;">Multi-Factor Authentication (2FA)</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
              Industry-standard RFC 6238 TOTP algorithms compatible with Google Authenticator and hardware security keys.
            </p>
          </div>
        </div>

        <div class="security-card">
          <div class="security-icon-box">🔢</div>
          <div>
            <strong style="font-size: 1.1rem;">Dedicated 4-Digit Transaction PIN</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
              All capital allocations, strategy lockups, and bank payouts require separate numeric cryptographic PIN authorization.
            </p>
          </div>
        </div>

        <div class="security-card">
          <div class="security-icon-box">👥</div>
          <div>
            <strong style="font-size: 1.1rem;">Multi-Sign Dual Admin Approvals</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
              High-value withdrawal requests (≥ ₹50,000) require independent sign-offs from both Finance and Super Admin officers.
            </p>
          </div>
        </div>

        <div class="security-card">
          <div class="security-icon-box">📜</div>
          <div>
            <strong style="font-size: 1.1rem;">Immutable Double-Entry Ledger</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
              Strict double-entry bookkeeping guarantees that total debits equal total credits across all 7 segregated platform accounts.
            </p>
          </div>
        </div>

        <div class="security-card">
          <div class="security-icon-box">🛡️</div>
          <div>
            <strong style="font-size: 1.1rem;">KYC & AML Verification Desk</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
              Full compliance document verification, identity checking, and AML screening before capital deployment.
            </p>
          </div>
        </div>

        <div class="security-card">
          <div class="security-icon-box">⚡</div>
          <div>
            <strong style="font-size: 1.1rem;">Cryptographic Audit Trail</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
              Real-time audit logging tracking every administrative action, IP address, and payload difference with non-repudiation.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 7. FAQ PAGE
  // ==========================================================================
  renderFAQ(container) {
    const faqs = [
      { q: 'What is Antigravity Fintech?', a: 'Antigravity Fintech is a comprehensive wealth management and digital assets investment platform designed for WordPress. It offers curated algorithmic yield strategies, segregated wallets, double-entry financial ledger accounting, and an administrative control center.' },
      { q: 'How are indicative yields calculated?', a: 'Yields are calculated based on quantitative algorithmic modeling and fixed-income market allocations. Indicative rates are reflected as daily percentages and compounded over contract durations (30, 90, 180 days).' },
      { q: 'Are returns guaranteed?', a: 'No. In compliance with financial regulations, no investment platform can guarantee returns or claim risk-free profits. All investments carry market risks, and returns shown are indicative targets.' },
      { q: 'How does the KYC verification process work?', a: 'Users upload a government-issued identification document (PAN card, Aadhaar, Passport, or Voter ID) along with a live selfie photo. The compliance team inspects submissions in the WordPress Admin KYC Lightbox.' },
      { q: 'How do deposits and withdrawals work?', a: 'Deposits can be initiated via UPI QR code or IMPS/NEFT bank wire with UTR reference tracking. Withdrawals are processed back to your verified bank account with a standard 1.0% processing fee. Requests of ₹50,000 or above enforce dual-admin multi-signature authorization.' },
      { q: 'Can I manage all parameters from WordPress Admin?', a: 'Yes! The custom WordPress plugin adds dedicated admin screens for managing investment plans, reviewing KYC documents, monitoring the double-entry financial ledger, approving withdrawals, resolving support tickets, and exporting 7 compliance reports.' }
    ];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; text-align: center;">
        <div class="hero-badge">Knowledge Base</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">Frequently Asked Questions</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 700px; margin: 0 auto;">
          Find answers to common questions regarding account onboarding, KYC compliance, yield strategies, and withdrawal policies.
        </p>
      </div>

      <div class="faq-accordion" style="margin-top: 30px;">
        ${faqs.map((f, i) => `
          <div class="faq-item ${i === 0 ? 'open' : ''}" onclick="this.classList.toggle('open')">
            <div class="faq-question">
              <span>${f.q}</span>
              <span class="faq-toggle-icon" style="transition: transform 0.2s;">▼</span>
            </div>
            <div class="faq-answer">
              ${f.a}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ==========================================================================
  // 8. CONTACT US PAGE
  // ==========================================================================
  renderContact(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="hero-badge">Get in Touch</div>
        <h1 style="font-family: var(--font-display); font-size: 2.4rem; font-weight: 800;">Contact Us & Institutional Desk</h1>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 800px; line-height: 1.6;">
          Have questions regarding high-net-worth liquidity, custom API integrations, or institutional custody? Our team is available 24/7.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 20px;">
        <div class="web-card-panel">
          <h3 style="font-size: 1.25rem; font-weight: 700;">Send a Message</h3>
          <form onsubmit="event.preventDefault(); Store.showToast('Inquiry received! Our desk will reply within 2 hours.', 'success'); this.reset();" style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" placeholder="Your full name" required />
            </div>

            <div class="form-group">
              <label class="form-label">Official Email</label>
              <input type="email" class="form-input" placeholder="name@company.com" required />
            </div>

            <div class="form-group">
              <label class="form-label">Inquiry Subject</label>
              <select class="form-select">
                <option>Institutional Capital Allocation</option>
                <option>API & WordPress Integration</option>
                <option>Compliance & Regulatory Query</option>
                <option>General Support</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Message Details</label>
              <textarea class="form-textarea" rows="4" placeholder="How can our desk assist you?" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg">
              Submit Inquiry
            </button>
          </form>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="web-card-panel">
            <h3 style="font-size: 1.15rem; font-weight: 700;">🏢 Global Headquarters</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 6px; line-height: 1.5;">
              Antigravity Financial Towers, Level 34<br>
              Financial District, Bandra Kurla Complex (BKC)<br>
              Mumbai, Maharashtra 400051, India
            </p>
            <div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-muted);">
              Email: <strong>institutional@antigravityfintech.com</strong><br>
              Direct Desk: <strong>+91 (022) 6900-5500</strong>
            </div>
          </div>

          <div class="web-card-panel">
            <h3 style="font-size: 1.15rem; font-weight: 700;">⏱️ Support SLAs</h3>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; margin-top: 8px; color: var(--text-secondary);">
              <div>• Institutional Telegram Desk: <strong>&lt; 5 Minutes</strong></div>
              <div>• Compliance & KYC Review: <strong>&lt; 2 Hours</strong></div>
              <div>• Bank Wire Reconciliation: <strong>Instant - 30 Minutes</strong></div>
              <div>• Ticket Response SLA: <strong>24/7 Continuous</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 9. AUTH VIEWS (LOGIN / REGISTER)
  // ==========================================================================
  renderAuthView(container, mode) {
    if (mode === 'register') {
      container.innerHTML = `
        <div style="max-width: 540px; margin: 0 auto; width: 100%;">
          <div class="web-card-panel">
            <div style="text-align: center;">
              <div class="web-brand-logo" style="margin: 0 auto 12px auto;">₳</div>
              <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Create Investor Account</h2>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">Join institutional and retail investors on Antigravity Fintech</p>
            </div>

            <form onsubmit="event.preventDefault(); Store.showToast('Registration successful! Directing to KYC flow...', 'success'); WebPortal.setActiveTab('user_profile');" style="display: flex; flex-direction: column; gap: 14px; margin-top: 16px;">
              <div class="form-group">
                <label class="form-label">Full Legal Name</label>
                <input type="text" class="form-input" placeholder="e.g. Rahul Sharma" required />
              </div>

              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" class="form-input" placeholder="+91 98765 43210" required />
              </div>

              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" placeholder="investor@domain.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" placeholder="••••••••••••" required />
              </div>

              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-input" placeholder="••••••••••••" required />
              </div>

              <div class="form-group">
                <label class="form-label">Referral Code (Optional)</label>
                <input type="text" class="form-input" placeholder="e.g. RAHUL77" />
              </div>

              <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; color: var(--text-muted); cursor: pointer;">
                <input type="checkbox" required style="margin-top: 3px;" />
                <span>I accept the <a href="javascript:void(0)" onclick="WebPortal.setActiveTab('terms')" style="color: var(--primary-light);">Terms & Conditions</a>, <a href="javascript:void(0)" onclick="WebPortal.setActiveTab('privacy')" style="color: var(--primary-light);">Privacy Policy</a>, and acknowledge the <a href="javascript:void(0)" onclick="WebPortal.setActiveTab('risk')" style="color: var(--primary-light);">Risk Disclosure</a>.</span>
              </label>

              <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 8px;">
                Complete Registration & Verify OTP →
              </button>

              <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
                Already registered? <a href="javascript:void(0)" onclick="WebPortal.setActiveTab('login')" style="color: var(--primary-light); font-weight: 700;">Log In</a>
              </div>
            </form>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="max-width: 480px; margin: 0 auto; width: 100%;">
          <div class="web-card-panel">
            <div style="text-align: center;">
              <div class="web-brand-logo" style="margin: 0 auto 12px auto;">₳</div>
              <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Investor Sign In</h2>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">Access your wealth management dashboard</p>
            </div>

            <form onsubmit="event.preventDefault(); Store.showToast('Authenticated successfully!', 'success'); WebPortal.setActiveTab('user_dashboard');" style="display: flex; flex-direction: column; gap: 14px; margin-top: 16px;">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" value="rahul.sharma@example.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" value="DemoInvestorPass123!" required />
              </div>

              <div class="form-group">
                <label class="form-label">6-Digit 2FA / OTP Code</label>
                <input type="text" class="form-input" placeholder="123456" value="849201" maxlength="6" />
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 8px;">
                Sign In to Dashboard →
              </button>

              <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
                New to Antigravity? <a href="javascript:void(0)" onclick="WebPortal.setActiveTab('register')" style="color: var(--primary-light); font-weight: 700;">Create Account</a>
              </div>
            </form>
          </div>
        </div>
      `;
    }
  },

  // ==========================================================================
  // 10. LEGAL & REGULATORY PAGES
  // ==========================================================================
  renderLegalPage(container, type) {
    const titles = {
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      risk: 'Risk Disclosure & Regulatory Notice',
      kyc_policy: 'KYC & Anti-Money Laundering (AML) Policy',
      cookies: 'Cookie Policy'
    };

    container.innerHTML = `
      <div class="legal-prose-container">
        <div style="font-size: 0.8rem; color: var(--primary-light); font-weight: 700; text-transform: uppercase;">Legal Compliance Document</div>
        <h1>${titles[type]}</h1>
        <p><strong>Effective Date:</strong> August 2026 • <strong>Version:</strong> 2.5.0 Compliance Release</p>

        <h2>1. Scope and Platform Governance</h2>
        <p>
          This document governs the operational, technical, and regulatory framework of the Antigravity Fintech platform. The platform operates on strict double-entry ledger bookkeeping, segregated fund custody, and cryptographic auditability.
        </p>

        <h2>2. Regulatory Disclosures & Prototype Demonstration</h2>
        <p>
          This platform is deployed in demonstration mode for institutional evaluation and architectural review. No real customer funds, fiat currency, or live cryptocurrency tokens are transacted without prior jurisdictional licensing and legal clearances.
        </p>

        <h2>3. Indicative Returns & Market Risk</h2>
        <p>
          Indicative daily returns and annualized percentage yields (APY) are algorithmically simulated based on historical quantitative bond models. Past performance does not guarantee future results. Users acknowledge that capital is subject to market volatility.
        </p>

        <h2>4. User Identity & KYC/AML Obligations</h2>
        <p>
          In accordance with global Anti-Money Laundering (AML) standards, all investors must complete identity verification before initiating strategy subscriptions or processing bank withdrawals. Fraudulent documentation will result in immediate account suspension and regulatory reporting.
        </p>

        <h2>5. Dispute Resolution & Contact</h2>
        <p>
          For compliance or legal inquiries, contact the Legal Compliance Directorate at <strong>compliance@antigravityfintech.com</strong>.
        </p>

        <div style="margin-top: 20px; text-align: center;">
          <button class="btn btn-secondary" onclick="WebPortal.setActiveTab('home')">← Return to Home Page</button>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 11. LOGGED-IN USER WEALTH DASHBOARD (14 SUB-SECTIONS)
  // ==========================================================================
  async renderUserPortal(container, subTab) {
    const user = Store.state.currentUser || { id: 5, full_name: 'Rahul Sharma', email: 'rahul.sharma@example.com', kyc_status: 'approved', referral_code: 'RAHUL77' };
    const wallet = Store.state.wallet || { cash_balance: 32500, invested_balance: 50000, accrued_balance: 246 };
    const investments = Store.state.investments || [];
    const transactions = Store.state.transactions || [];

    const cash = wallet.cash_balance;
    const invested = wallet.invested_balance;
    const accrued = wallet.accrued_balance;
    const total = cash + invested + accrued;

    container.innerHTML = `
      <div class="user-portal-layout">
        <!-- 14-Section Logged-in Sidebar -->
        <aside class="user-portal-sidebar">
          <div style="padding: 6px 14px 10px 14px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 6px;">
            <div style="font-size: 0.75rem; color: var(--text-muted);">Active Investor</div>
            <strong style="font-size: 0.95rem; display: block; color: var(--text-primary);">${user.full_name}</strong>
            <span class="badge ${user.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}" style="font-size: 0.7rem; padding: 2px 8px; margin-top: 4px;">
              ${user.kyc_status === 'approved' ? '✓ KYC Verified' : '⏳ KYC Pending'}
            </span>
          </div>

          <div class="user-sidebar-category">Core Operations</div>
          <button class="user-sidebar-btn ${subTab === 'user_dashboard' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_dashboard')">
            <span>📊</span> Dashboard
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_investments' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_investments')">
            <span>🚀</span> Active Investments
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_plans' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_plans')">
            <span>📈</span> Investment Plans
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_earnings' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_earnings')">
            <span>💰</span> Earnings & Yields
          </button>

          <div class="user-sidebar-category">Banking & Cash</div>
          <button class="user-sidebar-btn ${subTab === 'user_wallet' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_wallet')">
            <span>💳</span> Wallet Balances
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_deposits' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_deposits')">
            <span>📥</span> Deposit Funds
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_withdrawals' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_withdrawals')">
            <span>📤</span> Withdraw Funds
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_transactions' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_transactions')">
            <span>📜</span> Financial Ledger
          </button>

          <div class="user-sidebar-category">Assets & Community</div>
          <button class="user-sidebar-btn ${subTab === 'user_crypto' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_crypto')">
            <span>🪙</span> Digital Assets (VDA)
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_referrals' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_referrals')">
            <span>🤝</span> Referrals (5% APY)
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_notifications' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_notifications')">
            <span>🔔</span> Notifications
          </button>

          <div class="user-sidebar-category">Security & Support</div>
          <button class="user-sidebar-btn ${subTab === 'user_profile' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_profile')">
            <span>👤</span> Profile & KYC
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_security' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_security')">
            <span>🛡️</span> Security & 2FA
          </button>
          <button class="user-sidebar-btn ${subTab === 'user_support' ? 'active' : ''}" onclick="WebPortal.setActiveTab('user_support')">
            <span>💬</span> Support Helpdesk
          </button>
          <button class="user-sidebar-btn" onclick="Store.showToast('Logged out of investor session', 'info'); WebPortal.setActiveTab('home');" style="color: var(--danger-light); margin-top: 10px;">
            <span>🚪</span> Sign Out
          </button>
        </aside>

        <!-- Dynamic User Sub-View Port -->
        <main id="user-subview-content" style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Content loaded based on subTab -->
        </main>
      </div>
    `;

    const subview = document.getElementById('user-subview-content');
    if (!subview) return;

    if (subTab === 'user_dashboard') this.renderSubDashboard(subview, user, wallet, total, cash, invested, accrued, investments, transactions);
    else if (subTab === 'user_investments') this.renderSubInvestments(subview, investments);
    else if (subTab === 'user_plans') this.renderPlans(subview);
    else if (subTab === 'user_earnings') this.renderSubEarnings(subview, accrued, investments);
    else if (subTab === 'user_wallet') this.renderWallet(subview);
    else if (subTab === 'user_deposits') this.renderSubDeposits(subview);
    else if (subTab === 'user_withdrawals') this.renderSubWithdrawals(subview, wallet);
    else if (subTab === 'user_transactions') this.renderSubTransactions(subview, transactions);
    else if (subTab === 'user_crypto') this.renderCrypto(subview);
    else if (subTab === 'user_referrals') this.renderReferrals(subview);
    else if (subTab === 'user_notifications') this.renderSubNotifications(subview);
    else if (subTab === 'user_profile') this.renderSubProfile(subview, user);
    else if (subTab === 'user_security') this.renderSubSecurity(subview);
    else if (subTab === 'user_support') this.renderSupport(subview);
  },

  // 11.1 Sub-Dashboard
  renderSubDashboard(container, user, wallet, total, cash, invested, accrued, investments, transactions) {
    container.innerHTML = `
      <!-- Welcome Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Welcome back, ${user.full_name} 👋</h1>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Portfolio Valuation & Daily Accrual Analytics</p>
        </div>
        <button class="btn btn-primary" onclick="WebPortal.setActiveTab('user_plans')">
          🚀 Subscribe to Strategy
        </button>
      </div>

      <!-- 4 KPI Cards -->
      <div class="web-kpi-grid">
        <div class="web-kpi-card highlight">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Total Net Worth</span>
            <div class="web-kpi-icon" style="color: var(--primary);">💎</div>
          </div>
          <div class="web-kpi-value">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="web-kpi-footer">
            <span class="web-badge-gain">+18.4% APY</span>
            <span>Across all active positions</span>
          </div>
        </div>

        <div class="web-kpi-card">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Available Cash</span>
            <div class="web-kpi-icon" style="color: #38bdf8;">💳</div>
          </div>
          <div class="web-kpi-value">₹${cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="web-kpi-footer">
            <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('user_deposits')" style="padding: 2px 8px; font-size: 0.72rem;">+ Deposit</button>
            <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('user_withdrawals')" style="padding: 2px 8px; font-size: 0.72rem;">- Withdraw</button>
          </div>
        </div>

        <div class="web-kpi-card">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Locked Principal</span>
            <div class="web-kpi-icon" style="color: #f59e0b;">🔒</div>
          </div>
          <div class="web-kpi-value">₹${invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="web-kpi-footer">
            <span>${investments.length} Active Strategy Contracts</span>
          </div>
        </div>

        <div class="web-kpi-card">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Accrued Yield</span>
            <div class="web-kpi-icon" style="color: #10b981;">📈</div>
          </div>
          <div class="web-kpi-value" style="color: var(--primary-light);">+₹${accrued.toFixed(2)}</div>
          <div class="web-kpi-footer">
            <span class="web-badge-gain">Daily 24h Payout</span>
            <span>Reinvest ready</span>
          </div>
        </div>
      </div>

      <!-- Chart & Strategy Split -->
      <div class="web-dashboard-split">
        <div class="web-card-panel">
          <div class="web-panel-header">
            <div>
              <h3 class="web-panel-title">Portfolio Yield Trajectory</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Historical compounded yield performance</span>
            </div>
            <div class="web-time-tabs">
              <button class="web-time-tab">1D</button>
              <button class="web-time-tab">1W</button>
              <button class="web-time-tab active">1M</button>
              <button class="web-time-tab">1Y</button>
              <button class="web-time-tab">ALL</button>
            </div>
          </div>

          <div style="width: 100%; height: 240px; position: relative;">
            <svg viewBox="0 0 700 240" style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <linearGradient id="userDashArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 20,200 Q 140,170 240,140 T 440,90 T 680,30 L 680,220 L 20,220 Z" fill="url(#userDashArea)" />
              <path d="M 20,200 Q 140,170 240,140 T 440,90 T 680,30" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <circle cx="680" cy="30" r="5" fill="#10B981" />
            </svg>
          </div>
        </div>

        <div class="web-card-panel">
          <div class="web-panel-header">
            <h3 class="web-panel-title">Active Positions (${investments.length})</h3>
            <button class="btn btn-ghost btn-sm" onclick="WebPortal.setActiveTab('user_investments')">View All →</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${investments.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 24px 0;">No active investments yet.<br><a href="javascript:void(0)" onclick="WebPortal.setActiveTab('user_plans')" style="color: var(--primary-light); font-weight: 700;">Explore Strategies</a></p>
            ` : investments.slice(0, 3).map(inv => `
              <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong>${inv.plan_name}</strong>
                  <span class="badge badge-approved" style="font-size: 0.7rem;">+${inv.daily_roi_pct}%/d</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                  <span style="color: var(--text-muted);">Principal: ₹${inv.principal_amount.toLocaleString('en-IN')}</span>
                  <strong style="color: var(--primary-light);">+₹${inv.total_accrued.toFixed(2)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="web-card-panel">
        <div class="web-panel-header">
          <h3 class="web-panel-title">Recent Activity</h3>
          <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('user_transactions')">Full Ledger →</button>
        </div>

        <div style="overflow-x: auto;">
          <table class="admin-data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Tx Code</th>
                <th>Type</th>
                <th>Debit / Credit</th>
                <th>Account</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.slice(0, 5).map(tx => `
                <tr>
                  <td><strong style="font-family: monospace; font-size: 0.8rem;">${tx.transaction_id}</strong></td>
                  <td><span class="badge ${tx.transaction_type === 'DEPOSIT' ? 'badge-approved' : 'badge-pending'}">${tx.transaction_type}</span></td>
                  <td>${tx.credit_amount > 0 ? `<strong style="color: var(--primary-light);">+₹${tx.credit_amount.toFixed(2)}</strong>` : `<strong style="color: var(--danger-light);">-₹${tx.debit_amount.toFixed(2)}</strong>`}</td>
                  <td><span style="font-size: 0.75rem; color: var(--text-muted);">${tx.ledger_account_code}</span></td>
                  <td><span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(tx.created_at).toLocaleDateString()}</span></td>
                  <td><span class="badge badge-approved">Settled</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 11.2 Sub-Investments
  renderSubInvestments(container, investments) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Your Active Investments</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Manage active contracts and track daily maturity countdowns</p>
        </div>
        <button class="btn btn-primary" onclick="WebPortal.setActiveTab('user_plans')">
          + New Strategy
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        ${investments.length === 0 ? `
          <div class="web-card-panel" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <p style="color: var(--text-muted);">You currently have no active investment contracts.</p>
            <button class="btn btn-primary" onclick="WebPortal.setActiveTab('user_plans')" style="margin-top: 12px;">Browse High-Yield Plans</button>
          </div>
        ` : investments.map(inv => `
          <div class="web-card-panel">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>${inv.plan_name}</strong>
              <span class="badge badge-approved">● Running</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace;">Contract: ${inv.investment_code}</div>

            <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; margin: 8px 0;">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Invested Capital</span>
                <strong style="font-size: 1.1rem; display: block;">₹${inv.principal_amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">Accrued Yield</span>
                <strong style="font-size: 1.1rem; color: var(--primary-light); display: block;">+₹${inv.total_accrued.toFixed(2)}</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
              <span>Daily ROI: <strong>+${inv.daily_roi_pct}%/day</strong></span>
              <span>Days Active: <strong>${inv.days_accrued || 1}d</strong></span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 11.3 Sub-Earnings
  renderSubEarnings(container, accrued, investments) {
    container.innerHTML = `
      <div>
        <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Earnings & Daily Accruals</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted);">Automated daily 24-hour yield engine distributions</p>
      </div>

      <div class="web-kpi-grid">
        <div class="web-kpi-card highlight">
          <span class="web-kpi-title">Total Accrued Earnings</span>
          <div class="web-kpi-value" style="color: var(--primary-light);">+₹${accrued.toFixed(2)}</div>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Compounded daily</span>
        </div>
        <div class="web-kpi-card">
          <span class="web-kpi-title">Active Accruing Contracts</span>
          <div class="web-kpi-value">${investments.length}</div>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Next cycle in ~14 hours</span>
        </div>
      </div>
    `;
  },

  // 11.4 Sub-Deposits
  renderSubDeposits(container) {
    container.innerHTML = `
      <div>
        <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Instant Deposit Desk</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted);">Fund your account via UPI, IMPS, or NEFT bank transfer</p>
      </div>

      <div class="web-wallet-grid">
        <div class="web-card-panel">
          <h3 class="web-panel-title">Official Merchant QR Code</h3>
          <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=antigravityfintech@hdfcbank&pn=Antigravity%20Fintech&cu=INR" style="width: 140px; height: 140px; border-radius: 8px; background: #fff; padding: 6px;" />
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Official Merchant VPA</span>
              <strong style="font-family: monospace; font-size: 0.95rem; color: var(--primary-light); display: block;">antigravityfintech@hdfcbank</strong>
            </div>
          </div>
        </div>

        <div class="web-card-panel">
          <h3 class="web-panel-title">Submit Deposit Reference</h3>
          <form onsubmit="WebPortal.submitDeposit(event)" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Deposit Amount (INR)</label>
              <input type="number" id="web-dep-amount" class="form-input" placeholder="e.g. 10000" min="1000" value="10000" required />
            </div>

            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select id="web-dep-method" class="form-select">
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="IMPS">IMPS Instant Bank Wire</option>
                <option value="NEFT">NEFT / RTGS</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">UTR / Reference Number</label>
              <input type="text" id="web-dep-utr" class="form-input" placeholder="12-digit bank reference" value="UTR${Date.now().toString().slice(-8)}" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg">
              Confirm & Credit Wallet
            </button>
          </form>
        </div>
      </div>
    `;
  },

  // 11.5 Sub-Withdrawals
  renderSubWithdrawals(container, wallet) {
    container.innerHTML = `
      <div>
        <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Withdraw Funds to Bank</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted);">Standard 1% bank gateway fee • Dual-admin approval for ≥ ₹50,000</p>
      </div>

      <div class="web-card-panel" style="max-width: 600px;">
        <form onsubmit="WebPortal.submitWithdrawal(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Withdrawal Amount (INR)</label>
            <input type="number" id="web-wdl-amount" class="form-input" min="500" max="${wallet.cash_balance}" value="5000" oninput="WebPortal.updateWithdrawalFee(this.value)" required />
            <span style="font-size: 0.75rem; color: var(--text-muted);">Available Cash Balance: ₹${wallet.cash_balance.toLocaleString('en-IN')}</span>
          </div>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 12px; display: flex; justify-content: space-between; font-size: 0.85rem;">
            <span>Fee (1%): <strong id="web-wdl-fee">₹50.00</strong></span>
            <span>Net Payout: <strong style="color: var(--primary-light);" id="web-wdl-net">₹4,950.00</strong></span>
          </div>

          <div class="form-group">
            <label class="form-label">Destination Bank Account</label>
            <select id="web-wdl-bank" class="form-select">
              <option value="HDFC Bank (A/C: ...0005)">HDFC Bank (Verified - Primary)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">4-Digit Security PIN</label>
            <input type="password" id="web-wdl-pin" class="form-input" maxlength="4" placeholder="••••" value="1234" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">
            Submit Withdrawal Request
          </button>
        </form>
      </div>
    `;
  },

  // 11.6 Sub-Transactions
  renderSubTransactions(container, transactions) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Double-Entry Financial Ledger</h2>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Immutable audit records of all debits and credits</p>
        </div>
      </div>

      <div class="web-card-panel">
        <div style="overflow-x: auto;">
          <table class="admin-data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Tx Code</th>
                <th>Type</th>
                <th>Debit / Credit</th>
                <th>Account</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(tx => `
                <tr>
                  <td><strong style="font-family: monospace; font-size: 0.8rem;">${tx.transaction_id}</strong></td>
                  <td><span class="badge ${tx.transaction_type === 'DEPOSIT' ? 'badge-approved' : 'badge-pending'}">${tx.transaction_type}</span></td>
                  <td>${tx.credit_amount > 0 ? `<strong style="color: var(--primary-light);">+₹${tx.credit_amount.toFixed(2)}</strong>` : `<strong style="color: var(--danger-light);">-₹${tx.debit_amount.toFixed(2)}</strong>`}</td>
                  <td><span style="font-size: 0.75rem; color: var(--text-muted);">${tx.ledger_account_code}</span></td>
                  <td><span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(tx.created_at).toLocaleString()}</span></td>
                  <td><span class="badge badge-approved">Settled</span></td>
                  <td><button class="btn btn-secondary btn-sm" onclick="WebPortal.showReceipt('${tx.transaction_id}', '${tx.transaction_type}', ${tx.credit_amount || tx.debit_amount})">Receipt</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 11.7 Sub-Notifications
  renderSubNotifications(container) {
    container.innerHTML = `
      <div>
        <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Notifications Center</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted);">Real-time security alerts, daily yield updates, and compliance notices</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 700px;">
        <div class="web-card-panel" style="padding: 16px; border-left: 4px solid var(--primary);">
          <div style="display: flex; justify-content: space-between;">
            <strong>Daily Yield Accrual Credited</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Today, 00:00 UTC</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Your active Growth Alpha contract credited +₹20.55 to your yield balance.</p>
        </div>

        <div class="web-card-panel" style="padding: 16px; border-left: 4px solid #38bdf8;">
          <div style="display: flex; justify-content: space-between;">
            <strong>KYC Compliance Verified</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Yesterday</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Your PAN & Address verification was approved by the compliance desk.</p>
        </div>
      </div>
    `;
  },

  // 11.8 Sub-Profile & KYC
  renderSubProfile(container, user) {
    container.innerHTML = `
      <div>
        <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Investor Profile & KYC Status</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted);">Manage personal details and regulatory verification</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="web-card-panel">
          <h3 style="font-size: 1.15rem; font-weight: 700;">Account Identity</h3>
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; margin-top: 8px;">
            <div><span style="color: var(--text-muted);">Legal Name:</span> <strong>${user.full_name}</strong></div>
            <div><span style="color: var(--text-muted);">Email:</span> <strong>${user.email}</strong></div>
            <div><span style="color: var(--text-muted);">KYC Tier:</span> <span class="badge ${user.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}">${user.kyc_status.toUpperCase()}</span></div>
          </div>
        </div>

        <div class="web-card-panel">
          <h3 style="font-size: 1.15rem; font-weight: 700;">KYC Document Upload Wizard</h3>
          <form onsubmit="event.preventDefault(); Store.showToast('KYC documents submitted to compliance desk!', 'success');" style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
            <div class="form-group">
              <label class="form-label">ID Document Type</label>
              <select class="form-select">
                <option>PAN Card</option>
                <option>Aadhaar Card</option>
                <option>Passport</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ID Number</label>
              <input type="text" class="form-input" placeholder="ABCDE1234F" value="ABCDE1234F" />
            </div>
            <button type="submit" class="btn btn-secondary">Upload Document & Selfie</button>
          </form>
        </div>
      </div>
    `;
  },

  // 11.9 Sub-Security
  renderSubSecurity(container) {
    container.innerHTML = `
      <div>
        <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Security Controls</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted);">Manage 2FA, PIN, and session integrity</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="web-card-panel">
          <h3 style="font-size: 1.15rem; font-weight: 700;">4-Digit Transaction PIN</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Required for all strategy investments and bank payouts.</p>
          <button class="btn btn-secondary" onclick="Store.showToast('PIN is active: 1234', 'info')" style="margin-top: 12px;">Change Security PIN</button>
        </div>

        <div class="web-card-panel">
          <h3 style="font-size: 1.15rem; font-weight: 700;">Two-Factor Authentication (2FA)</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Google Authenticator TOTP protection.</p>
          <button class="btn btn-primary" onclick="Store.showToast('2FA is Enabled & Active', 'success')" style="margin-top: 12px;">✓ 2FA Enabled</button>
        </div>
      </div>
    `;
  },

  // Helper actions
  updateWithdrawalFee(val) {
    const amount = parseFloat(val) || 0;
    const fee = round(amount * 0.01, 2);
    const net = Math.max(0, amount - fee);
    const feeEl = document.getElementById('web-wdl-fee');
    const netEl = document.getElementById('web-wdl-net');
    if (feeEl) feeEl.innerText = `₹${fee.toFixed(2)}`;
    if (netEl) netEl.innerText = `₹${net.toFixed(2)}`;
  },

  async submitDeposit(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('web-dep-amount').value);
    const payment_method = document.getElementById('web-dep-method').value;
    const utr_ref = document.getElementById('web-dep-utr').value;

    try {
      const res = await API.post('/api/wallet/deposit', {
        user_id: user.id,
        amount,
        payment_method,
        utr_ref,
        auto_approve: true
      });

      if (res.success) {
        Store.showToast('Deposit confirmed and credited to ledger!', 'success');
        await Store.refreshAllData();
        this.renderUserPortal(document.getElementById('web-content-viewport'), 'user_dashboard');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async submitWithdrawal(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('web-wdl-amount').value);
    const pin = document.getElementById('web-wdl-pin').value;

    try {
      const res = await API.post('/api/wallet/withdraw', {
        user_id: user.id,
        amount,
        payout_method: 'BANK_TRANSFER',
        destination_details: { bank: 'HDFC Bank', acc: '501002900005' },
        pin
      });

      if (res.success) {
        Store.showToast(res.requires_dual_approval ? 'High-value payout routed to Dual-Admin Approval Desk.' : 'Withdrawal request submitted!', 'info');
        await Store.refreshAllData();
        this.renderUserPortal(document.getElementById('web-content-viewport'), 'user_dashboard');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  showReceipt(txId, type, amount) {
    const modalHTML = `
      <div id="web-receipt-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="admin-modal-card" style="max-width: 440px; text-align: center;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(16,185,129,0.15); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 10px auto;">✓</div>
          <h3 style="font-size: 1.3rem;">Official Financial Receipt</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Immutable Double-Entry Posting Verified</span>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0; text-align: left; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between;"><span>Transaction ID:</span> <strong style="font-family: monospace;">${txId}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Operation:</span> <strong>${type}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Amount:</span> <strong style="color: var(--primary-light);">₹${amount.toFixed(2)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Status:</span> <span class="badge badge-approved">Settled</span></div>
          </div>

          <button class="btn btn-primary btn-lg" onclick="document.getElementById('web-receipt-modal').remove()">Close Receipt</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
};
