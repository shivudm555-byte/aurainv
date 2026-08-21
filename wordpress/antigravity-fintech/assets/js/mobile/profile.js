// ==========================================================================
// Mobile Profile, Bank Accounts, Security & Legal Documents Controller
// ==========================================================================

const MobileProfile = {
  async render(container) {
    const user = Store.state.currentUser;
    if (!user) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">Account & Settings</h2>

        <!-- Profile Hero -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; align-items: center; gap: 14px;">
          <div class="user-avatar-badge" style="width: 54px; height: 54px; font-size: 1.4rem;">
            ${user.full_name.charAt(0)}
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <strong style="font-size: 1.05rem; color: var(--text-primary);">${user.full_name}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${user.email}</span>
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <span class="badge ${user.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}">
                KYC ${user.kyc_status}
              </span>
              <span class="badge badge-approved">Tier 1 Investor</span>
            </div>
          </div>
        </div>

        <!-- Menu Links Group 1: Financial & Documents -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('bank_accounts')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🏦</span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Linked Bank Accounts</span>
            </div>
            <span style="color: var(--text-muted);">→</span>
          </div>

          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('kyc_documents')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🪪</span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">KYC Documents</span>
            </div>
            <span style="color: var(--text-muted);">→</span>
          </div>

          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="Store.setMobileScreen('referrals')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🎁</span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Referral Program (5% Commission)</span>
            </div>
            <span style="color: var(--text-muted);">→</span>
          </div>
        </div>

        <!-- Menu Links Group 2: Security & App -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('security')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🛡️</span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Security Settings & PIN</span>
            </div>
            <span style="color: var(--text-muted);">→</span>
          </div>

          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('notifications')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🔔</span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Notifications Hub</span>
            </div>
            <span style="color: var(--text-muted);">→</span>
          </div>

          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="Store.setMobileScreen('help_center')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>💬</span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Help Center & Support Tickets</span>
            </div>
            <span style="color: var(--text-muted);">→</span>
          </div>
        </div>

        <!-- Menu Links Group 3: Legal Disclosures -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
          <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('terms')">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Terms & Conditions</span>
            <span style="color: var(--text-muted);">→</span>
          </div>
          <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('privacy')">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Privacy Policy</span>
            <span style="color: var(--text-muted);">→</span>
          </div>
          <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('risk_disclosure')">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Risk Disclosure Statement</span>
            <span style="color: var(--text-muted);">→</span>
          </div>
          <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="Store.setMobileScreen('about_us')">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">About Antigravity Finance</span>
            <span style="color: var(--text-muted);">→</span>
          </div>
        </div>

        <!-- Logout Button -->
        <button class="btn btn-danger btn-lg" onclick="MobileProfile.handleLogout()" style="margin-top: 6px;">
          Log Out of Session
        </button>
      </div>
    `;
  },

  async renderBankAccounts(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/user/bank-accounts/${user.id}`);
      const banks = res.bank_accounts || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Bank Accounts</h3>
            <button class="btn btn-primary btn-sm" onclick="MobileProfile.openAddBankModal()">＋ Add Bank</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${banks.map(b => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    🏦
                  </div>
                  <div>
                    <strong style="font-size: 0.95rem; color: var(--text-primary); display: block;">${b.bank_name}</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">A/C: ${b.account_number}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">IFSC: ${b.ifsc_code} (${b.account_type.toUpperCase()})</span>
                  </div>
                </div>

                <div style="text-align: right;">
                  ${b.is_primary ? `<span class="badge badge-approved">Primary</span>` : ''}
                  <span class="badge badge-approved" style="display: block; margin-top: 4px;">Verified</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading bank accounts</p>`;
    }
  },

  openAddBankModal() {
    const user = Store.state.currentUser;
    const modalHTML = `
      <div id="add-bank-modal" class="mobile-modal-overlay open">
        <div class="mobile-bottom-sheet">
          <div class="sheet-drag-handle"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">Link Bank Account</h3>
            <button class="icon-btn" onclick="document.getElementById('add-bank-modal').remove()">✕</button>
          </div>

          <form onsubmit="MobileProfile.submitAddBank(event)" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Bank Name</label>
              <input type="text" id="add-bank-name" class="form-input" placeholder="e.g. State Bank of India" required />
            </div>

            <div class="form-group">
              <label class="form-label">Account Holder Full Name</label>
              <input type="text" id="add-bank-holder" class="form-input" value="${user.full_name}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Account Number</label>
              <input type="text" id="add-bank-acc" class="form-input" placeholder="e.g. 50100293849182" required />
            </div>

            <div class="form-group">
              <label class="form-label">IFSC Code</label>
              <input type="text" id="add-bank-ifsc" class="form-input" placeholder="e.g. SBIN0001234" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 6px;">Verify via Penny-Drop</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async submitAddBank(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const bank_name = document.getElementById('add-bank-name').value;
    const account_holder_name = document.getElementById('add-bank-holder').value;
    const account_number = document.getElementById('add-bank-acc').value;
    const ifsc_code = document.getElementById('add-bank-ifsc').value;

    try {
      const res = await API.post('/api/user/bank-accounts', {
        user_id: user.id,
        bank_name,
        account_holder_name,
        account_number,
        ifsc_code
      });

      if (res.success) {
        document.getElementById('add-bank-modal')?.remove();
        Store.showToast('Bank account linked and penny-drop verified!', 'success');
        Store.setMobileScreen('bank_accounts');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async renderKYCDocuments(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/user/kyc/${user.id}`);
      const rec = res.record;

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">KYC Documents</h3>
            <span class="badge ${user.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}">${user.kyc_status}</span>
          </div>

          ${!rec ? `
            <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No KYC records found.</p>
          ` : `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Doc Type:</span>
                <strong style="text-transform: uppercase;">${rec.doc_type}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">ID Number:</span>
                <strong>${rec.id_number}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Status:</span>
                <span class="badge ${rec.status === 'approved' ? 'badge-approved' : 'badge-rejected'}">${rec.status}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 10px; text-align: center;">
                <span style="font-size: 2rem;">📄</span>
                <span style="font-size: 0.75rem; color: var(--text-primary); display: block; margin-top: 4px;">ID Front Proof</span>
              </div>
              <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 10px; text-align: center;">
                <span style="font-size: 2rem;">📸</span>
                <span style="font-size: 0.75rem; color: var(--text-primary); display: block; margin-top: 4px;">Live Selfie Scan</span>
              </div>
            </div>
          `}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading documents</p>`;
    }
  },

  renderSecuritySettings(container) {
    const user = Store.state.currentUser;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Security Center</h3>
          <span></span>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column;">
          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('change_password')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🔑</span>
              <div>
                <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">Change Password</strong>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Updated 30 days ago</span>
              </div>
            </div>
            <span>→</span>
          </div>

          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="Store.setMobileScreen('transaction_pin')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🔢</span>
              <div>
                <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">4-digit Transaction PIN</strong>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Required for investments & withdrawals</span>
              </div>
            </div>
            <span>→</span>
          </div>

          <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="Store.setMobileScreen('two_factor')">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span>🔐</span>
              <div>
                <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">Two-Factor Authentication (2FA)</strong>
                <span style="font-size: 0.7rem; color: var(--primary-light);">Google Authenticator Enabled</span>
              </div>
            </div>
            <span>→</span>
          </div>
        </div>

        <div class="mobile-section-box">
          <div class="section-title-bar">
            <h3>Active Login Sessions</h3>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.8rem; color: var(--text-primary); display: block;">iPhone 15 Pro (iOS 17.4)</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">Mumbai, India • Active Now</span>
            </div>
            <span class="badge badge-approved">Current</span>
          </div>
        </div>
      </div>
    `;
  },

  renderChangePassword(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('security')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Change Password</h3>
          <span></span>
        </div>

        <form onsubmit="MobileProfile.submitChangePassword(event)" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" id="cur-pw" class="form-input" placeholder="••••••••" required />
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" id="new-pw-input" class="form-input" placeholder="Minimum 8 characters" required />
          </div>

          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input type="password" id="confirm-pw-input" class="form-input" placeholder="Repeat new password" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Update Password</button>
        </form>
      </div>
    `;
  },

  submitChangePassword(e) {
    e.preventDefault();
    Store.showToast('Password changed successfully!', 'success');
    Store.setMobileScreen('security');
  },

  renderTransactionPIN(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('security')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Transaction PIN</h3>
          <span></span>
        </div>

        <form onsubmit="MobileProfile.submitNewPIN(event)" style="display: flex; flex-direction: column; gap: 14px; text-align: center;">
          <p style="font-size: 0.8rem; color: var(--text-muted);">Set a 4-digit security PIN to authorize all investments and bank payouts.</p>

          <div class="form-group">
            <input type="password" id="new-pin-val" maxlength="4" class="form-input" style="letter-spacing: 10px; font-size: 1.5rem; text-align: center; font-weight: 900;" placeholder="••••" value="1234" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Save Transaction PIN</button>
        </form>
      </div>
    `;
  },

  async submitNewPIN(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const new_pin = document.getElementById('new-pin-val').value;

    try {
      const res = await API.post('/api/auth/set-pin', { user_id: user.id, new_pin });
      if (res.success) {
        Store.showToast('Transaction PIN updated successfully!', 'success');
        Store.setMobileScreen('security');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  render2FA(container) {
    const user = Store.state.currentUser;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('security')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Two-Factor Auth</h3>
          <span></span>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">Authenticator App (TOTP)</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Use Google Authenticator or Authy</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="twofa-switch" ${user.is_2fa_enabled ? 'checked' : ''} onchange="MobileProfile.toggle2FAState(this.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;
  },

  async toggle2FAState(enabled) {
    const user = Store.state.currentUser;
    try {
      const res = await API.post('/api/auth/toggle-2fa', { user_id: user.id, enable: enabled });
      if (res.success) {
        user.is_2fa_enabled = enabled ? 1 : 0;
        Store.setUser(user);
        Store.showToast(res.message, 'success');
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async renderNotifications(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/user/notifications/${user.id}`);
      const notifs = res.notifications || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Notifications Hub</h3>
            <button class="btn btn-ghost btn-sm" onclick="MobileProfile.markAllNotifsRead()">Mark Read</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${notifs.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No notifications in your inbox.</p>
            ` : `
              ${notifs.map(n => `
                <div style="background: var(--bg-card); border: 1px solid ${n.is_read ? 'var(--border-color)' : 'var(--primary)'}; border-radius: var(--radius-sm); padding: 12px 14px; display: flex; gap: 10px;">
                  <span style="font-size: 1.2rem;">${n.category === 'investment' ? '🚀' : n.category === 'kyc' ? '🪪' : n.category === 'security' ? '🔐' : '💳'}</span>
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${n.title}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; margin-top: 2px;">${n.message}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 4px;">${new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading notifications</p>`;
    }
  },

  async markAllNotifsRead() {
    const user = Store.state.currentUser;
    await API.post('/api/user/notifications/mark-read', { user_id: user.id });
    Store.showToast('All notifications marked as read', 'info');
    this.renderNotifications(document.getElementById('mobile-screen-content'));
  },

  renderLegalDoc(container, title, subtitle) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('profile')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">${title}</h3>
          <span></span>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
          <strong style="color: var(--text-primary); font-size: 0.95rem;">${subtitle}</strong>
          <p>
            1. <strong>Institutional Safeguards:</strong> All client balances are maintained through immutable double-entry ledger accounts. Deposits are segregated in Tier-1 institutional banking reserves.
          </p>
          <p>
            2. <strong>Accrual Calculations:</strong> Projected returns are accrued on a 24-hour cycle based on algorithmic strategy yield and sovereign debt treasury bonds. Past performance is not an absolute guarantee of future outcomes.
          </p>
          <p>
            3. <strong>Anti-Money Laundering & Dual Authorization:</strong> All transactions exceeding threshold values require statutory KYC verification and dual-administrator cryptographic sign-off.
          </p>
        </div>
      </div>
    `;
  },

  handleLogout() {
    Store.showToast('Session ended. See you soon!', 'info');
    Store.setMobileScreen('login');
  }
};
