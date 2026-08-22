// ==========================================================================
// Firebase Service — Complete Auth, Firestore Ledger, Investments & Accruals
// ==========================================================================

const FirebaseService = {
  auth: null,
  db: null,
  currentUser: null,
  isInitialized: false,

  async init(config = window.FIREBASE_CONFIG) {
    try {
      if (!window.firebase) {
        console.warn("Firebase SDK script loading...");
        return;
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.isInitialized = true;
      console.log("🔥 Firebase initialized successfully!");

      // Set up auth state listener
      this.auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.currentUser = user;
          const profile = await this.getUserProfile(user.uid);
          console.log("Firebase Auth User active:", profile ? profile.full_name : user.email);
        } else {
          this.currentUser = null;
        }
      });
    } catch (err) {
      console.log("Firebase initialization note (using offline demo fallback if not configured):", err);
    }
  },

  // --------------------------------------------------------------------------
  // 1. Authentication Methods
  // --------------------------------------------------------------------------

  // Sign up with Email & Password + Initialize Wallet in Firestore
  async signUp(email, password, fullName, phone, referralCode = '') {
    email = email.trim().toLowerCase();
    try {
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      // Update Firebase display name
      await user.updateProfile({ displayName: fullName });

      const newRefCode = (fullName.slice(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase();

      // Create User Profile in Firestore
      await this.db.collection('users').doc(user.uid).set({
        uid: user.uid,
        full_name: fullName,
        email: email,
        phone: phone,
        role: 'user',
        status: 'active',
        kyc_status: 'not_submitted',
        referral_code: newRefCode,
        referred_by: referralCode || null,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Create Initial Wallet in Firestore
      await this.db.collection('wallets').doc(user.uid).set({
        user_id: user.uid,
        cash_balance: 0.0,
        invested_balance: 0.0,
        accrued_balance: 0.0,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, user };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Sign In with Email & Password
  async signIn(email, password) {
    email = email.trim().toLowerCase();
    try {
      const cred = await this.auth.signInWithEmailAndPassword(email, password);
      const profile = await this.getUserProfile(cred.user.uid);
      return { success: true, user: cred.user, profile };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Sign In with Google
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const cred = await this.auth.signInWithPopup(provider);
      const user = cred.user;

      // Check if user document exists, if not create one
      const doc = await this.db.collection('users').doc(user.uid).get();
      if (!doc.exists) {
        const fullName = user.displayName || user.email.split('@')[0];
        const newRefCode = (fullName.slice(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase();

        await this.db.collection('users').doc(user.uid).set({
          uid: user.uid,
          full_name: fullName,
          email: user.email,
          phone: user.phoneNumber || '',
          role: 'user',
          status: 'active',
          kyc_status: 'not_submitted',
          referral_code: newRefCode,
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        await this.db.collection('wallets').doc(user.uid).set({
          user_id: user.uid,
          cash_balance: 0.0,
          invested_balance: 0.0,
          accrued_balance: 0.0,
          updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      return { success: true, user };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Password Recovery Email
  async sendPasswordReset(email) {
    try {
      await this.auth.sendPasswordResetEmail(email.trim());
      return { success: true, message: 'Password recovery email dispatched by Firebase.' };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Sign Out
  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // --------------------------------------------------------------------------
  // 2. User Profile & Wallet Realtime Queries
  // --------------------------------------------------------------------------

  async getUserProfile(uid) {
    const doc = await this.db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  },

  // Real-time Wallet Listener (Automatically updates UI when balance changes!)
  subscribeToWallet(uid, callback) {
    return this.db.collection('wallets').doc(uid).onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data());
      }
    });
  },

  // --------------------------------------------------------------------------
  // 3. Investment Strategy Execution
  // --------------------------------------------------------------------------

  async subscribeToPlan(uid, plan, amount) {
    amount = parseFloat(amount);
    const walletRef = this.db.collection('wallets').doc(uid);

    return this.db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) throw new Error("Wallet not found");

      const wallet = walletDoc.data();
      if (wallet.cash_balance < amount) {
        throw new Error(`Insufficient cash balance (Available: ₹${wallet.cash_balance.toLocaleString('en-IN')})`);
      }

      const invCode = 'INV-' + Date.now().toString().slice(-6);
      const newCash = wallet.cash_balance - amount;
      const newInvested = wallet.invested_balance + amount;

      // 1. Update Wallet
      transaction.update(walletRef, {
        cash_balance: newCash,
        invested_balance: newInvested,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 2. Create Active Investment Record
      const invRef = this.db.collection('user_investments').doc();
      transaction.set(invRef, {
        id: invRef.id,
        investment_code: invCode,
        user_id: uid,
        plan_id: plan.id,
        plan_name: plan.name,
        principal_amount: amount,
        daily_roi_pct: plan.daily_roi_pct,
        duration_days: plan.duration_days,
        days_completed: 0,
        total_accrued: 0.0,
        status: 'active',
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 3. Create Immutable Double-Entry Ledger Entry
      const txRef = this.db.collection('ledger_transactions').doc();
      transaction.set(txRef, {
        transaction_id: 'TX-' + invCode,
        user_id: uid,
        ledger_account_code: 'INVESTMENT_PRINCIPAL',
        debit_amount: 0,
        credit_amount: amount,
        balance_after: newInvested,
        transaction_type: 'INVESTMENT_LOCK',
        description: `Subscribed to ${plan.name}`,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, investment_code: invCode };
    });
  },

  // --------------------------------------------------------------------------
  // 4. Deposits & Withdrawals
  // --------------------------------------------------------------------------

  async submitDeposit(uid, amount, paymentMethod, utrRef) {
    amount = parseFloat(amount);
    const depCode = 'DEP-' + Date.now().toString().slice(-6);

    // Save Deposit Request in Firestore
    await this.db.collection('deposits').add({
      deposit_code: depCode,
      user_id: uid,
      amount: amount,
      payment_method: paymentMethod,
      utr_ref: utrRef,
      status: 'approved', // Auto-approved for instant prototype demo
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Credit Cash Balance
    const walletRef = this.db.collection('wallets').doc(uid);
    const doc = await walletRef.get();
    const currentCash = doc.exists ? (doc.data().cash_balance || 0) : 0;
    const newCash = currentCash + amount;

    await walletRef.update({
      cash_balance: newCash,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Add Ledger Entry
    await this.db.collection('ledger_transactions').add({
      transaction_id: 'TX-' + depCode,
      user_id: uid,
      ledger_account_code: 'CASH_INR',
      debit_amount: 0,
      credit_amount: amount,
      balance_after: newCash,
      transaction_type: 'DEPOSIT',
      description: `Reconciled ${paymentMethod} Deposit (${utrRef})`,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, deposit_code: depCode };
  },

  async submitWithdrawal(uid, amount, bankDetails) {
    amount = parseFloat(amount);
    const fee = parseFloat((amount * 0.01).toFixed(2));
    const netAmount = amount - fee;
    const requiresDual = (amount >= 50000);
    const wdlCode = 'WDL-' + Date.now().toString().slice(-6);

    const walletRef = this.db.collection('wallets').doc(uid);
    const doc = await walletRef.get();
    const currentCash = doc.exists ? (doc.data().cash_balance || 0) : 0;

    if (currentCash < amount) {
      throw new Error(`Insufficient cash balance (Available: ₹${currentCash.toLocaleString('en-IN')})`);
    }

    const newCash = currentCash - amount;
    await walletRef.update({
      cash_balance: newCash,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    await this.db.collection('withdrawals').add({
      withdrawal_code: wdlCode,
      user_id: uid,
      amount: amount,
      fee: fee,
      net_amount: netAmount,
      status: requiresDual ? 'pending_second_approval' : 'completed',
      requires_dual_approval: requiresDual,
      bank_details: bankDetails,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    await this.db.collection('ledger_transactions').add({
      transaction_id: 'TX-' + wdlCode,
      user_id: uid,
      ledger_account_code: 'CASH_INR',
      debit_amount: amount,
      credit_amount: 0,
      balance_after: newCash,
      transaction_type: 'WITHDRAWAL',
      description: `Bank Withdrawal Payout (Net: ₹${netAmount.toLocaleString('en-IN')})`,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, withdrawal_code: wdlCode, requires_dual_approval: requiresDual };
  },

  // --------------------------------------------------------------------------
  // 5. Automated Daily Accruals Engine (Runs in Firestore)
  // --------------------------------------------------------------------------

  async runDailyAccruals() {
    const snapshot = await this.db.collection('user_investments').where('status', '==', 'active').get();
    let totalPayout = 0;

    for (const doc of snapshot.docs) {
      const inv = doc.data();
      const dailyYield = parseFloat((inv.principal_amount * (inv.daily_roi_pct / 100)).toFixed(2));
      const newAccrued = (inv.total_accrued || 0) + dailyYield;
      const newDays = (inv.days_completed || 0) + 1;
      const isMatured = newDays >= inv.duration_days;

      await doc.ref.update({
        total_accrued: newAccrued,
        days_completed: newDays,
        status: isMatured ? 'matured' : 'active'
      });

      // Update User Wallet Accruals
      const walletRef = this.db.collection('wallets').doc(inv.user_id);
      const wDoc = await walletRef.get();
      if (wDoc.exists) {
        const curAccrued = wDoc.data().accrued_balance || 0;
        await walletRef.update({
          accrued_balance: curAccrued + dailyYield
        });
      }

      totalPayout += dailyYield;
    }

    return { success: true, count: snapshot.size, total_payout: totalPayout };
  }
};
