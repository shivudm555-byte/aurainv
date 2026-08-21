// ==========================================================================
// Admin User Management Controller
// ==========================================================================

const AdminUsers = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/users');
      const users = res.users || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>User Management</h2>
            <p>Search, inspect financial portfolios, and manage user accounts</p>
          </div>
        </div>

        <div class="admin-table-container">
          <div class="table-toolbar">
            <div class="table-search-box">
              <span>🔍</span>
              <input type="text" id="user-search-input" placeholder="Search by name, email, or phone..." oninput="AdminUsers.filterUsers()" />
            </div>

            <div class="table-filter-group">
              <select id="user-status-filter" class="table-filter-select" onchange="AdminUsers.filterUsers()">
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <select id="user-kyc-filter" class="table-filter-select" onchange="AdminUsers.filterUsers()">
                <option value="ALL">All KYC</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="not_submitted">Not Submitted</option>
              </select>
            </div>
          </div>

          <table class="admin-data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Contact Info</th>
                <th>KYC Status</th>
                <th>Cash Balance</th>
                <th>Invested Principal</th>
                <th>Accrued Yield</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="user-table-tbody">
              ${this.buildUserRows(users)}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading users</p>`;
    }
  },

  buildUserRows(users) {
    if (users.length === 0) {
      return `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No users matching criteria.</td></tr>`;
    }

    return users.map(u => `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td>
          <strong>${u.full_name}</strong>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">Ref: ${u.referral_code}</span>
        </td>
        <td>
          <span>${u.email}</span>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">${u.phone}</span>
        </td>
        <td>
          <span class="badge ${u.kyc_status === 'approved' ? 'badge-approved' : u.kyc_status === 'pending' ? 'badge-pending' : 'badge-rejected'}">
            ${u.kyc_status}
          </span>
        </td>
        <td><strong>₹${(u.cash_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
        <td>₹${(u.invested_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="color: var(--primary-light);">+₹${(u.accrued_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td>
          <span class="badge ${u.status === 'active' ? 'badge-approved' : 'badge-rejected'}">
            ${u.status}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="AdminUsers.openUserDrawer(${u.id})">
            Inspect 360°
          </button>
        </td>
      </tr>
    `).join('');
  },

  async filterUsers() {
    const search = document.getElementById('user-search-input')?.value || '';
    const status = document.getElementById('user-status-filter')?.value || 'ALL';
    const kyc = document.getElementById('user-kyc-filter')?.value || 'ALL';

    const res = await API.get(`/api/admin/users?search=${encodeURIComponent(search)}&status=${status}&kyc_status=${kyc}`);
    const tbody = document.getElementById('user-table-tbody');
    if (tbody && res.users) {
      tbody.innerHTML = this.buildUserRows(res.users);
    }
  },

  async openUserDrawer(userId) {
    try {
      const res = await API.get(`/api/admin/users/${userId}`);
      const u = res.user;
      const w = res.wallet;
      const invs = res.investments || [];
      const deps = res.deposits || [];
      const wdls = res.withdrawals || [];

      const modalHTML = `
        <div id="user-drawer-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
          <div class="admin-modal-card" style="max-width: 800px;">
            <div class="modal-header-row">
              <div>
                <h3 style="font-size: 1.3rem;">${u.full_name} (User #${u.id})</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${u.email} • ${u.phone}</span>
              </div>
              <button class="icon-btn" onclick="document.getElementById('user-drawer-modal').remove()">✕</button>
            </div>

            <!-- Balances Summary -->
            <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Available Cash</span>
                <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">₹${w.cash_balance.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Invested Principal</span>
                <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">₹${w.invested_balance.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Accrued Yield</span>
                <strong style="font-size: 1.1rem; color: var(--primary-light); display: block;">+₹${w.accrued_balance.toFixed(2)}</strong>
              </div>
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Total Portfolio</span>
                <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">₹${w.total_portfolio.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <!-- Active Investments -->
            <div>
              <h4 style="font-size: 0.95rem; margin-bottom: 8px;">Active Investments (${invs.length})</h4>
              ${invs.length === 0 ? `<p style="font-size: 0.8rem; color: var(--text-muted);">No investments found.</p>` : `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${invs.map(i => `
                    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                      <div>
                        <strong>${i.plan_name}</strong> (${i.investment_code})
                        <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Daily: ${i.daily_roi_pct}% | Matures: ${new Date(i.maturity_date).toLocaleDateString()}</span>
                      </div>
                      <div style="text-align: right;">
                        <strong>₹${i.principal_amount.toLocaleString('en-IN')}</strong>
                        <span style="color: var(--primary-light); display: block; font-size: 0.75rem;">+₹${i.total_accrued.toFixed(2)} accrued</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Account Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px;">
              <div>
                <span class="badge ${u.status === 'active' ? 'badge-approved' : 'badge-rejected'}">Status: ${u.status}</span>
                <span class="badge ${u.kyc_status === 'approved' ? 'badge-approved' : 'badge-pending'}">KYC: ${u.kyc_status}</span>
              </div>

              <div style="display: flex; gap: 8px;">
                <button class="btn ${u.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="AdminUsers.toggleStatus(${u.id}, '${u.status === 'active' ? 'suspended' : 'active'}')">
                  ${u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                </button>
                <button class="btn btn-secondary btn-sm" onclick="AdminEarnings.openManualAdjustmentModal(${u.id})">
                  Post Ledger Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (err) {
      Store.showToast('Error inspecting user', 'error');
    }
  },

  async toggleStatus(userId, newStatus) {
    const admin = Store.state.currentAdmin;
    try {
      const res = await API.post('/api/admin/users/status', {
        admin_id: admin.id,
        admin_name: admin.full_name,
        user_id: userId,
        status: newStatus
      });

      if (res.success) {
        document.getElementById('user-drawer-modal')?.remove();
        Store.showToast(res.message, 'success');
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
