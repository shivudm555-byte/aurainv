// ==========================================================================
// Mobile Investment Plans & Portfolio Controller
// ==========================================================================

const MobileInvestment = {
  async renderPlansCatalog(container) {
    try {
      const res = await API.get('/api/invest/plans');
      const plans = res.plans || [];

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">Investment Plans</h2>
              <p style="font-size: 0.8rem; color: var(--text-muted);">Curated institutional & algorithmic yield strategies</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="Store.setMobileScreen('my_investments')">My Portfolio</button>
          </div>

          <!-- Regulatory Risk Notice -->
          <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.75rem; color: var(--text-secondary);">
            🛡️ <strong>Regulatory Notice:</strong> Returns reflect projected annual percentage yield (APY) based on institutional liquidity pools and treasury debt instruments. Capital is held under strict ledger safeguards.
          </div>

          <!-- Plans List -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${plans.map(p => `
              <div class="plan-card-item">
                <div class="plan-header-row">
                  <div class="plan-name-badge">
                    <span class="plan-title">${p.name}</span>
                    <span class="plan-tagline">${p.tagline}</span>
                  </div>
                  <div class="plan-roi-badge">+${(p.daily_roi_pct * 365).toFixed(1)}% APY</div>
                </div>

                <div class="plan-stats-grid">
                  <div class="plan-stat">
                    <span class="stat-label">Min Invest</span>
                    <span class="stat-val">₹${p.min_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="plan-stat">
                    <span class="stat-label">Duration</span>
                    <span class="stat-val">${p.duration_days} Days</span>
                  </div>
                  <div class="plan-stat">
                    <span class="stat-label">Daily Return</span>
                    <span class="stat-val" style="color: var(--primary-light);">${p.daily_roi_pct}%/day</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                  <span class="badge ${p.risk_level === 'Low' ? 'badge-approved' : p.risk_level === 'Moderate' ? 'badge-pending' : 'badge-rejected'}">
                    ${p.risk_level} Risk
                  </span>
                  <button class="btn btn-primary btn-sm" onclick="Store.setMobileScreen('plan_details', ${p.id})">
                    Explore & Invest →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load investment plans</p>`;
    }
  },

  async renderPlanDetails(container, planId) {
    try {
      const res = await API.get('/api/invest/plans');
      const plan = (res.plans || []).find(p => p.id === planId) || res.plans[0];
      const wallet = Store.state.wallet || { cash_balance: 0 };

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('invest_plans')">←</button>
            <span class="badge badge-approved">Capital Protected</span>
          </div>

          <div>
            <h2 style="font-family: var(--font-display); font-size: 1.45rem; font-weight: 800;">${plan.name}</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${plan.description}</p>
          </div>

          <!-- Key Metrics -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Daily Yield Rate</span>
              <strong style="font-size: 1.1rem; color: var(--primary-light); display: block;">${plan.daily_roi_pct}% / Day</strong>
            </div>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Annualized APY</span>
              <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">${(plan.daily_roi_pct * 365).toFixed(1)}% APY</strong>
            </div>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Lockup Period</span>
              <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">${plan.duration_days} Days</strong>
            </div>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Payout Schedule</span>
              <strong style="font-size: 1.1rem; color: var(--text-primary); display: block; text-transform: capitalize;">${plan.payout_frequency}</strong>
            </div>
          </div>

          <!-- Return Calculator -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <strong style="font-size: 0.9rem; color: var(--text-primary);">⚡ Interactive Return Calculator</strong>
            <div class="form-group">
              <label class="form-label">Investment Amount (INR)</label>
              <input type="number" id="calc-amount" class="form-input" value="${plan.min_amount}" min="${plan.min_amount}" max="${plan.max_amount}" oninput="MobileInvestment.calculateReturn(${plan.daily_roi_pct}, ${plan.duration_days})" />
            </div>

            <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Projected Total Return</span>
                <strong id="calc-result-total" style="font-size: 1.1rem; color: var(--primary-light); display: block;">
                  ₹${(plan.min_amount + (plan.min_amount * (plan.daily_roi_pct / 100) * plan.duration_days)).toFixed(2)}
                </strong>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Est. Profit</span>
                <strong id="calc-result-profit" style="font-size: 1.1rem; color: var(--primary-light); display: block;">
                  +₹${(plan.min_amount * (plan.daily_roi_pct / 100) * plan.duration_days).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          <!-- Invest Action Card -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
              <span>Available Cash Balance:</span>
              <strong style="color: var(--text-primary);">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>

            <button class="btn btn-primary btn-lg" onclick="MobileInvestment.openInvestModal(${plan.id}, '${plan.name}', ${plan.min_amount}, ${plan.max_amount})">
              Invest Now in Plan
            </button>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading plan details</p>`;
    }
  },

  calculateReturn(dailyRate, duration) {
    const input = document.getElementById('calc-amount');
    const totalEl = document.getElementById('calc-result-total');
    const profitEl = document.getElementById('calc-result-profit');
    if (!input || !totalEl || !profitEl) return;

    const amt = parseFloat(input.value) || 0;
    const profit = amt * (dailyRate / 100.0) * duration;
    const total = amt + profit;

    totalEl.innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    profitEl.innerText = `+₹${profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  openInvestModal(planId, planName, minAmt, maxAmt) {
    const user = Store.state.currentUser;
    const wallet = Store.state.wallet || { cash_balance: 0 };

    const modalHTML = `
      <div id="invest-modal-overlay" class="mobile-modal-overlay open">
        <div class="mobile-bottom-sheet">
          <div class="sheet-drag-handle"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.1rem; font-weight: 800;">Confirm Investment</h3>
            <button class="icon-btn" onclick="document.getElementById('invest-modal-overlay').remove()">✕</button>
          </div>

          <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 12px;">
            <strong style="font-size: 0.95rem; color: var(--text-primary);">${planName}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 2px;">Min: ₹${minAmt.toLocaleString('en-IN')} | Max: ₹${maxAmt.toLocaleString('en-IN')}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Investment Amount (INR)</label>
            <input type="number" id="invest-amount-input" class="form-input" value="${minAmt}" min="${minAmt}" max="${maxAmt}" />
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
            <span>Available Balance:</span>
            <span style="font-weight: 700; color: var(--text-primary);">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Enter 4-digit Transaction PIN</label>
            <input type="password" id="invest-pin-input" maxlength="4" class="form-input" style="letter-spacing: 6px; text-align: center; font-size: 1.2rem; font-weight: 800;" placeholder="••••" value="1234" />
          </div>

          <button class="btn btn-primary btn-lg" onclick="MobileInvestment.confirmInvestment(${planId})">
            Confirm & Lock Principal
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async confirmInvestment(planId) {
    const user = Store.state.currentUser;
    const amtInput = document.getElementById('invest-amount-input');
    const pinInput = document.getElementById('invest-pin-input');
    if (!amtInput || !pinInput) return;

    const amount = parseFloat(amtInput.value);
    const pin = pinInput.value;

    try {
      const res = await API.post('/api/invest/create', {
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        pin: pin
      });

      if (res.success) {
        document.getElementById('invest-modal-overlay')?.remove();
        Store.showToast(`Investment of ₹${amount.toLocaleString('en-IN')} activated!`, 'success', 'Investment Successful');
        await Store.refreshAllData();
        Store.setMobileScreen('my_investments');
      }
    } catch (err) {
      Store.showToast(err.message, 'error', 'Investment Failed');
    }
  },

  async renderMyInvestments(container) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/invest/my-investments/${user.id}`);
      const investments = res.investments || [];
      const summary = res.summary || { total_invested: 0, total_accrued: 0, active_count: 0 };

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">My Portfolio</h2>
            <button class="btn btn-primary btn-sm" onclick="Store.setMobileScreen('invest_plans')">＋ New Plan</button>
          </div>

          <!-- Summary Card -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Active Principal</span>
              <strong style="font-size: 1.2rem; color: var(--text-primary); display: block;">₹${summary.total_invested.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Total Returns Accrued</span>
              <strong style="font-size: 1.2rem; color: var(--primary-light); display: block;">+₹${summary.total_accrued.toFixed(2)}</strong>
            </div>
          </div>

          <!-- Active & Matured List -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${investments.length === 0 ? `
              <div style="background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 30px 16px; text-align: center;">
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">You do not have any active investment subscriptions.</p>
                <button class="btn btn-primary btn-sm" onclick="Store.setMobileScreen('invest_plans')">Subscribe to Plan</button>
              </div>
            ` : `
              ${investments.map(inv => `
                <div class="plan-card-item" onclick="Store.setMobileScreen('investment_details', ${inv.id})" style="cursor: pointer;">
                  <div class="plan-header-row">
                    <div>
                      <span class="plan-title">${inv.plan_name}</span>
                      <span class="plan-tagline">Ref: ${inv.investment_code}</span>
                    </div>
                    <span class="badge ${inv.status === 'active' ? 'badge-approved' : 'badge-matured'}">${inv.status}</span>
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
                      <span class="stat-label">Accrued Return</span>
                      <span class="stat-val" style="color: var(--primary-light);">+₹${inv.total_accrued.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 8px;">
                    <span>Matures: ${new Date(inv.maturity_date).toLocaleDateString()}</span>
                    <span style="color: var(--primary-light); font-weight: 600;">Details →</span>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading investments</p>`;
    }
  },

  async renderInvestmentDetails(container, invId) {
    const user = Store.state.currentUser;
    try {
      const res = await API.get(`/api/invest/my-investments/${user.id}`);
      const inv = (res.investments || []).find(i => i.id === invId) || res.investments[0];

      if (!inv) {
        Store.setMobileScreen('my_investments');
        return;
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 8px 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <button class="header-icon-btn" onclick="Store.setMobileScreen('my_investments')">←</button>
            <span class="badge ${inv.status === 'active' ? 'badge-approved' : 'badge-matured'}">${inv.status}</span>
          </div>

          <div>
            <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800;">${inv.plan_name}</h2>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Contract: ${inv.investment_code}</span>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Principal Subscribed:</span>
              <strong style="font-size: 0.95rem; color: var(--text-primary);">₹${inv.principal_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Daily Accrual Rate:</span>
              <strong style="font-size: 0.95rem; color: var(--primary-light);">${inv.daily_roi_pct}% per day</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Total Accrued to Date:</span>
              <strong style="font-size: 0.95rem; color: var(--primary-light);">+₹${inv.total_accrued.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Start Date:</span>
              <span style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(inv.start_date).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Maturity Date:</span>
              <span style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(inv.maturity_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <button class="btn btn-secondary btn-lg" onclick="Store.setMobileScreen('earnings')">View Accruals Ledger</button>
            <button class="btn btn-ghost" onclick="Store.setMobileScreen('invest_plans')">Browse Other Plans</button>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading details</p>`;
    }
  }
};
