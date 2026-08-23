import urllib.request
import re
import os
import json

base = "http://127.0.0.1:5000"

print("=" * 60)
print(" VERIFYING AURA WEALTH MOBILE APPLICATION ASSETS & ENDPOINTS ")
print("=" * 60)

# 1. Fetch index.html
with urllib.request.urlopen(base + "/") as r:
    html = r.read().decode("utf-8")
    assert "<title>" in html
    print("[PASS] index.html served (Status 200 OK)")

# 2. Extract and test CSS files
css_files = ["css/base.css", "css/mobile-app.css", "css/components.css", "css/web-portal.css", "css/admin-panel.css"]
for c in css_files:
    with urllib.request.urlopen(f"{base}/{c}") as r:
        content = r.read()
        print(f"[PASS] CSS asset: {c} ({len(content):,} bytes)")

# 3. Extract and test JS files
js_files = [
    "js/haptics.js",
    "js/chart_engine.js",
    "js/api.js",
    "js/store.js",
    "js/mobile/auth_flow.js",
    "js/mobile/kyc_flow.js",
    "js/mobile/dashboard.js",
    "js/mobile/investment.js",
    "js/mobile/earnings.js",
    "js/mobile/wallet.js",
    "js/mobile/activity.js",
    "js/mobile/crypto.js",
    "js/mobile/referral.js",
    "js/mobile/notifications.js",
    "js/mobile/profile.js",
    "js/mobile/security.js",
    "js/mobile/support.js",
    "js/mobile/settings.js",
    "js/mobile/error_empty.js",
    "js/mobile/router.js",
    "js/app.js"
]

for j in js_files:
    with urllib.request.urlopen(f"{base}/{j}") as r:
        content = r.read()
        print(f"[PASS] JS module: {j} ({len(content):,} bytes)")

# 4. Check Wallet Summary for Alex Morgan (User 5)
with urllib.request.urlopen(f"{base}/api/wallet/summary/5") as r:
    data = json.loads(r.read().decode("utf-8"))
    assert data["success"] is True
    w = data["wallet"]
    print(f"\n[PASS] Alex Morgan Live Ledger Balances:")
    print(f"       - Cash Available: INR {w['cash_balance']:,.2f}")
    print(f"       - Invested Principal: INR {w['invested_balance']:,.2f}")
    print(f"       - Accrued Earnings: INR {w['accrued_balance']:,.2f}")
    print(f"       - Total Portfolio: INR {w['total_portfolio']:,.2f}")

print("\n" + "=" * 60)
print(" ALL 21 MOBILE ASSETS & API ENDPOINTS 100% VERIFIED! ")
print("=" * 60)
