import uuid
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import get_db

crypto_bp = Blueprint('crypto_bp', __name__)

CRYPTO_ASSETS_CONFIG = {
    'BTC': {
        'name': 'Bitcoin',
        'symbol': 'BTC',
        'icon': '₿',
        'price_usd': 68450.0,
        'price_inr': 5681350.0,
        'networks': ['Bitcoin (Native SegWit)', 'Lightning Network'],
        'deposit_addresses': {
            'Bitcoin (Native SegWit)': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
        },
        'min_deposit': 0.001,
        'min_withdraw': 0.002,
        'withdraw_fee': 0.0002
    },
    'ETH': {
        'name': 'Ethereum',
        'symbol': 'ETH',
        'icon': 'Ξ',
        'price_usd': 3540.0,
        'price_inr': 293820.0,
        'networks': ['Ethereum (ERC20)', 'Arbitrum One', 'Optimism'],
        'deposit_addresses': {
            'Ethereum (ERC20)': '0x3A8F2b16C97E43d89d4E76092F2694Cd4788102a',
            'Arbitrum One': '0x3A8F2b16C97E43d89d4E76092F2694Cd4788102a'
        },
        'min_deposit': 0.01,
        'min_withdraw': 0.02,
        'withdraw_fee': 0.0025
    },
    'USDT': {
        'name': 'Tether USD',
        'symbol': 'USDT',
        'icon': '₮',
        'price_usd': 1.00,
        'price_inr': 83.00,
        'networks': ['Tron (TRC20)', 'Ethereum (ERC20)', 'Solana (SPL)', 'BNB Smart Chain (BEP20)'],
        'deposit_addresses': {
            'Tron (TRC20)': 'TQj8e9m3kLmNwP7vYr2Qx6Z1bK5gD9sV',
            'Ethereum (ERC20)': '0x3A8F2b16C97E43d89d4E76092F2694Cd4788102a',
            'Solana (SPL)': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
        },
        'min_deposit': 10.0,
        'min_withdraw': 20.0,
        'withdraw_fee': 1.0
    },
    'SOL': {
        'name': 'Solana',
        'symbol': 'SOL',
        'icon': '◎',
        'price_usd': 178.50,
        'price_inr': 14815.50,
        'networks': ['Solana'],
        'deposit_addresses': {
            'Solana': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
        },
        'min_deposit': 0.1,
        'min_withdraw': 0.2,
        'withdraw_fee': 0.005
    }
}

@crypto_bp.route('/api/crypto/config', methods=['GET'])
def get_crypto_config():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM app_settings WHERE key = 'crypto_module_enabled'")
    row = cursor.fetchone()
    enabled = row['value'].lower() == 'true' if row else True
    conn.close()

    return jsonify({
        'success': True,
        'module_enabled': enabled,
        'compliance_disclaimer': 'Virtual Digital Assets (VDA) are unregulated in certain jurisdictions and involve substantial market & technological risks. No statutory guaranteed returns.',
        'assets': CRYPTO_ASSETS_CONFIG
    })

@crypto_bp.route('/api/crypto/balances/<int:user_id>', methods=['GET'])
def get_crypto_balances(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT crypto_balances_json FROM wallets WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    raw_balances = json.loads(row['crypto_balances_json']) if row and row['crypto_balances_json'] else {}
    
    formatted = []
    total_val_usd = 0.0
    total_val_inr = 0.0

    for symbol, cfg in CRYPTO_ASSETS_CONFIG.items():
        bal = raw_balances.get(symbol, 0.0)
        val_usd = bal * cfg['price_usd']
        val_inr = bal * cfg['price_inr']
        total_val_usd += val_usd
        total_val_inr += val_inr

        formatted.append({
            'asset': symbol,
            'name': cfg['name'],
            'icon': cfg['icon'],
            'balance': bal,
            'price_usd': cfg['price_usd'],
            'price_inr': cfg['price_inr'],
            'value_usd': round(val_usd, 2),
            'value_inr': round(val_inr, 2),
            'networks': cfg['networks']
        })

    return jsonify({
        'success': True,
        'balances': formatted,
        'total_crypto_value_usd': round(total_val_usd, 2),
        'total_crypto_value_inr': round(total_val_inr, 2)
    })

@crypto_bp.route('/api/crypto/deposit', methods=['POST'])
def submit_crypto_deposit():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    asset = data.get('asset', 'USDT').upper()
    network = data.get('network', 'Tron (TRC20)')
    amount = float(data.get('amount', 0))
    tx_hash = data.get('tx_hash', '').strip()

    if not user_id or amount <= 0:
        return jsonify({'success': False, 'message': 'User ID and positive amount required'}), 400

    if not tx_hash:
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"

    tx_code = f"CTX-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:5].upper()}"

    conn = get_db()
    cursor = conn.cursor()

    cfg = CRYPTO_ASSETS_CONFIG.get(asset, {})
    wallet_addr = cfg.get('deposit_addresses', {}).get(network, '0x3A8F2b16C97E43d89d4E76092F2694Cd4788102a')

    cursor.execute("""
    INSERT INTO crypto_transactions (
        tx_code, user_id, asset, network, tx_type, amount, fee, wallet_address, tx_hash,
        confirmations, required_confirmations, status
    ) VALUES (?, ?, ?, ?, 'DEPOSIT', ?, 0.0, ?, ?, 1, 3, 'confirming')
    """, (tx_code, user_id, asset, network, amount, wallet_addr, tx_hash))

    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Crypto Deposit Detected', 'Incoming deposit of ' || ? || ' ' || ? || ' detected on network ' || ? || '. Awaiting blockchain confirmations.', 'transaction')
    """, (user_id, str(amount), asset, network))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Deposit transaction submitted. Monitoring {network} blockchain for confirmations.",
        'tx_code': tx_code,
        'tx_hash': tx_hash
    })

@crypto_bp.route('/api/crypto/withdraw', methods=['POST'])
def submit_crypto_withdrawal():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    asset = data.get('asset', 'USDT').upper()
    network = data.get('network', 'Tron (TRC20)')
    amount = float(data.get('amount', 0))
    destination_address = data.get('destination_address', '').strip()
    pin = data.get('pin', '')

    if not user_id or amount <= 0 or not destination_address:
        return jsonify({'success': False, 'message': 'User ID, amount, and destination address required'}), 400

    cfg = CRYPTO_ASSETS_CONFIG.get(asset)
    if not cfg:
        return jsonify({'success': False, 'message': 'Unsupported asset'}), 400

    fee = cfg['withdraw_fee']
    if amount <= fee:
        return jsonify({'success': False, 'message': f"Amount must be greater than network fee ({fee} {asset})"}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check user balance
    cursor.execute("SELECT crypto_balances_json FROM wallets WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    raw_bal = json.loads(row['crypto_balances_json']) if row and row['crypto_balances_json'] else {}
    current_asset_bal = raw_bal.get(asset, 0.0)

    if current_asset_bal < amount:
        conn.close()
        return jsonify({'success': False, 'message': f"Insufficient {asset} balance ({current_asset_bal} available)"}), 400

    # Deduct balance
    raw_bal[asset] = round(current_asset_bal - amount, 6)
    cursor.execute("UPDATE wallets SET crypto_balances_json = ? WHERE user_id = ?", (json.dumps(raw_bal), user_id))

    tx_code = f"CTX-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:5].upper()}"
    mock_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"

    cursor.execute("""
    INSERT INTO crypto_transactions (
        tx_code, user_id, asset, network, tx_type, amount, fee, wallet_address, tx_hash,
        confirmations, required_confirmations, status
    ) VALUES (?, ?, ?, ?, 'WITHDRAWAL', ?, ?, ?, ?, 12, 12, 'completed')
    """, (tx_code, user_id, asset, network, amount, fee, destination_address, mock_hash))

    cursor.execute("""
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (?, 'Crypto Withdrawal Broadcasted', 'Your withdrawal of ' || ? || ' ' || ? || ' has been broadcasted to the blockchain.', 'transaction')
    """, (user_id, str(amount), asset))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f"Withdrawal of {amount} {asset} broadcasted successfully.",
        'tx_code': tx_code,
        'tx_hash': mock_hash,
        'new_balance': raw_bal[asset]
    })

@crypto_bp.route('/api/crypto/history/<int:user_id>', methods=['GET'])
def get_crypto_history(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, tx_code, asset, network, tx_type, amount, fee, wallet_address, tx_hash,
           confirmations, required_confirmations, status, created_at
    FROM crypto_transactions
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))
    txs = [dict(t) for t in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'transactions': txs})
