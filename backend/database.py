import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fintech.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        pin_hash TEXT,
        role TEXT DEFAULT 'user', -- 'user', 'super_admin', 'finance_admin', 'kyc_admin', 'support_admin', 'ops_admin'
        status TEXT DEFAULT 'active', -- 'active', 'suspended', 'pending_verification'
        kyc_status TEXT DEFAULT 'not_submitted', -- 'not_submitted', 'pending', 'approved', 'rejected'
        is_2fa_enabled INTEGER DEFAULT 0,
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );
    """)

    # 2. User Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY,
        dob TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'India',
        postal_code TEXT,
        avatar_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. KYC Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kyc_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doc_type TEXT NOT NULL, -- 'aadhaar', 'pan', 'passport', 'national_id'
        id_number TEXT NOT NULL,
        doc_front_url TEXT,
        doc_back_url TEXT,
        selfie_url TEXT,
        address_proof_url TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        rejection_reason TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INTEGER,
        reviewed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
    );
    """)

    # 4. Bank Accounts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bank_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        bank_name TEXT NOT NULL,
        account_holder_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        ifsc_code TEXT NOT NULL,
        account_type TEXT DEFAULT 'savings', -- 'savings', 'current'
        is_primary INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 5. Investment Plans Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS investment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        tagline TEXT,
        description TEXT,
        min_amount REAL NOT NULL,
        max_amount REAL NOT NULL,
        duration_days INTEGER NOT NULL,
        daily_roi_pct REAL NOT NULL, -- Daily return percentage (e.g. 0.05% = 18.25% APR)
        payout_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'monthly', 'maturity'
        risk_level TEXT DEFAULT 'Moderate', -- 'Low', 'Moderate', 'High'
        capital_guarantee INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active', -- 'active', 'inactive'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. User Investments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investment_code TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        principal_amount REAL NOT NULL,
        daily_roi_pct REAL NOT NULL,
        total_accrued REAL DEFAULT 0.0,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        maturity_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'active', -- 'active', 'matured', 'cancelled'
        last_accrual_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES investment_plans(id)
    );
    """)

    # 7. Wallets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wallets (
        user_id INTEGER PRIMARY KEY,
        currency TEXT DEFAULT 'INR',
        cash_balance REAL DEFAULT 0.0,
        invested_balance REAL DEFAULT 0.0,
        accrued_balance REAL DEFAULT 0.0,
        crypto_balances_json TEXT DEFAULT '{"BTC": 0.0, "ETH": 0.0, "USDT": 0.0, "SOL": 0.0}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 8. Ledger Accounts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ledger_accounts (
        code TEXT PRIMARY KEY, -- 'CASH_INR', 'INVESTMENT_PRINCIPAL', 'ACCRUED_EARNINGS', 'REFERRAL_EARNINGS', 'PLATFORM_FEES', 'CRYPTO_ASSETS', 'PLATFORM_REVENUE'
        name TEXT NOT NULL,
        account_type TEXT NOT NULL, -- 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
        balance REAL DEFAULT 0.0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 9. Immutable Double-Entry Ledger Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ledger_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        user_id INTEGER,
        ledger_account_code TEXT NOT NULL,
        debit_amount REAL DEFAULT 0.0,
        credit_amount REAL DEFAULT 0.0,
        currency TEXT DEFAULT 'INR',
        balance_after REAL NOT NULL,
        transaction_type TEXT NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'INVEST_PRINCIPAL', 'ACCRUAL_PAYOUT', 'REFERRAL_COMMISSION', 'FEE_DEDUCTION', 'MANUAL_ADJUSTMENT', 'CRYPTO_TRANSFER'
        reference_id TEXT,
        blockchain_txid TEXT,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT DEFAULT 'SYSTEM',
        audit_reason TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (ledger_account_code) REFERENCES ledger_accounts(code)
    );
    """)

    # 10. Deposits Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deposit_code TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        fee REAL DEFAULT 0.0,
        net_amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        payment_method TEXT NOT NULL, -- 'UPI', 'BANK_TRANSFER', 'GATEWAY', 'CRYPTO'
        utr_ref TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        approved_by INTEGER,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id)
    );
    """)

    # 11. Withdrawals Table (with Dual-Approval support)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        withdrawal_code TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        fee REAL DEFAULT 0.0,
        net_amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        payout_method TEXT NOT NULL, -- 'BANK_TRANSFER', 'CRYPTO'
        destination_details TEXT NOT NULL, -- Bank account JSON or Crypto address
        status TEXT DEFAULT 'pending', -- 'pending', 'pending_second_approval', 'processing', 'completed', 'rejected', 'cancelled'
        requires_dual_approval INTEGER DEFAULT 0, -- 1 if amount > threshold
        first_approval_by INTEGER,
        first_approval_at TIMESTAMP,
        first_approval_admin_name TEXT,
        final_approval_by INTEGER,
        final_approval_at TIMESTAMP,
        final_approval_admin_name TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 12. Crypto Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crypto_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tx_code TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        asset TEXT NOT NULL, -- 'BTC', 'ETH', 'USDT', 'SOL'
        network TEXT NOT NULL, -- 'Bitcoin', 'Ethereum (ERC20)', 'Tron (TRC20)', 'Solana'
        tx_type TEXT NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL'
        amount REAL NOT NULL,
        fee REAL DEFAULT 0.0,
        wallet_address TEXT NOT NULL,
        tx_hash TEXT,
        confirmations INTEGER DEFAULT 0,
        required_confirmations INTEGER DEFAULT 3,
        status TEXT DEFAULT 'pending', -- 'pending', 'confirming', 'completed', 'rejected'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 13. Referral Commissions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS referral_commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_id INTEGER NOT NULL,
        referee_id INTEGER NOT NULL,
        investment_id INTEGER,
        commission_amount REAL NOT NULL,
        commission_pct REAL DEFAULT 5.0,
        status TEXT DEFAULT 'paid', -- 'pending', 'paid'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referrer_id) REFERENCES users(id),
        FOREIGN KEY (referee_id) REFERENCES users(id),
        FOREIGN KEY (investment_id) REFERENCES user_investments(id)
    );
    """)

    # 14. Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT DEFAULT 'general', -- 'transaction', 'investment', 'security', 'kyc', 'system'
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 15. Support Tickets Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_code TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        category TEXT DEFAULT 'general', -- 'deposit', 'withdrawal', 'investment', 'kyc', 'technical'
        priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
        status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 16. Ticket Messages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ticket_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        sender_type TEXT NOT NULL, -- 'user', 'admin'
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
    );
    """)

    # 17. Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        admin_name TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT,
        details_json TEXT,
        ip_address TEXT DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 18. App Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
