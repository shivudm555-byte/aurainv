// ==========================================================================
// Admin Investment Plans Management Controller
// ==========================================================================

const AdminInvestments = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/plans');
      const plans = res.plans || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>Investment Management</h2>
            <p>Configure investment vehicles, yields, lockup periods, and capital risk levels</p>
          </div>

          <div class="header-action-tools">
            <button class="btn btn-primary btn-sm" onclick="AdminInvestments.openPlanModal()">
              ＋ Create New Plan
            </button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Min - Max Limits</th>
                <th>Duration</th>
                <th>Daily Yield %</th>
                <th>Annual APY</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${plans.map(p => `
                <tr>
                  <td>
                    <strong>${p.name}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">${p.slug}</span>
                  </td>
                  <td>₹${p.min_amount.toLocaleString('en-IN')} - ₹${p.max_amount.toLocaleString('en-IN')}</td>
                  <td>${p.duration_days} Days</td>
                  <td><strong style="color: var(--primary-light);">${p.daily_roi_pct}%/day</strong></td>
                  <td><strong>${(p.daily_roi_pct * 365).toFixed(1)}% APY</strong></td>
                  <td><span class="badge ${p.risk_level === 'Low' ? 'badge-approved' : p.risk_level === 'Moderate' ? 'badge-pending' : 'badge-rejected'}">${p.risk_level}</span></td>
                  <td><span class="badge ${p.status === 'active' ? 'badge-approved' : 'badge-rejected'}">${p.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="AdminInvestments.openPlanModal(${p.id})">Edit Plan</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading investment plans</p>`;
    }
  },

  async openPlanModal(planId = null) {
    let plan = {
      name: '',
      tagline: '',
      description: '',
      min_amount: 1000,
      max_amount: 100000,
      duration_days: 30,
      daily_roi_pct: 0.05,
      payout_frequency: 'daily',
      risk_level: 'Moderate',
      status: 'active'
    };

    if (planId) {
      const res = await API.get('/api/admin/plans');
      plan = (res.plans || []).find(p => p.id === planId) || plan;
    }

    const modalHTML = `
      <div id="plan-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="admin-modal-card">
          <div class="modal-header-row">
            <h3>${planId ? 'Edit Investment Plan' : 'Create New Investment Plan'}</h3>
            <button class="icon-btn" onclick="document.getElementById('plan-modal').remove()">✕</button>
          </div>

          <form onsubmit="AdminInvestments.savePlan(event, ${planId || 'null'})" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Plan Name</label>
              <input type="text" id="plan-name-input" class="form-input" value="${plan.name}" placeholder="e.g. Liquid Starter Growth" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tagline</label>
              <input type="text" id="plan-tagline-input" class="form-input" value="${plan.tagline || ''}" placeholder="Short summary..." />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Min Investment (INR)</label>
                <input type="number" id="plan-min-input" class="form-input" value="${plan.min_amount}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Max Investment (INR)</label>
                <input type="number" id="plan-max-input" class="form-input" value="${plan.max_amount}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Duration (Days)</label>
                <input type="number" id="plan-dur-input" class="form-input" value="${plan.duration_days}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Daily Return ROI (%)</label>
                <input type="number" step="0.001" id="plan-roi-input" class="form-input" value="${plan.daily_roi_pct}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Risk Level</label>
                <select id="plan-risk-select" class="form-select">
                  <option value="Low" ${plan.risk_level === 'Low' ? 'selected' : ''}>Low Risk</option>
                  <option value="Moderate" ${plan.risk_level === 'Moderate' ? 'selected' : ''}>Moderate Risk</option>
                  <option value="High" ${plan.risk_level === 'High' ? 'selected' : ''}>High Risk</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Plan Status</label>
                <select id="plan-status-select" class="form-select">
                  <option value="active" ${plan.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="inactive" ${plan.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 8px;">Save Investment Plan</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async savePlan(e, planId) {
    e.preventDefault();
    const admin = Store.state.currentAdmin;
    const name = document.getElementById('plan-name-input').value;
    const tagline = document.getElementById('plan-tagline-input').value;
    const min_amount = parseFloat(document.getElementById('plan-min-input').value);
    const max_amount = parseFloat(document.getElementById('plan-max-input').value);
    const duration_days = parseInt(document.getElementById('plan-dur-input').value);
    const daily_roi_pct = parseFloat(document.getElementById('plan-roi-input').value);
    const risk_level = document.getElementById('plan-risk-select').value;
    const status = document.getElementById('plan-status-select').value;

    try {
      const res = await API.post('/api/admin/plans', {
        id: planId,
        admin_id: admin.id,
        admin_name: admin.full_name,
        name,
        tagline,
        min_amount,
        max_amount,
        duration_days,
        daily_roi_pct,
        risk_level,
        status
      });

      if (res.success) {
        document.getElementById('plan-modal')?.remove();
        Store.showToast(res.message, 'success');
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
