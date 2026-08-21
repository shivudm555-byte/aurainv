// ==========================================================================
// Admin Audit Logs & System Settings Controller
// ==========================================================================

const AdminAudit = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/audit-logs');
      const logs = res.logs || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>System Audit Trail</h2>
            <p>Cryptographic & administrative activity logs for compliance tracking</p>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Admin Name</th>
                <th>Action</th>
                <th>Target Type</th>
                <th>Target ID</th>
                <th>IP Address</th>
                <th>Details JSON</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td><strong>#${l.id}</strong></td>
                  <td><strong>${l.admin_name}</strong></td>
                  <td><span class="badge badge-approved">${l.action}</span></td>
                  <td><strong style="text-transform: uppercase;">${l.target_type}</strong></td>
                  <td><span style="font-family: monospace;">${l.target_id || '-'}</span></td>
                  <td><span style="font-family: monospace; font-size: 0.75rem;">${l.ip_address}</span></td>
                  <td>
                    <span style="font-family: monospace; font-size: 0.7rem; color: var(--text-muted); display: block; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${l.details_json}
                    </span>
                  </td>
                  <td><span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(l.created_at).toLocaleString()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading audit logs</p>`;
    }
  }
};

const AdminSettings = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/settings');
      const s = res.settings || {};

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>System Settings & Compliance Controls</h2>
            <p>Configure risk thresholds, withdrawal rules, and platform-wide security policies</p>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 16px; max-width: 650px;">
          <div class="form-group">
            <label class="form-label">Dual-Admin Approval Threshold (INR)</label>
            <input type="number" id="setting-dual-threshold" class="form-input" value="${s.dual_approval_threshold || '50000'}" />
            <span style="font-size: 0.7rem; color: var(--text-muted);">Withdrawals at or above this amount require Level 1 (Finance) + Level 2 (Super/Ops) approvals.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Platform Withdrawal Processing Fee (%)</label>
            <input type="number" step="0.1" id="setting-with-fee" class="form-input" value="${s.withdrawal_fee_pct || '1.0'}" />
          </div>

          <div class="form-group">
            <label class="form-label">Minimum Withdrawal Amount (INR)</label>
            <input type="number" id="setting-min-with" class="form-input" value="${s.min_withdrawal_amount || '500'}" />
          </div>

          <button class="btn btn-primary btn-lg" onclick="AdminSettings.saveSettings()" style="margin-top: 8px;">
            Save Global System Settings
          </button>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading settings</p>`;
    }
  },

  async saveSettings() {
    const dual_approval_threshold = document.getElementById('setting-dual-threshold').value;
    const withdrawal_fee_pct = document.getElementById('setting-with-fee').value;
    const min_withdrawal_amount = document.getElementById('setting-min-with').value;

    try {
      await API.put('/api/admin/settings', {
        dual_approval_threshold,
        withdrawal_fee_pct,
        min_withdrawal_amount
      });
      Store.showToast('Global settings updated and logged to audit trail.', 'success');
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
