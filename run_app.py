import os
import sys

# Ensure backend directory is in python path
base_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(base_dir, 'backend')
sys.path.insert(0, backend_dir)

from backend.app import app
from backend.database import init_db
from backend.seed_data import seed_all

if __name__ == '__main__':
    print("=" * 70)
    print(" ANTIGRAVITY FINTECH INVESTMENT PLATFORM & ADMIN CONTROL CENTER ")
    print("=" * 70)
    print(" Initializing SQLite Financial Double-Entry Ledger...")
    seed_all()
    
    port = int(os.environ.get('PORT', 5000))
    print(f"\n Application running at: http://localhost:{port}")
    print(" Open in browser to test User Mobile App + Admin Web Panel!")
    print("=" * 70)
    app.run(host='0.0.0.0', port=port, debug=True)
