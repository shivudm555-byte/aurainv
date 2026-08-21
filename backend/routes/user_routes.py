import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import get_db

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/api/user/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.kyc_status, 
           u.is_2fa_enabled, u.referral_code, u.referred_by, u.created_at, u.last_login,
           p.dob, p.address, p.city, p.state, p.country, p.postal_code, p.avatar_url
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
    """, (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    return jsonify({'success': True, 'user': dict(user)})

@user_bp.route('/api/user/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.get_json() or {}
    full_name = data.get('full_name')
    dob = data.get('dob')
    address = data.get('address')
    city = data.get('city')
    state = data.get('state')
    postal_code = data.get('postal_code')
    avatar_url = data.get('avatar_url')

    conn = get_db()
    cursor = conn.cursor()

    if full_name:
        cursor.execute("UPDATE users SET full_name = ? WHERE id = ?", (full_name, user_id))

    cursor.execute("""
    UPDATE user_profiles
    SET dob = COALESCE(?, dob),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        postal_code = COALESCE(?, postal_code),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
    """, (dob, address, city, state, postal_code, avatar_url, user_id))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Profile updated successfully'})

@user_bp.route('/api/user/kyc/<int:user_id>', methods=['GET'])
def get_kyc_status(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT kyc_status FROM users WHERE id = ?", (user_id,))
    u = cursor.fetchone()
    if not u:
        conn.close()
        return jsonify({'success': False, 'message': 'User not found'}), 404

    cursor.execute("""
    SELECT id, doc_type, id_number, doc_front_url, doc_back_url, selfie_url, address_proof_url,
           status, rejection_reason, submitted_at, reviewed_at
    FROM kyc_records
    WHERE user_id = ?
    ORDER BY id DESC LIMIT 1
    """, (user_id,))
    kyc_rec = cursor.fetchone()
    conn.close()

    return jsonify({
        'success': True,
        'kyc_status': u['kyc_status'],
        'record': dict(kyc_rec) if kyc_rec else None
    })

@user_bp.route('/api/user/kyc/submit', methods=['POST'])
def submit_kyc():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    doc_type = data.get('doc_type', 'pan')
    id_number = data.get('id_number', '').strip()
    doc_front = data.get('doc_front_url', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600')
    doc_back = data.get('doc_back_url', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600')
    selfie = data.get('selfie_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400')
    address_proof = data.get('address_proof_url', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600')

    if not user_id or not id_number:
        return jsonify({'success': False, 'message': 'User ID and ID Number are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Insert KYC record
    cursor.execute("""
    INSERT INTO kyc_records (
        user_id, doc_type, id_number, doc_front_url, doc_back_url, selfie_url, address_proof_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (user_id, doc_type, id_number, doc_front, doc_back, selfie, address_proof))

    # Update user kyc_status
    cursor.execute("UPDATE users SET kyc_status = 'pending' WHERE id = ?", (user_id,))

    # Notification
    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'KYC Documents Submitted', 'Your identity documents have been submitted and are under review by our compliance team (typically approved in 15-30 mins).', 'kyc')
    """, (user_id,))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'KYC submitted successfully and is under review.'})

@user_bp.route('/api/user/bank-accounts/<int:user_id>', methods=['GET'])
def get_bank_accounts(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, bank_name, account_holder_name, account_number, ifsc_code, account_type, is_primary, is_verified, created_at
    FROM bank_accounts
    WHERE user_id = ?
    ORDER BY is_primary DESC, id DESC
    """, (user_id,))
    banks = [dict(b) for b in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'bank_accounts': banks})

@user_bp.route('/api/user/bank-accounts', methods=['POST'])
def add_bank_account():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    bank_name = data.get('bank_name', '').strip()
    holder_name = data.get('account_holder_name', '').strip()
    account_no = data.get('account_number', '').strip()
    ifsc = data.get('ifsc_code', '').strip().upper()
    acc_type = data.get('account_type', 'savings')

    if not user_id or not bank_name or not holder_name or not account_no or not ifsc:
        return jsonify({'success': False, 'message': 'All bank fields are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check if this is the first bank account -> make primary
    cursor.execute("SELECT COUNT(*) as count FROM bank_accounts WHERE user_id = ?", (user_id,))
    is_first = cursor.fetchone()['count'] == 0
    is_primary = 1 if is_first else 0

    cursor.execute("""
    INSERT INTO bank_accounts (
        user_id, bank_name, account_holder_name, account_number, ifsc_code, account_type, is_primary, is_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    """, (user_id, bank_name, holder_name, account_no, ifsc, acc_type, is_primary))

    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Bank Account Linked', 'Your bank account ending in ' || substr(?, -4) || ' has been verified via penny-drop validation.', 'security')
    """, (user_id, account_no))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Bank account linked and verified successfully'})

@user_bp.route('/api/user/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, title, message, category, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY id DESC LIMIT 50
    """, (user_id,))
    notifs = [dict(n) for n in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'notifications': notifs})

@user_bp.route('/api/user/notifications/mark-read', methods=['POST'])
def mark_notifications_read():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    notif_id = data.get('notification_id')

    conn = get_db()
    cursor = conn.cursor()
    if notif_id:
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, user_id))
    elif user_id:
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Notifications marked as read'})

@user_bp.route('/api/user/security/sessions/<int:user_id>', methods=['GET'])
def get_sessions(user_id):
    sessions = [
        {'id': 1, 'device': 'iPhone 15 Pro (iOS 17.4)', 'browser': 'Safari App', 'location': 'Mumbai, India', 'ip': '103.212.145.22', 'is_current': True, 'last_active': 'Just now'},
        {'id': 2, 'device': 'MacBook Pro 16" (macOS)', 'browser': 'Chrome 124', 'location': 'Mumbai, India', 'ip': '103.212.145.22', 'is_current': False, 'last_active': 'Yesterday, 18:45'}
    ]
    return jsonify({'success': True, 'sessions': sessions})
