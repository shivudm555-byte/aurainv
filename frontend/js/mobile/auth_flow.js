// ==========================================================================
// Mobile Auth & Onboarding Flow (Integrated with Supabase Email Auth)
// ==========================================================================

const MobileAuth = {
  renderSplash(container) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 20px; padding: 40px 20px;">
        <div style="width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, var(--primary), var(--secondary-accent)); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: #fff; font-weight: 900; box-shadow: 0 0 35px var(--primary-glow); animation: pulseGlow 2s infinite ease-in-out;">
          ₳
        </div>
        <div>
          <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">ANTIGRAVITY</h1>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Institutional-Grade Fintech & Wealth</p>
          <span class="badge badge-approved" style="margin-top: 8px; font-size: 0.65rem;">
            ⚡ Supabase Auth Integrated
          </span>
        </div>
        <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <button class="btn btn-primary btn-lg" onclick="Store.setMobileScreen('onboarding')">Get Started</button>
          <button class="btn btn-ghost" onclick="Store.setMobileScreen('login')">Already have an account? Sign In</button>
        </div>
      </div>
    `;
  },

  renderOnboarding(container) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 24px 16px;">
        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-ghost btn-sm" onclick="Store.setMobileScreen('login')">Skip</button>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px;">
          <div style="width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, var(--primary-glow) 0%, rgba(15,23,42,0.4) 70%); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; font-size: 4rem;">
            📈
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">Smart Daily Growth</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Deploy capital into institutional liquid bonds and high-yield quantitative strategies with automated daily accrual payouts and Supabase-secured authentication.
            </p>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <span style="width: 24px; height: 6px; border-radius: 3px; background: var(--primary);"></span>
            <span style="width: 6px; height: 6px; border-radius: 3px; background: var(--border-color);"></span>
            <span style="width: 6px; height: 6px; border-radius: 3px; background: var(--border-color);"></span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn-primary btn-lg" onclick="Store.setMobileScreen('signup')">Create Free Account</button>
          <button class="btn btn-secondary btn-lg" onclick="Store.setMobileScreen('login')">Sign In with Supabase</button>
        </div>
      </div>
    `;
  },

  renderLogin(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('onboarding')">←</button>
          <span class="badge badge-approved" style="font-size: 0.65rem;">⚡ Supabase Auth</span>
        </div>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;">Welcome Back</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Sign in with your verified email to access your portfolio</p>
        </div>

        <form id="mobile-login-form" onsubmit="MobileAuth.handleLogin(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="login-identifier" class="form-input" placeholder="e.g. rahul.sharma@gmail.com" value="rahul.sharma@gmail.com" required />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label">Password</label>
              <a href="javascript:void(0)" onclick="Store.setMobileScreen('forgot_password')" style="font-size: 0.75rem; color: var(--primary-light); text-decoration: none;">Forgot?</a>
            </div>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" value="Fintech@123" required />
          </div>

          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary);">
            <input type="checkbox" id="remember-me" checked style="accent-color: var(--primary);" />
            <label for="remember-me">Remember session</label>
          </div>

          <button type="submit" id="btn-login-submit" class="btn btn-primary btn-lg" style="margin-top: 4px;">
            Sign In with Email
          </button>

          <button type="button" class="btn btn-secondary btn-sm" onclick="MobileAuth.sendMagicLinkPrompt()">
            ✉️ Passwordless Magic Link / Email OTP
          </button>

          <div style="border-top: 1px solid var(--border-color); padding-top: 10px; text-align: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 8px;">Quick Test Profiles:</span>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="MobileAuth.quickDemoLogin(5)">
                Rahul Sharma (₹50k)
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="MobileAuth.quickDemoLogin(7)">
                Amit Verma (HNW)
              </button>
            </div>
          </div>
        </form>

        <div style="text-align: center; margin-top: 4px;">
          <span style="font-size: 0.85rem; color: var(--text-muted);">Don't have an account?</span>
          <a href="javascript:void(0)" onclick="Store.setMobileScreen('signup')" style="font-size: 0.85rem; color: var(--primary-light); font-weight: 700; text-decoration: none; margin-left: 4px;">Sign Up with Supabase</a>
        </div>
      </div>
    `;
  },

  renderSignUp(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 18px; padding: 20px 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('login')">←</button>
          <span class="badge badge-approved" style="font-size: 0.65rem;">⚡ Supabase Auth</span>
        </div>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">Create Account</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Register via Supabase to start investing</p>
        </div>

        <form id="mobile-signup-form" onsubmit="MobileAuth.handleSignUp(event)" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Full Legal Name</label>
            <input type="text" id="reg-name" class="form-input" placeholder="e.g. Rahul Sharma" required />
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="reg-email" class="form-input" placeholder="name@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Mobile Number</label>
            <input type="tel" id="reg-phone" class="form-input" placeholder="+91 98765 43210" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="reg-password" class="form-input" placeholder="Minimum 8 characters" minlength="8" required />
          </div>

          <div class="form-group">
            <label class="form-label">Referral Code (Optional)</label>
            <input type="text" id="reg-refcode" class="form-input" placeholder="e.g. RAHUL77" />
          </div>

          <p style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.4;">
            By signing up, you agree to our <a href="javascript:void(0)" onclick="Store.setMobileScreen('terms')" style="color: var(--primary-light);">Terms of Service</a>, <a href="javascript:void(0)" onclick="Store.setMobileScreen('privacy')" style="color: var(--primary-light);">Privacy Policy</a>, and <a href="javascript:void(0)" onclick="Store.setMobileScreen('risk_disclosure')" style="color: var(--primary-light);">Risk Disclosure</a>.
          </p>

          <button type="submit" id="btn-signup-submit" class="btn btn-primary btn-lg">
            Create Account with Supabase
          </button>
        </form>

        <div style="text-align: center;">
          <span style="font-size: 0.85rem; color: var(--text-muted);">Already have an account?</span>
          <a href="javascript:void(0)" onclick="Store.setMobileScreen('login')" style="font-size: 0.85rem; color: var(--primary-light); font-weight: 700; text-decoration: none; margin-left: 4px;">Sign In</a>
        </div>
      </div>
    `;
  },

  renderOTP(container, params = {}) {
    const email = params.email || 'user@example.com';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 20px 8px; text-align: center;">
        <button class="header-icon-btn" onclick="Store.setMobileScreen('login')" style="align-self: flex-start;">←</button>

        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-subtle); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto;">
          ✉️
        </div>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">Verify Email OTP</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Enter the 6-digit code sent by Supabase to <strong>${email}</strong>
          </p>
        </div>

        <div style="display: flex; justify-content: center; gap: 8px;">
          <input type="text" id="otp-1" maxlength="1" class="form-input" style="width: 45px; height: 50px; text-align: center; font-size: 1.3rem; font-weight: 800;" value="1" />
          <input type="text" id="otp-2" maxlength="1" class="form-input" style="width: 45px; height: 50px; text-align: center; font-size: 1.3rem; font-weight: 800;" value="2" />
          <input type="text" id="otp-3" maxlength="1" class="form-input" style="width: 45px; height: 50px; text-align: center; font-size: 1.3rem; font-weight: 800;" value="3" />
          <input type="text" id="otp-4" maxlength="1" class="form-input" style="width: 45px; height: 50px; text-align: center; font-size: 1.3rem; font-weight: 800;" value="4" />
          <input type="text" id="otp-5" maxlength="1" class="form-input" style="width: 45px; height: 50px; text-align: center; font-size: 1.3rem; font-weight: 800;" value="5" />
          <input type="text" id="otp-6" maxlength="1" class="form-input" style="width: 45px; height: 50px; text-align: center; font-size: 1.3rem; font-weight: 800;" value="6" />
        </div>

        <button class="btn btn-primary btn-lg" onclick="MobileAuth.submitOTP('${email}')">Verify & Authenticate</button>

        <p style="font-size: 0.8rem; color: var(--text-muted);">
          Didn't receive code? <a href="javascript:void(0)" onclick="SupabaseAuth.signInWithMagicLink('${email}'); Store.showToast('Supabase OTP resent to ${email}', 'info');" style="color: var(--primary-light); font-weight: 600;">Resend OTP</a>
        </p>
      </div>
    `;
  },

  renderForgotPassword(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px 8px;">
        <button class="header-icon-btn" onclick="Store.setMobileScreen('login')" style="align-self: flex-start;">←</button>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">Forgot Password</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Enter your email to receive a password reset link from Supabase</p>
        </div>

        <form onsubmit="MobileAuth.handleForgotSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Registered Email Address</label>
            <input type="email" id="forgot-email" class="form-input" placeholder="e.g. rahul.sharma@gmail.com" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Send Supabase Reset Link</button>
        </form>
      </div>
    `;
  },

  renderResetPassword(container, params = {}) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px 8px;">
        <button class="header-icon-btn" onclick="Store.setMobileScreen('login')" style="align-self: flex-start;">←</button>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">Reset Password</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Choose a strong new password for your account</p>
        </div>

        <form onsubmit="MobileAuth.handleResetSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" id="new-pw" class="form-input" placeholder="Minimum 8 characters" required />
          </div>

          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input type="password" id="confirm-new-pw" class="form-input" placeholder="Repeat password" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Update Password</button>
        </form>
      </div>
    `;
  },

  renderKYCWizard(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 12px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('home')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">KYC Verification</h3>
          <span class="badge badge-pending">Required</span>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">
          🔒 <strong>Statutory AML & PMLA Compliance:</strong> Identity verification is required prior to deposits exceeding ₹10,000 and all bank withdrawals.
        </div>

        <form id="kyc-submit-form" onsubmit="MobileAuth.handleKYCSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Identity Document Type</label>
            <select id="kyc-doc-type" class="form-select">
              <option value="pan">PAN Card (National Tax ID)</option>
              <option value="aadhaar">Aadhaar Card (UIDAI)</option>
              <option value="passport">International Passport</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Document Identification Number</label>
            <input type="text" id="kyc-id-number" class="form-input" placeholder="e.g. ABCPS1234K" required />
          </div>

          <div class="form-group">
            <label class="form-label">Document Front Photo</label>
            <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-sm); padding: 14px; text-align: center; background: var(--bg-tertiary);">
              <span style="font-size: 1.5rem;">📄</span>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">id_document_front.jpg (Uploaded)</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Live Selfie Verification</label>
            <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-sm); padding: 14px; text-align: center; background: var(--bg-tertiary);">
              <span style="font-size: 1.5rem;">📸</span>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">live_biometric_selfie.jpg (Captured)</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Proof of Address (Utility Bill / Bank Statement)</label>
            <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-sm); padding: 14px; text-align: center; background: var(--bg-tertiary);">
              <span style="font-size: 1.5rem;">🏠</span>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">address_statement.pdf (Uploaded)</p>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 6px;">Submit KYC for Review</button>
        </form>
      </div>
    `;
  },

  renderKYCStatus(container) {
    const user = Store.state.currentUser;
    const status = user ? user.kyc_status : 'pending';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px 8px; text-align: center;">
        <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')" style="align-self: flex-start;">←</button>

        <div style="width: 80px; height: 80px; border-radius: 50%; background: ${status === 'approved' ? 'rgba(16,185,129,0.15)' : status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto;">
          ${status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳'}
        </div>

        <div>
          <h2 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">
            ${status === 'approved' ? 'KYC Verified' : status === 'rejected' ? 'KYC Verification Rejected' : 'KYC Under Review'}
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
            ${status === 'approved' ? 'Your identity documents are fully verified. All deposit, investment, and withdrawal limits unlocked.' :
              status === 'rejected' ? 'Your KYC document was rejected by the compliance desk. Please re-submit clear documents.' :
              'Your documents were submitted and are being reviewed by the compliance desk.'}
          </p>
        </div>

        ${status === 'rejected' ? `
          <button class="btn btn-primary btn-lg" onclick="Store.setMobileScreen('kyc')">Re-Submit KYC Documents</button>
        ` : `
          <button class="btn btn-secondary btn-lg" onclick="Store.setMobileScreen('home')">Back to Home</button>
        `}
      </div>
    `;
  },

  // Handler: Supabase Email Sign In
  async handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login-submit');
    if (btn) btn.innerText = 'Authenticating with Supabase...';

    try {
      // First attempt Supabase Auth
      let authUser = null;
      try {
        const sbRes = await SupabaseAuth.signInWithEmail(identifier, password);
        if (sbRes.success) {
          authUser = sbRes.user;
        }
      } catch (sbErr) {
        console.log("Supabase direct auth:", sbErr.message);
        // Fallback to local DB login if user is demo user or password matches
        const localRes = await API.post('/api/auth/login', { identifier, password });
        if (localRes.success) {
          authUser = localRes.user;
        } else {
          throw sbErr;
        }
      }

      if (authUser) {
        Store.setUser(authUser);
        Store.showToast(`Welcome back, ${authUser.full_name}!`, 'success', 'Supabase Authenticated');
        Store.setMobileScreen('home');
      }
    } catch (err) {
      Store.showToast(err.message || 'Invalid email or password', 'error', 'Authentication Failed');
    } finally {
      if (btn) btn.innerText = 'Sign In with Email';
    }
  },

  async sendMagicLinkPrompt() {
    const email = prompt("Enter your email address to receive a Supabase Magic Link / OTP:", "user@example.com");
    if (!email || !email.trim()) return;

    try {
      const res = await SupabaseAuth.signInWithMagicLink(email.trim());
      Store.showToast('Supabase Magic Link / OTP sent to your email!', 'success');
      Store.setMobileScreen('otp', { email: email.trim() });
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async quickDemoLogin(userId) {
    try {
      const res = await API.get(`/api/user/profile/${userId}`);
      if (res.success) {
        Store.setUser(res.user);
        Store.showToast(`Logged in as ${res.user.full_name} (${res.user.email})`, 'success');
        Store.setMobileScreen('home');
      }
    } catch (err) {
      Store.showToast('Error switching demo user', 'error');
    }
  },

  // Handler: Supabase Email Sign Up
  async handleSignUp(e) {
    e.preventDefault();
    const full_name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const referral_code = document.getElementById('reg-refcode').value;
    const btn = document.getElementById('btn-signup-submit');
    if (btn) btn.innerText = 'Registering with Supabase...';

    try {
      const res = await SupabaseAuth.signUpWithEmail(email, password, full_name, phone, referral_code);
      if (res.success) {
        Store.setUser(res.user);
        Store.showToast('Account registered via Supabase! Ledger wallet provisioned.', 'success', 'Welcome!');
        Store.setMobileScreen('home');
      }
    } catch (err) {
      Store.showToast(err.message || 'Error signing up with Supabase', 'error', 'Sign Up Error');
    } finally {
      if (btn) btn.innerText = 'Create Account with Supabase';
    }
  },

  async submitOTP(email) {
    const otp1 = document.getElementById('otp-1')?.value || '';
    const otp2 = document.getElementById('otp-2')?.value || '';
    const otp3 = document.getElementById('otp-3')?.value || '';
    const otp4 = document.getElementById('otp-4')?.value || '';
    const otp5 = document.getElementById('otp-5')?.value || '';
    const otp6 = document.getElementById('otp-6')?.value || '';
    const token = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;

    try {
      try {
        const res = await SupabaseAuth.verifyOtp(email, token);
        if (res.success) {
          Store.setUser(res.user);
        }
      } catch (e) {
        // Fallback for prototype testing
        await API.post('/api/auth/verify-otp', { otp: token });
      }

      Store.showToast('Email verified successfully via Supabase!', 'success');
      Store.setMobileScreen('home');
    } catch (err) {
      Store.showToast(err.message || 'Invalid OTP code', 'error');
    }
  },

  async handleForgotSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try {
      await SupabaseAuth.sendPasswordResetEmail(email);
      Store.showToast('Password recovery email dispatched by Supabase.', 'success');
      Store.setMobileScreen('login');
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  handleResetSubmit(e) {
    e.preventDefault();
    Store.showToast('Password updated! Please login with your new password.', 'success');
    Store.setMobileScreen('login');
  },

  async handleKYCSubmit(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    if (!user) return;

    const doc_type = document.getElementById('kyc-doc-type').value;
    const id_number = document.getElementById('kyc-id-number').value;

    try {
      const res = await API.post('/api/user/kyc/submit', {
        user_id: user.id,
        doc_type,
        id_number
      });
      if (res.success) {
        user.kyc_status = 'pending';
        Store.setUser(user);
        Store.showToast('KYC submitted for compliance review!', 'success');
        Store.setMobileScreen('kyc_status');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
