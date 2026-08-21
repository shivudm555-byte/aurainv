// ==========================================================================
// Admin Reports Generator & CSV/Print Exporter Controller
// ==========================================================================

const AdminReports = {
  currentReportData: null,

  async render(container) {
    container.innerHTML = `
      <div class="admin-view-header">
        <div class="title-group">
          <h2>Compliance & Financial Reports</h2>
          <p>Generate, filter, and export statutory audit reports in CSV and Printable Formats</p>
        </div>

        <div class="header-action-tools">
          <button class="btn btn-secondary btn-sm" onclick="AdminReports.exportCSV()">
            📥 Download CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="AdminReports.printReport()">
            🖨️ Print Formatted Report
          </button>
        </div>
      </div>

      <!-- Report Selection Toolbar -->
      <div class="admin-table-container">
        <div class="table-toolbar">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <label class="form-label" style="margin: 0;">Report Type:</label>
            <select id="report-type-select" class="table-filter-select" onchange="AdminReports.loadReport(this.value)">
              <option value="user">1. User Account & KYC Ledger Report</option>
              <option value="deposit">2. Deposit Reconciliation Report</option>
              <option value="withdrawal">3. Dual-Authorized Withdrawal Report</option>
              <option value="investment">4. Active Investment & Portfolio Report</option>
              <option value="earnings">5. Daily ROI & Accrual Distribution Report</option>
              <option value="kyc">6. KYC Verification Audit Report</option>
              <option value="revenue">7. Platform Net Fee & Revenue Report</option>
            </select>
          </div>
        </div>

        <div id="report-content-table" style="overflow-x: auto;">
          <p style="padding: 20px; color: var(--text-muted); text-align: center;">Loading report dataset...</p>
        </div>
      </div>
    `;

    this.loadReport('user');
  },

  async loadReport(type) {
    const tableContainer = document.getElementById('report-content-table');
    if (!tableContainer) return;

    try {
      const res = await API.get(`/api/admin/reports?type=${type}`);
      this.currentReportData = res;

      const cols = res.columns || [];
      const rows = res.rows || [];

      tableContainer.innerHTML = `
        <table class="admin-data-table">
          <thead>
            <tr>
              ${cols.map(c => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0 ? `
              <tr><td colspan="${cols.length}" style="text-align: center; color: var(--text-muted); padding: 24px;">No records found for this report.</td></tr>
            ` : `
              ${rows.map(r => `
                <tr>
                  ${r.map(cell => `<td>${cell !== null && cell !== undefined ? cell : '-'}</td>`).join('')}
                </tr>
              `).join('')}
            `}
          </tbody>
        </table>
      `;
    } catch (err) {
      tableContainer.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 20px;">Failed to generate report</p>`;
    }
  },

  exportCSV() {
    if (!this.currentReportData || !this.currentReportData.rows) {
      Store.showToast('No report data to export', 'warning');
      return;
    }

    const cols = this.currentReportData.columns;
    const rows = this.currentReportData.rows;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += cols.join(',') + '\r\n';

    rows.forEach(r => {
      const rowStr = r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
      csvContent += rowStr + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Antigravity_${this.currentReportData.report_type}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    Store.showToast('CSV report downloaded successfully!', 'success');
  },

  printReport() {
    if (!this.currentReportData) return;
    window.print();
  }
};
