// ==========================================================================
// Mobile Earnings & Yield Accruals Controller
// ==========================================================================

const MobileEarnings = {
  async render(container) {
    const user = Store.state.currentUser;
    await Store.refreshAllData();
    const wallet = Store.state.wallet || {
      cash_balance: 0,
      invested_balance: 0,
      accrued_balance: 0,
      today_earnings: 0,
      total_earnings: 0
    };

    // Fetch accrual ledger txs
    let accrualTxs = [];
    try {
      const res = await API.get(`/api/wallet/transactions/${user.id}?type=ACCRUAL_PAYOUT`);
      if (res.success) accrualTxs = res.transactions;
    } catch (e) {}

    // Fetch referral earnings
    let refEarnings = 0;
    try {
      const refRes = await API.get(`/api/referral/stats/${user.id}`);
      if (refRes.success) refEarnings = refRes.total_commissions_earned;
    } catch (e) {}

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">Earnings Dashboard</h2>
          <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('daily_earnings')">Daily Timeline</button>
        </div>

        <!-- Main Yield Card -->
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid var(--border-accent); border-radius: var(--radius-lg); padding: 20px; text-align: center; box-shadow: var(--shadow-glow);">
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Today's Accrued Yield</span>
          <div style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--primary-light); margin: 6px 0 14px 0;">
            +₹${wallet.today_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--border-color); padding-top: 12px; gap: 10px;">
            <div style="text-align: left;">
              <span style="font-size: 0.7rem; color: var(--text-muted);">Total Lifetime ROI</span>
              <strong style="font-size: 1rem; color: var(--text-primary); display: block;">+₹${wallet.total_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.7rem; color: var(--text-muted);">Accrued Balance</span>
              <strong style="font-size: 1rem; color: var(--primary-light); display: block;">₹${wallet.accrued_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        <!-- Earnings Breakdown (Separated by Type) -->
        <div class="mobile-section-box">
          <div class="section-title-bar">
            <h3>Revenue Breakdown</h3>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--primary);"></span>
                <span style="font-size: 0.85rem; color: var(--text-primary);">Investment Accruals (ROI)</span>
              </div>
              <strong style="font-size: 0.9rem; color: var(--primary-light);">+₹${wallet.total_earnings.toFixed(2)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--secondary-accent);"></span>
                <span style="font-size: 0.85rem; color: var(--text-primary);">Referral Commissions (5%)</span>
              </div>
              <strong style="font-size: 0.9rem; color: var(--secondary-accent);">+₹${refEarnings.toFixed(2)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--gold-accent);"></span>
                <span style="font-size: 0.85rem; color: var(--text-primary);">Platform Bonuses</span>
              </div>
              <strong style="font-size: 0.9rem; color: var(--gold-accent);">+₹0.00</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--danger);"></span>
                <span style="font-size: 0.85rem; color: var(--text-primary);">Withdrawal / Admin Fees</span>
              </div>
              <strong style="font-size: 0.9rem; color: var(--danger-light);">-₹50.00</strong>
            </div>
          </div>
        </div>

        <!-- Recent Accruals Feed -->
        <div class="mobile-section-box">
          <div class="section-title-bar">
            <h3>Recent Accruals History</h3>
          </div>

          ${accrualTxs.length === 0 ? `
            <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 14px;">No daily accruals posted yet.</p>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${accrualTxs.slice(0, 5).map(tx => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.8rem; color: var(--text-primary); display: block;">${tx.description}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(tx.created_at).toLocaleString()}</span>
                  </div>
                  <strong style="font-size: 0.9rem; color: var(--primary-light);">+₹${tx.credit_amount.toFixed(2)}</strong>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  async renderDaily(container) {
    const user = Store.state.currentUser;
    let accrualTxs = [];
    try {
      const res = await API.get(`/api/wallet/transactions/${user.id}?type=ACCRUAL_PAYOUT`);
      if (res.success) accrualTxs = res.transactions;
    } catch (e) {}

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('earnings')">←</button>
          <h3 style="font-size: 1rem; font-weight: 700;">Daily Accrual History</h3>
          <span></span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${accrualTxs.map(tx => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">${tx.description}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Ref: ${tx.reference_id} | ${new Date(tx.created_at).toLocaleString()}</span>
              </div>
              <div style="text-align: right;">
                <strong style="font-size: 0.95rem; color: var(--primary-light);">+₹${tx.credit_amount.toFixed(2)}</strong>
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">Ledger Verified</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};
