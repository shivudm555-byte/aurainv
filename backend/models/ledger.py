import uuid
import json
from datetime import datetime
from database import get_db

ACCOUNT_TYPES = {
    'CASH_INR': {'name': 'User Cash Balance', 'type': 'LIABILITY'},
    'INVESTMENT_PRINCIPAL': {'name': 'Investment Principal Locked', 'type': 'LIABILITY'},
    'ACCRUED_EARNINGS': {'name': 'Accrued Return Earnings', 'type': 'LIABILITY'},
    'REFERRAL_EARNINGS': {'name': 'Referral Commissions', 'type': 'LIABILITY'},
    'PLATFORM_FEES': {'name': 'Platform Fee Income', 'type': 'REVENUE'},
    'CRYPTO_ASSETS': {'name': 'Crypto & VDA Assets', 'type': 'ASSET'},
    'PLATFORM_REVENUE': {'name': 'Platform Net Revenue', 'type': 'REVENUE'}
}

def init_ledger_accounts(cursor):
    for code, info in ACCOUNT_TYPES.items():
        cursor.execute("""
        INSERT OR IGNORE INTO ledger_accounts (code, name, account_type, balance)
        VALUES (?, ?, ?, 0.0)
        """, (code, info['name'], info['type']))

class LedgerEngine:
    @staticmethod
    def post_transaction(cursor, user_id, transaction_type, entries, description, 
                         reference_id=None, blockchain_txid=None, created_by='SYSTEM', audit_reason=None):
        """
        Posts balanced double-entry ledger transactions.
        entries = [
            {'account_code': 'CASH_INR', 'debit': 0, 'credit': 5000},
            {'account_code': 'PLATFORM_REVENUE', 'debit': 5000, 'credit': 0}
        ]
        """
        # 1. Verify double entry balance
        total_debit = sum(float(e.get('debit', 0.0)) for e in entries)
        total_credit = sum(float(e.get('credit', 0.0)) for e in entries)
        
        # Round to 4 decimal places to prevent floating point mismatch
        if round(total_debit, 4) != round(total_credit, 4):
            raise ValueError(f"Ledger Imbalance: Total Debits ({total_debit}) != Total Credits ({total_credit})")

        tx_group_id = f"TX-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        
        posted_rows = []
        for entry in entries:
            code = entry['account_code']
            debit = float(entry.get('debit', 0.0))
            credit = float(entry.get('credit', 0.0))
            
            # Fetch current balance of the ledger account
            cursor.execute("SELECT balance, account_type FROM ledger_accounts WHERE code = ?", (code,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Ledger account code '{code}' does not exist.")
            
            current_balance = row['balance']
            acct_type = row['account_type']
            
            # Normal balances: ASSET & EXPENSE increase with debit; LIABILITY, EQUITY & REVENUE increase with credit
            if acct_type in ['ASSET', 'EXPENSE']:
                new_balance = current_balance + debit - credit
            else:
                new_balance = current_balance + credit - debit
                
            cursor.execute("""
            UPDATE ledger_accounts 
            SET balance = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE code = ?
            """, (new_balance, code))
            
            cursor.execute("""
            INSERT INTO ledger_transactions (
                transaction_id, user_id, ledger_account_code, debit_amount, credit_amount,
                currency, balance_after, transaction_type, reference_id, blockchain_txid,
                description, created_by, audit_reason
            ) VALUES (?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?)
            """, (
                tx_group_id, user_id, code, debit, credit,
                new_balance, transaction_type, reference_id, blockchain_txid,
                description, created_by, audit_reason
            ))
            
            posted_rows.append({
                'transaction_id': tx_group_id,
                'account_code': code,
                'debit': debit,
                'credit': credit,
                'balance_after': new_balance
            })
            
        return tx_group_id, posted_rows

    @staticmethod
    def sync_user_wallet(cursor, user_id):
        """
        Reconciles wallet snapshot from the ledger transactions for a user.
        """
        # Cash = Sum of (credit - debit) on CASH_INR for this user
        cursor.execute("""
        SELECT 
            COALESCE(SUM(credit_amount - debit_amount), 0.0) as cash_bal
        FROM ledger_transactions
        WHERE user_id = ? AND ledger_account_code = 'CASH_INR'
        """, (user_id,))
        cash_bal = cursor.fetchone()['cash_bal']

        # Invested Principal = Sum of active investments for user
        cursor.execute("""
        SELECT COALESCE(SUM(principal_amount), 0.0) as invested_bal
        FROM user_investments
        WHERE user_id = ? AND status = 'active'
        """, (user_id,))
        invested_bal = cursor.fetchone()['invested_bal']

        # Accrued Earnings = Sum of total_accrued across user investments
        cursor.execute("""
        SELECT COALESCE(SUM(total_accrued), 0.0) as accrued_bal
        FROM user_investments
        WHERE user_id = ?
        """, (user_id,))
        accrued_bal = cursor.fetchone()['accrued_bal']

        cursor.execute("""
        INSERT INTO wallets (user_id, cash_balance, invested_balance, accrued_balance, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            cash_balance = excluded.cash_balance,
            invested_balance = excluded.invested_balance,
            accrued_balance = excluded.accrued_balance,
            updated_at = CURRENT_TIMESTAMP
        """, (user_id, cash_bal, invested_bal, accrued_bal))
        
        return {
            'user_id': user_id,
            'cash_balance': cash_bal,
            'invested_balance': invested_bal,
            'accrued_balance': accrued_bal,
            'total_portfolio': cash_bal + invested_bal + accrued_bal
        }
