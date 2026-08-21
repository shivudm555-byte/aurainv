from flask import Blueprint, request, jsonify
from database import get_db

referral_bp = Blueprint('referral_bp', __name__)

@referral_bp.route('/api/referral/stats/<int:user_id>', methods=['GET'])
def get_referral_stats(user_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT referral_code FROM users WHERE id = ?", (user_id,))
    u = cursor.fetchone()
    if not u:
        conn.close()
        return jsonify({'success': False, 'message': 'User not found'}), 404

    ref_code = u['referral_code']

    # Total referred users
    cursor.execute("SELECT id, full_name, email, created_at, kyc_status FROM users WHERE referred_by = ?", (ref_code,))
    referees = [dict(r) for r in cursor.fetchall()]
    total_referees = len(referees)

    # Active investor referees
    active_referees_count = 0
    for r in referees:
        cursor.execute("SELECT COUNT(*) as count FROM user_investments WHERE user_id = ? AND status = 'active'", (r['id'],))
        if cursor.fetchone()['count'] > 0:
            active_referees_count += 1

    # Total commissions earned
    cursor.execute("""
    SELECT COALESCE(SUM(commission_amount), 0.0) as total_comm
    FROM referral_commissions
    WHERE referrer_id = ?
    """, (user_id,))
    total_comm = cursor.fetchone()['total_comm']

    # Recent commission logs
    cursor.execute("""
    SELECT rc.id, rc.commission_amount, rc.commission_pct, rc.status, rc.created_at,
           u.full_name as referee_name
    FROM referral_commissions rc
    JOIN users u ON rc.referee_id = u.id
    WHERE rc.referrer_id = ?
    ORDER BY rc.id DESC LIMIT 50
    """, (user_id,))
    commissions = [dict(c) for c in cursor.fetchall()]

    conn.close()

    return jsonify({
        'success': True,
        'referral_code': ref_code,
        'referral_link': f"https://invest.antigravity.finance/signup?ref={ref_code}",
        'commission_rate_pct': 5.0,
        'total_referees': total_referees,
        'active_investors': active_referees_count,
        'total_commissions_earned': total_comm,
        'referees': referees,
        'commissions_history': commissions
    })
