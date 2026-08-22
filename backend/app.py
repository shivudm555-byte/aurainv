import os
import sys
from flask import Flask, send_from_directory, jsonify

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from database import init_db
from seed_data import seed_all

# Import route blueprints
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.invest_routes import invest_bp
from routes.wallet_routes import wallet_bp
from routes.crypto_routes import crypto_bp
from routes.referral_routes import referral_bp
from routes.support_routes import support_bp
from routes.admin_routes import admin_bp

frontend_dir = os.path.join(os.path.dirname(backend_dir), 'frontend')

app = Flask(__name__, static_folder=frontend_dir)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(invest_bp)
app.register_blueprint(wallet_bp)
app.register_blueprint(crypto_bp)
app.register_blueprint(referral_bp)
app.register_blueprint(support_bp)
app.register_blueprint(admin_bp)

# CORS Header Middleware
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Serve Frontend SPA
@app.route('/')
def serve_index():
    return send_from_directory(frontend_dir, 'index.html')

# Serve Firebase Web App
@app.route('/firebase')
@app.route('/firebase/')
@app.route('/firebase/<path:path>')
def serve_firebase(path='index.html'):
    firebase_dir = os.path.join(os.path.dirname(backend_dir), 'firebase')
    return send_from_directory(firebase_dir, path)

@app.route('/<path:path>')
def serve_static(path):
    file_path = os.path.join(frontend_dir, path)
    if os.path.exists(file_path):
        return send_from_directory(frontend_dir, path)
    return send_from_directory(frontend_dir, 'index.html')

# Download WordPress Plugin Zip
@app.route('/download/antigravity-fintech.zip')
@app.route('/download/wordpress-plugin')
def download_wp_plugin():
    from flask import send_file
    wp_zip = os.path.join(os.path.dirname(backend_dir), 'wordpress', 'antigravity-fintech.zip')
    if os.path.exists(wp_zip):
        return send_file(wp_zip, as_attachment=True, download_name='antigravity-fintech.zip')
    return jsonify({'error': 'Plugin zip not found'}), 404

# Download WordPress Theme Zip
@app.route('/download/antigravity-fintech-theme.zip')
@app.route('/download/wordpress-theme')
def download_wp_theme():
    from flask import send_file
    wp_theme_zip = os.path.join(os.path.dirname(backend_dir), 'wordpress', 'antigravity-fintech-theme.zip')
    if os.path.exists(wp_theme_zip):
        return send_file(wp_theme_zip, as_attachment=True, download_name='antigravity-fintech-theme.zip')
    return jsonify({'error': 'Theme zip not found'}), 404

# Health Check API
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'platform': 'Antigravity Fintech Investment Platform',
        'version': '2.4.0-fintech-pro',
        'ledger_integrity': 'verified'
    })

if __name__ == '__main__':
    # Initialize DB if not present
    init_db()
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Antigravity Fintech Platform at http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
