// ==========================================================================
// 2026 Fintech Mobile App - Screen Router & Modal Manager
// ==========================================================================

const MobileRouter = {
  currentScreen: 'home',
  screenParams: null,
  history: [],

  init() {
    Store.on('mobileScreenChanged', ({ screen, params }) => {
      this.navigate(screen, params);
    });

    // Handle bottom navigation item clicks
    document.querySelectorAll('.phone-bottom-nav .nav-tab-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetScreen = btn.getAttribute('data-screen');
        if (targetScreen) {
          Store.setMobileScreen(targetScreen);
        }
      });
    });

    // Handle Quick Action FAB button
    const fabBtn = document.getElementById('mobile-fab-action-btn');
    if (fabBtn) {
      fabBtn.addEventListener('click', () => {
        this.openQuickActionsSheet();
      });
    }
  },

  navigate(screen, params = null) {
    if (this.currentScreen !== screen) {
      this.history.push({ screen: this.currentScreen, params: this.screenParams });
    }

    this.currentScreen = screen;
    this.screenParams = params;
    const viewport = document.getElementById('mobile-screen-content');
    if (!viewport) return;

    // Update bottom nav active state
    document.querySelectorAll('.phone-bottom-nav .nav-tab-item').forEach(btn => {
      const target = btn.getAttribute('data-screen');
      if (target === screen || (screen.startsWith(target) && target !== 'home')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Control bottom nav visibility (hide on auth & splash screens)
    const bottomNav = document.getElementById('mobile-bottom-nav');
    const authScreens = ['splash', 'onboarding', 'login', 'signup', 'otp', 'forgot_password', 'reset_password', 'kyc'];
    if (bottomNav) {
      bottomNav.style.display = authScreens.includes(screen) ? 'none' : 'flex';
    }

    // Scroll viewport to top
    viewport.scrollTop = 0;

    // Close any open bottom sheet or modal
    this.closeBottomSheet();

    // Render corresponding screen
    switch (screen) {
      // 1. Splash & Onboarding
      case 'splash':
        MobileAuth.renderSplash(viewport);
        break;
      case 'onboarding':
        MobileAuth.renderOnboarding(viewport);
        break;

      // 2. Auth & Verification
      case 'login':
        MobileAuth.renderLogin(viewport);
        break;
      case 'signup':
        MobileAuth.renderSignUp(viewport);
        break;
      case 'otp':
        MobileAuth.renderOTP(viewport, params);
        break;
      case 'forgot_password':
        MobileAuth.renderForgotPassword(viewport);
        break;

      // 3. KYC Verification Flow
      case 'kyc':
        MobileKYC.renderKYCWizard(viewport);
        break;
      case 'kyc_status':
        MobileKYC.renderKYCStatus(viewport);
        break;

      // 4. Home Dashboard
      case 'home':
        MobileDashboard.render(viewport);
        break;
      case 'portfolio_summary':
        MobileDashboard.renderPortfolioSummary(viewport);
        break;
      case 'my_investments':
        MobileInvestment.renderMyInvestments(viewport);
        break;

      // 5. Invest & Catalog
      case 'invest':
      case 'invest_plans':
        MobileInvestment.renderPlansCatalog(viewport);
        break;
      case 'plan_details':
        MobileInvestment.renderPlanDetails(viewport, params);
        break;
      case 'investment_details':
        MobileInvestment.renderInvestmentDetails(viewport, params);
        break;
      case 'invest_process':
        MobileInvestment.renderInvestProcess(viewport, params);
        break;

      // 6. Earnings Hub
      case 'earnings':
        MobileEarnings.render(viewport);
        break;

      // 7. Wallet, Deposit & Withdrawal
      case 'wallet':
        MobileWallet.render(viewport);
        break;
      case 'deposit':
        MobileWallet.renderDepositFlow(viewport);
        break;
      case 'withdrawal':
        MobileWallet.renderWithdrawalFlow(viewport);
        break;

      // 8. Activity & Transactions
      case 'activity':
      case 'transactions':
        MobileActivity.render(viewport);
        break;
      case 'transaction_details':
        MobileActivity.renderDetails(viewport, params);
        break;

      // 9. Digital Assets & Crypto
      case 'crypto':
      case 'digital_assets':
        MobileCrypto.render(viewport);
        break;
      case 'crypto_wallet':
        MobileCrypto.renderWallet(viewport, params);
        break;

      // 10. Referrals & Rewards
      case 'referral':
      case 'referrals':
        MobileReferral.render(viewport);
        break;

      // 11. Notifications
      case 'notifications':
        MobileNotifications.render(viewport);
        break;

      // 12. Profile & Account
      case 'profile':
        MobileProfile.render(viewport);
        break;
      case 'bank_accounts':
        MobileProfile.renderBankAccounts(viewport);
        break;

      // 13. Security Center & Biometrics
      case 'security':
        MobileSecurity.render(viewport);
        break;
      case 'biometrics':
        MobileSecurity.renderBiometricPrompt(viewport, params);
        break;

      // 14. Support & FAQ
      case 'support':
        MobileSupport.render(viewport);
        break;

      // 15. Settings & Legal
      case 'settings':
        MobileSettings.render(viewport);
        break;
      case 'terms':
        MobileSettings.renderLegal(viewport, 'terms');
        break;
      case 'privacy':
        MobileSettings.renderLegal(viewport, 'privacy');
        break;
      case 'risk':
        MobileSettings.renderLegal(viewport, 'risk');
        break;

      // 16. Error & Empty States
      case 'error_network':
        MobileErrorEmpty.renderNetworkError(viewport);
        break;
      case 'error_payment':
        MobileErrorEmpty.renderPaymentFailed(viewport);
        break;
      case 'empty_investments':
        MobileErrorEmpty.renderEmptyInvestments(viewport);
        break;

      default:
        MobileDashboard.render(viewport);
        break;
    }
  },

  goBack() {
    if (this.history.length > 0) {
      const prev = this.history.pop();
      this.navigate(prev.screen, prev.params);
    } else {
      this.navigate('home');
    }
  },

  openBottomSheet(contentHtml, title = '') {
    Haptics.tap();
    const sheet = document.getElementById('mobile-bottom-sheet');
    const sheetContent = document.getElementById('bottom-sheet-dynamic-content');
    const sheetTitle = document.getElementById('bottom-sheet-title');
    const overlay = document.getElementById('mobile-sheet-overlay');

    if (sheet && sheetContent && overlay) {
      if (sheetTitle) sheetTitle.innerText = title;
      sheetContent.innerHTML = contentHtml;
      overlay.style.display = 'block';
      sheet.classList.add('open');
    }
  },

  closeBottomSheet() {
    const sheet = document.getElementById('mobile-bottom-sheet');
    const overlay = document.getElementById('mobile-sheet-overlay');
    if (sheet) sheet.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
  },

  openQuickActionsSheet() {
    this.openBottomSheet(`
      <div class="quick-actions-sheet-grid">
        <button class="quick-action-item" onclick="MobileRouter.closeBottomSheet(); Store.setMobileScreen('deposit');">
          <div class="quick-action-icon-circle" style="background: rgba(0, 240, 255, 0.15); color: #00F0FF;">
            ↓
          </div>
          <span>Deposit</span>
          <small>Add funds</small>
        </button>

        <button class="quick-action-item" onclick="MobileRouter.closeBottomSheet(); Store.setMobileScreen('invest_plans');">
          <div class="quick-action-icon-circle" style="background: rgba(16, 185, 129, 0.15); color: #10B981;">
            ⚡
          </div>
          <span>Invest</span>
          <small>Explore plans</small>
        </button>

        <button class="quick-action-item" onclick="MobileRouter.closeBottomSheet(); Store.setMobileScreen('withdrawal');">
          <div class="quick-action-icon-circle" style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;">
            ↑
          </div>
          <span>Withdraw</span>
          <small>Bank payout</small>
        </button>

        <button class="quick-action-item" onclick="MobileRouter.closeBottomSheet(); Store.setMobileScreen('crypto');">
          <div class="quick-action-icon-circle" style="background: rgba(168, 85, 247, 0.15); color: #A855F7;">
            🪙
          </div>
          <span>Digital Assets</span>
          <small>Crypto rails</small>
        </button>
      </div>
    `, 'Quick Actions');
  }
};

window.MobileRouter = MobileRouter;
