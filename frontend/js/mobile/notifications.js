// ==========================================================================
// 2026 Fintech Mobile App - Notifications Center (Screen 21)
// ==========================================================================

const MobileNotifications = {
  activeCategory: 'All',

  render(container) {
    const notifs = Store.state.notifications || [];

    const filtered = notifs.filter(n => {
      if (this.activeCategory === 'All') return true;
      return n.category.toLowerCase() === this.activeCategory.toLowerCase();
    });

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="MobileRouter.goBack()">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Notifications</h2>
            <span class="subpage-step-indicator">${notifs.filter(n => !n.is_read).length} Unread Alerts</span>
          </div>
          <button class="header-text-action-btn" onclick="MobileNotifications.markAllRead()">Read All</button>
        </div>

        <!-- Categories Filter -->
        <div class="filter-chips-scroll-row">
          ${['All', 'Transactions', 'Investments', 'Security', 'KYC', 'System'].map(cat => `
            <button class="filter-chip ${cat === this.activeCategory ? 'active' : ''}" onclick="MobileNotifications.setCategory('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Notifications Feed -->
        <div class="notifications-feed-list" style="margin-top: 14px;">
          ${filtered.length > 0 ? filtered.map(n => `
            <div class="notification-card-item ${n.is_read ? 'read' : 'unread'}" onclick="MobileNotifications.toggleRead(${n.id})">
              <div class="notif-icon-circle">
                ${n.icon || '🔔'}
              </div>
              <div class="notif-card-body">
                <div class="notif-header-line">
                  <strong class="notif-title">${n.title}</strong>
                  <span class="notif-time">${n.time}</span>
                </div>
                <p class="notif-text">${n.body}</p>
                <div class="notif-category-tag">${n.category}</div>
              </div>
              ${!n.is_read ? `<div class="notif-unread-dot"></div>` : ''}
            </div>
          `).join('') : `
            <div class="empty-state-card">
              <span class="empty-icon">🔔</span>
              <h3>You're all caught up</h3>
              <p>No new notifications in "${this.activeCategory}".</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  setCategory(cat) {
    Haptics.tick();
    this.activeCategory = cat;
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
  },

  toggleRead(id) {
    Haptics.tick();
    const notif = (Store.state.notifications || []).find(n => n.id === id);
    if (notif) notif.is_read = true;
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
  },

  markAllRead() {
    Haptics.success();
    (Store.state.notifications || []).forEach(n => n.is_read = true);
    const viewport = document.getElementById('mobile-screen-content');
    this.render(viewport);
  }
};

window.MobileNotifications = MobileNotifications;
