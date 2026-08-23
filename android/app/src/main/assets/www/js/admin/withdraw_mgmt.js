// ==========================================================================
// Admin Withdrawal Desk & Dual-Approval Controller
// ==========================================================================

const AdminWithdrawals = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/withdrawals');
      const withdrawals = res.withdrawals || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Withdrawal Payouts & Dual-Approval Desk</h2>
            <p>Multi-sign authorization workflow for retail & institutional bank payouts</p>
          </div>

          <div class="table-filter-group">
            <select id="admin-wdl-status-filter" class="table-filter-select" onchange="AdminWithdrawals.filterWithdrawals()">
              <option value="ALL">All Withdrawals</option>
              <option value="pending" selected>Pending 1st Approval</option>
              <option value="pending_second_approval">Pending 2nd Approval (High Value)</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Dual Approval Threshold Rule Banner -->
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong style="font-size: 0.85rem; color: var(--warning);">⚡ Multi-Sign Risk Policy Active</strong>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
              Withdrawals >= ₹50,000 require Level 1 authorization (Finance Admin) followed by Level 2 authorization (Super / Operations Admin).
            </p>
          </div>
          <span class="badge badge-pending">Threshold: ₹50,000</span>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Beneficiary</th>
                <th>Gross (INR)</th>
                <th>Fee (1%)</th>
                <th>Net (INR)</th>
                <th>Status</th>
                <th>Dual Approval Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="wdl-table-tbody">
              ${this.buildWithdrawalRows(withdrawals)}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading withdrawals</p>`;
    }
  },

  buildWithdrawalRows(withdrawals) {
    if (withdrawals.length === 0) {
      return `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No withdrawals matching selected filter.</td></tr>`;
    }

    return withdrawals.map(w => `
      <tr>
        <td><strong>${w.withdrawal_code}</strong></td>
        <td>
          <strong>${w.full_name}</strong>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">User #${w.user_id}</span>
        </td>
        <td><strong>₹${w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
        <td style="color: var(--danger-light);">₹${w.fee.toFixed(2)}</td>
        <td><strong style="color: var(--primary-light);">₹${w.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
        <td>
          <span class="badge ${w.status === 'completed' ? 'badge-approved' : w.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}">
            ${w.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td>
          ${w.requires_dual_approval ? `
            <div class="dual-approval-stepper">
              <div class="step-bubble ${w.first_approval_by ? 'completed' : 'active'}" title="${w.first_approval_admin_name || '1st Sign Pending'}">
                1
              </div>
              <span class="step-arrow">→</span>
              <div class="step-bubble ${w.final_approval_by ? 'completed' : (w.status === 'pending_second_approval' ? 'active' : '')}" title="${w.final_approval_admin_name || '2nd Sign Pending'}">
                2
              </div>
              <span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 4px;">
                ${w.status === 'pending_second_approval' ? 'Awaiting 2nd Admin' : w.status === 'completed' ? 'Fully Signed' : 'Awaiting 1st Admin'}
              </span>
            </div>
          ` : `
            <span style="font-size: 0.75rem; color: var(--text-muted);">Standard (< ₹50k)</span>
          `}
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${w.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="AdminWithdrawals.approveFirst(${w.id})">
                ${w.requires_dual_approval ? '1st Approve (Finance)' : 'Approve & Release'}
              </button>
              <button class="btn btn-danger btn-sm" onclick="AdminWithdrawals.rejectWithdrawal(${w.id})">Reject</button>
            ` : w.status === 'pending_second_approval' ? `
              <button class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #f59e0b, #d97706);" onclick="AdminWithdrawals.approveFinal(${w.id})">
                ⚡ 2nd Final Sign (Super/Ops)
              </button>
              <button class="btn btn-danger btn-sm" onclick="AdminWithdrawals.rejectWithdrawal(${w.id})">Reject</button>
            ` : `
              <span style="font-size: 0.75rem; color: var(--text-muted);">Finalized</span>
            `}
          </div>
        </td>
      </tr>
    `).join('');
  },

  async filterWithdrawals() {
    const status = document.getElementById('admin-wdl-status-filter')?.value || 'ALL';
    const res = await API.get(`/api/admin/withdrawals?status=${status}`);
    const tbody = document.getElementById('wdl-table-tbody');
    if (tbody && res.withdrawals) {
      tbody.innerHTML = this.buildWithdrawalRows(res.withdrawals);
    }
  },

  async approveFirst(wdlId) {
    const admin = Store.state.currentAdmin;
    try {
      const res = await API.post('/api/admin/withdrawals/approve-first', {
        admin_id: admin.id,
        admin_name: `${admin.full_name} (${admin.role_title})`,
        withdrawal_id: wdlId
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Approval Recorded');
        await Store.refreshAllData();
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async approveFinal(wdlId) {
    const admin = Store.state.currentAdmin;
    try {
      const res = await API.post('/api/admin/withdrawals/approve-final', {
        admin_id: admin.id,
        admin_name: `${admin.full_name} (${admin.role_title})`,
        withdrawal_id: wdlId
      });

      if (res.success) {
        Store.showToast(res.message, 'success', 'Payout Disbursed');
        await Store.refreshAllData();
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  },

  async rejectWithdrawal(wdlId) {
    const reason = prompt('Enter rejection reason for audit records:') || 'Compliance discrepancy';
    const admin = Store.state.currentAdmin;
    try {
      const res = await API.post('/api/admin/withdrawals/reject', {
        admin_id: admin.id,
        admin_name: admin.full_name,
        withdrawal_id: wdlId,
        reason
      });

      if (res.success) {
        Store.showToast(res.message, 'warning');
        await Store.refreshAllData();
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
