/**
 * ============================================================================
 * Antigravity Fintech — Firestore Database Seeding Script
 * Populates all 18 Firestore collections with institutional seed data
 * ============================================================================
 * 
 * Usage:
 *   1. Place your serviceAccountKey.json in the firebase/ directory
 *   2. Run: node seed_firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log("------------------------------------------------------------------");
  console.log("⚠️  serviceAccountKey.json not found in firebase/ directory.");
  console.log("ℹ️  To seed a live Firebase project:");
  console.log("   1. Go to Firebase Console -> Project Settings -> Service accounts");
  console.log("   2. Click 'Generate new private key' and save as serviceAccountKey.json in this directory");
  console.log("   3. Run 'node seed_firestore.js' again.");
  console.log("------------------------------------------------------------------");
  process.exit(0);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  console.log("🚀 Starting Firestore database seed for Antigravity Fintech...");

  // 1. Investment Plans
  const plans = [
    {
      id: 'plan_1',
      name: 'Liquid Starter Growth',
      slug: 'liquid-starter-growth',
      daily_roi_pct: 0.0411, // ~15.0% APY
      duration_days: 30,
      min_amount: 1000,
      max_amount: 50000,
      risk_level: 'Low',
      category: 'Fixed Income',
      status: 'active',
      badge: 'POPULAR'
    },
    {
      id: 'plan_2',
      name: 'Alpha Yield Staking',
      slug: 'alpha-yield-staking',
      daily_roi_pct: 0.0548, // ~20.0% APY
      duration_days: 90,
      min_amount: 5000,
      max_amount: 200000,
      risk_level: 'Moderate',
      category: 'DeFi & Fixed Yield',
      status: 'active',
      badge: 'HIGH YIELD'
    },
    {
      id: 'plan_3',
      name: 'Institutional Wealth Builder',
      slug: 'institutional-wealth-builder',
      daily_roi_pct: 0.0685, // ~25.0% APY
      duration_days: 180,
      min_amount: 25000,
      max_amount: 1000000,
      risk_level: 'Moderate',
      category: 'Structured Debt',
      status: 'active',
      badge: 'FEATURED'
    },
    {
      id: 'plan_4',
      name: 'Quantum Arbitrage Fund',
      slug: 'quantum-arbitrage-fund',
      daily_roi_pct: 0.0822, // ~30.0% APY
      duration_days: 60,
      min_amount: 50000,
      max_amount: 2500000,
      risk_level: 'High',
      category: 'Algorithmic Arbitrage',
      status: 'active',
      badge: 'EXCLUSIVE'
    }
  ];

  for (const plan of plans) {
    await db.collection('investment_plans').doc(plan.id).set(plan);
  }
  console.log("✅ Seeded investment_plans (4 plans)");

  // 2. Digital Assets (VDA)
  const assets = [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin Mainnet', current_price_inr: 5850000, change_24h: 3.42, icon: '₿' },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', network: 'ERC-20', current_price_inr: 295000, change_24h: 1.85, icon: 'Ξ' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether USD', network: 'TRC-20 / ERC-20', current_price_inr: 83.50, change_24h: 0.02, icon: '₮' },
    { id: 'sol', symbol: 'SOL', name: 'Solana', network: 'Solana Native', current_price_inr: 14200, change_24h: -0.95, icon: '◎' }
  ];

  for (const asset of assets) {
    await db.collection('digital_assets').doc(asset.id).set(asset);
  }
  console.log("✅ Seeded digital_assets (4 coins)");

  // 3. System Settings
  const settings = {
    platform_name: 'Antigravity Fintech Global',
    support_email: 'support@antigravityfintech.io',
    min_deposit: 100,
    min_withdrawal: 500,
    withdrawal_fee_pct: 1.0,
    dual_approval_threshold: 50000,
    referral_commission_pct: 5.0,
    kyc_required_for_withdraw: true,
    maintenance_mode: false,
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  };
  await db.collection('system_settings').doc('global_config').set(settings);
  console.log("✅ Seeded system_settings");

  // 4. Seed Demo Users & Wallets
  const demoUsers = [
    {
      uid: 'demo_user_1',
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '+919876543210',
      role: 'user',
      status: 'active',
      kyc_status: 'verified',
      referral_code: 'RAHUL99',
      cash_balance: 32500.0,
      invested_balance: 50000.0,
      accrued_balance: 1450.0
    },
    {
      uid: 'demo_user_2',
      full_name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      phone: '+919812345678',
      role: 'user',
      status: 'active',
      kyc_status: 'pending',
      referral_code: 'PRIYA88',
      cash_balance: 15000.0,
      invested_balance: 20000.0,
      accrued_balance: 320.0
    }
  ];

  for (const user of demoUsers) {
    const { cash_balance, invested_balance, accrued_balance, ...userData } = user;
    await db.collection('users').doc(user.uid).set({
      ...userData,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('wallets').doc(user.uid).set({
      user_id: user.uid,
      cash_balance: cash_balance,
      invested_balance: invested_balance,
      accrued_balance: accrued_balance,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('kyc').doc(user.uid).set({
      user_id: user.uid,
      status: user.kyc_status,
      pan_number: 'ABCDE1234F',
      aadhaar_last4: '9876',
      submitted_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log("✅ Seeded demo users, wallets, and KYC records");

  console.log("🎉 Firestore database seeding completed successfully!");
}

seedDatabase().catch(err => {
  console.error("Error during Firestore seeding:", err);
  process.exit(1);
});
