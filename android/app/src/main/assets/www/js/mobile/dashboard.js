// ==========================================================================
// 2026 Fintech Mobile App - Home Dashboard Controller (Screens 6, 7, 8)
// ==========================================================================

const MobileDashboard = {
  activeTimeframe: '1D',

  async render(container) {
    const user = Store.state.currentUser;
    if (!user) {
      Store.setMobileScreen('login');
      return;
    }

    const wallet = Store.state.wallet || {
      total_portfolio: 25450.00,
      cash_balance: 5450.00,
      invested_balance: 20000.00,
      accrued_balance: 450.00,
      today_earnings: 45.00,
      total_earnings: 450.00,
      pending_balance: 0.00,
      fees_paid: 0.00,
      active_investments_count: 1
    };

    const investments = Store.state.investments || [];
    const activeInvestments = investments.filter(i => i.status === 'active');
    const unreadNotifs = (Store.state.notifications || []).filter(n => !n.is_read).length;

    container.innerHTML = `
      <!-- Top Mobile Header -->
      <div class="mobile-app-header">
        <div class="header-user-info" onclick="Store.setMobileScreen('profile')" style="cursor: pointer;">
          <div class="user-avatar-badge">
            <img src="${user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${user.full_name}" class="avatar-photo" />
            <div class="kyc-verified-dot ${user.kyc_status}" title="KYC: ${user.kyc_status}">
              ${user.kyc_status === 'approved' ? '✓' : '!'}
            </div>
          </div>
          <div class="header-text-greet">
            <span class="welcome-sub">Good morning,</span>
            <span class="user-display-name">${user.full_name}</span>
          </div>
        </div>

        <div class="header-action-icons">
          <button class="header-icon-btn" onclick="Store.setMobileScreen('notifications')" title="Notifications">
            🔔
            ${unreadNotifs > 0 ? `<span class="notif-badge-pill">${unreadNotifs}</span>` : ''}
          </button>
        </div>
      </div>

      <!-- KYC Notice Banner if not approved -->
      ${user.kyc_status !== 'approved' ? `
        <div class="kyc-alert-banner ${user.kyc_status}" onclick="Store.setMobileScreen('kyc')" style="cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${user.kyc_status === 'pending' ? '⏳' : '⚠️'}</span>
            <div>
              <strong style="font-size: 0.8rem; display: block; color: var(--text-primary);">
                ${user.kyc_status === 'pending' ? 'KYC Under Review' : 'KYC Verification Required'}
              </strong>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">
                ${user.kyc_status === 'pending' ? 'Tap to view compliance review progress' : 'Submit ID proof to unlock full limits'}
              </span>
            </div>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">→</span>
        </div>
      ` : ''}

      <!-- Screen 6: Total Portfolio Hero Card -->
      <div class="hero-portfolio-card">
        <div class="portfolio-header">
          <span class="portfolio-label">Total Portfolio Value</span>
          <div class="portfolio-growth-pill positive">
            <span>+₹450.00 (+1.78%)</span>
          </div>
        </div>

        <div class="portfolio-total-amount" id="dashboard-hero-value">
          ₹${wallet.total_portfolio.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <!-- Interactive Canvas Portfolio Chart -->
        <div class="portfolio-chart-container">
          <canvas id="dashboard-portfolio-canvas" height="150"></canvas>
        </div>

        <!-- Chart Timeframe Filter Tabs -->
        <div class="chart-timeframe-filters">
          ${['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'].map(tf => `
            <button class="tf-btn ${tf === this.activeTimeframe ? 'active' : ''}" onclick="MobileDashboard.setTimeframe('${tf}')">
              ${tf}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-bar">
        <button class="quick-action-btn" onclick="Store.setMobileScreen('deposit')">
          <div class="qa-icon-circle" style="background: rgba(0, 240, 255, 0.15); color: #00F0FF;">
            ↓
          </div>
          <span>Deposit</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('invest_plans')">
          <div class="qa-icon-circle" style="background: rgba(16, 185, 129, 0.15); color: #10B981;">
            ⚡
          </div>
          <span>Invest</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('withdrawal')">
          <div class="qa-icon-circle" style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;">
            ↑
          </div>
          <span>Withdraw</span>
        </button>

        <button class="quick-action-btn" onclick="Store.setMobileScreen('crypto')">
          <div class="qa-icon-circle" style="background: rgba(168, 85, 247, 0.15); color: #A855F7;">
            ⇄
          </div>
          <span>Transfer</span>
        </button>
      </div>

      <!-- Screen 7: Compact Portfolio Summary Cards -->
      <div class="section-header-row">
        <h3 class="section-title">Portfolio Summary</h3>
        <span class="section-sub-badge">Real-time Ledger</span>
      </div>

      <div class="portfolio-summary-2x2-grid">
        <div class="summary-metric-card" onclick="Store.setMobileScreen('my_investments')" style="cursor: pointer;">
          <div class="metric-card-top">
            <span class="metric-card-title">Invested</span>
            <span class="metric-card-icon" style="color: #38BDF8;">💼</span>
          </div>
          <div class="metric-card-value">₹${wallet.invested_balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
          <span class="metric-card-sub">${activeInvestments.length} Active Plan</span>
        </div>

        <div class="summary-metric-card" onclick="Store.setMobileScreen('wallet')" style="cursor: pointer;">
          <div class="metric-card-top">
            <span class="metric-card-title">Available</span>
            <span class="metric-card-icon" style="color: #10B981;">💰</span>
          </div>
          <div class="metric-card-value" style="color: #10B981;">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
          <span class="metric-card-sub">Instant Liquidity</span>
        </div>

        <div class="summary-metric-card" onclick="Store.setMobileScreen('earnings')" style="cursor: pointer;">
          <div class="metric-card-top">
            <span class="metric-card-title">Accrued</span>
            <span class="metric-card-icon" style="color: #00F0FF;">📈</span>
          </div>
          <div class="metric-card-value" style="color: #00F0FF;">₹${wallet.accrued_balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
          <span class="metric-card-sub">+₹45.00 Today</span>
        </div>

        <div class="summary-metric-card" onclick="Store.setMobileScreen('activity')" style="cursor: pointer;">
          <div class="metric-card-top">
            <span class="metric-card-title">Fees</span>
            <span class="metric-card-icon" style="color: #94A3B8;">🧾</span>
          </div>
          <div class="metric-card-value">₹${wallet.fees_paid.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</div>
          <span class="metric-card-sub">Zero Hidden Fees</span>
        </div>
      </div>

      <!-- Screen 8: Active Investments ("My Investments") -->
      <div class="section-header-row" style="margin-top: 22px;">
        <h3 class="section-title">My Investments</h3>
        <a href="javascript:void(0)" class="section-see-all-link" onclick="Store.setMobileScreen('my_investments')">View All (${activeInvestments.length})</a>
      </div>

      <div class="active-investments-feed">
        ${activeInvestments.length > 0 ? activeInvestments.map(inv => `
          <div class="active-investment-card" onclick="Store.setMobileScreen('investment_details', { id: ${inv.id} })">
            <div class="inv-card-header">
              <div>
                <h4 class="inv-plan-name">${inv.plan_name}</h4>
                <span class="inv-plan-ref">${inv.investment_code}</span>
              </div>
              <span class="inv-status-pill ${inv.status}">${inv.status.toUpperCase()}</span>
            </div>

            <div class="inv-metrics-grid">
              <div>
                <span class="inv-metric-label">Invested Amount</span>
                <strong class="inv-metric-val">₹${inv.principal_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span class="inv-metric-label">Current Value</span>
                <strong class="inv-metric-val" style="color: #10B981;">₹${inv.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div class="inv-progress-bar-box">
              <div class="inv-progress-header">
                <span>Progress: ${inv.days_active} / ${inv.duration_days} Days</span>
                <span style="color: #00F0FF;">${inv.progress_pct}%</span>
              </div>
              <div class="inv-progress-track">
                <div class="inv-progress-fill" style="width: ${inv.progress_pct}%;"></div>
              </div>
            </div>

            <div class="inv-card-footer">
              <span class="inv-maturity-text">Maturity: ${inv.days_remaining} days left (${inv.maturity_date})</span>
              <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); Store.setMobileScreen('investment_details', { id: ${inv.id} })">
                View Details →
              </button>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state-compact">
            <p>You don't have any active investments yet.</p>
            <button class="btn btn-primary btn-sm" onclick="Store.setMobileScreen('invest_plans')">Explore Plans</button>
          </div>
        `}
      </div>

      <!-- Recent Transactions Mini Feed -->
      <div class="section-header-row" style="margin-top: 22px;">
        <h3 class="section-title">Recent Activity</h3>
        <a href="javascript:void(0)" class="section-see-all-link" onclick="Store.setMobileScreen('activity')">See All</a>
      </div>

      <div class="recent-tx-feed">
        ${(Store.state.transactions || []).slice(0, 3).map(tx => `
          <div class="tx-mini-item" onclick="Store.setMobileScreen('transaction_details', { id: '${tx.id}' })">
            <div class="tx-mini-icon-circle ${tx.is_positive ? 'pos' : 'neg'}">
              ${tx.is_positive ? '↓' : '↑'}
            </div>
            <div class="tx-mini-info">
              <span class="tx-mini-title">${tx.title}</span>
              <small class="tx-mini-date">${tx.date} • ${tx.status}</small>
            </div>
            <div class="tx-mini-amount ${tx.is_positive ? 'positive' : ''}">
              ${tx.is_positive ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Render interactive chart on next animation frame
    requestAnimationFrame(() => {
      this.initPortfolioChart();
    });
  },

  setTimeframe(tf) {
    Haptics.tick();
    this.activeTimeframe = tf;
    document.querySelectorAll('.tf-btn').forEach(btn => {
      if (btn.innerText.trim() === tf) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    this.initPortfolioChart();
  },

  initPortfolioChart() {
    const heroValEl = document.getElementById('dashboard-hero-value');
    const defaultVal = Store.state.wallet.total_portfolio || 25450.00;

    ChartEngine.renderInteractiveAreaChart('dashboard-portfolio-canvas', {
      timeframe: this.activeTimeframe,
      currentValue: defaultVal,
      strokeColor: '#00F0FF',
      isPositive: true,
      onScrub: (data) => {
        if (heroValEl) {
          heroValEl.innerText = '₹' + data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      },
      onScrubEnd: () => {
        if (heroValEl) {
          heroValEl.innerText = '₹' + defaultVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
    });
  },

  // Full Screen Portfolio Summary
  renderPortfolioSummary(container) {
    const wallet = Store.state.wallet;
    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Portfolio Summary</h2>
          </div>
          <div></div>
        </div>

        <div class="summary-breakdown-card">
          <span class="summary-sub-label">Net Asset Valuation</span>
          <h2 class="summary-big-val">₹${wallet.total_portfolio.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>

          <div class="breakdown-items-list">
            <div class="breakdown-row">
              <span class="b-dot" style="background: #38BDF8;"></span>
              <span class="b-label">Invested Principal</span>
              <strong class="b-val">₹${wallet.invested_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div class="breakdown-row">
              <span class="b-dot" style="background: #10B981;"></span>
              <span class="b-label">Available Cash</span>
              <strong class="b-val">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div class="breakdown-row">
              <span class="b-dot" style="background: #00F0FF;"></span>
              <span class="b-label">Accrued Yield</span>
              <strong class="b-val">₹${wallet.accrued_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div class="breakdown-row">
              <span class="b-dot" style="background: #94A3B8;"></span>
              <span class="b-label">Platform Fees Paid</span>
              <strong class="b-val">₹${wallet.fees_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.MobileDashboard = MobileDashboard;
