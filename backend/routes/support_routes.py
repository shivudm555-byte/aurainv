import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import get_db

support_bp = Blueprint('support_bp', __name__)

FAQS = [
    {
        'category': 'General',
        'question': 'How does the Antigravity Investment Platform work?',
        'answer': 'Antigravity is a quantitative investment platform that allows retail and institutional investors to deploy capital into structured yield strategies, institutional liquidity bonds, and green energy infrastructure funds with daily return accruals.'
    },
    {
        'category': 'KYC & Verification',
        'question': 'Why is KYC required and how long does verification take?',
        'answer': 'Under statutory AML (Anti-Money Laundering) and PMLA guidelines, identity verification (PAN / Aadhaar / Passport) is mandatory before deposits and withdrawals. Automated verification usually completes within 15 minutes.'
    },
    {
        'category': 'Deposits & Withdrawals',
        'question': 'What are the withdrawal limits and dual-approval requirements?',
        'answer': 'Standard withdrawals under ₹50,000 are processed instantly by the automated finance rail. High-value withdrawals above ₹50,000 require dual-admin authorization (Finance Admin + Operations Admin) for maximum security against unauthorized access.'
    },
    {
        'category': 'Returns & Accruals',
        'question': 'Are returns guaranteed?',
        'answer': 'Returns represent projected annual yield (APY) based on institutional fund strategies. No statutory guarantee is implied unless explicitly stated for sovereign-backed instruments. Capital protection tiers are detailed on each plan.'
    },
    {
        'category': 'Crypto / VDA',
        'question': 'How is cryptocurrency / VDA handled on the platform?',
        'answer': 'The VDA module operates as a separate compliance-ready asset gateway supporting BTC, ETH, USDT, and SOL with multi-signature cold storage and strict network confirmation rules.'
    }
]

@support_bp.route('/api/support/faqs', methods=['GET'])
def get_faqs():
    return jsonify({'success': True, 'faqs': FAQS})

@support_bp.route('/api/support/tickets/<int:user_id>', methods=['GET'])
def get_user_tickets(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, ticket_code, subject, category, priority, status, created_at, updated_at
    FROM support_tickets
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))
    tickets = [dict(t) for t in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'tickets': tickets})

@support_bp.route('/api/support/tickets', methods=['POST'])
def create_ticket():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    subject = data.get('subject', '').strip()
    category = data.get('category', 'general')
    priority = data.get('priority', 'medium')
    message = data.get('message', '').strip()

    if not user_id or not subject or not message:
        return jsonify({'success': False, 'message': 'Subject and message are required'}), 400

    ticket_code = f"TCK-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO support_tickets (ticket_code, user_id, subject, category, priority, status)
    VALUES (?, ?, ?, ?, ?, 'open')
    """, (ticket_code, user_id, subject, category, priority))
    ticket_id = cursor.lastrowid

    # Fetch user name
    cursor.execute("SELECT full_name FROM users WHERE id = ?", (user_id,))
    u = cursor.fetchone()
    user_name = u['full_name'] if u else 'User'

    cursor.execute("""
    INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
    VALUES (?, 'user', ?, ?)
    """, (ticket_id, user_name, message))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Support ticket submitted successfully. A support specialist will respond shortly.',
        'ticket_code': ticket_code,
        'ticket_id': ticket_id
    })

@support_bp.route('/api/support/tickets/<int:ticket_id>/messages', methods=['GET'])
def get_ticket_messages(ticket_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM support_tickets WHERE id = ?", (ticket_id,))
    ticket = cursor.fetchone()
    if not ticket:
        conn.close()
        return jsonify({'success': False, 'message': 'Ticket not found'}), 404

    cursor.execute("""
    SELECT id, sender_type, sender_name, message, created_at
    FROM ticket_messages
    WHERE ticket_id = ?
    ORDER BY id ASC
    """, (ticket_id,))
    messages = [dict(m) for m in cursor.fetchall()]
    conn.close()

    return jsonify({
        'success': True,
        'ticket': dict(ticket),
        'messages': messages
    })

@support_bp.route('/api/support/tickets/<int:ticket_id>/messages', methods=['POST'])
def send_ticket_message(ticket_id):
    data = request.get_json() or {}
    sender_type = data.get('sender_type', 'user') # 'user' or 'admin'
    sender_name = data.get('sender_name', 'User')
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'success': False, 'message': 'Message cannot be empty'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
    VALUES (?, ?, ?, ?)
    """, (ticket_id, sender_type, sender_name, message))

    # Update ticket status if admin replied
    if sender_type == 'admin':
        cursor.execute("UPDATE support_tickets SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (ticket_id,))
    else:
        cursor.execute("UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (ticket_id,))

    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Message sent successfully'})
