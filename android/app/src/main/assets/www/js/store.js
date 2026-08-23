// ==========================================================================
// 2026 Fintech Mobile App - Global Reactive State Store & Ledger Connector
// ==========================================================================

const Store = {
  state: {
    // Current Active Mobile User (Alex Morgan by default)
    currentUser: {
      id: 5,
      full_name: 'Alex Morgan',
      email: 'alex.morgan@aurafin.com',
      phone: '+91 98111 22233',
      role: 'user',
      status: 'active',
      kyc_status: 'approved',
      is_2fa_enabled: 1,
      is_biometric_enabled: 1,
      transaction_pin_set: 1,
      referral_code: 'ALEX2026',
      total_referrals: 3,
      active_referrals: 2,
      referral_rewards: 1250.00,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },

    // Current Active Admin User
    currentAdmin: {
      id: 1,
      full_name: 'Vikramaditya Singhania',
      role: 'super_admin',
      role_title: 'Super Administrator'
    },

    // UI Configuration
    deviceType: 'iphone16', // 'iphone16', 'pixel9', 'full'
    theme: 'dark',
    currency: 'INR', // 'INR', 'USD', 'EUR'
    currencySymbol: '₹',
    currentMobileScreen: 'home',
    currentAdminTab: 'dashboard',

    // Cached Financial Data
    wallet: {
      total_portfolio: 25450.00,
      cash_balance: 5450.00,
      invested_balance: 20000.00,
      accrued_balance: 450.00,
      today_earnings: 45.00,
      total_earnings: 450.00,
      pending_balance: 0.00,
      fees_paid: 0.00,
      active_investments_count: 1
    },

    // Curated Investment Plans
    plans: [
      {
        id: 1,
        name: 'Starter Yield',
        slug: 'starter-yield',
        tagline: 'Liquid short-duration treasury & bond strategy',
        description: 'A conservative yield portfolio invested in high-grade liquid money market instruments with flexible daily liquidity.',
        min_amount: 1000,
        max_amount: 25000,
        duration_days: 30,
        daily_roi_pct: 0.041,
        indicative_apy: '15.0%',
        payout_frequency: 'Daily',
        risk_level: 'Low',
        features: ['Daily compounding accruals', 'Zero exit penalty', 'Automatic maturity rollover option', 'Sovereign bond backing']
      },
      {
        id: 2,
        name: 'Growth Plan',
        slug: 'growth-plan',
        tagline: 'Multi-asset quantitative growth & arbitrage',
        description: 'Our premier algorithmic growth portfolio delivering superior risk-adjusted alpha with weekly automated rebalancing.',
        min_amount: 5000,
        max_amount: 100000,
        duration_days: 90,
        daily_roi_pct: 0.055,
        indicative_apy: '20.0%',
        payout_frequency: 'Daily',
        risk_level: 'Moderate',
        features: ['Automated yield reinvestment', 'Dynamic volatility hedging', 'Real-time performance analytics', 'Priority liquidity queue']
      },
      {
        id: 3,
        name: 'Premium Institutional',
        slug: 'premium-institutional',
        tagline: 'Private credit & hedged institutional yield',
        description: 'Maximum compounding strategy for institutional and HNW investors deploying delta-neutral credit tranches.',
        min_amount: 25000,
        max_amount: 1000000,
        duration_days: 180,
        daily_roi_pct: 0.068,
        indicative_apy: '25.0%',
        payout_frequency: 'Daily',
        risk_level: 'Institutional',
        features: ['Dedicated portfolio manager', 'Tail-risk insurance cover', 'Tax-optimized distribution', 'Custom lockup tenures']
      },
      {
        id: 4,
        name: 'Green Infrastructure Bond',
        slug: 'green-infra-bond',
        tagline: 'Sovereign clean energy & solar expansion',
        description: 'Fixed-return infrastructure vehicle financing solar, wind, and smart battery storage grids across emerging markets.',
        min_amount: 10000,
        max_amount: 500000,
        duration_days: 365,
        daily_roi_pct: 0.050,
        indicative_apy: '18.25%',
        payout_frequency: 'Monthly',
        risk_level: 'Low',
        features: ['ESG Certified Green Asset', 'Predictable monthly cashflows', 'Government-backed tariff agreements', 'Carbon credit yield bonus']
      },
      {
        id: 5,
        name: 'Quantum Arbitrage Fund',
        slug: 'quantum-arbitrage',
        tagline: 'Cross-exchange algorithmic market neutral arbitrage',
        description: 'High-frequency delta-neutral arbitrage capturing micro price discrepancies across spot, futures, and decentralized order books.',
        min_amount: 50000,
        max_amount: 2500000,
        duration_days: 60,
        daily_roi_pct: 0.082,
        indicative_apy: '30.0%',
        payout_frequency: 'Daily',
        risk_level: 'High',
        features: ['Fully automated algorithmic bots', 'Sub-millisecond execution rails', 'Cold-storage liquidity pools', 'Bi-weekly performance audit']
      }
    ],

    // Active User Investments
    investments: [
      {
        id: 101,
        investment_code: 'INV-2026-101',
        plan_id: 2,
        plan_name: 'Growth Plan',
        principal_amount: 20000.00,
        current_value: 20450.00,
        total_accrued: 450.00,
        daily_roi_pct: 0.055,
        duration_days: 90,
        days_active: 45,
        days_remaining: 45,
        progress_pct: 50,
        start_date: '2026-07-08',
        maturity_date: '2026-10-06',
        status: 'active',
        risk_level: 'Moderate',
        payout_frequency: 'Daily'
      }
    ],

    // Digital Assets (Crypto / VDA)
    cryptoAssets: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price_inr: 5840250.00,
        change_24h: 3.42,
        holdings: 0.0450,
        value_inr: 262811.25,
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=035',
        network: 'Bitcoin Core',
        wallet_address: 'bc1q9v8k7y8x7d6f5e4w3z2a1s0p9o8i7u6y5t4r3e2w1q'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price_inr: 285400.00,
        change_24h: -1.15,
        holdings: 0.8500,
        value_inr: 242590.00,
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=035',
        network: 'ERC-20',
        wallet_address: '0x71C...B290'
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        price_inr: 88.50,
        change_24h: 0.05,
        holdings: 1500.00,
        value_inr: 132750.00,
        logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=035',
        network: 'TRC-20 / Polygon',
        wallet_address: 'TX9...K482'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price_inr: 14250.00,
        change_24h: 7.84,
        holdings: 12.00,
        value_inr: 171000.00,
        logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=035',
        network: 'Solana Mainnet',
        wallet_address: '7N3...F910'
      }
    ],

    // Transactions History
    transactions: [
      {
        id: 'TX-2026-904',
        type: 'ACCRUAL',
        title: 'Daily Accrual Payout',
        category: 'Earnings',
        amount: 45.00,
        is_positive: true,
        fee: 0.00,
        balance_before: 25405.00,
        balance_after: 25450.00,
        date: 'Today, 06:00 AM',
        status: 'Completed',
        reference: 'ACC/GROWTH/INV-101',
        description: 'Daily yield distribution for Growth Plan #INV-2026-101'
      },
      {
        id: 'TX-2026-892',
        type: 'INVESTMENT',
        title: 'Growth Plan Subscription',
        category: 'Investments',
        amount: 20000.00,
        is_positive: false,
        fee: 0.00,
        balance_before: 25450.00,
        balance_after: 5450.00,
        date: '45 days ago',
        status: 'Completed',
        reference: 'INV-2026-101',
        description: 'Subscribed to Growth Plan 90-day lockup'
      },
      {
        id: 'TX-2026-781',
        type: 'DEPOSIT',
        title: 'Instant UPI Deposit',
        category: 'Deposits',
        amount: 25450.00,
        is_positive: true,
        fee: 0.00,
        balance_before: 0.00,
        balance_after: 25450.00,
        date: '46 days ago',
        status: 'Completed',
        reference: 'UPI/20260810/987654321',
        description: 'Funds received via Unified Payments Interface'
      },
      {
        id: 'TX-2026-650',
        type: 'REFERRAL',
        title: 'Referral Bonus Payout',
        category: 'Earnings',
        amount: 1250.00,
        is_positive: true,
        fee: 0.00,
        balance_before: 24200.00,
        balance_after: 25450.00,
        date: '10 days ago',
        status: 'Completed',
        reference: 'REF-COMM-001',
        description: '5% referral commission credited from referee Priya Patel'
      }
    ],

    // Notifications Center
    notifications: [
      {
        id: 1,
        category: 'Investments',
        title: 'Daily Yield Credited',
        body: '₹45.00 has been credited to your accrued earnings from Growth Plan.',
        time: '10 mins ago',
        is_read: false,
        icon: '📈'
      },
      {
        id: 2,
        category: 'KYC',
        title: 'KYC Verification Approved',
        body: 'Your identity and address documents have been verified by compliance.',
        time: '2 hours ago',
        is_read: false,
        icon: '🪪'
      },
      {
        id: 3,
        category: 'Security',
        title: 'New Device Login',
        body: 'Successful login from iPhone 16 Pro (IP: 103.21.14.82).',
        time: 'Yesterday',
        is_read: true,
        icon: '🛡️'
      },
      {
        id: 4,
        category: 'Transactions',
        title: 'Deposit Settled',
        body: 'Your deposit of ₹25,450.00 has been confirmed on the ledger.',
        time: '3 days ago',
        is_read: true,
        icon: '💰'
      }
    ],

    // Support Tickets
    tickets: [
      {
        id: 'TICK-8842',
        subject: 'Tax TDS statement download query',
        category: 'Billing & Statements',
        status: 'Resolved',
        created_at: '2026-08-15',
        last_updated: '2026-08-16',
        messages: [
          { sender: 'Alex Morgan', text: 'Where can I download the annual TDS deduction statement?', time: 'Aug 15, 10:30 AM' },
          { sender: 'Support Desk (Meera)', text: 'Hello Alex! You can download your Form 16A TDS certificate directly under Profile > Documents > Tax Statements.', time: 'Aug 16, 09:15 AM' }
        ]
      }
    ]
  },

  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  },

  setDeviceType(type) {
    this.state.deviceType = type;
    this.emit('deviceTypeChanged', type);
  },

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.emit('themeChanged', theme);
  },

  setCurrency(curr) {
    const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€' };
    this.state.currency = curr;
    this.state.currencySymbol = symbols[curr] || '₹';
    this.emit('currencyChanged', { currency: curr, symbol: this.state.currencySymbol });
  },

  setMobileScreen(screen, params = null) {
    Haptics.tap();
    this.state.currentMobileScreen = screen;
    this.emit('mobileScreenChanged', { screen, params });
  },

  // Switch demo user identity
  switchDemoUser(userId) {
    const users = {
      5: {
        id: 5,
        full_name: 'Alex Morgan',
        email: 'alex.morgan@aurafin.com',
        phone: '+91 98111 22233',
        role: 'user',
        status: 'active',
        kyc_status: 'approved',
        is_2fa_enabled: 1,
        is_biometric_enabled: 1,
        transaction_pin_set: 1,
        referral_code: 'ALEX2026',
        total_referrals: 3,
        active_referrals: 2,
        referral_rewards: 1250.00
      },
      6: {
        id: 6,
        full_name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        phone: '+91 98222 33344',
        role: 'user',
        status: 'active',
        kyc_status: 'pending',
        is_2fa_enabled: 0,
        is_biometric_enabled: 0,
        transaction_pin_set: 0,
        referral_code: 'PRIYA88',
        total_referrals: 0,
        active_referrals: 0,
        referral_rewards: 0.00
      },
      7: {
        id: 7,
        full_name: 'Amit Verma',
        email: 'amit.verma@investor.com',
        phone: '+91 98333 44455',
        role: 'user',
        status: 'active',
        kyc_status: 'approved',
        is_2fa_enabled: 1,
        is_biometric_enabled: 1,
        transaction_pin_set: 1,
        referral_code: 'AMIT99',
        total_referrals: 5,
        active_referrals: 4,
        referral_rewards: 8500.00
      },
      8: {
        id: 8,
        full_name: 'Kavita Reddy',
        email: 'kavita.reddy@techcorp.in',
        phone: '+91 98444 55566',
        role: 'user',
        status: 'active',
        kyc_status: 'not_started',
        is_2fa_enabled: 0,
        is_biometric_enabled: 0,
        transaction_pin_set: 0,
        referral_code: 'KAVITA55',
        total_referrals: 0,
        active_referrals: 0,
        referral_rewards: 0.00
      }
    };

    const targetUser = users[userId] || users[5];
    this.state.currentUser = targetUser;

    if (userId == 6) {
      this.state.wallet = { total_portfolio: 25000, cash_balance: 25000, invested_balance: 0, accrued_balance: 0, today_earnings: 0, total_earnings: 0, pending_balance: 25000, fees_paid: 0, active_investments_count: 0 };
      this.state.investments = [];
    } else if (userId == 7) {
      this.state.wallet = { total_portfolio: 325000, cash_balance: 175000, invested_balance: 150000, accrued_balance: 2550, today_earnings: 102, total_earnings: 2550, pending_balance: 80000, fees_paid: 0, active_investments_count: 1 };
    } else if (userId == 8) {
      this.state.wallet = { total_portfolio: 0, cash_balance: 0, invested_balance: 0, accrued_balance: 0, today_earnings: 0, total_earnings: 0, pending_balance: 0, fees_paid: 0, active_investments_count: 0 };
      this.state.investments = [];
    } else {
      this.state.wallet = { total_portfolio: 25450, cash_balance: 5450, invested_balance: 20000, accrued_balance: 450, today_earnings: 45, total_earnings: 450, pending_balance: 0, fees_paid: 0, active_investments_count: 1 };
    }

    this.emit('userChanged', targetUser);
    this.emit('walletUpdated', this.state.wallet);
    this.refreshAllData();
  },

  // Synchronize state with backend API
  async refreshAllData() {
    try {
      if (this.state.currentUser) {
        const uid = this.state.currentUser.id;
        const [wRes, pRes, iRes, nRes] = await Promise.all([
          API.get(`/api/wallet/summary/${uid}`).catch(() => null),
          API.get(`/api/invest/plans`).catch(() => null),
          API.get(`/api/invest/my-investments/${uid}`).catch(() => null),
          API.get(`/api/user/notifications/${uid}`).catch(() => null)
        ]);

        if (wRes && wRes.success) {
          this.state.wallet = {
            total_portfolio: wRes.wallet.total_portfolio || 25450,
            cash_balance: wRes.wallet.cash_balance || 5450,
            invested_balance: wRes.wallet.invested_balance || 20000,
            accrued_balance: wRes.wallet.accrued_balance || 450,
            today_earnings: wRes.wallet.today_earnings || 45,
            total_earnings: wRes.wallet.total_earnings || 450,
            pending_balance: wRes.wallet.pending_withdrawals_amount || 0,
            fees_paid: wRes.wallet.fees_paid || 0,
            active_investments_count: wRes.wallet.active_investments_count || 1
          };
          this.emit('walletUpdated', this.state.wallet);
        }

        if (pRes && pRes.success && pRes.plans.length > 0) {
          this.state.plans = pRes.plans;
        }

        if (iRes && iRes.success && iRes.investments.length > 0) {
          this.state.investments = iRes.investments;
          this.emit('investmentsUpdated', this.state.investments);
        }
      }
    } catch (e) {
      console.warn('API sync fallback to mock store:', e);
    }
  },

  // Perform mock / real deposit
  async processDeposit(amount, method, utr = null) {
    const amt = parseFloat(amount);
    const txId = `DEP-${Date.now().toString().slice(-6)}`;
    
    try {
      if (typeof API !== 'undefined') {
        await API.post('/api/wallet/deposit', {
          user_id: this.state.currentUser.id,
          amount: amt,
          payment_method: method,
          utr_ref: utr || `MOCK/${Date.now()}`
        }).catch(() => null);
      }
    } catch (e) {}

    // Update local ledger state
    this.state.wallet.cash_balance += amt;
    this.state.wallet.total_portfolio += amt;

    const newTx = {
      id: txId,
      type: 'DEPOSIT',
      title: `${method} Deposit`,
      category: 'Deposits',
      amount: amt,
      is_positive: true,
      fee: 0.00,
      balance_before: this.state.wallet.total_portfolio - amt,
      balance_after: this.state.wallet.total_portfolio,
      date: 'Just now',
      status: 'Completed',
      reference: utr || `DEP/REF/${Date.now().toString().slice(-8)}`,
      description: `Approved ${method} deposit of ₹${amt.toLocaleString('en-IN')}`
    };

    this.state.transactions.unshift(newTx);
    this.emit('walletUpdated', this.state.wallet);
    this.emit('transactionAdded', newTx);
    Haptics.success();
    return { success: true, txId, amount: amt };
  },

  // Perform mock / real withdrawal
  async processWithdrawal(amount, method, pin) {
    const amt = parseFloat(amount);
    const fee = Math.round(amt * 0.01);
    const net = amt - fee;
    const txId = `WDL-${Date.now().toString().slice(-6)}`;
    const isHighValue = amt >= 50000;

    if (amt > this.state.wallet.cash_balance) {
      Haptics.error();
      throw new Error('Insufficient available cash balance');
    }

    try {
      if (typeof API !== 'undefined') {
        await API.post('/api/wallet/withdraw', {
          user_id: this.state.currentUser.id,
          amount: amt,
          payout_method: method,
          pin: pin
        }).catch(() => null);
      }
    } catch (e) {}

    this.state.wallet.cash_balance -= amt;
    this.state.wallet.total_portfolio -= amt;
    this.state.wallet.fees_paid += fee;

    const newTx = {
      id: txId,
      type: 'WITHDRAWAL',
      title: `Bank Withdrawal (${method})`,
      category: 'Withdrawals',
      amount: amt,
      is_positive: false,
      fee: fee,
      balance_before: this.state.wallet.total_portfolio + amt,
      balance_after: this.state.wallet.total_portfolio,
      date: 'Just now',
      status: isHighValue ? 'Processing' : 'Completed',
      reference: `WDL/REF/${Date.now().toString().slice(-8)}`,
      description: isHighValue ? 'Dual-approval required for high-value payout' : `Processed bank payout of ₹${net.toLocaleString('en-IN')}`
    };

    this.state.transactions.unshift(newTx);
    this.emit('walletUpdated', this.state.wallet);
    this.emit('transactionAdded', newTx);
    Haptics.success();
    return { success: true, txId, amount: amt, fee, net, isHighValue };
  },

  // Subscribe to investment plan
  async subscribeInvestment(planId, amount, pin) {
    const amt = parseFloat(amount);
    const plan = this.state.plans.find(p => p.id === planId) || this.state.plans[1];

    if (amt > this.state.wallet.cash_balance) {
      Haptics.error();
      throw new Error('Insufficient cash balance. Please deposit funds first.');
    }

    try {
      if (typeof API !== 'undefined') {
        await API.post('/api/invest/subscribe', {
          user_id: this.state.currentUser.id,
          plan_id: planId,
          amount: amt,
          pin: pin
        }).catch(() => null);
      }
    } catch (e) {}

    this.state.wallet.cash_balance -= amt;
    this.state.wallet.invested_balance += amt;
    this.state.wallet.active_investments_count += 1;

    const newInv = {
      id: 100 + this.state.investments.length + 1,
      investment_code: `INV-${Date.now().toString().slice(-6)}`,
      plan_id: plan.id,
      plan_name: plan.name,
      principal_amount: amt,
      current_value: amt,
      total_accrued: 0.00,
      daily_roi_pct: plan.daily_roi_pct,
      duration_days: plan.duration_days,
      days_active: 0,
      days_remaining: plan.duration_days,
      progress_pct: 0,
      start_date: new Date().toISOString().split('T')[0],
      maturity_date: new Date(Date.now() + plan.duration_days * 86400000).toISOString().split('T')[0],
      status: 'active',
      risk_level: plan.risk_level,
      payout_frequency: plan.payout_frequency
    };

    this.state.investments.unshift(newInv);

    const newTx = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      type: 'INVESTMENT',
      title: `${plan.name} Subscription`,
      category: 'Investments',
      amount: amt,
      is_positive: false,
      fee: 0.00,
      balance_before: this.state.wallet.cash_balance + amt,
      balance_after: this.state.wallet.cash_balance,
      date: 'Just now',
      status: 'Completed',
      reference: newInv.investment_code,
      description: `Invested ₹${amt.toLocaleString('en-IN')} in ${plan.name} (${plan.duration_days} Days)`
    };

    this.state.transactions.unshift(newTx);
    this.emit('walletUpdated', this.state.wallet);
    this.emit('investmentsUpdated', this.state.investments);
    this.emit('transactionAdded', newTx);
    Haptics.success();
    return { success: true, investment: newInv };
  }
};

window.Store = Store;
