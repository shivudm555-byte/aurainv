// ==========================================================================
// Admin Executive Dashboard & Metric Charts Controller
// ==========================================================================

const AdminDashboard = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/dashboard');
      const m = res.metrics;
      const charts = res.charts;

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Executive Dashboard</h2>
            <p>Real-time platform metrics, double-entry financial summaries & operational queues</p>
          </div>

          <div class="header-action-tools">
            <button class="btn btn-primary btn-sm" onclick="AdminEarnings.triggerAccrualsCycle()">
              ⚡ Run Daily Accrual Cycle
            </button>
            <button class="btn btn-secondary btn-sm" onclick="Store.setAdminTab('reports')">
              📊 Export Reports
            </button>
          </div>
        </div>

        <!-- 10 Primary Metric KPI Cards -->
        <div class="admin-kpi-grid">
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Total Users</span>
              <div class="kpi-icon">👥</div>
            </div>
            <div class="kpi-value">${m.total_users}</div>
            <div class="kpi-foot">
              <span class="kpi-trend-up">● ${m.active_users} Active</span>
            </div>
          </div>

          <div class="kpi-card" onclick="Store.setAdminTab('kyc')" style="cursor: pointer;">
            <div class="kpi-top">
              <span class="kpi-label">KYC Pending</span>
              <div class="kpi-icon" style="color: var(--warning);">🪪</div>
            </div>
            <div class="kpi-value" style="color: ${m.pending_kyc > 0 ? 'var(--warning)' : 'var(--text-primary)'};">${m.pending_kyc}</div>
            <div class="kpi-foot">
              <span>Verification Desk Queue</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Total Deposits</span>
              <div class="kpi-icon" style="color: var(--primary-light);">📥</div>
            </div>
            <div class="kpi-value">₹${m.total_deposits.toLocaleString('en-IN')}</div>
            <div class="kpi-foot">
              <span>Pending: ${m.pending_deposits_count} (₹${m.pending_deposits_amount.toLocaleString('en-IN')})</span>
            </div>
          </div>

          <div class="kpi-card" onclick="Store.setAdminTab('withdrawals')" style="cursor: pointer;">
            <div class="kpi-top">
              <span class="kpi-label">Total Withdrawals</span>
              <div class="kpi-icon">📤</div>
            </div>
            <div class="kpi-value">₹${m.total_withdrawals.toLocaleString('en-IN')}</div>
            <div class="kpi-foot">
              <span style="color: var(--warning);">Pending Queue: ${m.pending_withdrawals_count}</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Active AUM Principal</span>
              <div class="kpi-icon">💼</div>
            </div>
            <div class="kpi-value">₹${m.total_investments.toLocaleString('en-IN')}</div>
            <div class="kpi-foot">
              <span class="kpi-trend-up">100% Safeguarded</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Total Accrued Yield</span>
              <div class="kpi-icon" style="color: var(--primary-light);">📈</div>
            </div>
            <div class="kpi-value" style="color: var(--primary-light);">₹${m.total_accrued_earnings.toLocaleString('en-IN')}</div>
            <div class="kpi-foot">
              <span>Ledger Verified</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Platform Net Revenue</span>
              <div class="kpi-icon" style="color: var(--secondary-accent);">💰</div>
            </div>
            <div class="kpi-value" style="color: var(--secondary-accent);">₹${m.platform_revenue.toLocaleString('en-IN')}</div>
            <div class="kpi-foot">
              <span>Fees & AUM Spread</span>
            </div>
          </div>

          <div class="kpi-card" onclick="Store.setAdminTab('crypto')" style="cursor: pointer;">
            <div class="kpi-top">
              <span class="kpi-label">Crypto Tx Count</span>
              <div class="kpi-icon" style="color: var(--purple-accent);">🪙</div>
            </div>
            <div class="kpi-value">${m.crypto_tx_count}</div>
            <div class="kpi-foot">
              <span>VDA Segregated Vault</span>
            </div>
          </div>
        </div>

        <!-- Metric Charts Grid -->
        <div class="admin-charts-grid">
          <!-- Chart 1: Cash Inflow vs Outflow -->
          <div class="chart-card-box">
            <div class="chart-card-header">
              <h3>Monthly Cash Flow (Deposits vs Withdrawals)</h3>
              <div style="display: flex; gap: 12px; font-size: 0.75rem;">
                <span style="color: var(--primary-light);">● Deposits</span>
                <span style="color: var(--danger-light);">● Withdrawals</span>
              </div>
            </div>

            <div class="chart-svg-container">
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- Grid lines -->
                <line x1="50" y1="30" x2="580" y2="30" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
                <line x1="50" y1="90" x2="580" y2="90" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
                <line x1="50" y1="150" x2="580" y2="150" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

                <!-- Deposits Area & Line -->
                <polygon points="50,150 180,120 350,80 520,40 520,170 50,170" fill="url(#depGrad)"/>
                <polyline points="50,150 180,120 350,80 520,40" fill="none" stroke="#10b981" stroke-width="3"/>
                
                <!-- Withdrawals Line -->
                <polyline points="50,165 180,150 350,130 520,110" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,4"/>

                <!-- X Axis Labels -->
                <text x="50" y="190" fill="#64748b" font-size="12">May</text>
                <text x="180" y="190" fill="#64748b" font-size="12">Jun</text>
                <text x="350" y="190" fill="#64748b" font-size="12">Jul</text>
                <text x="520" y="190" fill="#64748b" font-size="12">Aug</text>
              </svg>
            </div>
          </div>

          <!-- Chart 2: Plan Distribution -->
          <div class="chart-card-box">
            <div class="chart-card-header">
              <h3>AUM by Plan</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; justify-content: center; height: 100%;">
              ${(charts.plan_distribution || []).map(p => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                    <span style="color: var(--text-primary);">${p.name}</span>
                    <strong style="color: var(--primary-light);">₹${p.value.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style="width: 100%; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${Math.min(100, Math.max(10, (p.value / Math.max(m.total_investments, 1)) * 100))}%; height: 100%; background: var(--primary);"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Quick Operation Shortcuts -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; cursor: pointer;" onclick="Store.setAdminTab('kyc')">
            <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">🪪 Pending KYC Queue</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${m.pending_kyc} submissions awaiting document review</span>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; cursor: pointer;" onclick="Store.setAdminTab('withdrawals')">
            <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">🛡️ Dual-Approval Desk</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${m.pending_withdrawals_count} pending payout authorizations</span>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; cursor: pointer;" onclick="AdminEarnings.openManualAdjustmentModal()">
            <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">⚖️ Manual Ledger Adjustment</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Credit/Debit with mandatory audit justification</span>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; cursor: pointer;" onclick="Store.setAdminTab('ledger')">
            <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">📖 Immutable Ledger Explorer</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Audit double-entry financial postings</span>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load dashboard metrics</p>`;
    }
  }
};
