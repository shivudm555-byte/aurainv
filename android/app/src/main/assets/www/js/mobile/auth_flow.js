// ==========================================================================
// 2026 Fintech Mobile App - Authentication & Onboarding Flow
// ==========================================================================

const MobileAuth = {
  currentOnboardingSlide: 0,

  // ==========================================================================
  // 1. SPLASH SCREEN
  // ==========================================================================
  renderSplash(container) {
    container.innerHTML = `
      <div class="auth-screen-layout splash-screen">
        <div class="splash-center-content">
          <div class="splash-logo-glow-wrapper">
            <div class="splash-logo-emblem">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L4 40H44L24 4Z" stroke="#00F0FF" stroke-width="3.5" stroke-linejoin="round"/>
                <path d="M24 16L14 34H34L24 16Z" fill="url(#cyan-grad)" stroke="#00F0FF" stroke-width="1.5"/>
                <defs>
                  <linearGradient id="cyan-grad" x1="24" y1="16" x2="24" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00F0FF" stop-opacity="0.6"/>
                    <stop offset="1" stop-color="#0066FF" stop-opacity="0.1"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h1 class="splash-brand-title">AURA WEALTH</h1>
          <p class="splash-tagline">Invest. Track. Grow.</p>
        </div>

        <div class="splash-footer-loader">
          <div class="splash-progress-bar">
            <div class="splash-progress-fill"></div>
          </div>
          <span class="splash-version-tag">2026 Institutional Engine v2.6.0</span>
        </div>
      </div>
    `;

    // Automatically transition to Onboarding after 1.8s
    setTimeout(() => {
      if (Store.state.currentMobileScreen === 'splash') {
        Store.setMobileScreen('onboarding');
      }
    }, 1800);
  },

  // ==========================================================================
  // 2. ONBOARDING FLOW (3 Slides)
  // ==========================================================================
  renderOnboarding(container) {
    this.currentOnboardingSlide = 0;
    const slides = [
      {
        title: 'Your Portfolio, One Place',
        description: 'Track investments, yield accruals, cash balances and portfolio activity from a single, unified dashboard.',
        badge: '01 / 03 • UNIFIED DASHBOARD',
        iconSvg: `
          <div class="onboarding-art-box">
            <div class="art-circle-orbit"></div>
            <div class="art-stat-card">
              <span class="art-card-label">Total Portfolio</span>
              <strong class="art-card-val">₹25,450.00</strong>
              <span class="art-card-delta">+1.78% Today</span>
            </div>
          </div>
        `
      },
      {
        title: 'Simple Investment Management',
        description: 'Explore curated quantitative yield strategies, automate recurring investments and monitor real-time daily returns.',
        badge: '02 / 03 • QUANTITATIVE YIELD',
        iconSvg: `
          <div class="onboarding-art-box">
            <div class="art-circle-orbit" style="border-color: rgba(16, 185, 129, 0.4);"></div>
            <div class="art-stat-card" style="border-color: rgba(16, 185, 129, 0.3);">
              <span class="art-card-label">Growth Alpha Strategy</span>
              <strong class="art-card-val" style="color: #10B981;">20.0% Indicative APY</strong>
              <span class="art-card-delta">Automated Rebalancing</span>
            </div>
          </div>
        `
      },
      {
        title: 'Security Comes First',
        description: 'Bank-grade double-entry ledger encryption, multi-tier KYC compliance, 2FA, 4-digit PIN and biometric authentication.',
        badge: '03 / 03 • BANK-GRADE SECURITY',
        iconSvg: `
          <div class="onboarding-art-box">
            <div class="art-circle-orbit" style="border-color: rgba(168, 85, 247, 0.4);"></div>
            <div class="art-stat-card" style="border-color: rgba(168, 85, 247, 0.3);">
              <span class="art-card-label">Account Protection</span>
              <strong class="art-card-val" style="color: #A855F7;">Face ID & Touch ID</strong>
              <span class="art-card-delta" style="background: rgba(168, 85, 247, 0.15); color: #A855F7;">100% Strong Security</span>
            </div>
          </div>
        `
      }
    ];

    const updateSlideView = () => {
      const slide = slides[this.currentOnboardingSlide];
      const isLast = this.currentOnboardingSlide === slides.length - 1;

      container.innerHTML = `
        <div class="auth-screen-layout onboarding-screen">
          <div class="onboarding-top-bar">
            <span class="onboarding-badge-pill">${slide.badge}</span>
            <button class="skip-btn" onclick="Store.setMobileScreen('login')">Skip</button>
          </div>

          <div class="onboarding-illustration-area">
            ${slide.iconSvg}
          </div>

          <div class="onboarding-content-area">
            <h2 class="onboarding-title">${slide.title}</h2>
            <p class="onboarding-desc">${slide.description}</p>

            <div class="onboarding-dots-row">
              ${slides.map((_, i) => `
                <div class="onboarding-dot ${i === this.currentOnboardingSlide ? 'active' : ''}"></div>
              `).join('')}
            </div>
          </div>

          <div class="onboarding-actions-area">
            ${isLast ? `
              <button class="btn btn-primary btn-full btn-lg" onclick="Store.setMobileScreen('login')">
                <span>Get Started</span> →
              </button>
            ` : `
              <div style="display: flex; gap: 12px; width: 100%;">
                <button class="btn btn-secondary btn-full btn-lg" onclick="Store.setMobileScreen('login')">
                  Skip
                </button>
                <button class="btn btn-primary btn-full btn-lg" id="onboarding-next-btn">
                  <span>Next</span> →
                </button>
              </div>
            `}
          </div>
        </div>
      `;

      const nextBtn = document.getElementById('onboarding-next-btn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          Haptics.tap();
          this.currentOnboardingSlide++;
          updateSlideView();
        };
      }
    };

    updateSlideView();
  },

  // ==========================================================================
  // 3. LOGIN SCREEN
  // ==========================================================================
  renderLogin(container) {
    container.innerHTML = `
      <div class="auth-screen-layout login-screen">
        <div class="auth-header-block">
          <div class="auth-brand-emblem-small">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L4 40H44L24 4Z" stroke="#00F0FF" stroke-width="4" stroke-linejoin="round"/>
              <path d="M24 16L14 34H34L24 16Z" fill="#00F0FF"/>
            </svg>
          </div>
          <h2 class="auth-page-title">Welcome Back</h2>
          <p class="auth-page-sub">Enter your credentials to access your portfolio</p>
        </div>

        <form id="mobile-login-form" class="auth-form-card" onsubmit="event.preventDefault(); MobileAuth.handleLoginSubmit();">
          <div class="form-group">
            <label class="form-label">Email / Mobile Number</label>
            <div class="input-with-icon">
              <span class="input-icon">✉️</span>
              <input type="text" id="login-identifier" class="form-input" placeholder="alex.morgan@aurafin.com" value="alex.morgan@aurafin.com" required />
            </div>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label">Password</label>
              <a href="javascript:void(0)" class="auth-link-text" onclick="Store.setMobileScreen('forgot_password')">Forgot?</a>
            </div>
            <div class="input-with-icon">
              <span class="input-icon">🔒</span>
              <input type="password" id="login-password" class="form-input" placeholder="••••••••" value="Fintech@123" required />
            </div>
          </div>

          <div class="form-group" style="margin-top: 8px;">
            <button type="submit" class="btn btn-primary btn-full btn-lg">
              <span>Sign In</span> →
            </button>
          </div>

          <div class="auth-divider">
            <span>OR</span>
          </div>

          <button type="button" class="btn btn-secondary btn-full" onclick="Store.setMobileScreen('otp', { purpose: 'login', target: 'alex.morgan@aurafin.com' })">
            <span>📲 Continue with OTP</span>
          </button>

          <button type="button" class="btn btn-outline btn-full" style="margin-top: 8px; border-color: rgba(0, 240, 255, 0.3); color: #00F0FF;" onclick="MobileAuth.handleBiometricQuickLogin()">
            <span>⚡ Biometric Instant Login</span>
          </button>
        </form>

        <div class="auth-footer-text">
          <span>Don't have an account?</span>
          <a href="javascript:void(0)" class="auth-link-highlight" onclick="Store.setMobileScreen('signup')">Create Account</a>
        </div>
      </div>
    `;
  },

  handleLoginSubmit() {
    Haptics.tap();
    const idVal = document.getElementById('login-identifier').value.trim();
    
    // Switch to Alex Morgan
    Store.switchDemoUser(5);
    Haptics.success();
    Store.setMobileScreen('home');
  },

  handleBiometricQuickLogin() {
    MobileSecurity.showBiometricPromptModal({
      title: 'Biometric Login',
      subtitle: 'Scan Face ID / Touch ID to authenticate as Alex Morgan',
      onSuccess: () => {
        Store.switchDemoUser(5);
        Store.setMobileScreen('home');
      }
    });
  },

  // ==========================================================================
  // 4. REGISTRATION SCREEN
  // ==========================================================================
  renderSignUp(container) {
    container.innerHTML = `
      <div class="auth-screen-layout signup-screen">
        <div class="auth-header-block">
          <div class="auth-brand-emblem-small">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L4 40H44L24 4Z" stroke="#00F0FF" stroke-width="4" stroke-linejoin="round"/>
              <path d="M24 16L14 34H34L24 16Z" fill="#00F0FF"/>
            </svg>
          </div>
          <h2 class="auth-page-title">Create Account</h2>
          <p class="auth-page-sub">Join AURA WEALTH and start compounding</p>
        </div>

        <form id="mobile-signup-form" class="auth-form-card" onsubmit="event.preventDefault(); MobileAuth.handleSignUpSubmit();">
          <div class="form-group">
            <label class="form-label">Full Legal Name</label>
            <input type="text" id="signup-fullname" class="form-input" placeholder="e.g. Alex Morgan" required />
          </div>

          <div class="form-group">
            <label class="form-label">Mobile Number</label>
            <input type="tel" id="signup-mobile" class="form-input" placeholder="+91 98765 43210" required />
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="signup-email" class="form-input" placeholder="name@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="signup-password" class="form-input" placeholder="Min. 8 characters" required />
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" id="signup-confirm-password" class="form-input" placeholder="Re-enter password" required />
          </div>

          <div class="form-group">
            <label class="form-label">Referral Code (Optional)</label>
            <input type="text" id="signup-referral" class="form-input" placeholder="e.g. ALEX2026" style="text-transform: uppercase;" />
          </div>

          <div class="form-group terms-checkbox-group">
            <label class="custom-checkbox-label">
              <input type="checkbox" id="signup-terms-check" required />
              <span class="terms-text">
                I agree to the <a href="javascript:void(0)" onclick="Store.setMobileScreen('terms')">Terms & Conditions</a>, <a href="javascript:void(0)" onclick="Store.setMobileScreen('privacy')">Privacy Policy</a>, and Risk Disclosures.
              </span>
            </label>
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <button type="submit" class="btn btn-primary btn-full btn-lg">
              <span>Create Account</span> →
            </button>
          </div>
        </form>

        <div class="auth-footer-text">
          <span>Already have an account?</span>
          <a href="javascript:void(0)" class="auth-link-highlight" onclick="Store.setMobileScreen('login')">Sign In</a>
        </div>
      </div>
    `;
  },

  handleSignUpSubmit() {
    Haptics.tap();
    const name = document.getElementById('signup-fullname').value.trim() || 'New Investor';
    const email = document.getElementById('signup-email').value.trim() || 'investor@example.com';
    const phone = document.getElementById('signup-mobile').value.trim() || '+91 98999 11223';
    
    // Switch to new user state & route to OTP
    Store.state.currentUser = {
      id: 99,
      full_name: name,
      email: email,
      phone: phone,
      role: 'user',
      status: 'active',
      kyc_status: 'not_started',
      is_2fa_enabled: 0,
      referral_code: 'NEW' + Math.floor(Math.random() * 1000)
    };

    Store.setMobileScreen('otp', { purpose: 'registration', target: email });
  },

  // ==========================================================================
  // 5. OTP VERIFICATION SCREEN
  // ==========================================================================
  renderOTP(container, params = {}) {
    const target = params.target || 'alex.morgan@aurafin.com';
    const purpose = params.purpose || 'verification';

    container.innerHTML = `
      <div class="auth-screen-layout otp-screen">
        <div class="auth-header-block">
          <button class="back-circle-btn" onclick="MobileRouter.goBack()">←</button>
          <h2 class="auth-page-title">Verify OTP</h2>
          <p class="auth-page-sub">Enter the 6-digit security code sent to <strong>${target}</strong></p>
        </div>

        <div class="otp-boxes-grid">
          <input type="text" maxlength="1" class="otp-box-digit" autofocus oninput="MobileAuth.handleOtpInput(this, 0)" value="7" />
          <input type="text" maxlength="1" class="otp-box-digit" oninput="MobileAuth.handleOtpInput(this, 1)" value="4" />
          <input type="text" maxlength="1" class="otp-box-digit" oninput="MobileAuth.handleOtpInput(this, 2)" value="9" />
          <input type="text" maxlength="1" class="otp-box-digit" oninput="MobileAuth.handleOtpInput(this, 3)" value="2" />
          <input type="text" maxlength="1" class="otp-box-digit" oninput="MobileAuth.handleOtpInput(this, 4)" value="0" />
          <input type="text" maxlength="1" class="otp-box-digit" oninput="MobileAuth.handleOtpInput(this, 5)" value="5" />
        </div>

        <div class="otp-timer-block">
          <span>Resend code in <strong id="otp-countdown-timer">00:45</strong></span>
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="MobileAuth.verifyOTP('${purpose}')">
          <span>Verify & Continue</span> →
        </button>

        <button class="btn btn-secondary btn-full" style="margin-top: 10px;" onclick="Haptics.tick(); alert('New OTP sent to ' + '${target}');">
          Resend OTP Code
        </button>
      </div>
    `;
  },

  handleOtpInput(el, index) {
    Haptics.tick();
    if (el.value.length === 1) {
      const inputs = document.querySelectorAll('.otp-box-digit');
      if (inputs[index + 1]) inputs[index + 1].focus();
    }
  },

  verifyOTP(purpose) {
    Haptics.success();
    if (purpose === 'registration') {
      Store.setMobileScreen('kyc');
    } else {
      Store.switchDemoUser(5);
      Store.setMobileScreen('home');
    }
  },

  // ==========================================================================
  // 6. FORGOT PASSWORD SCREEN
  // ==========================================================================
  renderForgotPassword(container) {
    container.innerHTML = `
      <div class="auth-screen-layout forgot-password-screen">
        <div class="auth-header-block">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('login')">←</button>
          <h2 class="auth-page-title">Reset Password</h2>
          <p class="auth-page-sub">Enter your registered email or phone number to receive a secure recovery code.</p>
        </div>

        <form class="auth-form-card" onsubmit="event.preventDefault(); Haptics.success(); alert('Password reset OTP sent!'); Store.setMobileScreen('otp', { purpose: 'reset', target: 'alex.morgan@aurafin.com' });">
          <div class="form-group">
            <label class="form-label">Email or Phone Number</label>
            <input type="text" class="form-input" placeholder="alex.morgan@aurafin.com" value="alex.morgan@aurafin.com" required />
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <button type="submit" class="btn btn-primary btn-full btn-lg">
              <span>Send Recovery Code</span> →
            </button>
          </div>
        </form>

        <div class="auth-footer-text">
          <a href="javascript:void(0)" class="auth-link-highlight" onclick="Store.setMobileScreen('login')">← Back to Login</a>
        </div>
      </div>
    `;
  }
};

window.MobileAuth = MobileAuth;
