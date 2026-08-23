// ==========================================================================
// 2026 Fintech Mobile App - Profile & Account Management (Screen 22)
// ==========================================================================

const MobileProfile = {
  render(container) {
    const user = Store.state.currentUser;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Profile</h2>
            <span class="subpage-step-indicator">Account Settings</span>
          </div>
          <button class="header-icon-btn" onclick="Store.setMobileScreen('settings')">⚙️</button>
        </div>

        <!-- User Identity Card -->
        <div class="profile-hero-card">
          <div class="profile-avatar-large">
            <img src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${user.full_name}" />
            <button class="avatar-edit-badge" onclick="Haptics.tick(); alert('Photo picker opened!');">📷</button>
          </div>

          <h3 class="profile-name">${user.full_name}</h3>
          <span class="profile-email">${user.email}</span>
          <span class="profile-phone">${user.phone}</span>

          <div class="kyc-profile-badge ${user.kyc_status}" onclick="Store.setMobileScreen('kyc_status')" style="cursor: pointer;">
            <span>KYC STATUS: ${user.kyc_status.toUpperCase()}</span> →
          </div>
        </div>

        <!-- Navigation Menu Sections -->
        <div class="profile-menu-group">
          <div class="profile-menu-item" onclick="MobileProfile.openPersonalInfoSheet()">
            <div class="menu-item-left">
              <span class="menu-icon" style="color: #00F0FF;">👤</span>
              <div>
                <strong>Personal Information</strong>
                <small>Legal name, DOB, address</small>
              </div>
            </div>
            <span class="menu-chevron">→</span>
          </div>

          <div class="profile-menu-item" onclick="Store.setMobileScreen('bank_accounts')">
            <div class="menu-item-left">
              <span class="menu-icon" style="color: #10B981;">🏦</span>
              <div>
                <strong>Bank Accounts</strong>
                <small>1 Linked HDFC Account</small>
              </div>
            </div>
            <span class="menu-chevron">→</span>
          </div>

          <div class="profile-menu-item" onclick="Store.setMobileScreen('security')">
            <div class="menu-item-left">
              <span class="menu-icon" style="color: #A855F7;">🛡️</span>
              <div>
                <strong>Security Center</strong>
                <small>2FA, PIN, Face ID (Strong 100%)</small>
              </div>
            </div>
            <span class="menu-chevron">→</span>
          </div>

          <div class="profile-menu-item" onclick="MobileProfile.openDocumentsSheet()">
            <div class="menu-item-left">
              <span class="menu-icon" style="color: #38BDF8;">🪪</span>
              <div>
                <strong>Documents & Compliance</strong>
                <small>PAN, Aadhaar, Tax Certificates</small>
              </div>
            </div>
            <span class="menu-chevron">→</span>
          </div>

          <div class="profile-menu-item" onclick="Store.setMobileScreen('support')">
            <div class="menu-item-left">
              <span class="menu-icon" style="color: #F59E0B;">💬</span>
              <div>
                <strong>Help & Support</strong>
                <small>FAQs, tickets, live chat</small>
              </div>
            </div>
            <span class="menu-chevron">→</span>
          </div>

          <div class="profile-menu-item" onclick="Store.setMobileScreen('settings')">
            <div class="menu-item-left">
              <span class="menu-icon" style="color: #94A3B8;">⚙️</span>
              <div>
                <strong>App Settings</strong>
                <small>Theme, currency, language</small>
              </div>
            </div>
            <span class="menu-chevron">→</span>
          </div>
        </div>

        <!-- Logout Button -->
        <button class="btn btn-outline btn-full btn-lg" style="margin-top: 20px; border-color: rgba(239, 68, 68, 0.4); color: #EF4444;" onclick="MobileProfile.handleLogout()">
          <span>🔒 Log Out Account</span>
        </button>
      </div>
    `;
  },

  openPersonalInfoSheet() {
    const user = Store.state.currentUser;
    MobileRouter.openBottomSheet(`
      <div class="personal-info-sheet-content">
        <h3 style="margin-top: 0;">Personal Details</h3>

        <div class="summary-table-row">
          <span>Full Legal Name</span>
          <strong>${user.full_name}</strong>
        </div>
        <div class="summary-table-row">
          <span>Date of Birth</span>
          <strong>20 Aug 1995</strong>
        </div>
        <div class="summary-table-row">
          <span>Primary Email</span>
          <strong>${user.email}</strong>
        </div>
        <div class="summary-table-row">
          <span>Mobile Phone</span>
          <strong>${user.phone}</strong>
        </div>
        <div class="summary-table-row">
          <span>Address</span>
          <strong>42 Horizon Tower, Mumbai, MH</strong>
        </div>

        <button class="btn btn-primary btn-full btn-lg" style="margin-top: 18px;" onclick="MobileRouter.closeBottomSheet();">
          Close
        </button>
      </div>
    `, 'Personal Information');
  },

  openDocumentsSheet() {
    MobileRouter.openBottomSheet(`
      <div class="documents-sheet-content">
        <h3 style="margin-top: 0;">Verified Documents Vault</h3>

        <div class="doc-vault-item">
          <div class="doc-icon">🪪</div>
          <div class="doc-info">
            <strong>Permanent Account Number (PAN)</strong>
            <small>ABCPS1234K • Verified ✓</small>
          </div>
        </div>

        <div class="doc-vault-item" style="margin-top: 10px;">
          <div class="doc-icon">📑</div>
          <div class="doc-info">
            <strong>Annual Form 16A Tax Statement</strong>
            <small>FY 2025-26 • Ready for download</small>
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" style="margin-top: 18px;" onclick="Haptics.success(); alert('Tax Statement PDF downloaded!'); MobileRouter.closeBottomSheet();">
          Download Form 16A
        </button>
      </div>
    `, 'Compliance Documents');
  },

  renderBankAccounts(container) {
    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Bank Accounts</h2>
            <span class="subpage-step-indicator">Beneficiary Accounts</span>
          </div>
          <button class="header-text-action-btn" onclick="alert('Add bank account modal');">+ Add</button>
        </div>

        <div class="beneficiary-bank-cards" style="margin-top: 10px;">
          <div class="beneficiary-card active">
            <div class="b-avatar">🏦</div>
            <div class="b-info">
              <strong>HDFC Bank Ltd</strong>
              <small>Account ••••••••••5890</small>
              <span class="b-ifsc">IFSC: HDFC0001234 • Primary Savings</span>
            </div>
            <span class="b-check">✓</span>
          </div>
        </div>
      </div>
    `;
  },

  handleLogout() {
    Haptics.tap();
    if (confirm('Are you sure you want to log out?')) {
      Haptics.success();
      Store.setMobileScreen('login');
    }
  }
};

window.MobileProfile = MobileProfile;
