// ==========================================================================
// 2026 Fintech Mobile App - Error & Empty State Views (Screens 27, 28)
// ==========================================================================

const MobileErrorEmpty = {
  // ==========================================================================
  // Screen 27: ERROR STATES
  // ==========================================================================
  renderNetworkError(container) {
    container.innerHTML = `
      <div class="auth-screen-layout error-state-screen">
        <div class="error-icon-box">
          <span style="font-size: 3rem;">📡</span>
        </div>

        <h2 class="error-title">Something went wrong</h2>
        <p class="error-desc">We encountered an issue connecting to the financial ledger network. Please check your network and try again.</p>

        <div class="error-actions-group">
          <button class="btn btn-primary btn-full btn-lg" onclick="Haptics.tap(); Store.setMobileScreen('home');">
            <span>Try Again</span> 🔄
          </button>
          <button class="btn btn-secondary btn-full" onclick="Store.setMobileScreen('support')">
            Contact Helpdesk
          </button>
        </div>
      </div>
    `;
  },

  renderPaymentFailed(container) {
    container.innerHTML = `
      <div class="auth-screen-layout error-state-screen">
        <div class="error-icon-box" style="border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1);">
          <span style="font-size: 3rem; color: #EF4444;">✕</span>
        </div>

        <h2 class="error-title">We couldn't complete your transaction</h2>
        <p class="error-desc">Your bank or card issuer declined the transaction. No funds were debited from your account.</p>

        <div class="error-actions-group">
          <button class="btn btn-primary btn-full btn-lg" onclick="Store.setMobileScreen('deposit')">
            <span>Try Again with UPI</span> →
          </button>
          <button class="btn btn-secondary btn-full" onclick="Store.setMobileScreen('wallet')">
            Back to Wallet
          </button>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // Screen 28: EMPTY STATES
  // ==========================================================================
  renderEmptyInvestments(container) {
    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Active Investments</h2>
          </div>
          <div></div>
        </div>

        <div class="empty-state-card" style="margin-top: 40px;">
          <div class="empty-icon-circle">💼</div>
          <h3 class="empty-title">You don't have any active investments yet.</h3>
          <p class="empty-desc">Explore our quantitative yield strategies and start earning daily compound accruals.</p>

          <button class="btn btn-primary btn-full btn-lg" style="margin-top: 20px;" onclick="Store.setMobileScreen('invest_plans')">
            <span>Explore Plans</span> →
          </button>
        </div>
      </div>
    `;
  }
};

window.MobileErrorEmpty = MobileErrorEmpty;
