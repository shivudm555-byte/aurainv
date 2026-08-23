// ==========================================================================
// Admin KYC Compliance Verification Desk Controller
// ==========================================================================

const AdminKYC = {
  async render(container) {
    try {
      const res = await API.get('/api/admin/kyc/records');
      const records = res.records || [];

      container.innerHTML = `
        <div class="admin-view-header">
          <div class="title-group">
            <h2>KYC Verification Desk</h2>
            <p>Statutory AML, PMLA & identity verification review queue</p>
          </div>

          <div class="table-filter-group">
            <select id="admin-kyc-status-filter" class="table-filter-select" onchange="AdminKYC.filterKYC()">
              <option value="ALL">All KYC Submissions</option>
              <option value="pending" selected>Pending Review Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>KYC ID</th>
                <th>User Name</th>
                <th>Doc Type</th>
                <th>Identification Number</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="kyc-table-tbody">
              ${this.buildKYCRows(records.filter(r => r.status === 'pending'))}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading KYC desk</p>`;
    }
  },

  buildKYCRows(records) {
    if (records.length === 0) {
      return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No KYC submissions in this queue.</td></tr>`;
    }

    return records.map(r => `
      <tr>
        <td><strong>#${r.id}</strong></td>
        <td>
          <strong>${r.full_name}</strong>
          <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">User #${r.user_id} • ${r.phone}</span>
        </td>
        <td><strong style="text-transform: uppercase;">${r.doc_type}</strong></td>
        <td><span style="font-family: monospace; font-weight: 700;">${r.id_number}</span></td>
        <td>${new Date(r.submitted_at).toLocaleString()}</td>
        <td>
          <span class="badge ${r.status === 'approved' ? 'badge-approved' : r.status === 'pending' ? 'badge-pending' : 'badge-rejected'}">
            ${r.status}
          </span>
        </td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="AdminKYC.openReviewModal(${r.id})">
            Review Documents
          </button>
        </td>
      </tr>
    `).join('');
  },

  async filterKYC() {
    const status = document.getElementById('admin-kyc-status-filter')?.value || 'ALL';
    const res = await API.get(`/api/admin/kyc/records?status=${status}`);
    const tbody = document.getElementById('kyc-table-tbody');
    if (tbody && res.records) {
      tbody.innerHTML = this.buildKYCRows(res.records);
    }
  },

  async openReviewModal(kycId) {
    const res = await API.get('/api/admin/kyc/records');
    const rec = (res.records || []).find(r => r.id === kycId);
    if (!rec) return;

    const modalHTML = `
      <div id="kyc-modal" class="admin-modal-overlay open" onclick="if(event.target === this) this.remove()">
        <div class="admin-modal-card" style="max-width: 750px;">
          <div class="modal-header-row">
            <div>
              <h3>KYC Review: ${rec.full_name}</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${rec.doc_type.toUpperCase()}: ${rec.id_number}</span>
            </div>
            <button class="icon-btn" onclick="document.getElementById('kyc-modal').remove()">✕</button>
          </div>

          <!-- Document Previews -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 14px; text-align: center;">
              <span style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 6px;">ID Document Front</span>
              <img src="${rec.doc_front_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px;" />
            </div>

            <div style="background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 14px; text-align: center;">
              <span style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 6px;">Live Selfie Scan</span>
              <img src="${rec.selfie_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px;" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <button class="btn btn-danger" onclick="AdminKYC.openRejectModal(${rec.id})">
              ✕ Reject KYC
            </button>
            <button class="btn btn-primary" onclick="AdminKYC.submitReview(${rec.id}, 'approve')">
              ✓ Approve & Verify Account
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  openRejectModal(kycId) {
    const reason = prompt("Enter mandatory rejection reason for compliance records (e.g. 'Document is blurred' or 'Name mismatch'):");
    if (!reason || !reason.trim()) {
      Store.showToast('Rejection cancelled: Mandatory reason required.', 'warning');
      return;
    }
    this.submitReview(kycId, 'reject', reason);
  },

  async submitReview(kycId, action, reason = '') {
    const admin = Store.state.currentAdmin;
    try {
      const res = await API.post('/api/admin/kyc/review', {
        admin_id: admin.id,
        admin_name: admin.full_name,
        kyc_id: kycId,
        action,
        reason
      });

      if (res.success) {
        document.getElementById('kyc-modal')?.remove();
        Store.showToast(res.message, 'success');
        this.render(document.getElementById('admin-content-viewport'));
      }
    } catch (err) {
      Store.showToast(err.message, 'error');
    }
  }
};
