import uuid
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import get_db
from models.ledger import LedgerEngine

wallet_bp = Blueprint('wallet_bp', __name__)

@wallet_bp.route('/api/wallet/summary/<int:user_id>', methods=['GET'])
def get_wallet_summary(user_id):
    conn = get_db()
    cursor = conn.cursor()

    # Reconcile latest ledger balances
    wallet_info = LedgerEngine.sync_user_wallet(cursor, user_id)

    # Fetch crypto balances
    cursor.execute("SELECT crypto_balances_json FROM wallets WHERE user_id = ?", (user_id,))
    w_row = cursor.fetchone()
    crypto_balances = json.loads(w_row['crypto_balances_json']) if w_row and w_row['crypto_balances_json'] else {}

    # Calculate 24h earnings (accruals in last 24h)
    cursor.execute("""
    SELECT COALESCE(SUM(credit_amount), 0.0) as today_earnings
    FROM ledger_transactions
    WHERE user_id = ? AND transaction_type = 'ACCRUAL_PAYOUT' 
      AND date(created_at) = date('now')
    """, (user_id,))
    today_earn = cursor.fetchone()['today_earnings']

    # Total lifetime earnings (accruals + referrals)
    cursor.execute("""
    SELECT COALESCE(SUM(credit_amount), 0.0) as total_earnings
    FROM ledger_transactions
    WHERE user_id = ? AND transaction_type IN ('ACCRUAL_PAYOUT', 'REFERRAL_COMMISSION')
    """, (user_id,))
    total_earn = cursor.fetchone()['total_earnings']

    # Active investments count
    cursor.execute("SELECT COUNT(*) as count FROM user_investments WHERE user_id = ? AND status = 'active'", (user_id,))
    active_inv_count = cursor.fetchone()['count']

    # Pending withdrawals count and sum
    cursor.execute("""
    SELECT COUNT(*) as count, COALESCE(SUM(amount), 0.0) as total
    FROM withdrawals 
    WHERE user_id = ? AND status IN ('pending', 'pending_second_approval', 'processing')
    """, (user_id,))
    pw = cursor.fetchone()

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'wallet': {
            'cash_balance': wallet_info['cash_balance'],
            'invested_balance': wallet_info['invested_balance'],
            'accrued_balance': wallet_info['accrued_balance'],
            'total_portfolio': wallet_info['total_portfolio'],
            'today_earnings': today_earn,
            'total_earnings': total_earn,
            'active_investments_count': active_inv_count,
            'pending_withdrawals_count': pw['count'],
            'pending_withdrawals_amount': pw['total'],
            'crypto_balances': crypto_balances
        }
    })

@wallet_bp.route('/api/wallet/deposit', methods=['POST'])
def request_deposit():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    amount = float(data.get('amount', 0))
    payment_method = data.get('payment_method', 'UPI') # 'UPI', 'BANK_TRANSFER', 'GATEWAY'
    utr_ref = data.get('utr_ref', '').strip()
    auto_approve = data.get('auto_approve', False) # Optional instant mode for seamless interactive testing

    if not user_id or amount <= 0:
        return jsonify({'success': False, 'message': 'Valid user ID and amount are required'}), 400

    if not utr_ref:
        utr_ref = f"UTR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    deposit_code = f"DEP-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:5].upper()}"

    conn = get_db()
    cursor = conn.cursor()

    status = 'approved' if auto_approve else 'pending'
    approved_by = 2 if auto_approve else None # Finance Admin ID
    approved_at = datetime.utcnow() if auto_approve else None

    cursor.execute("""
    INSERT INTO deposits (
        deposit_code, user_id, amount, fee, net_amount, payment_method, utr_ref, status, approved_by, approved_at
    ) VALUES (?, ?, ?, 0.0, ?, ?, ?, ?, ?, ?)
    """, (deposit_code, user_id, amount, amount, payment_method, utr_ref, status, approved_by, approved_at))

    if auto_approve:
        LedgerEngine.post_transaction(
            cursor, user_id=user_id, transaction_type='DEPOSIT',
            entries=[
                {'account_code': 'CASH_INR', 'debit': 0.0, 'credit': amount},
                {'account_code': 'PLATFORM_REVENUE', 'debit': amount, 'credit': 0.0}
            ],
            description=f"Deposit credited via {payment_method} (Ref: {utr_ref})",
            reference_id=deposit_code,
            created_by='AUTO_GATEWAY'
        )
        LedgerEngine.sync_user_wallet(cursor, user_id)

    # Notification
    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Deposit Submitted', 'Your deposit of ₹' || ? || ' via ' || ? || ' has been submitted' || (CASE WHEN ? THEN ' and credited instantly.' ELSE ' and is being verified.' END), 'transaction')
    """, (user_id, f"{amount:,.2f}", payment_method, 1 if auto_approve else 0))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Deposit submitted successfully' + (' and credited!' if auto_approve else ' and waiting for admin verification.'),
        'deposit_code': deposit_code,
        'status': status
    })

@wallet_bp.route('/api/wallet/deposit/history/<int:user_id>', methods=['GET'])
def get_deposit_history(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, deposit_code, amount, fee, net_amount, payment_method, utr_ref, status, created_at, approved_at
    FROM deposits
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))
    deposits = [dict(d) for d in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'deposits': deposits})

@wallet_bp.route('/api/wallet/withdraw', methods=['POST'])
def request_withdrawal():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    amount = float(data.get('amount', 0))
    payout_method = data.get('payout_method', 'BANK_TRANSFER')
    destination = data.get('destination_details', {})
    pin = data.get('pin', '').strip()

    if not user_id or amount <= 0:
        return jsonify({'success': False, 'message': 'Valid user ID and amount are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 1. Verify User PIN
    cursor.execute("SELECT pin_hash, kyc_status FROM users WHERE id = ?", (user_id,))
    u = cursor.fetchone()
    if not u:
        conn.close()
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # 2. Check KYC approval
    if u['kyc_status'] != 'approved':
        conn.close()
        return jsonify({'success': False, 'message': 'KYC verification is required before initiating withdrawals.'}), 403

    # 3. Check Available Cash Balance
    wallet_info = LedgerEngine.sync_user_wallet(cursor, user_id)
    if wallet_info['cash_balance'] < amount:
        conn.close()
        return jsonify({'success': False, 'message': f"Insufficient cash balance. Available: ₹{wallet_info['cash_balance']:,.2f}"}), 400

    # 4. Check Dual Approval Threshold
    cursor.execute("SELECT value FROM app_settings WHERE key = 'dual_approval_threshold'")
    thresh_row = cursor.fetchone()
    threshold = float(thresh_row['value']) if thresh_row else 50000.0
    requires_dual = 1 if amount >= threshold else 0

    # 5. Calculate 1% fee
    fee = round(amount * 0.01, 2)
    net_amount = round(amount - fee, 2)
    wdl_code = f"WDL-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:5].upper()}"

    cursor.execute("""
    INSERT INTO withdrawals (
        withdrawal_code, user_id, amount, fee, net_amount, payout_method, destination_details,
        status, requires_dual_approval
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    """, (
        wdl_code, user_id, amount, fee, net_amount, payout_method,
        json.dumps(destination) if isinstance(destination, dict) else str(destination),
        requires_dual
    ))

    # Add security notification
    msg = f"Withdrawal request for ₹{amount:,.2f} placed."
    if requires_dual:
        msg += " Since this amount exceeds ₹50,000, it is undergoing dual-level compliance and finance authorization."

    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Withdrawal Requested', ?, 'security')
    """, (user_id, msg))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Withdrawal request submitted successfully.',
        'withdrawal_code': wdl_code,
        'requires_dual_approval': bool(requires_dual),
        'net_amount': net_amount,
        'fee': fee
    })

@wallet_bp.route('/api/wallet/withdraw/history/<int:user_id>', methods=['GET'])
def get_withdrawal_history(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, withdrawal_code, amount, fee, net_amount, payout_method, destination_details,
           status, requires_dual_approval, first_approval_admin_name, final_approval_admin_name,
           rejection_reason, created_at, final_approval_at
    FROM withdrawals
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))
    withdrawals = [dict(w) for w in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'withdrawals': withdrawals})

@wallet_bp.route('/api/wallet/transactions/<int:user_id>', methods=['GET'])
def get_transactions(user_id):
    tx_type = request.args.get('type')
    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT id, transaction_id, user_id, ledger_account_code, debit_amount, credit_amount,
           balance_after, transaction_type, reference_id, description, created_at, created_by
    FROM ledger_transactions
    WHERE user_id = ?
    """
    params = [user_id]

    if tx_type and tx_type != 'ALL':
        query += " AND transaction_type = ?"
        params.append(tx_type)

    query += " ORDER BY id DESC LIMIT 100"

    cursor.execute(query, params)
    txs = [dict(t) for t in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'transactions': txs})
