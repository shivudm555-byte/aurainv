// ==========================================================================
// Admin Deposit Review Desk Controller
// ==========================================================================

const AdminDeposits = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/deposits');
      const deposits = res.deposits || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Deposit Reconciliation Desk</h2>
            <p>Verify bank transfer slips, UPI references, and credit cash ledger accounts</p>
          </div>

          <div class="table-filter-group">
            <select id="admin-dep-status-filter" class="table-filter-select" onchange="AdminDeposits.filterDeposits()">
              <option value="ALL">All Deposits</option>
              <option value="pending" selected>Pending Verification Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Deposit Code</th>
                <th>User / Beneficiary</th>
                <th>Amount (INR)</th>
                <th>Method</th>
                <th>UTR / Ref Number</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="dep-table-tbody">
              ${this.buildDepositRows(deposits.filter(d => d.status === 'pending'))}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading deposits</p>`;
    }
  },

  buildDepositRows(deposits) {
    if (deposits.length === 0) {
      return `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No deposits matching selected filter.</td></tr>`;
    }

    return deposits.map(d => `
      <tr>
        <td><strong>${d.deposit_code}</strong></td>
        <td>
          <strong>${d.full_name}</strong>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">User #${d.user_id}</span>
        </td>
        <td><strong style="color: var(--primary-light); font-size: 0.95rem;">₹${d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
        <td><span class="badge badge-approved">${d.payment_method}</span></td>
        <td><span style="font-family: monospace; font-weight: 700;">${d.utr_ref}</span></td>
        <td>${new Date(d.created_at).toLocaleString()}</td>
        <td>
          <span class="badge ${d.status === 'approved' ? 'badge-approved' : d.status === 'pending' ? 'badge-pending' : 'badge-rejected'}">
            ${d.status}
          </span>
        </td>
        <td>
          ${d.status === 'pending' ? `
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm" onclick="AdminDeposits.reviewDeposit(${d.id}, 'approve')">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="AdminDeposits.reviewDeposit(${d.id}, 'reject')">Reject</button>
            </div>
          ` : `
            <span style="font-size: 0.75rem; color: var(--text-muted);">Reconciled</span>
          `}
        </td>
      </tr>
    `).join('');
  },

  async filterDeposits() {
    const status = document.getElementById('admin-dep-status-filter')?.value || 'ALL';
    const res = await API.get(`/api/admin/deposits?status=${status}`);
    const tbody = document.getElementById('dep-table-tbody');
    if (tbody && res.deposits) {
      tbody.innerHTML = this.buildDepositRows(res.deposits);
    }
  },

  async reviewDeposit(depId, action) {
    const admin = Store.state.currentAdmin;
    let reason = '';
    if (action === 'reject') {
      reason = prompt('Enter rejection reason for audit records:') || 'Reference mismatch';
    }

    try {
      const res = await API.post('/api/admin/deposits/review', {
        admin_id: admin.id,
        admin_name: admin.full_name,
        deposit_id: depId,
        action,
        reason
      });

      if (res.success) {
        Store.showToast(res.message, 'success');
        await Store.refreshAllData();
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
