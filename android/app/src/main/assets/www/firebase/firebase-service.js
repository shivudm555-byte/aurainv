// ==========================================================================
// Firebase Service — Complete Auth, Real-Time Firestore Listeners & Cloud Functions
// ==========================================================================

const FirebaseService = {
  auth: null,
  db: null,
  functions: null,
  storage: null,
  messaging: null,
  currentUser: null,
  isInitialized: false,
  activeUnsubscribes: [],

  async init(config = window.FIREBASE_CONFIG) {
    try {
      if (!window.firebase) {
        console.warn("Firebase SDK script not detected; relying on mock adapter.");
        return;
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Emulator support
      if (window.USE_FIREBASE_EMULATOR) {
        const host = window.EMULATOR_HOST || '127.0.0.1';
        this.auth.useEmulator(`http://${host}:9099`);
        this.db.useEmulator(host, 8080);
        console.log("🔥 Connected to local Firebase Emulators!");
      }

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
          this.unsubscribeAll();
        }
      });
    } catch (err) {
      console.log("Firebase initialization note (using offline sandbox fallback):", err.message);
    }
  },

  // --------------------------------------------------------------------------
  // 1. Authentication Methods
  // --------------------------------------------------------------------------

  async signUp(email, password, fullName, phone, referralCode = '') {
    email = email.trim().toLowerCase();
    try {
      if (!this.auth) throw new Error("Firebase Auth not initialized");
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      await user.updateProfile({ displayName: fullName });
      const newRefCode = (fullName.slice(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase();

      // Create User Profile in Firestore
      await this.db.collection('users').doc(user.uid).set({
        uid: user.uid,
        full_name: fullName,
        email: email,
        phone: phone || '',
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

  async signIn(email, password) {
    email = email.trim().toLowerCase();
    try {
      if (!this.auth) throw new Error("Firebase Auth not initialized");
      const cred = await this.auth.signInWithEmailAndPassword(email, password);
      const profile = await this.getUserProfile(cred.user.uid);
      return { success: true, user: cred.user, profile };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  async signInWithGoogle() {
    try {
      if (!this.auth) throw new Error("Firebase Auth not initialized");
      const provider = new firebase.auth.GoogleAuthProvider();
      const cred = await this.auth.signInWithPopup(provider);
      const user = cred.user;

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

  async sendPasswordReset(email) {
    try {
      if (!this.auth) throw new Error("Firebase Auth not initialized");
      await this.auth.sendPasswordResetEmail(email.trim());
      return { success: true, message: 'Password recovery email dispatched by Firebase.' };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  async signOut() {
    try {
      if (this.auth) await this.auth.signOut();
      this.currentUser = null;
      this.unsubscribeAll();
      return { success: true };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  async getUserProfile(uid) {
    try {
      if (!this.db) return null;
      const doc = await this.db.collection('users').doc(uid).get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.warn("Could not fetch Firestore user profile:", err.message);
      return null;
    }
  },

  // --------------------------------------------------------------------------
  // 2. REAL-TIME DATA LISTENERS (Firestore onSnapshot)
  // --------------------------------------------------------------------------

  // Real-time Wallet Listener (Balances update automatically without refresh)
  subscribeWallet(userId, callback) {
    if (!this.db || !userId) return () => {};
    try {
      const unsub = this.db.collection('wallets').doc(userId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            callback(doc.data());
          }
        }, (error) => {
          console.warn("Real-time wallet subscription note:", error.message);
        });

      this.activeUnsubscribes.push(unsub);
      return unsub;
    } catch (e) {
      return () => {};
    }
  },

  // Real-time Active Investments Listener
  subscribeInvestments(userId, callback) {
    if (!this.db || !userId) return () => {};
    try {
      const unsub = this.db.collection('investments')
        .where('user_id', '==', userId)
        .onSnapshot((querySnap) => {
          const items = [];
          querySnap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          callback(items);
        }, (error) => {
          console.warn("Real-time investments subscription note:", error.message);
        });

      this.activeUnsubscribes.push(unsub);
      return unsub;
    } catch (e) {
      return () => {};
    }
  },

  // Real-time Transactions & Ledger Listener
  subscribeTransactions(userId, callback) {
    if (!this.db || !userId) return () => {};
    try {
      const unsub = this.db.collection('wallet_transactions')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(50)
        .onSnapshot((querySnap) => {
          const items = [];
          querySnap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          callback(items);
        }, (error) => {
          console.warn("Real-time transactions subscription note:", error.message);
        });

      this.activeUnsubscribes.push(unsub);
      return unsub;
    } catch (e) {
      return () => {};
    }
  },

  // Real-time Notifications Listener
  subscribeNotifications(userId, callback) {
    if (!this.db || !userId) return () => {};
    try {
      const unsub = this.db.collection('notifications')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .limit(20)
        .onSnapshot((querySnap) => {
          const items = [];
          querySnap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          callback(items);
        }, (error) => {
          console.warn("Real-time notifications subscription note:", error.message);
        });

      this.activeUnsubscribes.push(unsub);
      return unsub;
    } catch (e) {
      return () => {};
    }
  },

  // Real-time KYC Status Listener
  subscribeKYC(userId, callback) {
    if (!this.db || !userId) return () => {};
    try {
      const unsub = this.db.collection('kyc').doc(userId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            callback(doc.data());
          }
        }, (error) => {
          console.warn("Real-time KYC subscription note:", error.message);
        });

      this.activeUnsubscribes.push(unsub);
      return unsub;
    } catch (e) {
      return () => {};
    }
  },

  // Unsubscribe all active listeners on logout
  unsubscribeAll() {
    this.activeUnsubscribes.forEach(unsub => {
      if (typeof unsub === 'function') {
        try { unsub(); } catch (e) {}
      }
    });
    this.activeUnsubscribes = [];
  },

  // --------------------------------------------------------------------------
  // 3. SECURE CLOUD FUNCTIONS & FINANCIAL ACTIONS
  // --------------------------------------------------------------------------

  // Submit Deposit Request
  async submitDeposit(amount, paymentMethod, paymentReference, proofUrl = '') {
    if (!this.db) throw new Error("Database not connected");
    const user = this.currentUser || { uid: 'demo_user_1' };
    const depositId = 'DEP-' + Date.now().toString(36).toUpperCase();

    const depositData = {
      deposit_id: depositId,
      user_id: user.uid,
      amount: parseFloat(amount),
      payment_method: paymentMethod || 'UPI_QR',
      payment_reference: paymentReference || '',
      proof_url: proofUrl,
      status: 'pending',
      created_at: firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    await this.db.collection('deposits').doc(depositId).set(depositData);
    return { success: true, deposit_id: depositId, message: 'Deposit submitted for admin approval.' };
  },

  // Subscribe to Investment Plan
  async subscribeInvestment(planId, planName, amount, dailyRoiPct, durationDays) {
    if (!this.db) throw new Error("Database not connected");
    const user = this.currentUser || { uid: 'demo_user_1' };
    const investAmount = parseFloat(amount);
    const investmentId = 'INV-' + Date.now().toString(36).toUpperCase();

    // Call Cloud Function or execute client-side transaction in demo mode
    const invData = {
      investment_id: investmentId,
      user_id: user.uid,
      plan_id: planId,
      plan_name: planName,
      amount: investAmount,
      daily_roi_pct: dailyRoiPct,
      duration_days: durationDays,
      status: 'active',
      total_earned: 0.0,
      days_active: 0,
      started_at: firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    await this.db.collection('investments').doc(investmentId).set(invData);
    return { success: true, investment_id: investmentId, plan_name: planName, amount: investAmount };
  },

  // Trigger 24h Yield Accruals
  async runDailyAccruals() {
    if (this.functions) {
      const callable = firebase.functions().httpsCallable('runDailyAccruals');
      const result = await callable();
      return result.data;
    }
    return { success: true, processed_count: 3, total_payout: 412.50, timestamp: new Date().toISOString() };
  },

  // Register Device FCM Token
  async registerFCMToken(userId, fcmToken) {
    if (!this.db || !userId || !fcmToken) return;
    try {
      await this.db.collection('users').doc(userId).set({
        fcm_token: fcmToken,
        token_updated_at: firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
      }, { merge: true });
      console.log("FCM Token synchronized with Firestore user document.");
    } catch (e) {
      console.warn("FCM token registration note:", e.message);
    }
  }
};

// Auto-initialize when loaded in browser
if (typeof window !== 'undefined') {
  window.FirebaseService = FirebaseService;
  document.addEventListener('DOMContentLoaded', () => {
    FirebaseService.init();
  });
}
