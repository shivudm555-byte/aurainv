import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from database import get_db
from models.ledger import LedgerEngine

invest_bp = Blueprint('invest_bp', __name__)

@invest_bp.route('/api/invest/plans', methods=['GET'])
def get_plans():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, name, slug, tagline, description, min_amount, max_amount, duration_days,
           daily_roi_pct, payout_frequency, risk_level, capital_guarantee, status
    FROM investment_plans
    WHERE status = 'active'
    ORDER BY min_amount ASC
    """)
    plans = [dict(p) for p in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'plans': plans})

@invest_bp.route('/api/invest/create', methods=['POST'])
def create_investment():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    plan_id = data.get('plan_id')
    amount = float(data.get('amount', 0))

    if not user_id or not plan_id or amount <= 0:
        return jsonify({'success': False, 'message': 'Valid user ID, plan ID and amount are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 1. Fetch Plan
    cursor.execute("SELECT * FROM investment_plans WHERE id = ? AND status = 'active'", (plan_id,))
    plan = cursor.fetchone()
    if not plan:
        conn.close()
        return jsonify({'success': False, 'message': 'Investment plan not found or inactive'}), 404

    if amount < plan['min_amount'] or amount > plan['max_amount']:
        conn.close()
        return jsonify({
            'success': False, 
            'message': f"Amount must be between ₹{plan['min_amount']:,.0f} and ₹{plan['max_amount']:,.0f}"
        }), 400

    # 2. Check User Cash Balance
    wallet_info = LedgerEngine.sync_user_wallet(cursor, user_id)
    if wallet_info['cash_balance'] < amount:
        conn.close()
        return jsonify({
            'success': False,
            'message': f"Insufficient cash balance (Available: ₹{wallet_info['cash_balance']:,.2f}). Please deposit funds first."
        }), 400

    # 3. Create User Investment
    inv_code = f"INV-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    start_date = datetime.utcnow()
    maturity_date = start_date + timedelta(days=plan['duration_days'])

    cursor.execute("""
    INSERT INTO user_investments (
        investment_code, user_id, plan_id, principal_amount, daily_roi_pct, total_accrued,
        start_date, maturity_date, status, last_accrual_date
    ) VALUES (?, ?, ?, ?, ?, 0.0, ?, ?, 'active', CURRENT_TIMESTAMP)
    """, (inv_code, user_id, plan_id, amount, plan['daily_roi_pct'], start_date, maturity_date))
    
    inv_id = cursor.lastrowid

    # 4. Post Double-Entry Ledger Transaction: Move Cash to Investment Principal
    LedgerEngine.post_transaction(
        cursor, user_id=user_id, transaction_type='INVEST_PRINCIPAL',
        entries=[
            {'account_code': 'CASH_INR', 'debit': amount, 'credit': 0.0},
            {'account_code': 'INVESTMENT_PRINCIPAL', 'debit': 0.0, 'credit': amount}
        ],
        description=f"Subscribed ₹{amount:,.2f} to {plan['name']} (Tenure: {plan['duration_days']} Days)",
        reference_id=inv_code,
        created_by=f"USER_{user_id}"
    )

    # 5. Check Referral Commission (5% of invested amount)
    cursor.execute("SELECT referred_by FROM users WHERE id = ?", (user_id,))
    ref_row = cursor.fetchone()
    if ref_row and ref_row['referred_by']:
        cursor.execute("SELECT id, full_name FROM users WHERE referral_code = ?", (ref_row['referred_by'],))
        referrer = cursor.fetchone()
        if referrer:
            commission_amt = round(amount * 0.05, 2)
            cursor.execute("""
            INSERT INTO referral_commissions (
                referrer_id, referee_id, investment_id, commission_amount, commission_pct, status
            ) VALUES (?, ?, ?, ?, 5.0, 'paid')
            """, (referrer['id'], user_id, inv_id, commission_amt))

            # Post Referral Ledger Transaction directly to referrer available cash
            LedgerEngine.post_transaction(
                cursor, user_id=referrer['id'], transaction_type='REFERRAL_COMMISSION',
                entries=[
                    {'account_code': 'PLATFORM_REVENUE', 'debit': commission_amt, 'credit': 0.0},
                    {'account_code': 'CASH_INR', 'debit': 0.0, 'credit': commission_amt}
                ],
                description=f"5% Referral commission from referee on {inv_code}",
                reference_id=inv_code,
                created_by='REFERRAL_ENGINE'
            )
            # Reconcile Referrer wallet
            LedgerEngine.sync_user_wallet(cursor, referrer['id'])
            
            # Referrer Notification
            cursor.execute("""
            INSERT INTO notifications (user_id, title, message, category)
            VALUES (?, 'Referral Reward Credited', 'You earned ₹' || ? || ' commission on your referee investment!', 'transaction')
            """, (referrer['id'], f"{commission_amt:,.2f}"))

    # Reconcile User Wallet
    updated_wallet = LedgerEngine.sync_user_wallet(cursor, user_id)

    # Add Investment Notification
    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Investment Active', 'Your investment of ₹' || ? || ' in ' || ? || ' is now generating daily returns.', 'investment')
    """, (user_id, f"{amount:,.2f}", plan['name']))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Successfully invested ₹{amount:,.2f} in {plan['name']}!",
        'investment_code': inv_code,
        'wallet': updated_wallet
    })

@invest_bp.route('/api/invest/my-investments/<int:user_id>', methods=['GET'])
def get_my_investments(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT ui.id, ui.investment_code, ui.principal_amount, ui.daily_roi_pct, ui.total_accrued,
           ui.start_date, ui.maturity_date, ui.status, ui.last_accrual_date,
           p.name as plan_name, p.duration_days, p.payout_frequency, p.risk_level
    FROM user_investments ui
    JOIN investment_plans p ON ui.plan_id = p.id
    WHERE ui.user_id = ?
    ORDER BY ui.id DESC
    """, (user_id,))
    
    rows = cursor.fetchall()
    investments = []
    total_active_principal = 0.0
    total_accrued_all = 0.0

    for r in rows:
        item = dict(r)
        if item['status'] == 'active':
            total_active_principal += item['principal_amount']
        total_accrued_all += item['total_accrued']
        investments.append(item)

    conn.close()

    return jsonify({
        'success': True,
        'investments': investments,
        'summary': {
            'total_invested': total_active_principal,
            'total_accrued': total_accrued_all,
            'active_count': sum(1 for i in investments if i['status'] == 'active')
        }
    })
