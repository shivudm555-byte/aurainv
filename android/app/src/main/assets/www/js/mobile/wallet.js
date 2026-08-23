// ==========================================================================
// 2026 Fintech Mobile App - Wallet, Banking, Deposit & Withdrawal Flows (Screens 13, 14, 15)
// ==========================================================================

const MobileWallet = {
  depositStep: 1,
  depositAmount: 5000,
  depositMethod: 'UPI',

  withdrawStep: 1,
  withdrawAmount: 2000,
  withdrawMethod: 'BANK_TRANSFER',

  // ==========================================================================
  // Screen 13: WALLET MAIN VIEW
  // ==========================================================================
  render(container) {
    const wallet = Store.state.wallet;

    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <!-- Header -->
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('home')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Cash Wallet</h2>
            <span class="subpage-step-indicator">Available Liquidity</span>
          </div>
          <button class="header-icon-btn" onclick="Store.setMobileScreen('bank_accounts')" title="Bank Accounts">🏦</button>
        </div>

        <!-- Available Balance Card -->
        <div class="wallet-balance-hero-card">
          <span class="wallet-bal-label">Available Balance</span>
          <h1 class="wallet-big-val">₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
          <span class="wallet-settlement-tag">Instant 24/7 withdrawals & zero lockup</span>

          <!-- Main Deposit / Withdraw Buttons -->
          <div class="wallet-hero-actions-row">
            <button class="btn btn-primary btn-full btn-lg" onclick="Store.setMobileScreen('deposit')">
              <span>↓ Deposit Funds</span>
            </button>
            <button class="btn btn-secondary btn-full btn-lg" onclick="Store.setMobileScreen('withdrawal')">
              <span>↑ Withdraw</span>
            </button>
          </div>
        </div>

        <!-- Balances Grid -->
        <div class="wallet-sub-metrics-grid">
          <div class="sub-metric-card">
            <span class="sub-m-label">Invested Balance</span>
            <strong class="sub-m-val">₹${wallet.invested_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            <small class="sub-m-note">${Store.state.investments.length} Active Plan</small>
          </div>

          <div class="sub-metric-card">
            <span class="sub-m-label">Pending Payouts</span>
            <strong class="sub-m-val" style="color: ${wallet.pending_balance > 0 ? '#F59E0B' : 'var(--text-muted)'};">
              ₹${wallet.pending_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
            <small class="sub-m-note">${wallet.pending_balance > 0 ? 'Under review' : 'No pending orders'}</small>
          </div>
        </div>

        <!-- Bank Account Card -->
        <div class="section-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 class="section-card-title" style="margin: 0;">Linked Primary Bank</h4>
            <span class="badge-verified">✓ Verified</span>
          </div>
          <div class="linked-bank-item" style="margin-top: 10px;">
            <div class="bank-avatar">🏦</div>
            <div class="bank-info">
              <strong>HDFC Bank Ltd</strong>
              <small>A/C ••••••••••5890 • IFSC: HDFC0001234</small>
            </div>
          </div>
        </div>

        <!-- Wallet Activity Feed -->
        <div class="section-header-row" style="margin-top: 18px;">
          <h3 class="section-title">Wallet Activity</h3>
          <a href="javascript:void(0)" class="section-see-all-link" onclick="Store.setMobileScreen('activity')">All History</a>
        </div>

        <div class="recent-tx-feed">
          ${(Store.state.transactions || []).map(tx => `
            <div class="tx-mini-item" onclick="Store.setMobileScreen('transaction_details', { id: '${tx.id}' })">
              <div class="tx-mini-icon-circle ${tx.is_positive ? 'pos' : 'neg'}">
                ${tx.is_positive ? '↓' : '↑'}
              </div>
              <div class="tx-mini-info">
                <span class="tx-mini-title">${tx.title}</span>
                <small class="tx-mini-date">${tx.date} • ${tx.status}</small>
              </div>
              <div class="tx-mini-amount ${tx.is_positive ? 'positive' : ''}">
                ${tx.is_positive ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // Screen 14: 4-STEP DEPOSIT FLOW
  // ==========================================================================
  renderDepositFlow(container) {
    this.depositStep = 1;
    this.renderDepositStep(container);
  },

  renderDepositStep(container) {
    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('wallet')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Deposit Funds</h2>
            <span class="subpage-step-indicator">Step ${this.depositStep} of 4</span>
          </div>
          <div></div>
        </div>

        <div class="deposit-flow-content">
          ${this.getDepositStepHtml()}
        </div>
      </div>
    `;
  },

  getDepositStepHtml() {
    // Step 1: Enter Amount
    if (this.depositStep === 1) {
      return `
        <div class="flow-card">
          <div class="step-badge-tag">STEP 1 • ENTER AMOUNT</div>
          <h3 class="step-heading">How much would you like to deposit?</h3>
          <p class="step-sub">Instant zero-fee deposits across all supported payment rails.</p>

          <div class="amount-large-input-box">
            <span class="currency-prefix">₹</span>
            <input type="number" id="deposit-amt-input" class="amount-large-input" value="${this.depositAmount}" oninput="MobileWallet.depositAmount = parseFloat(this.value) || 0;" />
          </div>

          <div class="quick-chip-row">
            <button class="quick-amt-chip" onclick="MobileWallet.setDepositAmt(1000)">+₹1,000</button>
            <button class="quick-amt-chip" onclick="MobileWallet.setDepositAmt(5000)">+₹5,000</button>
            <button class="quick-amt-chip" onclick="MobileWallet.setDepositAmt(10000)">+₹10,000</button>
            <button class="quick-amt-chip" onclick="MobileWallet.setDepositAmt(50000)">+₹50,000</button>
          </div>

          <button class="btn btn-primary btn-full btn-lg" style="margin-top: 24px;" onclick="MobileWallet.goToDepositStep(2)">
            <span>Continue to Payment Method</span> →
          </button>
        </div>
      `;
    }

    // Step 2: Choose Payment Method
    if (this.depositStep === 2) {
      return `
        <div class="flow-card">
          <div class="step-badge-tag">STEP 2 • PAYMENT METHOD</div>
          <h3 class="step-heading">Select Deposit Rail</h3>
          <p class="step-sub">Choose how you wish to transfer ₹${this.depositAmount.toLocaleString('en-IN')}.</p>

          <div class="payment-methods-selector">
            <div class="payment-method-item active" onclick="Haptics.tick(); MobileWallet.selectDepositMethod('UPI', this)">
              <div class="pm-icon" style="color: #00F0FF;">⚡</div>
              <div class="pm-info">
                <strong>Instant UPI (QR / VPA)</strong>
                <small>Google Pay, PhonePe, Paytm (Instant Credit)</small>
              </div>
              <span class="pm-check">✓</span>
            </div>

            <div class="payment-method-item" onclick="Haptics.tick(); MobileWallet.selectDepositMethod('Net Banking', this)">
              <div class="pm-icon" style="color: #38BDF8;">🏦</div>
              <div class="pm-info">
                <strong>IMPS / NEFT Net Banking</strong>
                <small>HDFC, ICICI, SBI, Axis direct transfer</small>
              </div>
              <span class="pm-check">✓</span>
            </div>

            <div class="payment-method-item" onclick="Haptics.tick(); MobileWallet.selectDepositMethod('Payment Gateway', this)">
              <div class="pm-icon" style="color: #10B981;">💳</div>
              <div class="pm-info">
                <strong>Debit Card / Gateway</strong>
                <small>Visa, Mastercard, RuPay 3D Secure</small>
              </div>
              <span class="pm-check">✓</span>
            </div>

            <div class="payment-method-item" onclick="Haptics.tick(); MobileWallet.selectDepositMethod('USDT Crypto', this)">
              <div class="pm-icon" style="color: #A855F7;">🪙</div>
              <div class="pm-info">
                <strong>Digital Asset (USDT TRC-20)</strong>
                <small>Instant on-chain settlement</small>
              </div>
              <span class="pm-check">✓</span>
            </div>
          </div>

          <div class="kyc-actions-row" style="margin-top: 20px;">
            <button class="btn btn-secondary" onclick="MobileWallet.goToDepositStep(1)">Back</button>
            <button class="btn btn-primary btn-full btn-lg" onclick="MobileWallet.goToDepositStep(3)">
              <span>Review Deposit</span> →
            </button>
          </div>
        </div>
      `;
    }

    // Step 3: Review & Mock Pay
    if (this.depositStep === 3) {
      return `
        <div class="flow-card">
          <div class="step-badge-tag">STEP 3 • ORDER REVIEW</div>
          <h3 class="step-heading">Deposit Summary</h3>
          <p class="step-sub">Scan the generated UPI QR code or proceed to simulate deposit payment.</p>

          ${this.depositMethod === 'UPI' ? `
            <div class="mock-upi-qr-card">
              <div class="upi-qr-image-box">
                <!-- SVG simulated QR code -->
                <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" rx="8"/>
                  <rect x="10" y="10" width="25" height="25" fill="#0A0E1A"/>
                  <rect x="15" y="15" width="15" height="15" fill="white"/>
                  <rect x="18" y="18" width="9" height="9" fill="#0A0E1A"/>
                  <rect x="65" y="10" width="25" height="25" fill="#0A0E1A"/>
                  <rect x="70" y="15" width="15" height="15" fill="white"/>
                  <rect x="73" y="18" width="9" height="9" fill="#0A0E1A"/>
                  <rect x="10" y="65" width="25" height="25" fill="#0A0E1A"/>
                  <rect x="15" y="70" width="15" height="15" fill="white"/>
                  <rect x="18" y="73" width="9" height="9" fill="#0A0E1A"/>
                  <rect x="42" y="42" width="16" height="16" fill="#00F0FF"/>
                  <circle cx="50" cy="50" r="4" fill="#0A0E1A"/>
                  <path d="M40 15h15v5h-15z M45 25h10v10h-10z M15 45h10v10h-10z M40 65h10v15h-10z M65 45h20v5h-20z M70 60h15v20h-5v-15h-10z" fill="#0A0E1A"/>
                </svg>
              </div>
              <span class="vpa-text">aurawealth.fintech@hdfcbank</span>
              <small style="color: var(--text-muted);">Amount: ₹${this.depositAmount.toLocaleString('en-IN')}</small>
            </div>
          ` : ''}

          <div class="confirmation-order-card" style="margin-top: 14px;">
            <div class="order-row">
              <span>Deposit Amount</span>
              <strong>₹${this.depositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="order-row">
              <span>Payment Rail</span>
              <strong>${this.depositMethod}</strong>
            </div>
            <div class="order-row">
              <span>Processing Fee</span>
              <strong style="color: #10B981;">₹0.00 (Zero Fee)</strong>
            </div>
            <div class="order-row">
              <span>Net Credited to Wallet</span>
              <strong class="highlight">₹${this.depositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div class="kyc-actions-row" style="margin-top: 18px;">
            <button class="btn btn-secondary" onclick="MobileWallet.goToDepositStep(2)">Back</button>
            <button class="btn btn-primary btn-full btn-lg" onclick="MobileWallet.confirmDeposit()">
              <span>Simulate Instant Deposit</span> ✓
            </button>
          </div>
        </div>
      `;
    }
  },

  setDepositAmt(amt) {
    Haptics.tick();
    this.depositAmount = amt;
    const input = document.getElementById('deposit-amt-input');
    if (input) input.value = amt;
  },

  selectDepositMethod(method, element) {
    this.depositMethod = method;
    document.querySelectorAll('.payment-method-item').forEach(e => e.classList.remove('active'));
    element.classList.add('active');
  },

  goToDepositStep(step) {
    Haptics.tap();
    this.depositStep = step;
    const viewport = document.getElementById('mobile-screen-content');
    this.renderDepositStep(viewport);
  },

  async confirmDeposit() {
    Haptics.tap();
    try {
      const res = await Store.processDeposit(this.depositAmount, this.depositMethod);
      const viewport = document.getElementById('mobile-screen-content');
      this.renderDepositSuccess(viewport, res);
    } catch (e) {
      alert(e.message || 'Deposit error');
    }
  },

  renderDepositSuccess(container, res) {
    container.innerHTML = `
      <div class="auth-screen-layout kyc-success-screen">
        <div class="kyc-success-emblem-box">
          <div class="success-icon-ring">
            <span style="font-size: 2.2rem; color: #10B981;">✓</span>
          </div>
        </div>

        <h2 class="auth-page-title" style="margin-top: 16px;">Deposit Confirmed!</h2>
        <p class="auth-page-sub">
          ₹${res.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been credited to your cash wallet. Available balance updated immediately on the ledger.
        </p>

        <div class="kyc-summary-card" style="margin: 16px 0; text-align: left;">
          <div class="summary-row">
            <span>Transaction ID</span>
            <strong>${res.txId}</strong>
          </div>
          <div class="summary-row">
            <span>Amount Credited</span>
            <strong style="color: #10B981;">₹${res.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="summary-row">
            <span>Status</span>
            <strong style="color: #10B981;">COMPLETED ✓</strong>
          </div>
        </div>

        <div style="display: flex; gap: 10px; width: 100%;">
          <button class="btn btn-secondary btn-full" onclick="Store.setMobileScreen('wallet')">
            View Wallet
          </button>
          <button class="btn btn-primary btn-full" onclick="Store.setMobileScreen('invest_plans')">
            Invest Now →
          </button>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // Screen 15: 5-STEP SECURE WITHDRAWAL FLOW
  // ==========================================================================
  renderWithdrawalFlow(container) {
    this.withdrawStep = 1;
    this.renderWithdrawalStep(container);
  },

  renderWithdrawalStep(container) {
    container.innerHTML = `
      <div class="mobile-subpage-layout">
        <div class="mobile-subpage-header">
          <button class="back-circle-btn" onclick="Store.setMobileScreen('wallet')">←</button>
          <div class="subpage-title-box">
            <h2 class="subpage-title">Withdraw Funds</h2>
            <span class="subpage-step-indicator">Step ${this.withdrawStep} of 5</span>
          </div>
          <div></div>
        </div>

        <div class="withdrawal-flow-content">
          ${this.getWithdrawalStepHtml()}
        </div>
      </div>
    `;
  },

  getWithdrawalStepHtml() {
    const wallet = Store.state.wallet;

    // Step 1: Enter Amount
    if (this.withdrawStep === 1) {
      return `
        <div class="flow-card">
          <div class="step-badge-tag">STEP 1 • WITHDRAWAL AMOUNT</div>
          <h3 class="step-heading">Enter payout amount</h3>
          <p class="step-sub">Available for Withdrawal: <strong>₹${wallet.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>

          <div class="amount-large-input-box">
            <span class="currency-prefix">₹</span>
            <input type="number" id="withdraw-amt-input" class="amount-large-input" value="${this.withdrawAmount}" oninput="MobileWallet.withdrawAmount = parseFloat(this.value) || 0;" />
          </div>

          <div class="quick-chip-row">
            <button class="quick-amt-chip" onclick="MobileWallet.setWithdrawAmt(1000)">₹1,000</button>
            <button class="quick-amt-chip" onclick="MobileWallet.setWithdrawAmt(5000)">₹5,000</button>
            <button class="quick-amt-chip" onclick="MobileWallet.setWithdrawAmt(25000)">₹25,000</button>
            <button class="quick-amt-chip" onclick="MobileWallet.setWithdrawAmt(${wallet.cash_balance})">All Available</button>
          </div>

          <button class="btn btn-primary btn-full btn-lg" style="margin-top: 24px;" onclick="MobileWallet.goToWithdrawStep(2)">
            <span>Select Destination Bank</span> →
          </button>
        </div>
      `;
    }

    // Step 2: Select Bank / Wallet
    if (this.withdrawStep === 2) {
      return `
        <div class="flow-card">
          <div class="step-badge-tag">STEP 2 • DESTINATION ACCOUNT</div>
          <h3 class="step-heading">Select Bank Account</h3>
          <p class="step-sub">Choose your verified beneficiary account for payout.</p>

          <div class="beneficiary-bank-cards">
            <div class="beneficiary-card active">
              <div class="b-avatar">🏦</div>
              <div class="b-info">
                <strong>HDFC Bank Ltd</strong>
                <small>Account ••••••••••5890</small>
                <span class="b-ifsc">IFSC: HDFC0001234 • Primary</span>
              </div>
              <span class="b-check">✓</span>
            </div>
          </div>

          <div class="kyc-actions-row" style="margin-top: 20px;">
            <button class="btn btn-secondary" onclick="MobileWallet.goToWithdrawStep(1)">Back</button>
            <button class="btn btn-primary btn-full btn-lg" onclick="MobileWallet.goToWithdrawStep(3)">
              <span>Review Payout Fees</span> →
            </button>
          </div>
        </div>
      `;
    }

    // Step 3: Review Fees & Thresholds
    if (this.withdrawStep === 3) {
      const fee = Math.round(this.withdrawAmount * 0.01);
      const net = this.withdrawAmount - fee;
      const isHighValue = this.withdrawAmount >= 50000;

      return `
        <div class="flow-card">
          <div class="step-badge-tag">STEP 3 • FEE REVIEW</div>
          <h3 class="step-heading">Review Breakdown</h3>
          <p class="step-sub">Verify bank payout details and dynamic regulatory fee.</p>

          <div class="confirmation-order-card">
            <div class="order-row">
              <span>Gross Withdrawal</span>
              <strong>₹${this.withdrawAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="order-row">
              <span>Dynamic Processing Fee (1%)</span>
              <strong style="color: #EF4444;">-₹${fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="order-row">
              <span>Net Payout to Bank</span>
              <strong class="highlight">₹${net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="order-row">
              <span>Estimated Settlement</span>
              <strong style="color: #10B981;">Instant IMPS (1-5 minutes)</strong>
            </div>
          </div>

          ${isHighValue ? `
            <div class="dual-admin-warning-banner" style="margin-top: 14px;">
              <span class="warning-icon">🛡️</span>
              <div>
                <strong>Additional Verification Required</strong>
                <p>Withdrawals ≥ ₹50,000 undergo dual-administrator multi-sign compliance review.</p>
              </div>
            </div>
          ` : ''}

          <div class="kyc-actions-row" style="margin-top: 20px;">
            <button class="btn btn-secondary" onclick="MobileWallet.goToWithdrawStep(2)">Back</button>
            <button class="btn btn-primary btn-full btn-lg" onclick="MobileWallet.promptWithdrawalPin()">
              <span>Authorize Withdrawal</span> →
            </button>
          </div>
        </div>
      `;
    }
  },

  setWithdrawAmt(amt) {
    Haptics.tick();
    this.withdrawAmount = amt;
    const input = document.getElementById('withdraw-amt-input');
    if (input) input.value = amt;
  },

  goToWithdrawStep(step) {
    Haptics.tap();
    const wallet = Store.state.wallet;
    if (step > 1 && this.withdrawAmount > wallet.cash_balance) {
      Haptics.error();
      alert(`Insufficient cash balance (₹${wallet.cash_balance.toLocaleString('en-IN')}).`);
      return;
    }
    this.withdrawStep = step;
    const viewport = document.getElementById('mobile-screen-content');
    this.renderWithdrawalStep(viewport);
  },

  promptWithdrawalPin() {
    MobileSecurity.showPinPromptModal({
      title: 'Security Verification',
      subtitle: `Enter 4-digit PIN to withdraw ₹${this.withdrawAmount.toLocaleString('en-IN')}`,
      onSuccess: async (pin) => {
        try {
          const res = await Store.processWithdrawal(this.withdrawAmount, this.withdrawMethod, pin);
          const viewport = document.getElementById('mobile-screen-content');
          this.renderWithdrawalSuccess(viewport, res);
        } catch (e) {
          alert(e.message || 'Withdrawal failed');
        }
      }
    });
  },

  renderWithdrawalSuccess(container, res) {
    container.innerHTML = `
      <div class="auth-screen-layout kyc-success-screen">
        <div class="kyc-success-emblem-box">
          <div class="success-icon-ring">
            <span style="font-size: 2.2rem; color: #10B981;">✓</span>
          </div>
        </div>

        <h2 class="auth-page-title" style="margin-top: 16px;">
          ${res.isHighValue ? 'Withdrawal Submitted' : 'Payout Dispatched!'}
        </h2>
        <p class="auth-page-sub">
          ${res.isHighValue
            ? `Your high-value withdrawal of ₹${res.net.toLocaleString('en-IN')} is queued for dual-admin compliance review.`
            : `₹${res.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been dispatched via IMPS to your HDFC Bank account.`}
        </p>

        <div class="kyc-summary-card" style="margin: 16px 0; text-align: left;">
          <div class="summary-row">
            <span>Withdrawal Ref</span>
            <strong>${res.txId}</strong>
          </div>
          <div class="summary-row">
            <span>Net Dispatched</span>
            <strong style="color: #10B981;">₹${res.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="summary-row">
            <span>Fee (1%)</span>
            <strong>₹${res.fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div class="summary-row">
            <span>Status</span>
            <strong style="color: ${res.isHighValue ? '#F59E0B' : '#10B981'};">
              ${res.isHighValue ? 'UNDER REVIEW' : 'COMPLETED ✓'}
            </strong>
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="Store.setMobileScreen('wallet')">
          <span>Back to Wallet</span> →
        </button>
      </div>
    `;
  }
};

window.MobileWallet = MobileWallet;
