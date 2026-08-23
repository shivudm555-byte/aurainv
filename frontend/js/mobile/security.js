// ==========================================================================
// 2026 Fintech Mobile App - Security Dashboard & Biometric Engine (Screens 23, 24)
// ==========================================================================

const MobileSecurity = {
  currentPinInput: '',

  // ==========================================================================
  // Screen 23: SECURITY DASHBOARD
  // ==========================================================================
  render(container) {
    const user = Store.state.currentUser;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Security Center</h2>
            <span class="subpage-step-indicator">Bank-Grade Protection</span>
          </div>
          <div></div>
        </div>

        <!-- Security Health Hero Card -->
        <div class="security-score-hero-card">
          <div class="security-score-badge">
            <span class="score-shield-icon">🛡️</span>
            <div>
              <span class="score-label">Account Security</span>
              <h2 class="score-rating" style="color: #10B981;">STRONG (100%)</h2>
            </div>
          </div>
          <p class="score-desc">All enterprise biometric and cryptographic safeguards are currently active.</p>
        </div>

        <!-- Security Items List -->
        <div class="security-checklist-group">
          <div class="security-item-card">
            <div class="sec-item-left">
              <span class="sec-icon" style="color: #10B981;">🔒</span>
              <div>
                <strong>Account Password</strong>
                <small>Updated 30 days ago • High entropy</small>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="Haptics.tick(); alert('Password change modal');">Change</button>
          </div>

          <div class="security-item-card">
            <div class="sec-item-left">
              <span class="sec-icon" style="color: #00F0FF;">📲</span>
              <div>
                <strong>SMS & Email OTP</strong>
                <small>2-step login challenge active</small>
              </div>
            </div>
            <span class="sec-status-check">✓ Active</span>
          </div>

          <div class="security-item-card">
            <div class="sec-item-left">
              <span class="sec-icon" style="color: #38BDF8;">🔐</span>
              <div>
                <strong>Two-Factor Authenticator (2FA)</strong>
                <small>Google Authenticator / TOTP</small>
              </div>
            </div>
            <span class="sec-status-check">✓ Enabled</span>
          </div>

          <div class="security-item-card">
            <div class="sec-item-left">
              <span class="sec-icon" style="color: #A855F7;">🔢</span>
              <div>
                <strong>4-Digit Transaction PIN</strong>
                <small>Required for all investments & withdrawals</small>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="Haptics.tick(); alert('PIN update modal');">Update</button>
          </div>

          <!-- Screen 24: Biometric Login Toggle & Simulator -->
          <div class="security-item-card" onclick="MobileSecurity.testBiometricScan()" style="cursor: pointer;">
            <div class="sec-item-left">
              <span class="sec-icon" style="color: #00F0FF;">👁️</span>
              <div>
                <strong>Biometric Authentication</strong>
                <small>Face ID & Touch ID instant login</small>
              </div>
            </div>
            <span class="sec-status-check" style="background: rgba(0, 240, 255, 0.15); color: #00F0FF;">
              Test Face ID
            </span>
          </div>
        </div>

        <!-- Trusted Devices & Sessions -->
        <div class="section-header-row" style="margin-top: 20px;">
          <h3 class="section-title">Trusted Devices</h3>
          <span class="section-sub-badge">Active Sessions</span>
        </div>

        <div class="trusted-devices-list">
          <div class="device-session-item">
            <span class="device-icon">📱</span>
            <div class="device-info">
              <strong>Apple iPhone 16 Pro (Current Device)</strong>
              <small>Mumbai, India • IP: 103.21.14.82 • Active Now</small>
            </div>
            <span class="badge-verified">Active</span>
          </div>

          <div class="device-session-item">
            <span class="device-icon">💻</span>
            <div class="device-info">
              <strong>MacBook Pro 16" (Fintech Portal)</strong>
              <small>Mumbai, India • IP: 103.21.14.82 • 2 hrs ago</small>
            </div>
            <button class="btn btn-outline btn-sm" style="color: #EF4444; border-color: rgba(239,68,68,0.4);" onclick="Haptics.tap(); alert('Session revoked');">Revoke</button>
          </div>
        </div>
      </div>
    `;
  },

  testBiometricScan() {
    this.showBiometricPromptModal({
      title: 'Biometric Test Scan',
      subtitle: 'Scanning Face ID / Fingerprint biometric sensor...',
      onSuccess: () => {
        Haptics.success();
        alert('Biometric Identity Verified Successfully! Match: 100%');
      }
    });
  },

  // ==========================================================================
  // Screen 24: BIOMETRIC MODAL SIMULATION
  // ==========================================================================
  showBiometricPromptModal(options = {}) {
    Haptics.scan();
    const overlay = document.getElementById('mobile-biometric-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="biometric-modal-sheet">
        <div class="biometric-scan-animation-box">
          <div class="face-id-square">
            <div class="face-id-laser-sweep"></div>
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
              <path d="M8 16V8H16" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
              <path d="M40 16V8H32" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
              <path d="M8 32V40H16" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
              <path d="M40 32V40H32" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
              <circle cx="18" cy="20" r="2.5" fill="#00F0FF"/>
              <circle cx="30" cy="20" r="2.5" fill="#00F0FF"/>
              <path d="M24 23V27" stroke="#00F0FF" stroke-width="2" stroke-linecap="round"/>
              <path d="M18 32C20 34 28 34 30 32" stroke="#00F0FF" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <h3 class="biometric-title">${options.title || 'Biometric Verification'}</h3>
        <p class="biometric-sub">${options.subtitle || 'Scanning Face ID...'}</p>

        <div class="biometric-status-indicator" id="bio-scan-status">
          <span>Authenticating...</span>
        </div>

        <button class="btn btn-secondary btn-full" style="margin-top: 16px;" onclick="MobileSecurity.closeBiometricModal()">
          Cancel
        </button>
      </div>
    `;

    overlay.style.display = 'flex';

    // Simulate authenticating after 1.2s
    setTimeout(() => {
      Haptics.success();
      const statusEl = document.getElementById('bio-scan-status');
      if (statusEl) {
        statusEl.innerHTML = '<span style="color: #10B981; font-weight: 700;">✓ Biometric Verified!</span>';
      }
      setTimeout(() => {
        MobileSecurity.closeBiometricModal();
        if (options.onSuccess) options.onSuccess();
      }, 500);
    }, 1200);
  },

  closeBiometricModal() {
    const overlay = document.getElementById('mobile-biometric-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  // 4-Digit PIN Prompt Modal
  showPinPromptModal(options = {}) {
    this.currentPinInput = '';
    const overlay = document.getElementById('mobile-pin-overlay');
    if (!overlay) return;

    this.renderPinNumpad(overlay, options);
    overlay.style.display = 'flex';
  },

  renderPinNumpad(overlay, options) {
    overlay.innerHTML = `
      <div class="pin-prompt-sheet">
        <div class="pin-header-row">
          <span style="font-size: 1.5rem;">🔒</span>
          <h3>${options.title || 'Enter Security PIN'}</h3>
          <p>${options.subtitle || 'Enter your 4-digit PIN to authorize'}</p>
        </div>

        <!-- 4 PIN Dots -->
        <div class="pin-dots-row">
          ${[0, 1, 2, 3].map(i => `
            <div class="pin-dot ${i < this.currentPinInput.length ? 'filled' : ''}"></div>
          `).join('')}
        </div>

        <!-- Interactive Numpad -->
        <div class="numpad-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
            <button class="numpad-btn" onclick="MobileSecurity.handlePinDigit('${num}', ${JSON.stringify(options).replace(/"/g, '&quot;')})">
              ${num}
            </button>
          `).join('')}
          <button class="numpad-btn" onclick="MobileSecurity.closePinModal()">✕</button>
          <button class="numpad-btn" onclick="MobileSecurity.handlePinDigit('0', ${JSON.stringify(options).replace(/"/g, '&quot;')})">0</button>
          <button class="numpad-btn" onclick="MobileSecurity.handlePinBackspace(${JSON.stringify(options).replace(/"/g, '&quot;')})">⌫</button>
        </div>
      </div>
    `;
  },

  handlePinDigit(digit, options) {
    Haptics.tick();
    if (this.currentPinInput.length < 4) {
      this.currentPinInput += digit;
      const overlay = document.getElementById('mobile-pin-overlay');
      this.renderPinNumpad(overlay, options);

      if (this.currentPinInput.length === 4) {
        setTimeout(() => {
          this.closePinModal();
          if (options.onSuccess) options.onSuccess(this.currentPinInput);
        }, 200);
      }
    }
  },

  handlePinBackspace(options) {
    Haptics.tick();
    if (this.currentPinInput.length > 0) {
      this.currentPinInput = this.currentPinInput.slice(0, -1);
      const overlay = document.getElementById('mobile-pin-overlay');
      this.renderPinNumpad(overlay, options);
    }
  },

  closePinModal() {
    const overlay = document.getElementById('mobile-pin-overlay');
    if (overlay) overlay.style.display = 'none';
  }
};

window.MobileSecurity = MobileSecurity;
