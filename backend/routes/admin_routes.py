import uuid
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from database import get_db
from models.ledger import LedgerEngine

admin_bp = Blueprint('admin_bp', __name__)

def log_audit(cursor, admin_id, admin_name, action, target_type, target_id, details=None, ip='127.0.0.1'):
    cursor.execute("""
    INSERT INTO audit_logs (admin_id, admin_name, action, target_type, target_id, details_json, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        admin_id, admin_name, action, target_type, str(target_id),
        json.dumps(details) if isinstance(details, dict) else str(details or '{}'),
        ip
    ))

# -------------------------------------------------------------
# 1. ADMIN DASHBOARD & METRICS
# -------------------------------------------------------------
@admin_bp.route('/api/admin/dashboard', methods=['GET'])
def get_dashboard_metrics():
    conn = get_db()
    cursor = conn.cursor()

    # User counts
    cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM users WHERE role = 'user'")
    u_data = cursor.fetchone()
    total_users = u_data['total'] or 0
    active_users = u_data['active'] or 0

    # KYC counts
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE kyc_status = 'pending'")
    pending_kyc = cursor.fetchone()['count'] or 0

    # Deposit totals
    cursor.execute("SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0.0) as total_amt FROM deposits WHERE status = 'approved'")
    dep_data = cursor.fetchone()
    total_deposits = dep_data['total_amt']

    cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0.0) as total_amt FROM deposits WHERE status = 'pending'")
    p_dep = cursor.fetchone()
    pending_deposits_count = p_dep['count'] or 0
    pending_deposits_amount = p_dep['total_amt'] or 0.0

    # Withdrawal totals
    cursor.execute("SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0.0) as total_amt FROM withdrawals WHERE status = 'completed'")
    wdl_data = cursor.fetchone()
    total_withdrawals = wdl_data['total_amt']

    cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0.0) as total_amt FROM withdrawals WHERE status IN ('pending', 'pending_second_approval')")
    p_wdl = cursor.fetchone()
    pending_withdrawals_count = p_wdl['count'] or 0
    pending_withdrawals_amount = p_wdl['total_amt'] or 0.0

    # Investments & Accruals
    cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(principal_amount), 0.0) as total_principal, COALESCE(SUM(total_accrued), 0.0) as total_accrued FROM user_investments WHERE status = 'active'")
    inv_data = cursor.fetchone()
    total_investments = inv_data['total_principal']
    total_accrued_earnings = inv_data['total_accrued']

    # Platform Revenue (Ledger Fees + Platform Spread)
    cursor.execute("SELECT COALESCE(SUM(credit_amount), 0.0) as revenue FROM ledger_transactions WHERE ledger_account_code = 'PLATFORM_FEES'")
    fee_rev = cursor.fetchone()['revenue'] or 0.0
    platform_revenue = fee_rev + (total_investments * 0.02) # Simulated 2% AUM management revenue

    # Crypto Tx volume
    cursor.execute("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0.0) as vol FROM crypto_transactions")
    crypto_data = cursor.fetchone()
    crypto_tx_count = crypto_data['count'] or 0

    # Chart 1: User Growth (Past 6 Months / Weeks)
    chart_growth = [
        {'period': 'May', 'users': 120, 'active': 95},
        {'period': 'Jun', 'users': 240, 'active': 190},
        {'period': 'Jul', 'users': 480, 'active': 410},
        {'period': 'Aug (Current)', 'users': max(total_users, 650), 'active': max(active_users, 520)}
    ]

    # Chart 2: Deposits vs Withdrawals
    chart_cashflow = [
        {'period': 'May', 'deposits': 450000, 'withdrawals': 120000},
        {'period': 'Jun', 'deposits': 820000, 'withdrawals': 260000},
        {'period': 'Jul', 'deposits': 1450000, 'withdrawals': 480000},
        {'period': 'Aug', 'deposits': max(total_deposits, 1950000), 'withdrawals': max(total_withdrawals, 650000)}
    ]

    # Chart 3: Investment Distribution by Plan
    cursor.execute("""
    SELECT p.name, COALESCE(SUM(ui.principal_amount), 0.0) as value
    FROM investment_plans p
    LEFT JOIN user_investments ui ON p.id = ui.plan_id AND ui.status = 'active'
    GROUP BY p.id
    """)
    chart_plans = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        'success': True,
        'metrics': {
            'total_users': total_users,
            'active_users': active_users,
            'pending_kyc': pending_kyc,
            'total_deposits': total_deposits,
            'pending_deposits_count': pending_deposits_count,
            'pending_deposits_amount': pending_deposits_amount,
            'total_withdrawals': total_withdrawals,
            'pending_withdrawals_count': pending_withdrawals_count,
            'pending_withdrawals_amount': pending_withdrawals_amount,
            'total_investments': total_investments,
            'total_accrued_earnings': total_accrued_earnings,
            'platform_revenue': round(platform_revenue, 2),
            'crypto_tx_count': crypto_tx_count
        },
        'charts': {
            'growth': chart_growth,
            'cashflow': chart_cashflow,
            'plan_distribution': chart_plans
        }
    })

# -------------------------------------------------------------
# 2. USER MANAGEMENT
# -------------------------------------------------------------
@admin_bp.route('/api/admin/users', methods=['GET'])
def get_all_users():
    search = request.args.get('search', '').strip().lower()
    status_filter = request.args.get('status')
    kyc_filter = request.args.get('kyc_status')

    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.kyc_status,
           u.is_2fa_enabled, u.referral_code, u.referred_by, u.created_at, u.last_login,
           w.cash_balance, w.invested_balance, w.accrued_balance
    FROM users u
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE 1=1
    """
    params = []

    if search:
        query += " AND (LOWER(u.full_name) LIKE ? OR LOWER(u.email) LIKE ? OR u.phone LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    if status_filter and status_filter != 'ALL':
        query += " AND u.status = ?"
        params.append(status_filter)

    if kyc_filter and kyc_filter != 'ALL':
        query += " AND u.kyc_status = ?"
        params.append(kyc_filter)

    query += " ORDER BY u.id ASC"

    cursor.execute(query, params)
    users = [dict(u) for u in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'users': users})

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['GET'])
def get_user_detail(user_id):
    conn = get_db()
    cursor = conn.cursor()

    # User & Profile
    cursor.execute("""
    SELECT u.*, p.dob, p.address, p.city, p.state, p.country, p.postal_code, p.avatar_url
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
    """, (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # Wallet
    wallet = LedgerEngine.sync_user_wallet(cursor, user_id)

    # KYC
    cursor.execute("SELECT * FROM kyc_records WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    kyc = cursor.fetchone()

    # Bank Accounts
    cursor.execute("SELECT * FROM bank_accounts WHERE user_id = ?", (user_id,))
    banks = [dict(b) for b in cursor.fetchall()]

    # Investments
    cursor.execute("""
    SELECT ui.*, p.name as plan_name, p.duration_days
    FROM user_investments ui
    JOIN investment_plans p ON ui.plan_id = p.id
    WHERE ui.user_id = ?
    """, (user_id,))
    investments = [dict(i) for i in cursor.fetchall()]

    # Deposits
    cursor.execute("SELECT * FROM deposits WHERE user_id = ? ORDER BY id DESC", (user_id,))
    deposits = [dict(d) for d in cursor.fetchall()]

    # Withdrawals
    cursor.execute("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY id DESC", (user_id,))
    withdrawals = [dict(w) for w in cursor.fetchall()]

    # Ledger Transactions
    cursor.execute("SELECT * FROM ledger_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 50", (user_id,))
    txs = [dict(t) for t in cursor.fetchall()]

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'user': dict(user),
        'wallet': wallet,
        'kyc': dict(kyc) if kyc else None,
        'bank_accounts': banks,
        'investments': investments,
        'deposits': deposits,
        'withdrawals': withdrawals,
        'transactions': txs
    })

@admin_bp.route('/api/admin/users/status', methods=['POST'])
def toggle_user_status():
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 1)
    admin_name = data.get('admin_name', 'Super Admin')
    user_id = data.get('user_id')
    new_status = data.get('status') # 'active', 'suspended'

    if not user_id or new_status not in ['active', 'suspended']:
        return jsonify({'success': False, 'message': 'Invalid user ID or status'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, user_id))
    log_audit(cursor, admin_id, admin_name, f"USER_STATUS_{new_status.upper()}", "USER", user_id, {'status': new_status})
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f"User status updated to {new_status}"})

# -------------------------------------------------------------
# 3. KYC MANAGEMENT
# -------------------------------------------------------------
@admin_bp.route('/api/admin/kyc/records', methods=['GET'])
def get_kyc_records():
    status = request.args.get('status')
    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT k.*, u.full_name, u.email, u.phone
    FROM kyc_records k
    JOIN users u ON k.user_id = u.id
    WHERE 1=1
    """
    params = []
    if status and status != 'ALL':
        query += " AND k.status = ?"
        params.append(status)

    query += " ORDER BY k.id DESC"
    cursor.execute(query, params)
    records = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'records': records})

@admin_bp.route('/api/admin/kyc/review', methods=['POST'])
def review_kyc():
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 3)
    admin_name = data.get('admin_name', 'KYC Compliance Admin')
    kyc_id = data.get('kyc_id')
    action = data.get('action') # 'approve' or 'reject'
    reason = data.get('reason', '')

    if not kyc_id or action not in ['approve', 'reject']:
        return jsonify({'success': False, 'message': 'Invalid KYC ID or action'}), 400

    if action == 'reject' and not reason.strip():
        return jsonify({'success': False, 'message': 'Mandatory rejection reason required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM kyc_records WHERE id = ?", (kyc_id,))
    k_row = cursor.fetchone()
    if not k_row:
        conn.close()
        return jsonify({'success': False, 'message': 'KYC record not found'}), 404

    user_id = k_row['user_id']
    status = 'approved' if action == 'approve' else 'rejected'

    cursor.execute("""
    UPDATE kyc_records
    SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (status, reason if action == 'reject' else None, admin_id, kyc_id))

    cursor.execute("UPDATE users SET kyc_status = ? WHERE id = ?", (status, user_id))

    notif_msg = 'Your KYC verification has been approved! You now have full access to investment plans and withdrawal limits.' if action == 'approve' else f"Your KYC submission was rejected: {reason}. Please re-upload clear documents."
    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, ?, ?, 'kyc')
    """, (user_id, f"KYC {status.capitalize()}", notif_msg))

    log_audit(cursor, admin_id, admin_name, f"KYC_{action.upper()}", "KYC", kyc_id, {'user_id': user_id, 'reason': reason})

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f"KYC record has been {status} successfully."})

# -------------------------------------------------------------
# 4. INVESTMENT PLANS MANAGEMENT
# -------------------------------------------------------------
@admin_bp.route('/api/admin/plans', methods=['GET'])
def get_all_plans():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM investment_plans ORDER BY id ASC")
    plans = [dict(p) for p in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'plans': plans})

@admin_bp.route('/api/admin/plans', methods=['POST'])
def create_or_update_plan():
    data = request.get_json() or {}
    plan_id = data.get('id')
    name = data.get('name', '').strip()
    tagline = data.get('tagline', '')
    description = data.get('description', '')
    min_amt = float(data.get('min_amount', 1000))
    max_amt = float(data.get('max_amount', 100000))
    duration = int(data.get('duration_days', 30))
    daily_roi = float(data.get('daily_roi_pct', 0.05))
    payout_freq = data.get('payout_frequency', 'daily')
    risk_level = data.get('risk_level', 'Moderate')
    status = data.get('status', 'active')
    admin_id = data.get('admin_id', 1)
    admin_name = data.get('admin_name', 'Operations Admin')

    if not name:
        return jsonify({'success': False, 'message': 'Plan name is required'}), 400

    slug = name.lower().replace(' ', '-')
    conn = get_db()
    cursor = conn.cursor()

    if plan_id:
        cursor.execute("""
        UPDATE investment_plans
        SET name = ?, tagline = ?, description = ?, min_amount = ?, max_amount = ?,
            duration_days = ?, daily_roi_pct = ?, payout_frequency = ?, risk_level = ?, status = ?
        WHERE id = ?
        """, (name, tagline, description, min_amt, max_amt, duration, daily_roi, payout_freq, risk_level, status, plan_id))
        log_audit(cursor, admin_id, admin_name, "PLAN_UPDATED", "PLAN", plan_id, {'name': name})
    else:
        cursor.execute("""
        INSERT INTO investment_plans (
            name, slug, tagline, description, min_amount, max_amount, duration_days,
            daily_roi_pct, payout_frequency, risk_level, capital_guarantee, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (name, slug, tagline, description, min_amt, max_amt, duration, daily_roi, payout_freq, risk_level, status))
        plan_id = cursor.lastrowid
        log_audit(cursor, admin_id, admin_name, "PLAN_CREATED", "PLAN", plan_id, {'name': name})

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Investment plan saved successfully', 'plan_id': plan_id})

# -------------------------------------------------------------
# 5. EARNINGS ENGINE & MANUAL ADJUSTMENTS
# -------------------------------------------------------------
@admin_bp.route('/api/admin/accruals/run-cycle', methods=['POST'])
def run_accruals_cycle():
    """
    Simulates automated 24-hour daily accrual cycle across all active investments.
    """
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 4)
    admin_name = data.get('admin_name', 'Ops Accruals System')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT ui.id, ui.investment_code, ui.user_id, ui.principal_amount, ui.daily_roi_pct, ui.total_accrued,
           p.name as plan_name
    FROM user_investments ui
    JOIN investment_plans p ON ui.plan_id = p.id
    WHERE ui.status = 'active'
    """)
    active_invs = cursor.fetchall()

    processed_count = 0
    total_accrued_cycle = 0.0

    for inv in active_invs:
        # daily yield = principal * (daily_roi_pct / 100)
        daily_amount = round(inv['principal_amount'] * (inv['daily_roi_pct'] / 100.0), 2)
        new_total_accrued = round(inv['total_accrued'] + daily_amount, 2)

        # Update user_investments
        cursor.execute("""
        UPDATE user_investments
        SET total_accrued = ?, last_accrual_date = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (new_total_accrued, inv['id']))

        # Post to double-entry ledger: Debit PLATFORM_REVENUE, Credit ACCRUED_EARNINGS
        LedgerEngine.post_transaction(
            cursor, user_id=inv['user_id'], transaction_type='ACCRUAL_PAYOUT',
            entries=[
                {'account_code': 'PLATFORM_REVENUE', 'debit': daily_amount, 'credit': 0.0},
                {'account_code': 'ACCRUED_EARNINGS', 'debit': 0.0, 'credit': daily_amount}
            ],
            description=f"Daily ROI Accrual of ₹{daily_amount:,.2f} ({inv['daily_roi_pct']}%) on {inv['plan_name']}",
            reference_id=inv['investment_code'],
            created_by='ACCRUAL_CYCLE_RUNNER'
        )

        # Sync user wallet
        LedgerEngine.sync_user_wallet(cursor, inv['user_id'])

        # Notification
        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Daily Return Accrued', '₹' || ? || ' return accrued on ' || ? || ' (Principal: ₹' || ? || ')', 'investment')
        """, (inv['user_id'], f"{daily_amount:,.2f}", inv['plan_name'], f"{inv['principal_amount']:,.2f}"))

        processed_count += 1
        total_accrued_cycle += daily_amount

    log_audit(cursor, admin_id, admin_name, "ACCRUAL_CYCLE_EXECUTED", "SYSTEM", "ACCRUAL_BATCH", {
        'investments_processed': processed_count,
        'total_accrued_payout': total_accrued_cycle
    })

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Daily accrual cycle executed successfully for {processed_count} active investments.",
        'investments_processed': processed_count,
        'total_payout_amount': total_accrued_cycle
    })

@admin_bp.route('/api/admin/earnings/manual-adjustment', methods=['POST'])
def manual_adjustment():
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 2)
    admin_name = data.get('admin_name', 'Finance Admin')
    user_id = data.get('user_id')
    account_code = data.get('account_code', 'CASH_INR')
    adj_type = data.get('adjustment_type', 'CREDIT') # 'CREDIT' or 'DEBIT'
    amount = float(data.get('amount', 0))
    audit_reason = data.get('audit_reason', '').strip()

    if not user_id or amount <= 0 or not audit_reason:
        return jsonify({'success': False, 'message': 'User ID, positive amount and mandatory audit reason are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    if adj_type == 'CREDIT':
        entries = [
            {'account_code': 'PLATFORM_REVENUE', 'debit': amount, 'credit': 0.0},
            {'account_code': account_code, 'debit': 0.0, 'credit': amount}
        ]
    else:
        entries = [
            {'account_code': account_code, 'debit': amount, 'credit': 0.0},
            {'account_code': 'PLATFORM_REVENUE', 'debit': 0.0, 'credit': amount}
        ]

    tx_id, _ = LedgerEngine.post_transaction(
        cursor, user_id=user_id, transaction_type='MANUAL_ADJUSTMENT',
        entries=entries,
        description=f"Manual Admin {adj_type} on {account_code}: {audit_reason}",
        created_by=f"ADMIN_{admin_name}",
        audit_reason=audit_reason
    )

    updated_wallet = LedgerEngine.sync_user_wallet(cursor, user_id)

    log_audit(cursor, admin_id, admin_name, f"LEDGER_ADJUSTMENT_{adj_type}", "USER", user_id, {
        'account_code': account_code,
        'amount': amount,
        'reason': audit_reason,
        'tx_id': tx_id
    })

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Ledger adjustment {adj_type} of ₹{amount:,.2f} posted successfully.",
        'transaction_id': tx_id,
        'wallet': updated_wallet
    })

# -------------------------------------------------------------
# 6. DEPOSIT MANAGEMENT
# -------------------------------------------------------------
@admin_bp.route('/api/admin/deposits', methods=['GET'])
def get_all_deposits():
    status = request.args.get('status')
    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT d.*, u.full_name, u.email, u.phone
    FROM deposits d
    JOIN users u ON d.user_id = u.id
    WHERE 1=1
    """
    params = []
    if status and status != 'ALL':
        query += " AND d.status = ?"
        params.append(status)

    query += " ORDER BY d.id DESC"
    cursor.execute(query, params)
    deposits = [dict(d) for d in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'deposits': deposits})

@admin_bp.route('/api/admin/deposits/review', methods=['POST'])
def review_deposit():
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 2)
    admin_name = data.get('admin_name', 'Finance Admin')
    deposit_id = data.get('deposit_id')
    action = data.get('action') # 'approve' or 'reject'
    reason = data.get('reason', '')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM deposits WHERE id = ?", (deposit_id,))
    dep = cursor.fetchone()
    if not dep or dep['status'] != 'pending':
        conn.close()
        return jsonify({'success': False, 'message': 'Deposit not found or already processed'}), 404

    user_id = dep['user_id']
    amount = dep['amount']

    if action == 'approve':
        cursor.execute("""
        UPDATE deposits SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (admin_id, deposit_id))

        # Post to Double-Entry Ledger: Credit CASH_INR, Debit PLATFORM_REVENUE
        LedgerEngine.post_transaction(
            cursor, user_id=user_id, transaction_type='DEPOSIT',
            entries=[
                {'account_code': 'CASH_INR', 'debit': 0.0, 'credit': amount},
                {'account_code': 'PLATFORM_REVENUE', 'debit': amount, 'credit': 0.0}
            ],
            description=f"Approved {dep['payment_method']} Deposit ₹{amount:,.2f} (UTR: {dep['utr_ref']})",
            reference_id=dep['deposit_code'],
            created_by=f"ADMIN_{admin_name}"
        )

        LedgerEngine.sync_user_wallet(cursor, user_id)

        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Deposit Approved', 'Your deposit of ₹' || ? || ' has been approved and credited to your Cash Wallet.', 'transaction')
        """, (user_id, f"{amount:,.2f}"))

        log_audit(cursor, admin_id, admin_name, "DEPOSIT_APPROVED", "DEPOSIT", deposit_id, {'amount': amount, 'user_id': user_id})
    else:
        cursor.execute("""
        UPDATE deposits SET status = 'rejected', rejection_reason = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (reason or 'Payment reference could not be reconciled with banking records', admin_id, deposit_id))

        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Deposit Rejected', 'Your deposit of ₹' || ? || ' was rejected: ' || ?, 'transaction')
        """, (user_id, f"{amount:,.2f}", reason or 'Verification mismatch'))

        log_audit(cursor, admin_id, admin_name, "DEPOSIT_REJECTED", "DEPOSIT", deposit_id, {'reason': reason})

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': f"Deposit has been {action}d successfully."})

# -------------------------------------------------------------
# 7. WITHDRAWAL MANAGEMENT & DUAL-ADMIN APPROVAL
# -------------------------------------------------------------
@admin_bp.route('/api/admin/withdrawals', methods=['GET'])
def get_all_withdrawals():
    status = request.args.get('status')
    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT w.*, u.full_name, u.email, u.phone, u.kyc_status
    FROM withdrawals w
    JOIN users u ON w.user_id = u.id
    WHERE 1=1
    """
    params = []
    if status and status != 'ALL':
        query += " AND w.status = ?"
        params.append(status)

    query += " ORDER BY w.id DESC"
    cursor.execute(query, params)
    withdrawals = [dict(w) for w in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'withdrawals': withdrawals})

@admin_bp.route('/api/admin/withdrawals/approve-first', methods=['POST'])
def approve_withdrawal_first():
    """
    Finance Admin first-level approval.
    If amount < 50,000, completes directly.
    If amount >= 50,000, sets status to pending_second_approval.
    """
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 2)
    admin_name = data.get('admin_name', 'Meera Nambiar (Finance Admin)')
    withdrawal_id = data.get('withdrawal_id')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM withdrawals WHERE id = ?", (withdrawal_id,))
    w = cursor.fetchone()
    if not w or w['status'] != 'pending':
        conn.close()
        return jsonify({'success': False, 'message': 'Withdrawal not in pending state'}), 400

    if w['requires_dual_approval']:
        cursor.execute("""
        UPDATE withdrawals
        SET status = 'pending_second_approval',
            first_approval_by = ?,
            first_approval_at = CURRENT_TIMESTAMP,
            first_approval_admin_name = ?
        WHERE id = ?
        """, (admin_id, admin_name, withdrawal_id))

        log_audit(cursor, admin_id, admin_name, "WITHDRAWAL_FIRST_APPROVAL", "WITHDRAWAL", withdrawal_id, {
            'amount': w['amount'],
            'note': 'Passed 1st level Finance check. Awaiting 2nd level authorization.'
        })

        conn.commit()
        conn.close()
        return jsonify({
            'success': True,
            'message': '1st level approval granted. High-value withdrawal queued for 2nd Admin authorization.',
            'status': 'pending_second_approval'
        })
    else:
        # Complete directly for standard amounts
        return _finalize_withdrawal(conn, cursor, w, admin_id, admin_name, is_dual=False)

@admin_bp.route('/api/admin/withdrawals/approve-final', methods=['POST'])
def approve_withdrawal_final():
    """
    Second-level approval by Super Admin or Operations Admin.
    Finalizes the withdrawal, executes ledger posting, and releases funds.
    """
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 1)
    admin_name = data.get('admin_name', 'Vikramaditya Singhania (Super Admin)')
    withdrawal_id = data.get('withdrawal_id')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM withdrawals WHERE id = ?", (withdrawal_id,))
    w = cursor.fetchone()
    if not w or w['status'] != 'pending_second_approval':
        conn.close()
        return jsonify({'success': False, 'message': 'Withdrawal not in pending 2nd approval state'}), 400

    return _finalize_withdrawal(conn, cursor, w, admin_id, admin_name, is_dual=True)

def _finalize_withdrawal(conn, cursor, w, admin_id, admin_name, is_dual=False):
    user_id = w['user_id']
    amount = w['amount']
    fee = w['fee']
    net_amt = w['net_amount']

    # 1. Update Withdrawal row
    cursor.execute("""
    UPDATE withdrawals
    SET status = 'completed',
        final_approval_by = ?,
        final_approval_at = CURRENT_TIMESTAMP,
        final_approval_admin_name = ?
    WHERE id = ?
    """, (admin_id, admin_name, w['id']))

    # 2. Post to Double-Entry Ledger: Debit CASH_INR, Credit PLATFORM_FEES & PLATFORM_REVENUE
    LedgerEngine.post_transaction(
        cursor, user_id=user_id, transaction_type='WITHDRAWAL',
        entries=[
            {'account_code': 'CASH_INR', 'debit': amount, 'credit': 0.0},
            {'account_code': 'PLATFORM_FEES', 'debit': 0.0, 'credit': fee},
            {'account_code': 'PLATFORM_REVENUE', 'debit': 0.0, 'credit': net_amt}
        ],
        description=f"Processed Withdrawal ₹{amount:,.2f} (Net: ₹{net_amt:,.2f}, Fee: ₹{fee:,.2f})",
        reference_id=w['withdrawal_code'],
        created_by=f"ADMIN_{admin_name}"
    )

    # 3. Sync user wallet
    LedgerEngine.sync_user_wallet(cursor, user_id)

    # 4. User Notification
    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Withdrawal Completed', 'Your withdrawal of ₹' || ? || ' (Net: ₹' || ? || ') has been successfully disbursed to your bank account.', 'transaction')
    """, (user_id, f"{amount:,.2f}", f"{net_amt:,.2f}"))

    log_audit(cursor, admin_id, admin_name, "WITHDRAWAL_FINAL_COMPLETED", "WITHDRAWAL", w['id'], {
        'amount': amount,
        'net_amount': net_amt,
        'fee': fee,
        'dual_approval': is_dual
    })

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Withdrawal {w['withdrawal_code']} of ₹{amount:,.2f} approved and disbursed!",
        'status': 'completed'
    })

@admin_bp.route('/api/admin/withdrawals/reject', methods=['POST'])
def reject_withdrawal():
    data = request.get_json() or {}
    admin_id = data.get('admin_id', 2)
    admin_name = data.get('admin_name', 'Finance Admin')
    withdrawal_id = data.get('withdrawal_id')
    reason = data.get('reason', '').strip()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM withdrawals WHERE id = ?", (withdrawal_id,))
    w = cursor.fetchone()
    if not w:
        conn.close()
        return jsonify({'success': False, 'message': 'Withdrawal not found'}), 404

    cursor.execute("""
    UPDATE withdrawals
    SET status = 'rejected',
        rejection_reason = ?,
        final_approval_by = ?,
        final_approval_at = CURRENT_TIMESTAMP,
        final_approval_admin_name = ?
    WHERE id = ?
    """, (reason or 'Risk assessment flag / Invalid beneficiary bank account details', admin_id, admin_name, withdrawal_id))

    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Withdrawal Request Rejected', 'Your withdrawal request of ₹' || ? || ' was rejected: ' || ?, 'security')
    """, (w['user_id'], f"{w['amount']:,.2f}", reason or 'Compliance discrepancy'))

    log_audit(cursor, admin_id, admin_name, "WITHDRAWAL_REJECTED", "WITHDRAWAL", withdrawal_id, {'reason': reason})

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Withdrawal has been rejected.'})

# -------------------------------------------------------------
# 8. FINANCIAL LEDGER EXPLORER
# -------------------------------------------------------------
@admin_bp.route('/api/admin/ledger', methods=['GET'])
def get_ledger_records():
    account_code = request.args.get('account_code')
    tx_type = request.args.get('transaction_type')
    user_id = request.args.get('user_id')

    conn = get_db()
    cursor = conn.cursor()

    # Get accounts summary
    cursor.execute("SELECT * FROM ledger_accounts ORDER BY code ASC")
    accounts = [dict(a) for a in cursor.fetchall()]

    query = """
    SELECT lt.*, u.full_name as user_name, u.email as user_email
    FROM ledger_transactions lt
    LEFT JOIN users u ON lt.user_id = u.id
    WHERE 1=1
    """
    params = []

    if account_code and account_code != 'ALL':
        query += " AND lt.ledger_account_code = ?"
        params.append(account_code)

    if tx_type and tx_type != 'ALL':
        query += " AND lt.transaction_type = ?"
        params.append(tx_type)

    if user_id:
        query += " AND lt.user_id = ?"
        params.append(user_id)

    query += " ORDER BY lt.id DESC LIMIT 200"

    cursor.execute(query, params)
    transactions = [dict(t) for t in cursor.fetchall()]

    conn.close()

    return jsonify({
        'success': True,
        'accounts': accounts,
        'transactions': transactions
    })

# -------------------------------------------------------------
# 9. REPORTS GENERATOR
# -------------------------------------------------------------
@admin_bp.route('/api/admin/reports', methods=['GET'])
def generate_report():
    report_type = request.args.get('type', 'user') # 'user', 'kyc', 'deposit', 'withdrawal', 'investment', 'earnings', 'referral', 'crypto', 'revenue'
    
    conn = get_db()
    cursor = conn.cursor()

    data = []
    columns = []

    if report_type == 'user':
        columns = ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Status', 'KYC Status', 'Cash Bal (INR)', 'Invested (INR)', 'Accrued (INR)', 'Joined Date']
        cursor.execute("""
        SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.kyc_status,
               COALESCE(w.cash_balance, 0), COALESCE(w.invested_balance, 0), COALESCE(w.accrued_balance, 0), u.created_at
        FROM users u
        LEFT JOIN wallets w ON u.id = w.user_id
        ORDER BY u.id ASC
        """)
        data = [list(r) for r in cursor.fetchall()]

    elif report_type == 'kyc':
        columns = ['KYC ID', 'User ID', 'Name', 'Doc Type', 'ID Number', 'Status', 'Submitted At', 'Reviewed At', 'Reason']
        cursor.execute("""
        SELECT k.id, k.user_id, u.full_name, k.doc_type, k.id_number, k.status, k.submitted_at, k.reviewed_at, k.rejection_reason
        FROM kyc_records k
        JOIN users u ON k.user_id = u.id
        ORDER BY k.id DESC
        """)
        data = [list(r) for r in cursor.fetchall()]

    elif report_type == 'deposit':
        columns = ['Deposit Code', 'User Name', 'Amount (INR)', 'Method', 'UTR / Ref', 'Status', 'Approved At', 'Created At']
        cursor.execute("""
        SELECT d.deposit_code, u.full_name, d.amount, d.payment_method, d.utr_ref, d.status, d.approved_at, d.created_at
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        ORDER BY d.id DESC
        """)
        data = [list(r) for r in cursor.fetchall()]

    elif report_type == 'withdrawal':
        columns = ['Withdrawal Code', 'User Name', 'Gross Amount', 'Fee', 'Net Amount', 'Method', 'Status', 'Dual Approval', 'Approved By', 'Created At']
        cursor.execute("""
        SELECT w.withdrawal_code, u.full_name, w.amount, w.fee, w.net_amount, w.payout_method, w.status,
               CASE WHEN w.requires_dual_approval = 1 THEN 'YES' ELSE 'NO' END,
               COALESCE(w.final_approval_admin_name, w.first_approval_admin_name, 'None'), w.created_at
        FROM withdrawals w
        JOIN users u ON w.user_id = u.id
        ORDER BY w.id DESC
        """)
        data = [list(r) for r in cursor.fetchall()]

    elif report_type == 'investment':
        columns = ['Investment Code', 'User Name', 'Plan Name', 'Principal (INR)', 'Daily ROI %', 'Accrued Return', 'Status', 'Start Date', 'Maturity Date']
        cursor.execute("""
        SELECT ui.investment_code, u.full_name, p.name, ui.principal_amount, ui.daily_roi_pct, ui.total_accrued, ui.status, ui.start_date, ui.maturity_date
        FROM user_investments ui
        JOIN users u ON ui.user_id = u.id
        JOIN investment_plans p ON ui.plan_id = p.id
        ORDER BY ui.id DESC
        """)
        data = [list(r) for r in cursor.fetchall()]

    elif report_type == 'earnings':
        columns = ['Tx ID', 'User Name', 'Account', 'Credit (INR)', 'Debit (INR)', 'Balance After', 'Type', 'Description', 'Timestamp']
        cursor.execute("""
        SELECT lt.transaction_id, COALESCE(u.full_name, 'SYSTEM'), lt.ledger_account_code, lt.credit_amount, lt.debit_amount,
               lt.balance_after, lt.transaction_type, lt.description, lt.created_at
        FROM ledger_transactions lt
        LEFT JOIN users u ON lt.user_id = u.id
        WHERE lt.transaction_type IN ('ACCRUAL_PAYOUT', 'REFERRAL_COMMISSION', 'MANUAL_ADJUSTMENT')
        ORDER BY lt.id DESC
        """)
        data = [list(r) for r in cursor.fetchall()]

    elif report_type == 'revenue':
        columns = ['Tx ID', 'Account', 'Fee / Income (INR)', 'Type', 'Reference', 'Timestamp']
        cursor.execute("""
        SELECT lt.transaction_id, lt.ledger_account_code, lt.credit_amount, lt.transaction_type, lt.reference_id, lt.created_at
        FROM ledger_transactions lt
        WHERE lt.ledger_account_code IN ('PLATFORM_FEES', 'PLATFORM_REVENUE')
        ORDER BY lt.id DESC
        """)
        data = [list(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        'success': True,
        'report_type': report_type,
        'columns': columns,
        'rows': data,
        'total_records': len(data),
        'generated_at': datetime.utcnow().isoformat()
    })

# -------------------------------------------------------------
# 10. AUDIT LOGS & SETTINGS
# -------------------------------------------------------------
@admin_bp.route('/api/admin/audit-logs', methods=['GET'])
def get_audit_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, admin_id, admin_name, action, target_type, target_id, details_json, ip_address, created_at
    FROM audit_logs
    ORDER BY id DESC LIMIT 100
    """)
    logs = [dict(l) for l in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'logs': logs})

@admin_bp.route('/api/admin/settings', methods=['GET', 'PUT'])
def handle_settings():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'PUT':
        data = request.get_json() or {}
        for k, v in data.items():
            cursor.execute("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)", (k, str(v)))
        conn.commit()
        log_audit(cursor, 1, 'Super Admin', 'SETTINGS_UPDATED', 'CONFIG', 'APP_SETTINGS', data)

    cursor.execute("SELECT key, value FROM app_settings")
    settings = {r['key']: r['value'] for r in cursor.fetchall()}
    conn.close()

    return jsonify({'success': True, 'settings': settings})
