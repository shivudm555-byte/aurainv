// ==========================================================================
// Mobile Home Dashboard Controller
// ==========================================================================

const MobileDashboard = {
  async render(container) {
    const user = Store.state.currentUser;
    if (!user) {
      Store.setMobileScreen('login');
      return;
    }

    // Refresh wallet & data
    await Store.refreshAllData();
    const wallet = Store.state.wallet || {
      total_portfolio: 0,
      cash_balance: 0,
      invested_balance: 0,
      accrued_balance: 0,
      today_earnings: 0,
      total_earnings: 0,
      active_investments_count: 0
    };

    const investments = Store.state.investments || [];
    const activeInvestments = investments.filter(i => i.status === 'active');

    // Fetch recent transactions
    let recentTxs = [];
    try {
      const txRes = await API.get(`/api/wallet/transactions/${user.id}`);
      if (txRes.success) recentTxs = txRes.transactions.slice(0, 5);
    } catch (e) {}

    const unreadNotifs = (Store.state.notifications || []).filter(n => !n.is_read).length;

    container.innerHTML = `
      <!-- Header -->
      <div class="mobile-app-header">
        <div class="header-user-info" onclick="Store.setMobileScreen('profile')" style="cursor: pointer;">
          <div class="user-avatar-badge">
            ${user.full_name.charAt(0)}
            <div class="kyc-verified-dot" style="background: ${user.kyc_status === 'approved' ? 'var(--primary)' : user.kyc_status === 'pending' ? 'var(--warning)' : 'var(--danger)'};">
              ${user.kyc_status === 'approved' ? '✓' : '!'}
            </div>
          </div>
          <div class="header-text-greet">
            <span class="welcome-sub">Welcome back</span>
            <span class="user-display-name">${user.full_name}</span>
          </div>
        </div>

        <div class="header-action-icons">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('notifications')">
            🔔
            ${unreadNotifs > 0 ? `<span class="notif-badge-pill">${unreadNotifs}</span>` : ''}
          </button>
        </div>
      </div>

      <!-- KYC Banner if not approved -->
      ${user.kyc_status !== 'approved' ? `
        <div class="kyc-alert-banner ${user.kyc_status}" onclick="Store.setMobileScreen('${user.kyc_status === 'pending' ? 'kyc_status' : 'kyc'}')" style="cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">${user.kyc_status === 'pending' ? '⏳' : '⚠️'}</span>
            <div>
              <strong style="font-size: 0.8rem; display: block; color: var(--text-primary);">
                ${user.kyc_status === 'pending' ? 'KYC Under Review' : 'KYC Verification Pending'}
              </strong>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">
                ${user.kyc_status === 'pending' ? 'Tap to view verification progress' : 'Submit ID proof to unlock withdrawals'}
              </span>
            </div>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">→</span>
        </div>
      ` : ''}

      <!-- Hero Portfolio Card -->
      <div class="hero-portfolio-card">
        <div class="portfolio-header">
          <span class="portfolio-label">Total Portfolio Valuation</span>
          <div class="portfolio-growth-pill">
            <span>+${((wallet.today_earnings / Math.max(wallet.invested_balance, 1)) * 100).toFixed(2)}% Today</span>
          </div>
        </div>

        <div class="portfolio-total-amount">
          ₹${wallet.total_portfolio.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <div class="portfolio-metrics-grid">
          <div class="metric-col">
            <span class="metric-title">Available Cash</span>
            <span class="metric-val">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="metric-col">
            <span class="metric-title">Invested Principal</span>
            <span class="metric-val">₹${wallet.invested_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="metric-col" style="margin-top: 6px;">
            <span class="metric-title">Today's Yield</span>
            <span class="metric-val earn-accent">+₹${wallet.today_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="metric-col" style="margin-top: 6px;">
            <span class="metric-title">Total Lifetime Yield</span>
            <span class="metric-val earn-accent">+₹${wallet.total_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Toolbar -->
      <div class="quick-actions-toolbar">
        <button class="quick-action-btn action-primary" onclick="Store.setMobileScreen('deposit')">
          <div class="action-icon-circle">＋</div>
          <span class="action-label-text">Deposit</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('invest_plans')">
          <div class="action-icon-circle">🚀</div>
          <span class="action-label-text">Invest</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('withdrawal')">
          <div class="action-icon-circle">⤓</div>
          <span class="action-label-text">Withdraw</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('wallet')">
          <div class="action-icon-circle">💳</div>
          <span class="action-label-text">Wallet</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('transactions')">
          <div class="action-icon-circle">📋</div>
          <span class="action-label-text">History</span>
        </button>
      </div>

      <!-- Active Investments Snapshot -->
      <div class="mobile-section-box">
        <div class="section-title-bar">
          <h3>Active Investments (${activeInvestments.length})</h3>
          <a class="view-all-link" onclick="Store.setMobileScreen('my_investments')">View All</a>
        </div>

        ${activeInvestments.length === 0 ? `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 24px; text-align: center;">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">No active investments yet. Start earning daily returns!</p>
            <button class="btn btn-primary btn-sm" onclick="Store.setMobileScreen('invest_plans')">Explore Investment Plans</button>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${activeInvestments.slice(0, 2).map(inv => `
              <div class="plan-card-item" onclick="Store.setMobileScreen('investment_details', ${inv.id})" style="cursor: pointer;">
                <div class="plan-header-row">
                  <div class="plan-name-badge">
                    <span class="plan-title">${inv.plan_name}</span>
                    <span class="plan-tagline">Ref: ${inv.investment_code}</span>
                  </div>
                  <span class="badge badge-approved">Active</span>
                </div>
                <div class="plan-stats-grid">
                  <div class="plan-stat">
                    <span class="stat-label">Principal</span>
                    <span class="stat-val">₹${inv.principal_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="plan-stat">
                    <span class="stat-label">Daily Yield</span>
                    <span class="stat-val" style="color: var(--primary-light);">${inv.daily_roi_pct}%</span>
                  </div>
                  <div class="plan-stat">
                    <span class="stat-label">Total Accrued</span>
                    <span class="stat-val" style="color: var(--primary-light);">+₹${inv.total_accrued.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Modular Crypto / VDA Banner -->
      <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.8)); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="Store.setMobileScreen('crypto')">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
            🪙
          </div>
          <div>
            <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">Crypto & VDA Vault</strong>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Manage BTC, ETH, USDT & SOL holdings</span>
          </div>
        </div>
        <span style="font-size: 1rem; color: var(--purple-accent);">→</span>
      </div>

      <!-- Recent Transactions -->
      <div class="mobile-section-box">
        <div class="section-title-bar">
          <h3>Recent Transactions</h3>
          <a class="view-all-link" onclick="Store.setMobileScreen('transactions')">All</a>
        </div>

        ${recentTxs.length === 0 ? `
          <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 16px;">No transactions recorded.</p>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${recentTxs.map(tx => {
              const isCredit = tx.credit_amount > 0;
              const amt = isCredit ? tx.credit_amount : tx.debit_amount;
              return `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 34px; height: 34px; border-radius: 50%; background: ${isCredit ? 'var(--primary-subtle)' : 'var(--danger-subtle)'}; color: ${isCredit ? 'var(--primary-light)' : 'var(--danger-light)'}; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800;">
                      ${isCredit ? '↓' : '↑'}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                      <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">${tx.transaction_type.replace(/_/g, ' ')}</span>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 0.85rem; font-weight: 800; color: ${isCredit ? 'var(--primary-light)' : 'var(--text-primary)'};">
                      ${isCredit ? '+' : '-'}₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span style="display: block; font-size: 0.65rem; color: var(--text-muted);">Bal: ₹${tx.balance_after.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }
};
