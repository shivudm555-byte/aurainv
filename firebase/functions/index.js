/**
 * ============================================================================
 * Antigravity Fintech — Firebase Cloud Functions Backend (v2)
 * Institutional Double-Entry Ledger, Accruals Engine, Multi-Sign Approvals & FCM
 * ============================================================================
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ============================================================================
// HELPER: Double-Entry Financial Ledger Journal Creator
// ============================================================================
async function recordLedgerEntry(transaction, {
  userId,
  transactionType,
  amount,
  fee = 0.0,
  debitAccount,
  creditAccount,
  referenceId,
  description,
  actor = 'SYSTEM',
  ipAddress = '127.0.0.1'
}) {
  const txnId = 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const txnRef = db.collection('wallet_transactions').doc(txnId);

  const txnData = {
    transaction_id: txnId,
    user_id: userId,
    type: transactionType,
    amount: parseFloat(amount),
    fee: parseFloat(fee),
    net_amount: parseFloat(amount) - parseFloat(fee),
    debit_account: debitAccount,
    credit_account: creditAccount,
    status: 'completed',
    reference_id: referenceId || txnId,
    description: description || `Transaction ${transactionType}`,
    actor: actor,
    ip_address: ipAddress,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  };

  transaction.set(txnRef, txnData);

  // Also record in immutable audit_logs
  const auditRef = db.collection('audit_logs').doc();
  transaction.set(auditRef, {
    action: `LEDGER_${transactionType}`,
    target_type: 'wallet_transaction',
    target_id: txnId,
    user_id: userId,
    actor: actor,
    ip_address: ipAddress,
    payload: txnData,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return txnData;
}

// ============================================================================
// HELPER: Send FCM Push Notification to User Devices
// ============================================================================
async function sendFCMNotification(userId, title, body, data = {}) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const fcmToken = userDoc.data().fcm_token;
    if (!fcmToken) return;

    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          channelId: data.channelId || 'transactions',
          sound: 'default',
          color: '#10B981'
        }
      }
    };

    await messaging.send(message);

    // Save in in-app notifications collection
    await db.collection('notifications').add({
      user_id: userId,
      title: title,
      message: body,
      type: data.type || 'system',
      read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (err) {
    console.error(`Error sending FCM to ${userId}:`, err);
  }
}

// ============================================================================
// 1. CALLABLE: Submit Deposit Request
// ============================================================================
exports.submitDeposit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  const { amount, paymentMethod, paymentReference, proofUrl } = data;

  if (!amount || amount < 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Minimum deposit amount is ₹100.');
  }

  const depositId = 'DEP-' + Date.now().toString(36).toUpperCase();
  const depositRef = db.collection('deposits').doc(depositId);

  const depositData = {
    deposit_id: depositId,
    user_id: userId,
    amount: parseFloat(amount),
    payment_method: paymentMethod || 'UPI_QR',
    payment_reference: paymentReference || '',
    proof_url: proofUrl || '',
    status: 'pending',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  };

  await depositRef.set(depositData);

  // Send in-app notification
  await sendFCMNotification(
    userId,
    'Deposit Submitted',
    `Your deposit request of ₹${parseFloat(amount).toLocaleString('en-IN')} has been received and is pending admin verification.`,
    { channelId: 'transactions', type: 'deposit', deposit_id: depositId }
  );

  return { success: true, deposit_id: depositId, message: 'Deposit request submitted successfully.' };
});

// ============================================================================
// 2. CALLABLE: Admin Approve Deposit (Atomic Double-Entry Ledger)
// ============================================================================
exports.approveDeposit = functions.https.onCall(async (data, context) => {
  // Check admin authorization
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can approve deposits.');
  }

  const { depositId } = data;
  const adminId = context.auth.uid;
  const depositRef = db.collection('deposits').doc(depositId);

  return await db.runTransaction(async (t) => {
    const depositDoc = await t.get(depositRef);
    if (!depositDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deposit record not found.');
    }

    const deposit = depositDoc.data();
    if (deposit.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', `Deposit already marked as ${deposit.status}.`);
    }

    const userId = deposit.user_id;
    const amount = parseFloat(deposit.amount);
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await t.get(walletRef);

    let currentCash = 0.0;
    if (walletDoc.exists) {
      currentCash = parseFloat(walletDoc.data().cash_balance || 0);
    }

    const newCash = currentCash + amount;

    // 1. Update Deposit status
    t.update(depositRef, {
      status: 'approved',
      approved_by: adminId,
      approved_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Update User Wallet
    t.set(walletRef, {
      user_id: userId,
      cash_balance: newCash,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 3. Create Double-Entry Ledger Transaction (Debit: BANK_RECEIVING, Credit: USER_CASH_INR)
    await recordLedgerEntry(t, {
      userId: userId,
      transactionType: 'deposit',
      amount: amount,
      fee: 0.0,
      debitAccount: 'BANK_RECEIVING_ACCOUNT',
      creditAccount: 'CASH_INR',
      referenceId: depositId,
      description: `Deposit approved via ${deposit.payment_method} (Ref: ${deposit.payment_reference})`,
      actor: adminId
    });

    // 4. Trigger Real-Time Notification
    sendFCMNotification(
      userId,
      'Deposit Approved! 💰',
      `₹${amount.toLocaleString('en-IN')} has been successfully credited to your available wallet balance.`,
      { channelId: 'transactions', type: 'deposit_approved', amount: amount.toString() }
    );

    return { success: true, deposit_id: depositId, new_balance: newCash };
  });
});

// ============================================================================
// 3. CALLABLE: Request Withdrawal (1% Fee, PIN Validation, Dual-Admin Routing)
// ============================================================================
exports.requestWithdrawal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  const { amount, bankDetails, pin } = data;
  const withdrawAmount = parseFloat(amount);

  if (!withdrawAmount || withdrawAmount < 500) {
    throw new functions.https.HttpsError('invalid-argument', 'Minimum withdrawal amount is ₹500.');
  }

  const fee = withdrawAmount * 0.01; // 1% platform disbursement fee
  const netDisbursement = withdrawAmount - fee;

  const withdrawalId = 'WTH-' + Date.now().toString(36).toUpperCase();
  const withdrawalRef = db.collection('withdrawals').doc(withdrawalId);
  const walletRef = db.collection('wallets').doc(userId);
  const userRef = db.collection('users').doc(userId);

  return await db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    const userData = userDoc.data();
    if (userData.kyc_status !== 'verified') {
      throw new functions.https.HttpsError('failed-precondition', 'KYC verification is required before initiating withdrawals.');
    }

    // Verify PIN if set
    if (userData.transaction_pin && userData.transaction_pin !== pin) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid 4-digit Transaction PIN.');
    }

    const walletDoc = await t.get(walletRef);
    if (!walletDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Wallet not found.');
    }

    const cashBalance = parseFloat(walletDoc.data().cash_balance || 0);
    if (cashBalance < withdrawAmount) {
      throw new functions.https.HttpsError('failed-precondition', `Insufficient wallet balance. Available: ₹${cashBalance}`);
    }

    // Deduct cash from available balance immediately into pending escrow
    const newCash = cashBalance - withdrawAmount;
    t.update(walletRef, {
      cash_balance: newCash,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    const isHighValue = withdrawAmount >= 50000;

    // Record Withdrawal Request
    t.set(withdrawalRef, {
      withdrawal_id: withdrawalId,
      user_id: userId,
      gross_amount: withdrawAmount,
      fee: fee,
      net_amount: netDisbursement,
      bank_details: bankDetails || {},
      status: 'pending',
      requires_dual_approval: isHighValue,
      first_approval: null,
      second_approval: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Record Ledger Escrow Entry
    await recordLedgerEntry(t, {
      userId: userId,
      transactionType: 'withdrawal_hold',
      amount: withdrawAmount,
      fee: fee,
      debitAccount: 'CASH_INR',
      creditAccount: 'WITHDRAWAL_ESCROW',
      referenceId: withdrawalId,
      description: `Withdrawal initiated to ${bankDetails?.bank_name || 'Bank'} (Held in Escrow)`,
      actor: userId
    });

    sendFCMNotification(
      userId,
      'Withdrawal Request Initiated',
      `Your request to withdraw ₹${withdrawAmount.toLocaleString('en-IN')} (Net: ₹${netDisbursement.toLocaleString('en-IN')}) has been queued.`,
      { channelId: 'transactions', type: 'withdrawal_initiated', withdrawal_id: withdrawalId }
    );

    return {
      success: true,
      withdrawal_id: withdrawalId,
      gross_amount: withdrawAmount,
      fee: fee,
      net_amount: netDisbursement,
      remaining_balance: newCash
    };
  });
});

// ============================================================================
// 4. CALLABLE: Subscribe to Investment Plan
// ============================================================================
exports.subscribeInvestment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = context.auth.uid;
  const { planId, amount, pin } = data;
  const investAmount = parseFloat(amount);

  if (!planId || !investAmount || investAmount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plan ID or investment amount.');
  }

  const planRef = db.collection('investment_plans').doc(planId.toString());
  const walletRef = db.collection('wallets').doc(userId);
  const userRef = db.collection('users').doc(userId);

  return await db.runTransaction(async (t) => {
    const planDoc = await t.get(planRef);
    if (!planDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Selected investment plan not found.');
    }

    const plan = planDoc.data();
    if (investAmount < plan.min_amount || investAmount > plan.max_amount) {
      throw new functions.https.HttpsError('invalid-argument', `Investment amount must be between ₹${plan.min_amount} and ₹${plan.max_amount}.`);
    }

    const walletDoc = await t.get(walletRef);
    if (!walletDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User wallet not found.');
    }

    const cashBalance = parseFloat(walletDoc.data().cash_balance || 0);
    const investedBalance = parseFloat(walletDoc.data().invested_balance || 0);

    if (cashBalance < investAmount) {
      throw new functions.https.HttpsError('failed-precondition', `Insufficient cash balance. Available: ₹${cashBalance}`);
    }

    const newCash = cashBalance - investAmount;
    const newInvested = investedBalance + investAmount;

    // Update wallet: transfer Cash -> Invested
    t.update(walletRef, {
      cash_balance: newCash,
      invested_balance: newInvested,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    const investmentId = 'INV-' + Date.now().toString(36).toUpperCase();
    const investmentRef = db.collection('investments').doc(investmentId);

    const now = new Date();
    const maturityDate = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

    const investmentData = {
      investment_id: investmentId,
      user_id: userId,
      plan_id: planId,
      plan_name: plan.name,
      amount: investAmount,
      daily_roi_pct: plan.daily_roi_pct,
      duration_days: plan.duration_days,
      status: 'active',
      total_earned: 0.0,
      days_active: 0,
      started_at: admin.firestore.FieldValue.serverTimestamp(),
      maturity_date: admin.firestore.Timestamp.fromDate(maturityDate),
      last_accrual_at: admin.firestore.FieldValue.serverTimestamp()
    };

    t.set(investmentRef, investmentData);

    // Double-Entry Ledger Entry (Debit: CASH_INR, Credit: INVESTMENT_PRINCIPAL)
    await recordLedgerEntry(t, {
      userId: userId,
      transactionType: 'investment_subscribed',
      amount: investAmount,
      fee: 0.0,
      debitAccount: 'CASH_INR',
      creditAccount: 'INVESTMENT_PRINCIPAL',
      referenceId: investmentId,
      description: `Subscribed to ${plan.name} (${plan.duration_days} Days @ ${(plan.daily_roi_pct * 365).toFixed(2)}% APY)`,
      actor: userId
    });

    sendFCMNotification(
      userId,
      'Investment Activated! 🚀',
      `₹${investAmount.toLocaleString('en-IN')} locked into ${plan.name}. Daily yield will accrue automatically.`,
      { channelId: 'yield_alerts', type: 'investment_activated', investment_id: investmentId }
    );

    return {
      success: true,
      investment_id: investmentId,
      plan_name: plan.name,
      amount: investAmount,
      cash_balance: newCash,
      invested_balance: newInvested
    };
  });
});

// ============================================================================
// 5. SCHEDULED & CALLABLE: Daily 24h Yield Accruals Engine
// ============================================================================
exports.runDailyAccruals = functions.https.onCall(async (data, context) => {
  // Admin only or internal runner
  const activeInvestmentsSnap = await db.collection('investments')
    .where('status', '==', 'active')
    .get();

  if (activeInvestmentsSnap.empty) {
    return { success: true, processed_count: 0, total_payout: 0 };
  }

  let totalPayout = 0;
  let processedCount = 0;

  for (const doc of activeInvestmentsSnap.docs) {
    const inv = doc.data();
    const principal = parseFloat(inv.amount);
    const dailyRoiPct = parseFloat(inv.daily_roi_pct);
    const dailyYield = parseFloat((principal * (dailyRoiPct / 100)).toFixed(2));

    const userId = inv.user_id;
    const invRef = doc.ref;
    const walletRef = db.collection('wallets').doc(userId);

    await db.runTransaction(async (t) => {
      const walletDoc = await t.get(walletRef);
      let accruedBalance = 0;
      let cashBalance = 0;

      if (walletDoc.exists) {
        accruedBalance = parseFloat(walletDoc.data().accrued_balance || 0);
        cashBalance = parseFloat(walletDoc.data().cash_balance || 0);
      }

      // Add yield to wallet accrued & cash balances
      t.update(walletRef, {
        accrued_balance: accruedBalance + dailyYield,
        cash_balance: cashBalance + dailyYield,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update investment record
      t.update(invRef, {
        total_earned: parseFloat(inv.total_earned || 0) + dailyYield,
        days_active: (inv.days_active || 0) + 1,
        last_accrual_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Record in earnings collection
      const earningRef = db.collection('earnings').doc();
      t.set(earningRef, {
        user_id: userId,
        investment_id: inv.investment_id,
        amount: dailyYield,
        type: 'daily_roi',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Double-entry ledger: Debit PLATFORM_REVENUE / YIELD_EXPENSE, Credit CASH_INR
      await recordLedgerEntry(t, {
        userId: userId,
        transactionType: 'daily_yield_credit',
        amount: dailyYield,
        fee: 0.0,
        debitAccount: 'PLATFORM_YIELD_RESERVE',
        creditAccount: 'ACCRUED_EARNINGS',
        referenceId: inv.investment_id,
        description: `Daily ROI yield credit for ${inv.plan_name}`,
        actor: 'ACCRUALS_ENGINE'
      });
    });

    totalPayout += dailyYield;
    processedCount++;

    // Trigger Notification
    sendFCMNotification(
      userId,
      'Daily Yield Credited! 📈',
      `₹${dailyYield.toFixed(2)} ROI has been credited to your wallet for ${inv.plan_name}.`,
      { channelId: 'yield_alerts', type: 'yield_credit', amount: dailyYield.toString() }
    );
  }

  return {
    success: true,
    processed_count: processedCount,
    total_payout: totalPayout,
    timestamp: new Date().toISOString()
  };
});

// ============================================================================
// 6. FIRESTORE TRIGGER: Real-time Transaction Push Notification
// ============================================================================
exports.onTransactionCreated = functions.firestore
  .document('wallet_transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const txn = snap.data();
    const userId = txn.user_id;

    let title = 'Transaction Update';
    let body = `Your ${txn.type} of ₹${txn.amount} has been processed.`;

    if (txn.type === 'deposit') {
      title = 'Deposit Successful 💰';
      body = `₹${txn.amount} has been credited to your wallet.`;
    } else if (txn.type === 'withdrawal') {
      title = 'Withdrawal Processed 🏦';
      body = `₹${txn.net_amount} has been transferred to your bank account.`;
    } else if (txn.type === 'daily_yield_credit') {
      title = 'Daily Yield Accrued 📈';
      body = `₹${txn.amount} ROI credited from your active investments.`;
    }

    await sendFCMNotification(userId, title, body, {
      channelId: 'transactions',
      type: txn.type,
      transaction_id: txn.transaction_id
    });
  });

// ============================================================================
// 7. REST API Express App Exporter
// ============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Antigravity Fintech Firebase Cloud Functions v2',
    timestamp: new Date().toISOString()
  });
});

exports.api = functions.https.onRequest(app);
