// ==========================================================================
// Mobile Referral Program Controller
// ==========================================================================

const MobileReferral = {
  async render(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/referral/stats/${user.id}`);
      const stats = res;

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">Refer & Earn</h2>
            <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('referral_history')">History</button>
          </div>

          <!-- Hero Invite Card -->
          <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid var(--gold-accent); border-radius: var(--radius-lg); padding: 20px; text-align: center;">
            <span style="font-size: 0.75rem; color: var(--gold-accent); font-weight: 700; text-transform: uppercase;">Earn 5% Instant Commission</span>
            <div style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: #fff; margin: 6px 0 14px 0;">
              ₹${stats.total_commissions_earned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              Earn direct 5% cash rewards on every active investment subscribed by your referees.
            </p>
          </div>

          <!-- Referral Code Box -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <label class="form-label">Your Exclusive Referral Code</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" value="${stats.referral_code}" readonly style="font-weight: 800; text-align: center; letter-spacing: 2px; color: var(--primary-light);" />
              <button class="btn btn-primary btn-sm" onclick="Store.showToast('Referral code copied: ${stats.referral_code}', 'success')">Copy</button>
            </div>

            <label class="form-label" style="margin-top: 4px;">Direct Invite Link</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" class="form-input" value="${stats.referral_link}" readonly style="font-size: 0.75rem;" />
              <button class="btn btn-secondary btn-sm" onclick="Store.showToast('Invite link copied to clipboard!', 'info')">Share</button>
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; text-align: center;">
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Total Referees</span>
              <strong style="font-size: 1.3rem; color: var(--text-primary); display: block; margin-top: 4px;">${stats.total_referees}</strong>
            </div>

            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; text-align: center;">
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Active Investors</span>
              <strong style="font-size: 1.3rem; color: var(--primary-light); display: block; margin-top: 4px;">${stats.active_investors}</strong>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading referral dashboard</p>`;
    }
  },

  async renderHistory(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/referral/stats/${user.id}`);
      const commissions = res.commissions_history || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('referrals')">←</button>
            <h3 style="font-size: 1rem; font-weight: 700;">Commission Ledger</h3>
            <span></span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${commissions.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px;">No referral commissions recorded yet.</p>
            ` : `
              ${commissions.map(c => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">From ${c.referee_name}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">5% Commission Payout | ${new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style="text-align: right;">
                    <strong style="font-size: 0.95rem; color: var(--gold-accent);">+₹${c.commission_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    <span class="badge badge-approved" style="display: block; margin-top: 2px;">Paid</span>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading referral history</p>`;
    }
  }
};
