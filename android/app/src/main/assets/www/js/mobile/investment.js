// ==========================================================================
// 2026 Fintech Mobile App - Investment Marketplace & Subscription Flow (Screens 9, 10, 11)
// ==========================================================================

const MobileInvestment = {
  selectedPlan: null,
  investStep: 1,
  enteredAmount: 10000,

  // ==========================================================================
  // Screen 9: EXPLORE INVESTMENT OPTIONS
  // ==========================================================================
  renderPlansCatalog(container) {
    const plans = Store.state.plans || [];

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Invest</h2>
            <span class="subpage-step-indicator">Curated Strategies</span>
          </div>
          <button class="header-text-action-btn" onclick="Store.setMobileScreen('my_investments')">My Active</button>
        </div>

        <div class="plans-catalog-hero">
          <h3 class="plans-hero-heading">Explore Investment Options</h3>
          <p class="plans-hero-sub">Deploy capital across institutional yield strategies tailored to your horizon.</p>
        </div>

        <!-- Plan Cards List -->
        <div class="investment-plans-feed">
          ${plans.map(plan => `
            <div class="plan-marketplace-card">
              <div class="plan-card-header">
                <div>
                  <h4 class="plan-title">${plan.name}</h4>
                  <p class="plan-tagline">${plan.tagline}</p>
                </div>
                <span class="risk-badge ${plan.risk_level.toLowerCase()}">${plan.risk_level} Risk</span>
              </div>

              <div class="plan-key-metrics-row">
                <div class="plan-metric-item">
                  <span class="plan-metric-label">Indicative APY</span>
                  <strong class="plan-metric-val highlight">${plan.indicative_apy}</strong>
                </div>
                <div class="plan-metric-item">
                  <span class="plan-metric-label">Duration</span>
                  <strong class="plan-metric-val">${plan.duration_days} Days</strong>
                </div>
                <div class="plan-metric-item">
                  <span class="plan-metric-label">Min. Investment</span>
                  <strong class="plan-metric-val">₹${plan.min_amount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div class="plan-features-list">
                ${(plan.features || []).slice(0, 3).map(f => `
                  <div class="plan-feature-row">
                    <span class="feature-check">✓</span>
                    <span>${f}</span>
                  </div>
                `).join('')}
              </div>

              <div class="plan-card-actions">
                <button class="btn btn-secondary btn-full" onclick="MobileInvestment.viewPlanDetails(${plan.id})">
                  View Details
                </button>
                <button class="btn btn-primary btn-full" onclick="MobileInvestment.startInvestFlow(${plan.id})">
                  Invest Now →
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Mandatory Legal Disclaimer -->
        <div class="regulatory-disclaimer-box">
          <span class="disclaimer-icon">⚠️</span>
          <p class="disclaimer-text">
            <strong>Important Notice:</strong> Investment returns are subject to applicable terms, conditions and investment risks. Indicative returns are simulated projections and not guaranteed.
          </p>
        </div>
      </div>
    `;
  },

  viewPlanDetails(planId) {
    Haptics.tap();
    const plan = Store.state.plans.find(p => p.id === planId);
    if (plan) {
      Store.setMobileScreen('plan_details', { planId });
    }
  },

  // ==========================================================================
  // Screen 10: INVESTMENT DETAIL VIEW
  // ==========================================================================
  renderPlanDetails(container, params = {}) {
    const planId = params.planId || 2;
    const plan = Store.state.plans.find(p => p.id === planId) || Store.state.plans[1];

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="MobileRouter.goBack()">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">${plan.name}</h2>
            <span class="subpage-step-indicator">${plan.risk_level} Risk • ${plan.duration_days} Days</span>
          </div>
          <div></div>
        </div>

        <!-- Large Overview Card -->
        <div class="plan-details-hero-card">
          <div class="plan-details-apy-box">
            <span class="apy-label">Target Indicative Return</span>
            <h1 class="apy-big-number">${plan.indicative_apy}</h1>
            <span class="apy-sub">${plan.daily_roi_pct}% estimated daily yield</span>
          </div>

          <div class="plan-summary-metrics-grid">
            <div class="p-metric">
              <span>Min. Deposit</span>
              <strong>₹${plan.min_amount.toLocaleString('en-IN')}</strong>
            </div>
            <div class="p-metric">
              <span>Max. Limit</span>
              <strong>₹${plan.max_amount.toLocaleString('en-IN')}</strong>
            </div>
            <div class="p-metric">
              <span>Lockup Period</span>
              <strong>${plan.duration_days} Days</strong>
            </div>
            <div class="p-metric">
              <span>Payout Schedule</span>
              <strong>${plan.payout_frequency}</strong>
            </div>
          </div>
        </div>

        <!-- Strategy Description -->
        <div class="section-card">
          <h4 class="section-card-title">Strategy Overview</h4>
          <p class="section-card-p">${plan.description}</p>
        </div>

        <!-- Strategy Features -->
        <div class="section-card">
          <h4 class="section-card-title">Key Strategy Highlights</h4>
          <div class="strategy-highlights-list">
            ${(plan.features || []).map(f => `
              <div class="highlight-item">
                <span class="highlight-bullet">⚡</span>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sticky Bottom CTA -->
        <div class="sticky-bottom-action-bar">
          <button class="btn btn-primary btn-full btn-lg" onclick="MobileInvestment.startInvestFlow(${plan.id})">
            <span>Invest in ${plan.name}</span> →
          </button>
        </div>
      </div>
    `;
  },

  // Active Investment Details with Lifecycle Timeline
  renderInvestmentDetails(container, params = {}) {
    const invId = params.id || 101;
    const inv = Store.state.investments.find(i => i.id === invId) || Store.state.investments[0];

    if (!inv) {
      Store.setMobileScreen('home');
      return;
    }

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="MobileRouter.goBack()">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">${inv.plan_name}</h2>
            <span class="subpage-step-indicator">${inv.investment_code}</span>
          </div>
          <span class="inv-status-pill ${inv.status}">${inv.status.toUpperCase()}</span>
        </div>

        <div class="inv-details-hero-card">
          <span class="inv-current-label">Current Valuation</span>
          <h1 class="inv-big-valuation">₹${inv.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
          <div class="inv-accrual-gain-pill">
            <span>+₹${inv.total_accrued.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Total Accrued</span>
          </div>
        </div>

        <!-- Summary Grid -->
        <div class="inv-summary-table-card">
          <div class="summary-table-row">
            <span>Invested Principal</span>
            <strong>₹${inv.principal_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="summary-table-row">
            <span>Start Date</span>
            <strong>${inv.start_date}</strong>
          </div>
          <div class="summary-table-row">
            <span>Maturity Date</span>
            <strong>${inv.maturity_date} (${inv.days_remaining} days left)</strong>
          </div>
          <div class="summary-table-row">
            <span>Duration Tenure</span>
            <strong>${inv.duration_days} Days</strong>
          </div>
          <div class="summary-table-row">
            <span>Daily Yield Rate</span>
            <strong style="color: #10B981;">+${inv.daily_roi_pct}% / day</strong>
          </div>
          <div class="summary-table-row">
            <span>Platform Fee</span>
            <strong>₹0.00</strong>
          </div>
        </div>

        <!-- 4-Milestone Lifecycle Timeline -->
        <div class="section-card">
          <h4 class="section-card-title">Investment Lifecycle Timeline</h4>

          <div class="lifecycle-timeline-track">
            <div class="timeline-step completed">
              <div class="timeline-dot">✓</div>
              <div class="timeline-content">
                <strong>Investment Created</strong>
                <small>${inv.start_date} • Order matched on ledger</small>
              </div>
            </div>

            <div class="timeline-step completed">
              <div class="timeline-dot">✓</div>
              <div class="timeline-content">
                <strong>Funds Allocated</strong>
                <small>${inv.start_date} • Principal locked in yield pool</small>
              </div>
            </div>

            <div class="timeline-step active">
              <div class="timeline-dot pulse">⚡</div>
              <div class="timeline-content">
                <strong>Daily Accruals Active</strong>
                <small>Currently compounding (Day ${inv.days_active} of ${inv.duration_days})</small>
              </div>
            </div>

            <div class="timeline-step upcoming">
              <div class="timeline-dot">🏁</div>
              <div class="timeline-content">
                <strong>Maturity & Settlement</strong>
                <small>${inv.maturity_date} • Principal + yield returned to cash wallet</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Active Investments List ("My Investments")
  renderMyInvestments(container) {
    const investments = Store.state.investments || [];

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">My Investments</h2>
            <span class="subpage-step-indicator">${investments.length} Active Positions</span>
          </div>
          <button class="header-text-action-btn" onclick="Store.setMobileScreen('invest_plans')">+ New</button>
        </div>

        <div class="active-investments-feed">
          ${investments.length > 0 ? investments.map(inv => `
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
                <button class="btn btn-outline btn-sm">View Details →</button>
              </div>
            </div>
          `).join('') : `
            <div class="empty-state-card">
              <span class="empty-icon">💼</span>
              <h3>No Active Investments</h3>
              <p>You don't have any active investments yet.</p>
              <button class="btn btn-primary" onclick="Store.setMobileScreen('invest_plans')">Explore Plans</button>
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // Screen 11: 4-STEP INVESTMENT PROCESS
  // ==========================================================================
  startInvestFlow(planId) {
    Haptics.tap();
    const plan = Store.state.plans.find(p => p.id === planId) || Store.state.plans[1];
    this.selectedPlan = plan;
    this.investStep = 2; // Step 1 is select plan
    this.enteredAmount = Math.max(plan.min_amount, 5000);
    Store.setMobileScreen('invest_process', { planId: plan.id });
  },

  renderInvestProcess(container, params = {}) {
    const plan = this.selectedPlan || Store.state.plans[1];
    const wallet = Store.state.wallet;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="MobileRouter.goBack()">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Invest in ${plan.name}</h2>
            <span class="subpage-step-indicator">Step ${this.investStep} of 4</span>
          </div>
          <div></div>
        </div>

        <div class="invest-flow-body">
          ${this.renderInvestFlowStep(plan, wallet)}
        </div>
      </div>
    `;
  },

  renderInvestFlowStep(plan, wallet) {
    if (this.investStep === 2) {
      // Step 2: Enter Amount
      return `
        <div class="invest-step-card">
          <div class="step-badge-tag">STEP 2 • INVESTMENT AMOUNT</div>
          <h3 class="step-heading">Enter Investment Amount</h3>
          <p class="step-sub">Available Wallet Cash: <strong>₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>

          <div class="amount-large-input-box">
            <span class="currency-prefix">₹</span>
            <input type="number" id="invest-amount-input" class="amount-large-input" value="${this.enteredAmount}" min="${plan.min_amount}" max="${plan.max_amount}" oninput="MobileInvestment.handleAmountChange(this.value)" />
          </div>

          <!-- Quick Chip Increments -->
          <div class="quick-chip-row">
            <button class="quick-amt-chip" onclick="MobileInvestment.setAmount(${plan.min_amount})">Min (₹${plan.min_amount.toLocaleString('en-IN')})</button>
            <button class="quick-amt-chip" onclick="MobileInvestment.setAmount(10000)">₹10,000</button>
            <button class="quick-amt-chip" onclick="MobileInvestment.setAmount(25000)">₹25,000</button>
            <button class="quick-amt-chip" onclick="MobileInvestment.setAmount(${wallet.cash_balance})">Max Cash</button>
          </div>

          <div class="projected-returns-card">
            <div class="proj-row">
              <span>Indicative APY</span>
              <strong style="color: #10B981;">${plan.indicative_apy}</strong>
            </div>
            <div class="proj-row">
              <span>Tenure Duration</span>
              <strong>${plan.duration_days} Days</strong>
            </div>
            <div class="proj-row">
              <span>Est. Total Maturity Value</span>
              <strong id="invest-proj-maturity" style="color: #00F0FF;">₹${Math.round(this.enteredAmount * (1 + (plan.daily_roi_pct / 100) * plan.duration_days)).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button class="btn btn-primary btn-full btn-lg" style="margin-top: 20px;" onclick="MobileInvestment.goToReview()">
            <span>Review Investment</span> →
          </button>
        </div>
      `;
    } else if (this.investStep === 3) {
      // Step 3: Review Summary
      const projectedGain = Math.round(this.enteredAmount * (plan.daily_roi_pct / 100) * plan.duration_days);
      const maturityVal = this.enteredAmount + projectedGain;

      return `
        <div class="invest-step-card">
          <div class="step-badge-tag">STEP 3 • ORDER REVIEW</div>
          <h3 class="step-heading">Review & Terms</h3>
          <p class="step-sub">Please verify your investment order parameters before confirmation.</p>

          <div class="confirmation-order-card">
            <div class="order-row">
              <span>Selected Strategy</span>
              <strong>${plan.name}</strong>
            </div>
            <div class="order-row">
              <span>Principal Amount</span>
              <strong class="highlight">₹${this.enteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="order-row">
              <span>Lockup Duration</span>
              <strong>${plan.duration_days} Days</strong>
            </div>
            <div class="order-row">
              <span>Target APY</span>
              <strong style="color: #10B981;">${plan.indicative_apy}</strong>
            </div>
            <div class="order-row">
              <span>Estimated Accrual</span>
              <strong style="color: #00F0FF;">+₹${projectedGain.toLocaleString('en-IN')}</strong>
            </div>
            <div class="order-row">
              <span>Platform Fee</span>
              <strong>₹0.00</strong>
            </div>
          </div>

          <div class="form-group terms-checkbox-group" style="margin-top: 14px;">
            <label class="custom-checkbox-label">
              <input type="checkbox" id="invest-terms-agree" checked />
              <span class="terms-text">
                I understand that returns are subject to strategy risk terms and lockup tenures.
              </span>
            </label>
          </div>

          <div class="kyc-actions-row" style="margin-top: 16px;">
            <button class="btn btn-secondary" onclick="MobileInvestment.investStep=2; Store.setMobileScreen('invest_process');">Back</button>
            <button class="btn btn-primary btn-full btn-lg" onclick="MobileInvestment.promptPinAndConfirm()">
              <span>Confirm Investment</span> ✓
            </button>
          </div>
        </div>
      `;
    }
  },

  handleAmountChange(val) {
    this.enteredAmount = parseFloat(val) || 0;
    const plan = this.selectedPlan;
    if (plan) {
      const projEl = document.getElementById('invest-proj-maturity');
      if (projEl) {
        const est = Math.round(this.enteredAmount * (1 + (plan.daily_roi_pct / 100) * plan.duration_days));
        projEl.innerText = '₹' + est.toLocaleString('en-IN');
      }
    }
  },

  setAmount(amt) {
    Haptics.tick();
    this.enteredAmount = amt;
    const input = document.getElementById('invest-amount-input');
    if (input) input.value = amt;
    this.handleAmountChange(amt);
  },

  goToReview() {
    Haptics.tap();
    const wallet = Store.state.wallet;
    if (this.enteredAmount > wallet.cash_balance) {
      Haptics.error();
      alert(`Insufficient cash balance (₹${wallet.cash_balance.toLocaleString('en-IN')}). Please deposit funds first.`);
      return;
    }
    this.investStep = 3;
    const viewport = document.getElementById('mobile-screen-content');
    this.renderInvestProcess(viewport);
  },

  promptPinAndConfirm() {
    MobileSecurity.showPinPromptModal({
      title: 'Authorize Investment',
      subtitle: `Enter 4-digit PIN to invest ₹${this.enteredAmount.toLocaleString('en-IN')}`,
      onSuccess: async (pin) => {
        try {
          await Store.subscribeInvestment(this.selectedPlan.id, this.enteredAmount, pin);
          const viewport = document.getElementById('mobile-screen-content');
          this.renderInvestSuccess(viewport);
        } catch (e) {
          alert(e.message || 'Investment failed');
        }
      }
    });
  },

  renderInvestSuccess(container) {
    const plan = this.selectedPlan;
    container.innerHTML = `
      <div class="auth-screen-layout kyc-success-screen">
        <div class="kyc-success-emblem-box">
          <div class="success-icon-ring">
            <span style="font-size: 2.2rem; color: #10B981;">⚡</span>
          </div>
        </div>

        <h2 class="auth-page-title" style="margin-top: 16px;">Investment Active!</h2>
        <p class="auth-page-sub">
          ₹${this.enteredAmount.toLocaleString('en-IN')} has been locked into <strong>${plan.name}</strong>. Daily accruals will compound starting from next cycle.
        </p>

        <div class="kyc-summary-card" style="margin: 16px 0; text-align: left;">
          <div class="summary-row">
            <span>Plan</span>
            <strong>${plan.name}</strong>
          </div>
          <div class="summary-row">
            <span>Principal</span>
            <strong style="color: #00F0FF;">₹${this.enteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="summary-row">
            <span>Tenure</span>
            <strong>${plan.duration_days} Days</strong>
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="Store.setMobileScreen('home')">
          <span>Go to Home Dashboard</span> →
        </button>
      </div>
    `;
  }
};

window.MobileInvestment = MobileInvestment;
