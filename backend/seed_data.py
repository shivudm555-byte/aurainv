import hashlib
import json
from datetime import datetime, timedelta
from database import get_db, init_db
from models.ledger import init_ledger_accounts, LedgerEngine

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def hash_pin(pin: str) -> str:
    return hashlib.sha256(pin.encode('utf-8')).hexdigest()

def seed_all():
    init_db()
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Initialize Ledger Accounts
    init_ledger_accounts(cursor)
    
    # 2. Insert App Settings
    settings = [
        ('crypto_module_enabled', 'true'),
        ('dual_approval_threshold', '50000'),
        ('withdrawal_fee_pct', '1.0'),
        ('min_withdrawal_amount', '500'),
        ('max_daily_withdrawal', '250000'),
        ('maintenance_mode', 'false'),
        ('terms_content', 'Standard Institutional & Retail Investor Agreement...'),
        ('privacy_policy', 'GDPR & DPDP Act 2023 Compliant Financial Data Policy...'),
        ('risk_disclosure', 'Investments are subject to market risks. Historical performance does not guarantee future results.')
    ]
    for k, v in settings:
        cursor.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", (k, v))

    # 3. Create Investment Plans
    plans = [
        (
            'Liquid Starter Growth', 'liquid-starter', 'Ideal for first-time investors with daily liquidity.',
            'A low-risk short-horizon portfolio invested in high-grade liquid money market instruments and treasury assets.',
            1000.0, 50000.0, 30, 0.041, 'daily', 'Low', 1, 'active' # ~15% APY
        ),
        (
            'Alpha Yield Staking', 'alpha-yield', 'Enhanced compound returns backed by algorithmic liquidity pools.',
            'A moderate-risk yield strategy with weekly rebalancing and automated reward compounding.',
            5000.0, 200000.0, 90, 0.055, 'daily', 'Moderate', 1, 'active' # ~20% APY
        ),
        (
            'Institutional Wealth Builder', 'wealth-builder', 'Maximum compounding for long-term strategic wealth creation.',
            'A premier multi-asset investment vehicle delivering superior risk-adjusted alpha for serious investors.',
            25000.0, 1000000.0, 180, 0.068, 'daily', 'Moderate', 1, 'active' # ~25% APY
        ),
        (
            'Green Infrastructure Bond', 'green-infra-bond', 'Sovereign-grade green energy infrastructure financing.',
            'Fixed-return bond backing solar, wind, and sustainable clean grid expansion with periodic payouts.',
            10000.0, 500000.0, 365, 0.050, 'monthly', 'Low', 1, 'active' # ~18% APY
        ),
        (
            'Quantum Arbitrage Fund', 'quantum-arbitrage', 'Cross-exchange algorithmic market neutral arbitrage.',
            'High frequency delta-neutral arbitrage capturing micro price discrepancies across global spot and derivatives.',
            50000.0, 2500000.0, 60, 0.082, 'daily', 'High', 0, 'active' # ~30% APY
        )
    ]
    cursor.executemany("""
    INSERT OR IGNORE INTO investment_plans (
        name, slug, tagline, description, min_amount, max_amount, duration_days,
        daily_roi_pct, payout_frequency, risk_level, capital_guarantee, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, plans)

    # 4. Create Users (Admins + Investors)
    users = [
        # (id, name, email, phone, role, status, kyc_status, 2fa, referral_code, referred_by)
        (1, 'Vikramaditya Singhania', 'superadmin@fintech.com', '+91 98765 00001', 'super_admin', 'active', 'approved', 1, 'SUPER001', None),
        (2, 'Meera Nambiar', 'finance@fintech.com', '+91 98765 00002', 'finance_admin', 'active', 'approved', 1, 'FIN002', None),
        (3, 'Suresh Iyer', 'kyc@fintech.com', '+91 98765 00003', 'kyc_admin', 'active', 'approved', 0, 'KYC003', None),
        (4, 'Ananya Sen', 'ops@fintech.com', '+91 98765 00004', 'ops_admin', 'active', 'approved', 1, 'OPS004', None),
        (5, 'Rahul Sharma', 'rahul.sharma@gmail.com', '+91 98111 22233', 'user', 'active', 'approved', 1, 'RAHUL77', None),
        (6, 'Priya Patel', 'priya.patel@gmail.com', '+91 98222 33344', 'user', 'active', 'pending', 0, 'PRIYA88', 'RAHUL77'),
        (7, 'Amit Verma', 'amit.verma@investor.com', '+91 98333 44455', 'user', 'active', 'approved', 1, 'AMIT99', 'RAHUL77'),
        (8, 'Kavita Reddy', 'kavita.reddy@techcorp.in', '+91 98444 55566', 'user', 'active', 'rejected', 0, 'KAVITA55', None),
        (9, 'Rohan Merchant', 'rohan.merchant@gmail.com', '+91 98555 66677', 'user', 'suspended', 'approved', 0, 'ROHAN11', None)
    ]

    for u in users:
        cursor.execute("""
        INSERT OR IGNORE INTO users (
            id, full_name, email, phone, password_hash, pin_hash, role, status,
            kyc_status, is_2fa_enabled, referral_code, referred_by, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            u[0], u[1], u[2], u[3], hash_pw('Fintech@123'), hash_pin('1234'),
            u[4], u[5], u[6], u[7], u[8], u[9]
        ))
        
        # User Profile
        cursor.execute("""
        INSERT OR IGNORE INTO user_profiles (user_id, dob, address, city, state, country, postal_code, avatar_url)
        VALUES (?, '1992-06-15', 'Flat 402, Cyber Heights, Hitec City', 'Hyderabad', 'Telangana', 'India', '500081', 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
        """, (u[0],))

        # Bank Account
        cursor.execute("""
        INSERT OR IGNORE INTO bank_accounts (
            user_id, bank_name, account_holder_name, account_number, ifsc_code, account_type, is_primary, is_verified
        ) VALUES (?, 'HDFC Bank Ltd', ?, ?, 'HDFC0001234', 'savings', 1, 1)
        """, (u[0], u[1], f"5010029{u[0]:04d}890"))

    # 5. KYC Records
    kyc_records = [
        (5, 'pan', 'ABCPS1234K', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600', 'approved', None, 3, datetime.utcnow() - timedelta(days=10)),
        (6, 'aadhaar', '9876 5432 1098', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600', 'pending', None, None, None),
        (7, 'passport', 'Z8920194', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600', 'approved', None, 3, datetime.utcnow() - timedelta(days=5)),
        (8, 'pan', 'XYZPK9876Q', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600', 'rejected', 'Address proof document photo is blurry and unreadable. Please upload a clear bank statement or electricity bill.', 3, datetime.utcnow() - timedelta(days=2))
    ]
    for k in kyc_records:
        cursor.execute("""
        INSERT OR IGNORE INTO kyc_records (
            user_id, doc_type, id_number, doc_front_url, doc_back_url, selfie_url, address_proof_url,
            status, rejection_reason, reviewed_by, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, k)

    # 6. Post Deposits into Ledger & Record Deposit Objects
    # Rahul Sharma: Deposit ₹75,000 via UPI
    dep1_amt = 75000.0
    cursor.execute("""
    INSERT OR IGNORE INTO deposits (
        deposit_code, user_id, amount, fee, net_amount, payment_method, utr_ref, status, approved_by, approved_at
    ) VALUES ('DEP-2026-001', 5, ?, 0.0, ?, 'UPI', 'UPI/20260810/987654321', 'approved', 2, CURRENT_TIMESTAMP)
    """, (dep1_amt, dep1_amt))
    LedgerEngine.post_transaction(
        cursor, user_id=5, transaction_type='DEPOSIT',
        entries=[
            {'account_code': 'CASH_INR', 'debit': 0.0, 'credit': dep1_amt},
            {'account_code': 'PLATFORM_REVENUE', 'debit': dep1_amt, 'credit': 0.0} # Source liability matching
        ],
        description="Approved UPI Deposit ₹75,000",
        reference_id='DEP-2026-001',
        created_by='FINANCE_ADMIN'
    )

    # Amit Verma: Deposit ₹250,000 via Bank IMPS
    dep2_amt = 250000.0
    cursor.execute("""
    INSERT OR IGNORE INTO deposits (
        deposit_code, user_id, amount, fee, net_amount, payment_method, utr_ref, status, approved_by, approved_at
    ) VALUES ('DEP-2026-002', 7, ?, 0.0, ?, 'BANK_TRANSFER', 'HDFC/IMPS/7654321890', 'approved', 2, CURRENT_TIMESTAMP)
    """, (dep2_amt, dep2_amt))
    LedgerEngine.post_transaction(
        cursor, user_id=7, transaction_type='DEPOSIT',
        entries=[
            {'account_code': 'CASH_INR', 'debit': 0.0, 'credit': dep2_amt},
            {'account_code': 'PLATFORM_REVENUE', 'debit': dep2_amt, 'credit': 0.0}
        ],
        description="Approved Bank IMPS Deposit ₹250,000",
        reference_id='DEP-2026-002',
        created_by='FINANCE_ADMIN'
    )

    # Priya Patel: Pending Deposit ₹25,000 awaiting Admin Approval
    cursor.execute("""
    INSERT OR IGNORE INTO deposits (
        deposit_code, user_id, amount, fee, net_amount, payment_method, utr_ref, status
    ) VALUES ('DEP-2026-003', 6, 25000.0, 0.0, 25000.0, 'UPI', 'UPI/20260818/887766554', 'pending')
    """)

    # 7. Create Active User Investments
    # Rahul Sharma invests ₹50,000 in Liquid Starter Growth
    inv1_amt = 50000.0
    start_d1 = datetime.utcnow() - timedelta(days=12)
    mat_d1 = start_d1 + timedelta(days=30)
    accrued1 = round(inv1_amt * 0.00041 * 12, 2) # 12 days of accrual = ₹246.00
    
    cursor.execute("""
    INSERT OR IGNORE INTO user_investments (
        investment_code, user_id, plan_id, principal_amount, daily_roi_pct, total_accrued,
        start_date, maturity_date, status, last_accrual_date
    ) VALUES ('INV-2026-101', 5, 1, ?, 0.041, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
    """, (inv1_amt, accrued1, start_d1, mat_d1))
    
    # Ledger for Investment: Move from Cash to Investment Principal
    LedgerEngine.post_transaction(
        cursor, user_id=5, transaction_type='INVEST_PRINCIPAL',
        entries=[
            {'account_code': 'CASH_INR', 'debit': inv1_amt, 'credit': 0.0},
            {'account_code': 'INVESTMENT_PRINCIPAL', 'debit': 0.0, 'credit': inv1_amt}
        ],
        description="Invested ₹50,000 in Liquid Starter Growth",
        reference_id='INV-2026-101',
        created_by='USER_RAHUL'
    )

    # Post Accrued Earnings to Ledger
    LedgerEngine.post_transaction(
        cursor, user_id=5, transaction_type='ACCRUAL_PAYOUT',
        entries=[
            {'account_code': 'PLATFORM_REVENUE', 'debit': accrued1, 'credit': 0.0},
            {'account_code': 'ACCRUED_EARNINGS', 'debit': 0.0, 'credit': accrued1}
        ],
        description=f"Accrued daily returns (12 cycles) for INV-2026-101",
        reference_id='INV-2026-101',
        created_by='ACCRUAL_ENGINE'
    )

    # Amit Verma invests ₹150,000 in Institutional Wealth Builder
    inv2_amt = 150000.0
    start_d2 = datetime.utcnow() - timedelta(days=25)
    mat_d2 = start_d2 + timedelta(days=180)
    accrued2 = round(inv2_amt * 0.00068 * 25, 2) # 25 days = ₹2,550.00
    
    cursor.execute("""
    INSERT OR IGNORE INTO user_investments (
        investment_code, user_id, plan_id, principal_amount, daily_roi_pct, total_accrued,
        start_date, maturity_date, status, last_accrual_date
    ) VALUES ('INV-2026-102', 7, 3, ?, 0.068, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
    """, (inv2_amt, accrued2, start_d2, mat_d2))

    LedgerEngine.post_transaction(
        cursor, user_id=7, transaction_type='INVEST_PRINCIPAL',
        entries=[
            {'account_code': 'CASH_INR', 'debit': inv2_amt, 'credit': 0.0},
            {'account_code': 'INVESTMENT_PRINCIPAL', 'debit': 0.0, 'credit': inv2_amt}
        ],
        description="Invested ₹150,000 in Institutional Wealth Builder",
        reference_id='INV-2026-102',
        created_by='USER_AMIT'
    )
    LedgerEngine.post_transaction(
        cursor, user_id=7, transaction_type='ACCRUAL_PAYOUT',
        entries=[
            {'account_code': 'PLATFORM_REVENUE', 'debit': accrued2, 'credit': 0.0},
            {'account_code': 'ACCRUED_EARNINGS', 'debit': 0.0, 'credit': accrued2}
        ],
        description=f"Accrued daily returns (25 cycles) for INV-2026-102",
        reference_id='INV-2026-102',
        created_by='ACCRUAL_ENGINE'
    )

    # 8. Referral Commission for Rahul Sharma (Amit Verma was referred by Rahul)
    ref_commission = 7500.0 # 5% of ₹150,000
    cursor.execute("""
    INSERT OR IGNORE INTO referral_commissions (
        referrer_id, referee_id, investment_id, commission_amount, commission_pct, status
    ) VALUES (5, 7, 2, ?, 5.0, 'paid')
    """, (ref_commission,))
    
    LedgerEngine.post_transaction(
        cursor, user_id=5, transaction_type='REFERRAL_COMMISSION',
        entries=[
            {'account_code': 'PLATFORM_REVENUE', 'debit': ref_commission, 'credit': 0.0},
            {'account_code': 'CASH_INR', 'debit': 0.0, 'credit': ref_commission} # Directly credited to available cash
        ],
        description="5% Referral Commission from referee Amit Verma investment",
        reference_id='REF-COMM-001',
        created_by='REFERRAL_ENGINE'
    )

    # 9. Create Withdrawals (Normal completed, Pending standard, and High-Value Pending Dual Approval)
    # Rahul Sharma normal completed withdrawal ₹5,000
    w1_amt = 5000.0
    w1_fee = 50.0
    cursor.execute("""
    INSERT OR IGNORE INTO withdrawals (
        withdrawal_code, user_id, amount, fee, net_amount, payout_method, destination_details,
        status, requires_dual_approval, first_approval_by, first_approval_at, first_approval_admin_name,
        final_approval_by, final_approval_at, final_approval_admin_name
    ) VALUES ('WDL-2026-001', 5, ?, ?, ?, 'BANK_TRANSFER', '{"bank": "HDFC Bank", "acc": "50100290005890", "ifsc": "HDFC0001234"}',
    'completed', 0, 2, CURRENT_TIMESTAMP, 'Meera Nambiar (Finance)', 2, CURRENT_TIMESTAMP, 'Meera Nambiar (Finance)')
    """, (w1_amt, w1_fee, w1_amt - w1_fee))
    
    LedgerEngine.post_transaction(
        cursor, user_id=5, transaction_type='WITHDRAWAL',
        entries=[
            {'account_code': 'CASH_INR', 'debit': w1_amt, 'credit': 0.0},
            {'account_code': 'PLATFORM_FEES', 'debit': 0.0, 'credit': w1_fee},
            {'account_code': 'PLATFORM_REVENUE', 'debit': 0.0, 'credit': w1_amt - w1_fee}
        ],
        description="Processed Bank Withdrawal of ₹5,000 (Fee ₹50)",
        reference_id='WDL-2026-001',
        created_by='FINANCE_ADMIN'
    )

    # Amit Verma: High-Value Withdrawal ₹80,000 requiring Dual Admin Approval (Currently pending 2nd approval!)
    w2_amt = 80000.0
    w2_fee = 800.0
    cursor.execute("""
    INSERT OR IGNORE INTO withdrawals (
        withdrawal_code, user_id, amount, fee, net_amount, payout_method, destination_details,
        status, requires_dual_approval, first_approval_by, first_approval_at, first_approval_admin_name
    ) VALUES ('WDL-2026-002', 7, ?, ?, ?, 'BANK_TRANSFER', '{"bank": "HDFC Bank", "acc": "50100290007890", "ifsc": "HDFC0001234"}',
    'pending_second_approval', 1, 2, CURRENT_TIMESTAMP, 'Meera Nambiar (Finance Admin)')
    """, (w2_amt, w2_fee, w2_amt - w2_fee))

    # 10. Crypto Transactions & Balances
    crypto_data = {
        'BTC': 0.1542,
        'ETH': 2.4500,
        'USDT': 3250.00,
        'SOL': 18.7500
    }
    cursor.execute("""
    UPDATE wallets SET crypto_balances_json = ? WHERE user_id = 5
    """, (json.dumps(crypto_data),))
    
    cursor.execute("""
    INSERT OR IGNORE INTO crypto_transactions (
        tx_code, user_id, asset, network, tx_type, amount, fee, wallet_address, tx_hash,
        confirmations, required_confirmations, status
    ) VALUES 
    ('CTX-2026-001', 5, 'USDT', 'Tron (TRC20)', 'DEPOSIT', 2500.0, 0.0, 'TQj8e9m3kLmNwP7vYr2Qx6Z1bK5gD9sV', '0x7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', 20, 3, 'completed'),
    ('CTX-2026-002', 5, 'ETH', 'Ethereum (ERC20)', 'DEPOSIT', 1.5, 0.002, '0x3A8F2b16C97E43d89d4E76092F2694Cd4788102a', '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', 12, 12, 'completed'),
    ('CTX-2026-003', 5, 'SOL', 'Solana', 'WITHDRAWAL', 5.0, 0.0005, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', '4uQeVj5tqViQh7yVw8z9aB0c1d2e3f4g5h6j7k8m9n0p', 32, 32, 'completed')
    """)

    # 11. Support Tickets & Messaging
    cursor.execute("""
    INSERT OR IGNORE INTO support_tickets (
        id, ticket_code, user_id, subject, category, priority, status
    ) VALUES (1, 'TCK-8921', 5, 'Query regarding daily compounding calculation on Liquid Starter', 'investment', 'medium', 'in_progress')
    """)
    cursor.execute("""
    INSERT OR IGNORE INTO ticket_messages (ticket_id, sender_type, sender_name, message)
    VALUES 
    (1, 'user', 'Rahul Sharma', 'Hi team, I wanted to understand if the daily return of 0.041% is automatically added to the invested principal or held in the accrued balance?'),
    (1, 'admin', 'Ananya Sen (Support)', 'Hello Rahul! Thank you for reaching out. The daily returns are credited to your Accrued Balance every 24 hours. You can withdraw them anytime or reinvest back into any active plan.')
    """)

    # 12. Notifications
    notifs = [
        (5, 'Welcome to Antigravity Fintech', 'Your account has been created. Start by exploring our institutional-grade investment plans.', 'system', 1),
        (5, 'KYC Verified Successfully', 'Your identity and PAN documents have been approved by compliance desk.', 'kyc', 1),
        (5, 'Deposit Received: ₹75,000', 'Your UPI deposit has been verified and credited to your cash wallet.', 'transaction', 1),
        (5, 'Investment Activated: Liquid Starter Growth', 'Principal ₹50,000 is now earning daily returns.', 'investment', 0),
        (5, 'Referral Reward Credited: ₹7,500', 'You earned 5% commission on your referee Amit Verma investment!', 'transaction', 0),
        (7, 'High-Value Withdrawal Under Dual Review', 'Your withdrawal request of ₹80,000 has received first-level finance approval.', 'security', 0)
    ]
    for n in notifs:
        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category, is_read)
        VALUES (?, ?, ?, ?, ?)
        """, n)

    # 13. Audit Logs
    audit_entries = [
        (1, 'Vikramaditya Singhania', 'SYSTEM_INIT', 'SYSTEM', 'SYS_01', '{"status": "Platform and ledger tables initialized"}', '127.0.0.1'),
        (3, 'Suresh Iyer', 'KYC_APPROVED', 'USER', '5', '{"user_id": 5, "doc_type": "PAN", "id_number": "ABCPS1234K"}', '192.168.1.10'),
        (2, 'Meera Nambiar', 'DEPOSIT_APPROVED', 'DEPOSIT', 'DEP-2026-001', '{"amount": 75000.0, "user_id": 5, "method": "UPI"}', '192.168.1.12'),
        (2, 'Meera Nambiar', 'WITHDRAWAL_FIRST_APPROVAL', 'WITHDRAWAL', 'WDL-2026-002', '{"amount": 80000.0, "user_id": 7, "note": "Passed initial liquidity and AML check"}', '192.168.1.12')
    ]
    for a in audit_entries:
        cursor.execute("""
        INSERT INTO audit_logs (admin_id, admin_name, action, target_type, target_id, details_json, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, a)

    # Reconcile Wallets for all users
    for u in users:
        LedgerEngine.sync_user_wallet(cursor, u[0])

    conn.commit()
    conn.close()
    print("Seed data successfully populated!")

if __name__ == "__main__":
    seed_all()
