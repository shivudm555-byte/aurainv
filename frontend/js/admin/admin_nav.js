// ==========================================================================
// Admin Navigation & RBAC Role Switcher
// ==========================================================================

const AdminNav = {
  init() {
    Store.on('adminTabChanged', (tab) => {
      this.setActiveTab(tab);
    });

    Store.on('adminChanged', (admin) => {
      this.updateAdminHeader(admin);
    });

    // Handle nav clicks
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        if (tab) {
          Store.setAdminTab(tab);
        }
      });
    });
  },

  updateAdminHeader(admin) {
    const roleTag = document.getElementById('admin-current-role-tag');
    const adminName = document.getElementById('admin-current-name');
    if (roleTag) roleTag.innerText = admin.role_title;
    if (adminName) adminName.innerText = admin.full_name;
  },

  setActiveTab(tab) {
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tab) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const viewport = document.getElementById('admin-content-viewport');
    if (!viewport) return;

    switch (tab) {
      case 'dashboard':
        AdminDashboard.render(viewport);
        break;
      case 'users':
        AdminUsers.render(viewport);
        break;
      case 'kyc':
        AdminKYC.render(viewport);
        break;
      case 'investments':
        AdminInvestments.render(viewport);
        break;
      case 'earnings':
        AdminEarnings.render(viewport);
        break;
      case 'deposits':
        AdminDeposits.render(viewport);
        break;
      case 'withdrawals':
        AdminWithdrawals.render(viewport);
        break;
      case 'crypto':
        AdminCrypto.render(viewport);
        break;
      case 'ledger':
        AdminLedger.render(viewport);
        break;
      case 'reports':
        AdminReports.render(viewport);
        break;
      case 'tickets':
        AdminTickets.render(viewport);
        break;
      case 'audit':
        AdminAudit.render(viewport);
        break;
      case 'settings':
        AdminSettings.render(viewport);
        break;
      default:
        AdminDashboard.render(viewport);
    }
  }
};
