// ==========================================================================
// User Mobile App Screen Router
// ==========================================================================

const MobileRouter = {
  currentScreen: 'home',
  screenParams: null,

  init() {
    Store.on('mobileScreenChanged', ({ screen, params }) => {
      this.navigate(screen, params);
    });

    // Handle bottom nav clicks
    document.querySelectorAll('.phone-bottom-nav .nav-tab-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetScreen = btn.getAttribute('data-screen');
        if (targetScreen) {
          Store.setMobileScreen(targetScreen);
        }
      });
    });
  },

  navigate(screen, params = null) {
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
    const authScreens = ['splash', 'onboarding', 'signup', 'login', 'otp', 'forgot_password', 'reset_password'];
    if (bottomNav) {
      bottomNav.style.display = authScreens.includes(screen) ? 'none' : 'flex';
    }

    // Render corresponding screen
    switch (screen) {
      case 'splash':
        MobileAuth.renderSplash(viewport);
        break;
      case 'onboarding':
        MobileAuth.renderOnboarding(viewport);
        break;
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
      case 'reset_password':
        MobileAuth.renderResetPassword(viewport, params);
        break;
      case 'kyc':
        MobileAuth.renderKYCWizard(viewport);
        break;
      case 'kyc_status':
        MobileAuth.renderKYCStatus(viewport);
        break;
      case 'home':
        MobileDashboard.render(viewport);
        break;
      case 'invest_plans':
        MobileInvestment.renderPlansCatalog(viewport);
        break;
      case 'plan_details':
        MobileInvestment.renderPlanDetails(viewport, params);
        break;
      case 'my_investments':
        MobileInvestment.renderMyInvestments(viewport);
        break;
      case 'investment_details':
        MobileInvestment.renderInvestmentDetails(viewport, params);
        break;
      case 'earnings':
        MobileEarnings.render(viewport);
        break;
      case 'daily_earnings':
        MobileEarnings.renderDaily(viewport);
        break;
      case 'wallet':
        MobileWallet.render(viewport);
        break;
      case 'deposit':
        MobileWallet.renderDeposit(viewport, params);
        break;
      case 'deposit_history':
        MobileWallet.renderDepositHistory(viewport);
        break;
      case 'withdrawal':
        MobileWallet.renderWithdrawal(viewport);
        break;
      case 'withdrawal_history':
        MobileWallet.renderWithdrawalHistory(viewport);
        break;
      case 'transactions':
        MobileWallet.renderTransactions(viewport);
        break;
      case 'transaction_details':
        MobileWallet.renderTransactionDetails(viewport, params);
        break;
      case 'crypto':
        MobileCrypto.render(viewport);
        break;
      case 'crypto_deposit':
        MobileCrypto.renderDeposit(viewport, params);
        break;
      case 'crypto_withdraw':
        MobileCrypto.renderWithdraw(viewport, params);
        break;
      case 'crypto_history':
        MobileCrypto.renderHistory(viewport);
        break;
      case 'referrals':
        MobileReferral.render(viewport);
        break;
      case 'referral_history':
        MobileReferral.renderHistory(viewport);
        break;
      case 'profile':
        MobileProfile.render(viewport);
        break;
      case 'bank_accounts':
        MobileProfile.renderBankAccounts(viewport);
        break;
      case 'kyc_documents':
        MobileProfile.renderKYCDocuments(viewport);
        break;
      case 'security':
        MobileProfile.renderSecuritySettings(viewport);
        break;
      case 'change_password':
        MobileProfile.renderChangePassword(viewport);
        break;
      case 'transaction_pin':
        MobileProfile.renderTransactionPIN(viewport);
        break;
      case 'two_factor':
        MobileProfile.render2FA(viewport);
        break;
      case 'notifications':
        MobileProfile.renderNotifications(viewport);
        break;
      case 'help_center':
        MobileSupport.renderHelpCenter(viewport);
        break;
      case 'faq':
        MobileSupport.renderFAQ(viewport);
        break;
      case 'support_tickets':
        MobileSupport.renderTickets(viewport);
        break;
      case 'ticket_chat':
        MobileSupport.renderTicketChat(viewport, params);
        break;
      case 'terms':
        MobileProfile.renderLegalDoc(viewport, 'Terms & Conditions', 'Institutional Master Agreement & Terms of Service for Antigravity Global.');
        break;
      case 'privacy':
        MobileProfile.renderLegalDoc(viewport, 'Privacy Policy', 'Data Protection, encryption standard, and DPDP / GDPR regulatory disclosures.');
        break;
      case 'risk_disclosure':
        MobileProfile.renderLegalDoc(viewport, 'Risk Disclosure Statement', 'Comprehensive market volatility disclosure, non-guarantee principles, and sovereign liquidity factors.');
        break;
      case 'about_us':
        MobileProfile.renderLegalDoc(viewport, 'About Antigravity Finance', 'Next-generation quantitative wealth management and algorithmic liquidity infrastructure.');
        break;
      default:
        MobileDashboard.render(viewport);
    }
  }
};
