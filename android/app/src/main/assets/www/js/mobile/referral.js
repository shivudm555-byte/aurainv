// ==========================================================================
// 2026 Fintech Mobile App - Referral Program & Rewards Center (Screen 20)
// ==========================================================================

const MobileReferral = {
  render(container) {
    const user = Store.state.currentUser;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Invite & Earn</h2>
            <span class="subpage-step-indicator">Affiliate Rewards</span>
          </div>
          <div></div>
        </div>

        <!-- Hero Referral Card -->
        <div class="referral-hero-card">
          <div class="ref-hero-badge">⚡ 5% LIFETIME COMMISSION</div>
          <h2 class="ref-hero-title">Grow Wealth Together</h2>
          <p class="ref-hero-sub">Earn 5% direct commission on every subscription made by friends you invite.</p>

          <!-- Referral Code Box -->
          <div class="referral-code-display-box">
            <div class="ref-code-inner">
              <span class="ref-code-label">YOUR EXCLUSIVE CODE</span>
              <strong class="ref-code-value">${user.referral_code || 'ALEX2026'}</strong>
            </div>
            <button class="btn btn-primary btn-sm" onclick="Haptics.success(); alert('Referral code copied to clipboard!');">
              Copy Code
            </button>
          </div>

          <button class="btn btn-secondary btn-full" style="margin-top: 12px;" onclick="MobileReferral.shareCode()">
            <span>📲 Share Invitation Link</span>
          </button>
        </div>

        <!-- 3-Col Stats Grid -->
        <div class="referral-stats-grid">
          <div class="ref-stat-card">
            <span class="ref-stat-title">Total Invited</span>
            <strong class="ref-stat-number">${user.total_referrals || 3}</strong>
          </div>
          <div class="ref-stat-card">
            <span class="ref-stat-title">Active Investors</span>
            <strong class="ref-stat-number" style="color: #10B981;">${user.active_referrals || 2}</strong>
          </div>
          <div class="ref-stat-card">
            <span class="ref-stat-title">Rewards Earned</span>
            <strong class="ref-stat-number highlight">₹${(user.referral_rewards || 1250).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <!-- Referral History -->
        <div class="section-header-row" style="margin-top: 20px;">
          <h3 class="section-title">Invited Friends</h3>
          <span class="section-sub-badge">Auto-Credit</span>
        </div>

        <div class="referral-history-list">
          <div class="ref-friend-item">
            <div class="ref-friend-avatar">P</div>
            <div class="ref-friend-info">
              <strong>Priya Patel</strong>
              <small>Joined Aug 10, 2026 • Starter Plan (Active)</small>
            </div>
            <div class="ref-reward-amt" style="color: #10B981;">+₹1,250.00</div>
          </div>

          <div class="ref-friend-item">
            <div class="ref-friend-avatar" style="background: #38BDF8;">A</div>
            <div class="ref-friend-info">
              <strong>Amit Verma</strong>
              <small>Joined Aug 14, 2026 • Growth Plan (Active)</small>
            </div>
            <div class="ref-reward-amt" style="color: #F59E0B;">Pending</div>
          </div>

          <div class="ref-friend-item">
            <div class="ref-friend-avatar" style="background: #94A3B8;">K</div>
            <div class="ref-friend-info">
              <strong>Kavita Reddy</strong>
              <small>Joined Aug 18, 2026 • KYC Incomplete</small>
            </div>
            <div class="ref-reward-amt" style="color: var(--text-muted);">₹0.00</div>
          </div>
        </div>
      </div>
    `;
  },

  shareCode() {
    Haptics.tap();
    if (navigator.share) {
      navigator.share({
        title: 'Join AURA WEALTH with my code',
        text: `Invest in institutional wealth strategies with AURA WEALTH. Use my referral code ${Store.state.currentUser.referral_code} to get started!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      Haptics.success();
      alert(`Invitation message copied! Code: ${Store.state.currentUser.referral_code}`);
    }
  }
};

window.MobileReferral = MobileReferral;
