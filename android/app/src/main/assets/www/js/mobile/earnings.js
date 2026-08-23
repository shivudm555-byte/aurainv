// ==========================================================================
// 2026 Fintech Mobile App - Earnings & Accruals Center (Screen 12)
// ==========================================================================

const MobileEarnings = {
  activeTimeframe: 'Month',

  render(container) {
    const wallet = Store.state.wallet;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Earnings Overview</h2>
            <span class="subpage-step-indicator">Yield & Rewards</span>
          </div>
          <span class="demo-tag-pill">Demo Values</span>
        </div>

        <!-- Hero Earnings Card -->
        <div class="earnings-hero-card">
          <span class="earnings-label">Total Accrued Yield</span>
          <h1 class="earnings-big-number">+₹${wallet.accrued_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
          <span class="earnings-sub-tag">Composed of daily quantitative accruals</span>

          <div class="earnings-stats-row">
            <div class="e-stat-col">
              <span class="e-stat-label">Today's Accrued</span>
              <strong class="e-stat-val">+₹${wallet.today_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="e-stat-col">
              <span class="e-stat-label">This Month</span>
              <strong class="e-stat-val">+₹${wallet.total_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        <!-- Earnings History Chart -->
        <div class="section-card">
          <div class="section-card-header-with-tabs">
            <h4 class="section-card-title">Earnings History</h4>
            <div class="earnings-timeframe-tabs">
              ${['Week', 'Month', 'Year'].map(tf => `
                <button class="e-tf-btn ${tf === this.activeTimeframe ? 'active' : ''}" onclick="MobileEarnings.setTimeframe('${tf}')">
                  ${tf}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="earnings-chart-container">
            <canvas id="earnings-history-canvas" height="130"></canvas>
          </div>
        </div>

        <!-- Segregated Breakdown -->
        <div class="section-card">
          <h4 class="section-card-title">Earnings Segregation</h4>

          <div class="breakdown-items-list">
            <div class="breakdown-row">
              <div class="b-left">
                <span class="b-dot" style="background: #00F0FF;"></span>
                <div>
                  <strong style="display: block; font-size: 0.85rem;">Investment Accruals</strong>
                  <small style="color: var(--text-muted); font-size: 0.7rem;">Growth Plan daily returns</small>
                </div>
              </div>
              <strong class="b-val" style="color: #00F0FF;">+₹${wallet.accrued_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <div class="breakdown-row">
              <div class="b-left">
                <span class="b-dot" style="background: #10B981;"></span>
                <div>
                  <strong style="display: block; font-size: 0.85rem;">Referral Rewards</strong>
                  <small style="color: var(--text-muted); font-size: 0.7rem;">5% commission from invited referees</small>
                </div>
              </div>
              <strong class="b-val" style="color: #10B981;">+₹1,250.00</strong>
            </div>

            <div class="breakdown-row">
              <div class="b-left">
                <span class="b-dot" style="background: #A855F7;"></span>
                <div>
                  <strong style="display: block; font-size: 0.85rem;">Platform Welcome Bonus</strong>
                  <small style="color: var(--text-muted); font-size: 0.7rem;">Early adopter promotional tier</small>
                </div>
              </div>
              <strong class="b-val">₹0.00</strong>
            </div>

            <div class="breakdown-row">
              <div class="b-left">
                <span class="b-dot" style="background: #EF4444;"></span>
                <div>
                  <strong style="display: block; font-size: 0.85rem;">Platform / Gas Fees</strong>
                  <small style="color: var(--text-muted); font-size: 0.7rem;">Zero charges on accrual distributions</small>
                </div>
              </div>
              <strong class="b-val">₹0.00</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      this.initEarningsChart();
    });
  },

  setTimeframe(tf) {
    Haptics.tick();
    this.activeTimeframe = tf;
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
  },

  initEarningsChart() {
    const tfData = {
      'Week': [
        { time: 'Mon', value: 45 },
        { time: 'Tue', value: 45 },
        { time: 'Wed', value: 45 },
        { time: 'Thu', value: 45 },
        { time: 'Fri', value: 45 },
        { time: 'Sat', value: 45 },
        { time: 'Sun', value: 45 }
      ],
      'Month': [
        { time: 'Week 1', value: 315 },
        { time: 'Week 2', value: 315 },
        { time: 'Week 3', value: 315 },
        { time: 'Week 4', value: 450 }
      ],
      'Year': [
        { time: 'Q1', value: 1200 },
        { time: 'Q2', value: 1350 },
        { time: 'Q3', value: 1400 },
        { time: 'Q4', value: 1700 }
      ]
    };

    ChartEngine.renderInteractiveAreaChart('earnings-history-canvas', {
      data: tfData[this.activeTimeframe] || tfData['Month'],
      strokeColor: '#10B981',
      isPositive: true
    });
  }
};

window.MobileEarnings = MobileEarnings;
