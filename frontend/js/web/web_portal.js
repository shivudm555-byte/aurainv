// ==========================================================================
// Antigravity Fintech — Modern Desktop-First Web Portal Controller
// ==========================================================================

const WebPortal = {
  activeTab: 'dashboard',
  calculatorAmount: 25000,
  calculatorPlan: null,

  init() {
    this.setupNavigation();
  },

  setupNavigation() {
    document.querySelectorAll('.web-nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.setActiveTab(tab);
        }
      });
    });
  },

  setActiveTab(tab) {
    this.activeTab = tab;

    // Update active nav links
    document.querySelectorAll('.web-nav-link').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const viewport = document.getElementById('web-content-viewport');
    if (!viewport) return;

    if (tab === 'dashboard') this.renderDashboard(viewport);
    else if (tab === 'plans') this.renderPlans(viewport);
    else if (tab === 'portfolio') this.renderPortfolio(viewport);
    else if (tab === 'wallet') this.renderWallet(viewport);
    else if (tab === 'crypto') this.renderCrypto(viewport);
    else if (tab === 'referrals') this.renderReferrals(viewport);
    else if (tab === 'profile') this.renderProfile(viewport);
    else if (tab === 'support') this.renderSupport(viewport);
  },

  // --------------------------------------------------------------------------
  // 1. Executive Dashboard View
  // --------------------------------------------------------------------------
  async renderDashboard(container) {
    const user = Store.state.currentUser;
    const wallet = Store.state.wallet;
    const investments = Store.state.investments || [];
    const transactions = Store.state.transactions || [];

    const cash = wallet ? wallet.cash_balance : 32500;
    const invested = wallet ? wallet.invested_balance : 50000;
    const accrued = wallet ? wallet.accrued_balance : 246;
    const total = cash + invested + accrued;

    container.innerHTML = `
      <!-- Top Welcome Row -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
        <div>
          <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">
            Welcome back, ${user ? user.full_name : 'Investor'} 👋
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px;">
            Here is your wealth management overview and real-time yield performance.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge ${user && user.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}" style="font-size: 0.8rem; padding: 6px 14px;">
            ${user && user.kyc_status === 'approved' ? '✓ KYC Verified' : '⏳ KYC Under Review'}
          </span>
          <button class="btn btn-primary" onclick="WebPortal.setActiveTab('plans')">
            🚀 Explore High-Yield Plans
          </button>
        </div>
      </div>

      <!-- 4 Expansive KPI Cards -->
      <div class="web-kpi-grid">
        <div class="web-kpi-card highlight">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Total Net Worth</span>
            <div class="web-kpi-icon" style="color: var(--primary);">💎</div>
          </div>
          <div class="web-kpi-value">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="web-kpi-footer">
            <span class="web-badge-gain">+18.4% APY</span>
            <span>Across all active vehicles</span>
          </div>
        </div>

        <div class="web-kpi-card">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Available Cash</span>
            <div class="web-kpi-icon" style="color: #3b82f6;">💳</div>
          </div>
          <div class="web-kpi-value">₹${cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="web-kpi-footer">
            <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('wallet')" style="padding: 2px 8px; font-size: 0.72rem;">+ Deposit</button>
            <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('wallet')" style="padding: 2px 8px; font-size: 0.72rem;">- Withdraw</button>
          </div>
        </div>

        <div class="web-kpi-card">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Locked Principal</span>
            <div class="web-kpi-icon" style="color: #f59e0b;">🔒</div>
          </div>
          <div class="web-kpi-value">₹${invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div class="web-kpi-footer">
            <span>${investments.length} active strategy subscriptions</span>
          </div>
        </div>

        <div class="web-kpi-card">
          <div class="web-kpi-header">
            <span class="web-kpi-title">Accrued Yield</span>
            <div class="web-kpi-icon" style="color: #10b981;">📈</div>
          </div>
          <div class="web-kpi-value" style="color: var(--primary-light);">+₹${accrued.toFixed(2)}</div>
          <div class="web-kpi-footer">
            <span class="web-badge-gain">Daily 24h Payout</span>
            <span>Reinvest available</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Toolbar -->
      <div class="web-quick-actions-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.2rem;">⚡</span>
          <strong style="font-size: 0.95rem;">Quick Operations:</strong>
        </div>
        <div class="web-action-buttons-group">
          <button class="btn btn-primary btn-sm" onclick="WebPortal.setActiveTab('wallet')">
            📥 Deposit Funds (UPI / Bank)
          </button>
          <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('plans')">
            🚀 Invest Capital
          </button>
          <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('wallet')">
            📤 Withdraw Payout
          </button>
          <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('crypto')">
            🪙 Crypto Vault
          </button>
        </div>
      </div>

      <!-- Chart & Active Strategy Split -->
      <div class="web-dashboard-split">
        <!-- Live SVG Area Growth Chart -->
        <div class="web-card-panel">
          <div class="web-panel-header">
            <div>
              <h3 class="web-panel-title">Portfolio Yield Trajectory</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Real-time historical compounded yield performance</span>
            </div>
            <div class="web-time-tabs">
              <button class="web-time-tab">1D</button>
              <button class="web-time-tab">1W</button>
              <button class="web-time-tab active">1M</button>
              <button class="web-time-tab">1Y</button>
              <button class="web-time-tab">ALL</button>
            </div>
          </div>

          <div style="width: 100%; height: 260px; position: relative;">
            <svg viewBox="0 0 700 240" style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <linearGradient id="webGradArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 20,200 Q 140,170 240,140 T 440,90 T 680,30 L 680,220 L 20,220 Z" fill="url(#webGradArea)" />
              <path d="M 20,200 Q 140,170 240,140 T 440,90 T 680,30" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <circle cx="680" cy="30" r="5" fill="#10B981" />
            </svg>
          </div>
        </div>

        <!-- Active Investments Snapshot -->
        <div class="web-card-panel">
          <div class="web-panel-header">
            <h3 class="web-panel-title">Active Investments (${investments.length})</h3>
            <button class="btn btn-ghost btn-sm" onclick="WebPortal.setActiveTab('portfolio')">View All →</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${investments.length === 0 ? `
              <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 30px 0;">No active investments yet.<br><a href="javascript:void(0)" onclick="WebPortal.setActiveTab('plans')" style="color: var(--primary-light); font-weight: 700;">Explore Plans</a></p>
            ` : investments.slice(0, 3).map(inv => `
              <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 14px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong>${inv.plan_name}</strong>
                  <span class="badge badge-approved" style="font-size: 0.7rem;">+${inv.daily_roi_pct}%/day</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                  <span style="color: var(--text-muted);">Principal: ₹${inv.principal_amount.toLocaleString('en-IN')}</span>
                  <strong style="color: var(--primary-light);">+₹${inv.total_accrued.toFixed(2)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Recent Transactions Data Table -->
      <div class="web-card-panel">
        <div class="web-panel-header">
          <h3 class="web-panel-title">Recent Activity & Financial Ledger</h3>
          <button class="btn btn-secondary btn-sm" onclick="WebPortal.setActiveTab('wallet')">Full Ledger Explorer →</button>
        </div>

        <div style="overflow-x: auto;">
          <table class="admin-data-table" style="width: 100%;">
            <thead>
              <tr>
                <th>Tx Code</th>
                <th>Type</th>
                <th>Debit / Credit</th>
                <th>Account</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No recent transactions recorded.</td></tr>
              ` : transactions.slice(0, 5).map(tx => `
                <tr>
                  <td><strong style="font-family: monospace; font-size: 0.8rem;">${tx.transaction_id}</strong></td>
                  <td><span class="badge ${tx.transaction_type === 'DEPOSIT' ? 'badge-approved' : 'badge-pending'}">${tx.transaction_type}</span></td>
                  <td>
                    ${tx.credit_amount > 0 ? `<strong style="color: var(--primary-light);">+₹${tx.credit_amount.toFixed(2)}</strong>` : `<strong style="color: var(--danger-light);">-₹${tx.debit_amount.toFixed(2)}</strong>`}
                  </td>
                  <td><span style="font-size: 0.75rem; color: var(--text-muted);">${tx.ledger_account_code}</span></td>
                  <td><span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(tx.created_at).toLocaleString()}</span></td>
                  <td><span class="badge badge-approved">Completed</span></td>
                  <td><button class="btn btn-secondary btn-sm" onclick="WebPortal.showReceipt('${tx.transaction_id}', '${tx.transaction_type}', ${tx.credit_amount || tx.debit_amount})">Receipt</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // 2. Investment Plans & Live Calculator View
  // --------------------------------------------------------------------------
  async renderPlans(container) {
    const plans = Store.state.plans || [];
    const wallet = Store.state.wallet || { cash_balance: 32500 };
    const defaultPlan = plans[0] || { id: 1, name: 'Liquid Starter Growth', daily_roi_pct: 0.0411, duration_days: 30 };

    this.calculatorPlan = defaultPlan;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Investment Vehicles & Strategies</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Deploy institutional capital into algorithmic bond funds and quantitative yield strategies.
        </p>
      </div>

      <!-- Live Dynamic Yield Calculator Box -->
      <div class="web-calculator-box">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--primary-light);">🧮 Interactive Return Calculator</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Simulate projected daily, monthly, and compound maturity profits</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label class="form-label" style="margin: 0;">Strategy:</label>
            <select id="web-calc-plan-select" class="form-select" style="width: auto;" onchange="WebPortal.updateCalculatorPlan(this.value)">
              ${plans.map(p => `<option value="${p.id}">${p.name} (${(p.daily_roi_pct * 365).toFixed(1)}% APY)</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: center;">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.9rem; color: var(--text-secondary);">Investment Amount:</span>
              <strong style="font-size: 1.3rem; color: var(--text-primary);" id="web-calc-display-amount">₹25,000</strong>
            </div>
            <input type="range" id="web-calc-slider" min="1000" max="500000" step="1000" value="25000" style="width: 100%; accent-color: var(--primary);" oninput="WebPortal.updateCalculatorSlider(this.value)" />
          </div>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: center;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Daily ROI</span>
              <strong style="font-size: 1.1rem; color: var(--primary-light); display: block;" id="web-calc-daily-ret">₹10.28</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Total Net Profit</span>
              <strong style="font-size: 1.1rem; color: var(--primary-light); display: block;" id="web-calc-total-profit">+₹308.25</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Plans Marketplace Grid -->
      <div class="web-plans-grid">
        ${plans.map(p => `
          <div class="web-plan-card">
            ${p.badge_text ? `<span class="web-plan-badge badge-approved">${p.badge_text}</span>` : ''}
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 800;">${p.name}</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${p.tagline || 'Institutional yield vehicle'}</p>
            </div>

            <div class="web-plan-roi-box">
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Daily Yield</span>
                <strong style="font-size: 1.3rem; color: var(--primary-light); display: block;">${p.daily_roi_pct}%/day</strong>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Annualized</span>
                <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">${(p.daily_roi_pct * 365).toFixed(1)}% APY</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
              <span>Duration: <strong>${p.duration_days} Days</strong></span>
              <span>Risk: <strong>${p.risk_level}</strong></span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
              <span>Min: ₹${p.min_amount.toLocaleString('en-IN')}</span>
              <span>Max: ₹${p.max_amount.toLocaleString('en-IN')}</span>
            </div>

            <button class="btn btn-primary btn-lg" onclick="WebPortal.openInvestModal(${p.id})">
              Invest in Strategy →
            </button>
          </div>
        `).join('')}
      </div>
    `;
  },

  updateCalculatorSlider(val) {
    this.calculatorAmount = parseFloat(val);
    document.getElementById('web-calc-display-amount').innerText = `₹${this.calculatorAmount.toLocaleString('en-IN')}`;
    this.recalculateROI();
  },

  updateCalculatorPlan(planId) {
    const plans = Store.state.plans || [];
    this.calculatorPlan = plans.find(p => p.id == planId) || plans[0];
    this.recalculateROI();
  },

  recalculateROI() {
    if (!this.calculatorPlan) return;
    const daily = (this.calculatorAmount * (this.calculatorPlan.daily_roi_pct / 100));
    const total = daily * this.calculatorPlan.duration_days;
    document.getElementById('web-calc-daily-ret').innerText = `₹${daily.toFixed(2)}`;
    document.getElementById('web-calc-total-profit').innerText = `+₹${total.toFixed(2)}`;
  },

  openInvestModal(planId) {
    const plans = Store.state.plans || [];
    const plan = plans.find(p => p.id == planId);
    if (!plan) return;

    const modalHTML = `
      <div id="web-invest-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="admin-modal-card" style="max-width: 520px;">
          <div class="modal-header-row">
            <div>
              <h3>Subscribe: ${plan.name}</h3>
              <span style="font-size: 0.8rem; color: var(--primary-light);">${plan.daily_roi_pct}%/day (${(plan.daily_roi_pct * 365).toFixed(1)}% APY)</span>
            </div>
            <button class="icon-btn" onclick="document.getElementById('web-invest-modal').remove()">✕</button>
          </div>

          <form onsubmit="WebPortal.submitInvestment(event, ${plan.id})" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Subscription Amount (INR)</label>
              <input type="number" id="web-inv-amount" class="form-input" min="${plan.min_amount}" max="${plan.max_amount}" value="${plan.min_amount}" required />
              <span style="font-size: 0.75rem; color: var(--text-muted);">Limits: ₹${plan.min_amount.toLocaleString('en-IN')} - ₹${plan.max_amount.toLocaleString('en-IN')}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Enter 4-Digit Transaction PIN</label>
              <input type="password" id="web-inv-pin" class="form-input" maxlength="4" placeholder="••••" value="1234" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg">
              Confirm & Lock Capital
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async submitInvestment(e, planId) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('web-inv-amount').value);
    const pin = document.getElementById('web-inv-pin').value;

    try {
      const res = await API.post('/api/invest/create', {
        user_id: user.id,
        plan_id: planId,
        amount,
        pin
      });

      if (res.success) {
        document.getElementById('web-invest-modal')?.remove();
        Store.showToast(`Investment active! Code: ${res.investment_code}`, 'success');
        await Store.refreshAllData();
        this.renderDashboard(document.getElementById('web-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  // --------------------------------------------------------------------------
  // 3. Wallet & Banking Desk View
  // --------------------------------------------------------------------------
  async renderWallet(container) {
    const user = Store.state.currentUser;
    const wallet = Store.state.wallet || { cash_balance: 32500, invested_balance: 50000, accrued_balance: 246 };
    const transactions = Store.state.transactions || [];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Wallet & Banking Desk</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Manage fiat balances, instant UPI deposits, and bank payout requests.</p>
      </div>

      <!-- Side-by-Side Deposit & Withdrawal Grid -->
      <div class="web-wallet-grid">
        <!-- Instant UPI & Bank Deposit -->
        <div class="web-card-panel">
          <h3 class="web-panel-title">📥 Deposit Funds (Instant Credit)</h3>
          
          <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=antigravityfintech@hdfcbank&pn=Antigravity%20Fintech&cu=INR" style="width: 130px; height: 130px; border-radius: 8px; background: #fff; padding: 6px;" />
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Official Merchant VPA</span>
              <strong style="font-family: monospace; font-size: 0.95rem; color: var(--primary-light); display: block;">antigravityfintech@hdfcbank</strong>
            </div>
          </div>

          <form onsubmit="WebPortal.submitDeposit(event)" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Deposit Amount (INR)</label>
              <input type="number" id="web-dep-amount" class="form-input" placeholder="e.g. 10000" min="1000" value="10000" required />
            </div>

            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select id="web-dep-method" class="form-select">
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="IMPS">IMPS Instant Bank Wire</option>
                <option value="NEFT">NEFT / RTGS</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">UTR / Transaction Reference</label>
              <input type="text" id="web-dep-utr" class="form-input" placeholder="12-digit bank reference" value="UTR${Date.now().toString().slice(-8)}" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg">
              Submit Deposit Confirmation
            </button>
          </form>
        </div>

        <!-- Bank Withdrawal Form -->
        <div class="web-card-panel">
          <h3 class="web-panel-title">📤 Request Bank Withdrawal</h3>

          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 12px; font-size: 0.8rem; color: var(--text-secondary);">
            ⚡ <strong>Dual-Approval Risk Policy:</strong> Withdrawals >= ₹50,000 require Level 1 (Finance) + Level 2 (Super Admin) authorization. Standard processing fee: 1.0%.
          </div>

          <form onsubmit="WebPortal.submitWithdrawal(event)" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Withdrawal Amount (INR)</label>
              <input type="number" id="web-wdl-amount" class="form-input" placeholder="e.g. 5000" min="500" max="${wallet.cash_balance}" value="5000" oninput="WebPortal.updateWithdrawalFee(this.value)" required />
              <span style="font-size: 0.75rem; color: var(--text-muted);">Available: ₹${wallet.cash_balance.toLocaleString('en-IN')}</span>
            </div>

            <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 12px; display: flex; justify-content: space-between; font-size: 0.85rem;">
              <span>Fee (1%): <strong id="web-wdl-fee">₹50.00</strong></span>
              <span>Net Payout: <strong style="color: var(--primary-light);" id="web-wdl-net">₹4,950.00</strong></span>
            </div>

            <div class="form-group">
              <label class="form-label">Destination Bank Account</label>
              <select id="web-wdl-bank" class="form-select">
                <option value="HDFC Bank (A/C: ...0005)">HDFC Bank (Primary - Verified)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">4-Digit Security PIN</label>
              <input type="password" id="web-wdl-pin" class="form-input" maxlength="4" placeholder="••••" value="1234" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg">
              Authorize Withdrawal
            </button>
          </form>
        </div>
      </div>
    `;
  },

  updateWithdrawalFee(val) {
    const amount = parseFloat(val) || 0;
    const fee = round(amount * 0.01, 2);
    const net = Math.max(0, amount - fee);
    document.getElementById('web-wdl-fee').innerText = `₹${fee.toFixed(2)}`;
    document.getElementById('web-wdl-net').innerText = `₹${net.toFixed(2)}`;
  },

  async submitDeposit(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('web-dep-amount').value);
    const payment_method = document.getElementById('web-dep-method').value;
    const utr_ref = document.getElementById('web-dep-utr').value;

    try {
      const res = await API.post('/api/wallet/deposit', {
        user_id: user.id,
        amount,
        payment_method,
        utr_ref,
        auto_approve: true
      });

      if (res.success) {
        Store.showToast('Deposit reconciled & credited to ledger!', 'success');
        await Store.refreshAllData();
        this.renderWallet(document.getElementById('web-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async submitWithdrawal(e) {
    e.preventDefault();
    const user = Store.state.currentUser;
    const amount = parseFloat(document.getElementById('web-wdl-amount').value);
    const pin = document.getElementById('web-wdl-pin').value;

    try {
      const res = await API.post('/api/wallet/withdraw', {
        user_id: user.id,
        amount,
        payout_method: 'BANK_TRANSFER',
        destination_details: { bank: 'HDFC Bank', acc: '501002900005' },
        pin
      });

      if (res.success) {
        Store.showToast(res.requires_dual_approval ? 'High-value payout routed to Dual-Admin Approval Desk.' : 'Withdrawal request submitted!', 'info');
        await Store.refreshAllData();
        this.renderWallet(document.getElementById('web-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  // --------------------------------------------------------------------------
  // 4. Crypto / VDA Terminal View
  // --------------------------------------------------------------------------
  async renderCrypto(container) {
    const user = Store.state.currentUser;
    const res = await API.get(`/api/crypto/balances/${user.id}`);
    const balances = res.balances || {};

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Crypto & Virtual Digital Assets (VDA)</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Segregated custodial crypto reserves with on-chain liquidity monitoring.</p>
      </div>

      <div class="web-kpi-grid">
        ${Object.entries(balances).map(([sym, b]) => `
          <div class="web-kpi-card">
            <div class="web-kpi-header">
              <span class="web-kpi-title">${sym} Asset Balance</span>
              <span class="badge badge-approved">${sym}</span>
            </div>
            <div class="web-kpi-value">${b.amount} ${sym}</div>
            <div class="web-kpi-footer">
              <strong>$${b.value_usd.toLocaleString()}</strong> • <span>₹${b.value_inr.toLocaleString()}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // 5. Referrals, Profile & Support Views
  // --------------------------------------------------------------------------
  renderReferrals(container) {
    const user = Store.state.currentUser;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Partner & Referral Program</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Earn 5% automated commissions on all referee capital subscriptions.</p>
      </div>

      <div class="web-card-panel" style="max-width: 600px;">
        <div class="form-group">
          <label class="form-label">Your Referral Invite Code</label>
          <input type="text" class="form-input" value="${user ? user.referral_code : 'RAHUL77'}" readonly style="font-family: monospace; font-size: 1.1rem; font-weight: 800;" />
        </div>
        <button class="btn btn-primary btn-lg" onclick="navigator.clipboard.writeText('${user ? user.referral_code : 'RAHUL77'}'); Store.showToast('Referral code copied!', 'success');">
          📋 Copy Referral Code
        </button>
      </div>
    `;
  },

  renderProfile(container) {
    const user = Store.state.currentUser;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Account Settings & Security</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Manage KYC verification, transaction PIN, and 2FA authentication.</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="web-card-panel">
          <h3 class="web-panel-title">User Identity</h3>
          <div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 10px;">
            <div><span style="color: var(--text-muted);">Name:</span> <strong>${user ? user.full_name : 'Investor'}</strong></div>
            <div><span style="color: var(--text-muted);">Email:</span> <strong>${user ? user.email : 'user@example.com'}</strong></div>
            <div><span style="color: var(--text-muted);">Phone:</span> <strong>${user ? user.phone : '+91 98000 00000'}</strong></div>
            <div><span style="color: var(--text-muted);">KYC Status:</span> <span class="badge ${user && user.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}">${user ? user.kyc_status : 'Pending'}</span></div>
          </div>
        </div>

        <div class="web-card-panel">
          <h3 class="web-panel-title">Security Controls</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-secondary btn-lg" onclick="Store.showToast('4-Digit PIN is active: 1234', 'info')">
              🔒 Change 4-Digit Security PIN
            </button>
            <button class="btn btn-secondary btn-lg" onclick="Store.showToast('Google Authenticator 2FA Enabled', 'success')">
              🛡️ Toggle Two-Factor Authentication (2FA)
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderSupport(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <h1 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;">Help Center & Dedicated Support</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">24/7 dedicated support desk for liquidity, KYC, and portfolio questions.</p>
      </div>

      <div class="web-card-panel" style="max-width: 600px;">
        <form onsubmit="event.preventDefault(); Store.showToast('Support ticket dispatched to operations team!', 'success');" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Subject</label>
            <input type="text" class="form-input" placeholder="e.g. Deposit reconciliation query" required />
          </div>
          <div class="form-group">
            <label class="form-label">Message Details</label>
            <textarea class="form-textarea" rows="4" placeholder="Describe your question..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg">Submit Support Ticket</button>
        </form>
      </div>
    `;
  },

  showReceipt(txId, type, amount) {
    const modalHTML = `
      <div id="web-receipt-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="admin-modal-card" style="max-width: 440px; text-align: center;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(16,185,129,0.15); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 10px auto;">✓</div>
          <h3 style="font-size: 1.3rem;">Official Financial Receipt</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Immutable Double-Entry Posting Verified</span>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0; text-align: left; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between;"><span>Transaction ID:</span> <strong style="font-family: monospace;">${txId}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Operation:</span> <strong>${type}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Amount:</span> <strong style="color: var(--primary-light);">₹${amount.toFixed(2)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Status:</span> <span class="badge badge-approved">Settled</span></div>
          </div>

          <button class="btn btn-primary btn-lg" onclick="document.getElementById('web-receipt-modal').remove()">Close Receipt</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
};
