// ==========================================================================
// Admin Earnings Engine & Manual Adjustments Controller
// ==========================================================================

const AdminEarnings = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/reports?type=earnings');
      const earnings = res.rows || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Earnings & Accruals Management</h2>
            <p>Automated interest engines, ledger distributions & compliance adjustment tools</p>
          </div>

          <div class="header-action-tools">
            <button class="btn btn-primary btn-sm" onclick="AdminEarnings.triggerAccrualsCycle()">
              ⚡ Run Daily Accrual Cycle
            </button>
            <button class="btn btn-secondary btn-sm" onclick="AdminEarnings.openManualAdjustmentModal()">
              ⚖️ Post Manual Adjustment
            </button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>User / Beneficiary</th>
                <th>Account</th>
                <th>Credit (INR)</th>
                <th>Debit (INR)</th>
                <th>Balance After</th>
                <th>Type</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${earnings.map(e => `
                <tr>
                  <td><strong style="font-family: monospace; font-size: 0.75rem;">${e[0]}</strong></td>
                  <td><strong>${e[1]}</strong></td>
                  <td><span class="badge badge-approved">${e[2]}</span></td>
                  <td style="color: var(--primary-light); font-weight: 700;">+₹${(e[3] || 0).toFixed(2)}</td>
                  <td style="color: var(--danger-light);">₹${(e[4] || 0).toFixed(2)}</td>
                  <td><strong>₹${(e[5] || 0).toLocaleString('en-IN')}</strong></td>
                  <td><span class="badge ${e[6] === 'ACCRUAL_PAYOUT' ? 'badge-approved' : 'badge-pending'}">${e[6]}</span></td>
                  <td><span style="font-size: 0.8rem;">${e[7]}</span></td>
                  <td><span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(e[8]).toLocaleString()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading earnings management</p>`;
    }
  },

  async triggerAccrualsCycle() {
    const admin = Store.state.currentAdmin;
    try {
      const res = await API.post('/api/admin/accruals/run-cycle', {
        admin_id: admin.id,
        admin_name: admin.full_name
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Daily Accrual Cycle Completed');
        await Store.refreshAllData();
        const activeTab = Store.state.currentAdminTab;
        if (activeTab === 'earnings' || activeTab === 'dashboard') {
          AdminNav.setActiveTab(activeTab);
        }
      }
    } catch (err) {
      Store.showToast(err.message, 'error', 'Accrual Run Failed');
    }
  },

  openManualAdjustmentModal(prefillUserId = null) {
    const modalHTML = `
      <div id="adjustment-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="admin-modal-card">
          <div class="modal-header-row">
            <div>
              <h3>Post Financial Ledger Adjustment</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Strict immutable double-entry journal posting</span>
            </div>
            <button class="icon-btn" onclick="document.getElementById('adjustment-modal').remove()">✕</button>
          </div>

          <form onsubmit="AdminEarnings.submitManualAdjustment(event)" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Target User ID</label>
              <input type="number" id="adj-user-id" class="form-input" value="${prefillUserId || 5}" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Ledger Account</label>
                <select id="adj-account-code" class="form-select">
                  <option value="CASH_INR">CASH_INR (User Cash Balance)</option>
                  <option value="ACCRUED_EARNINGS">ACCRUED_EARNINGS (Accrued Yield)</option>
                  <option value="INVESTMENT_PRINCIPAL">INVESTMENT_PRINCIPAL</option>
                  <option value="REFERRAL_EARNINGS">REFERRAL_EARNINGS</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Adjustment Type</label>
                <select id="adj-type" class="form-select">
                  <option value="CREDIT">CREDIT (+ Add Funds)</option>
                  <option value="DEBIT">DEBIT (- Deduct Funds)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Adjustment Amount (INR)</label>
              <input type="number" id="adj-amount" class="form-input" placeholder="e.g. 5000" min="1" step="0.01" required />
            </div>

            <div class="form-group">
              <label class="form-label">Mandatory Audit Justification Reason</label>
              <textarea id="adj-reason" class="form-textarea" rows="3" placeholder="State explicit compliance / finance rationale for audit records..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 8px;">
              Commit Immutable Ledger Entry
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async submitManualAdjustment(e) {
    e.preventDefault();
    const admin = Store.state.currentAdmin;
    const user_id = parseInt(document.getElementById('adj-user-id').value);
    const account_code = document.getElementById('adj-account-code').value;
    const adjustment_type = document.getElementById('adj-type').value;
    const amount = parseFloat(document.getElementById('adj-amount').value);
    const audit_reason = document.getElementById('adj-reason').value;

    try {
      const res = await API.post('/api/admin/earnings/manual-adjustment', {
        admin_id: admin.id,
        admin_name: admin.full_name,
        user_id,
        account_code,
        adjustment_type,
        amount,
        audit_reason
      });

      if (res.success) {
        document.getElementById('adjustment-modal')?.remove();
        Store.showToast(res.message, 'success', 'Adjustment Posted');
        await Store.refreshAllData();
        AdminNav.setActiveTab('earnings');
      }
    } catch (err) {
      Store.showToast(err.message, 'error', 'Adjustment Failed');
    }
  }
};
