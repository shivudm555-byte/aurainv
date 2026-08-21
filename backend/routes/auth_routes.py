import hashlib
import json
import uuid
from flask import Blueprint, request, jsonify
from database import get_db

auth_bp = Blueprint('auth_bp', __name__)

def hash_val(val: str) -> str:
    return hashlib.sha256(val.encode('utf-8')).hexdigest()

@auth_bp.route('/api/auth/supabase-sync', methods=['POST'])
def supabase_sync():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    full_name = data.get('full_name', '').strip() or email.split('@')[0].capitalize()
    phone = data.get('phone', '').strip() or '+91 98000 00000'
    supabase_uid = data.get('supabase_uid', '').strip()
    referral_code = data.get('referral_code', '').strip()

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, full_name, email, phone, role, status, kyc_status, is_2fa_enabled, referral_code FROM users WHERE LOWER(email) = ?", (email,))
    user = cursor.fetchone()

    if not user:
        # Provision new user from Supabase Auth
        new_referral_code = f"{full_name[:3].upper()}{uuid.uuid4().hex[:4].upper()}"
        pw_hash = hash_val(f"supabase_{supabase_uid or email}")
        pin_hash = hash_val('1234')

        # Check referrer
        referrer = None
        if referral_code:
            cursor.execute("SELECT id FROM users WHERE referral_code = ?", (referral_code,))
            referrer = cursor.fetchone()

        cursor.execute("""
        INSERT INTO users (full_name, email, phone, password_hash, pin_hash, referral_code, referred_by, kyc_status, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'not_submitted', 'user', 'active')
        """, (full_name, email, phone, pw_hash, pin_hash, new_referral_code, referral_code if referrer else None))
        user_id = cursor.lastrowid

        # Profile & Wallet
        cursor.execute("""
        INSERT INTO user_profiles (user_id, dob, address, city, country)
        VALUES (?, '', '', '', 'India')
        """, (user_id,))

        cursor.execute("""
        INSERT INTO wallets (user_id, cash_balance, invested_balance, accrued_balance)
        VALUES (?, 0.0, 0.0, 0.0)
        """, (user_id,))

        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, category)
        VALUES (?, 'Welcome to Antigravity Fintech', 'Your account has been authenticated via Supabase. Complete your KYC to unlock full investment and withdrawal capabilities.', 'system')
        """, (user_id,))

        cursor.execute("SELECT id, full_name, email, phone, role, status, kyc_status, is_2fa_enabled, referral_code FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user['id'],))
    conn.commit()
    conn.close()

    user_dict = dict(user)
    token = f"sb-token-{uuid.uuid4().hex}"

    return jsonify({
        'success': True,
        'message': 'Supabase user authenticated & synchronized successfully',
        'token': token,
        'user': user_dict
    })

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    referral_code = data.get('referral_code', '').strip()

    if not full_name or not email or not phone or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check existing email/phone
    cursor.execute("SELECT id FROM users WHERE email = ? OR phone = ?", (email, phone))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'Email or phone already registered.'}), 400

    # Validate referral code if provided
    referrer = None
    if referral_code:
        cursor.execute("SELECT id, full_name FROM users WHERE referral_code = ?", (referral_code,))
        referrer = cursor.fetchone()

    new_referral_code = f"{full_name[:3].upper()}{uuid.uuid4().hex[:4].upper()}"
    pw_hash = hash_val(password)
    pin_hash = hash_val('1234') # default pin

    cursor.execute("""
    INSERT INTO users (full_name, email, phone, password_hash, pin_hash, referral_code, referred_by, kyc_status, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'not_submitted', 'user')
    """, (full_name, email, phone, pw_hash, pin_hash, new_referral_code, referral_code if referrer else None))
    
    user_id = cursor.lastrowid

    # Create empty profile & wallet
    cursor.execute("""
    INSERT INTO user_profiles (user_id, dob, address, city, country)
    VALUES (?, '', '', '', 'India')
    """, (user_id,))

    cursor.execute("""
    INSERT INTO wallets (user_id, cash_balance, invested_balance, accrued_balance)
    VALUES (?, 0.0, 0.0, 0.0)
    """, (user_id,))

    # Add welcome notification
    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Welcome to Antigravity Fintech', 'Your account has been created successfully. Complete your KYC to unlock full investment and withdrawal capabilities.', 'system')
    """, (user_id,))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Registration successful! Please login.',
        'user': {
            'id': user_id,
            'full_name': full_name,
            'email': email,
            'phone': phone,
            'role': 'user',
            'referral_code': new_referral_code
        }
    })

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('identifier', '').strip().lower()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Email/phone and password are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, full_name, email, phone, password_hash, role, status, kyc_status, is_2fa_enabled, referral_code
    FROM users
    WHERE LOWER(email) = ? OR phone = ?
    """, (identifier, identifier))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    if user['status'] == 'suspended':
        conn.close()
        return jsonify({'success': False, 'message': 'Account is suspended. Please contact compliance desk.'}), 403

    if user['password_hash'] != hash_val(password):
        conn.close()
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    # Update last login
    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user['id'],))
    conn.commit()
    conn.close()

    user_dict = dict(user)
    del user_dict['password_hash']
    token = f"jwt-token-{uuid.uuid4().hex}"

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'token': token,
        'user': user_dict
    })

@auth_bp.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    otp = data.get('otp', '').strip()
    # In prototype mode, any 6-digit OTP (e.g. 123456) or matches session
    if len(otp) == 6 or otp in ['123456', '888888', '000000']:
        return jsonify({'success': True, 'message': 'OTP verified successfully'})
    return jsonify({'success': False, 'message': 'Invalid OTP code. Please enter 6-digit code (e.g. 123456)'}), 400

@auth_bp.route('/api/auth/verify-pin', methods=['POST'])
def verify_pin():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    pin = data.get('pin', '').strip()

    if not user_id or not pin:
        return jsonify({'success': False, 'message': 'User ID and PIN are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT pin_hash FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # Check pin hash or standard demo default
    if user['pin_hash'] == hash_val(pin) or pin in ['1234', '0000', '9999']:
        return jsonify({'success': True, 'message': 'PIN verified successfully'})
    return jsonify({'success': False, 'message': 'Incorrect 4-digit Transaction PIN'}), 400

@auth_bp.route('/api/auth/set-pin', methods=['POST'])
def set_pin():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    new_pin = data.get('new_pin', '').strip()

    if not user_id or len(new_pin) != 4 or not new_pin.isdigit():
        return jsonify({'success': False, 'message': 'Valid 4-digit numeric PIN is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET pin_hash = ? WHERE id = ?", (hash_val(new_pin), user_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Transaction PIN updated successfully'})

@auth_bp.route('/api/auth/toggle-2fa', methods=['POST'])
def toggle_2fa():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    enable = 1 if data.get('enable') else 0

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET is_2fa_enabled = ? WHERE id = ?", (enable, user_id))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'is_2fa_enabled': enable, 'message': f"2FA has been {'enabled' if enable else 'disabled'}"})

@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    new_password = data.get('new_password', '')

    if not email or not new_password:
        return jsonify({'success': False, 'message': 'Email and new password are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({'success': False, 'message': 'User with this email not found'}), 404

    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hash_val(new_password), user['id']))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Password has been reset successfully. Please login.'})
