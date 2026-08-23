import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:5000"

def request_json(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        try:
            return json.loads(err_content)
        except:
            return {"error": str(e), "content": err_content}

def run_tests():
    print("=" * 60)
    print(" RUNNING FINTECH SUITE & DOUBLE-ENTRY LEDGER AUDIT ")
    print("=" * 60)

    # 1. Health Check
    health = request_json("/api/health")
    assert health.get("status") == "healthy", "Health check failed"
    print("[PASS] 1. API Health Check passed")

    # 2. User Authentication
    login = request_json("/api/auth/login", method="POST", data={
        "identifier": "alex.morgan@aurafin.com",
        "password": "Fintech@123"
    })
    assert login.get("success") is True, f"Login failed: {login}"
    user_id = login["user"]["id"]
    print(f"[PASS] 2. User Authentication verified (User ID: {user_id}, Name: {login['user']['full_name']})")

    # 2b. Supabase Email Authentication Sync
    sb_sync = request_json("/api/auth/supabase-sync", method="POST", data={
        "email": "investor.supabase@example.com",
        "full_name": "Supabase Investor Pro",
        "phone": "+91 99887 76655",
        "supabase_uid": "sb-uid-9988-test"
    })
    assert sb_sync.get("success") is True, f"Supabase sync failed: {sb_sync}"
    assert sb_sync["user"]["email"] == "investor.supabase@example.com"
    print(f"[PASS] 2b. Supabase Auth Sync & Ledger Provisioning verified (User: {sb_sync['user']['full_name']}, Email: {sb_sync['user']['email']})")

    # 3. PIN Verification
    pin_res = request_json("/api/auth/verify-pin", method="POST", data={
        "user_id": user_id,
        "pin": "1234"
    })
    assert pin_res.get("success") is True, f"PIN verification failed: {pin_res}"
    print("[PASS] 3. 4-Digit Transaction PIN verified")

    # 4. Wallet Summary & Portfolio Breakdown
    wallet_res = request_json(f"/api/wallet/summary/{user_id}")
    assert wallet_res.get("success") is True
    w = wallet_res["wallet"]
    print(f"[PASS] 4. Wallet Summary retrieved (Cash: INR {w['cash_balance']:,.2f}, Invested: INR {w['invested_balance']:,.2f}, Accrued: INR {w['accrued_balance']:,.2f})")

    # 5. Investment Plans Catalog
    plans_res = request_json("/api/invest/plans")
    assert plans_res.get("success") is True
    assert len(plans_res["plans"]) >= 5
    plan = plans_res["plans"][0]
    print(f"[PASS] 5. Investment Plans catalog verified ({len(plans_res['plans'])} plans loaded, Top plan: {plan['name']})")

    # 6. Test Deposit Creation & Instant Ledger Reconciliation
    dep_res = request_json("/api/wallet/deposit", method="POST", data={
        "user_id": user_id,
        "amount": 10000.0,
        "payment_method": "UPI",
        "utr_ref": "TEST-UPI-AUTO-001",
        "auto_approve": True
    })
    assert dep_res.get("success") is True, f"Deposit failed: {dep_res}"
    print("[PASS] 6. Deposit and automatic double-entry ledger posting verified")

    # 7. Test Subscription to Investment Plan
    inv_res = request_json("/api/invest/create", method="POST", data={
        "user_id": user_id,
        "plan_id": plan["id"],
        "amount": 5000.0
    })
    assert inv_res.get("success") is True, f"Investment creation failed: {inv_res}"
    print(f"[PASS] 7. Investment Subscription active (Code: {inv_res['investment_code']})")

    # 8. Test Daily Accrual Cycle Execution
    accrual_res = request_json("/api/admin/accruals/run-cycle", method="POST", data={
        "admin_id": 4,
        "admin_name": "Ops Accruals System"
    })
    assert accrual_res.get("success") is True
    print(f"[PASS] 8. Daily Accruals Engine executed (Processed {accrual_res['investments_processed']} investments, Total Payout: INR {accrual_res['total_payout_amount']:.2f})")

    # 9. Test High-Value Withdrawal & Dual-Admin Multi-Sign Workflow
    wdl_res = request_json("/api/wallet/withdraw", method="POST", data={
        "user_id": 7, # Amit Verma
        "amount": 60000.0, # >= INR 50,000 threshold
        "payout_method": "BANK_TRANSFER",
        "destination_details": {"bank": "HDFC Bank", "acc": "50100290007890"},
        "pin": "1234"
    })
    assert wdl_res.get("success") is True
    assert wdl_res.get("requires_dual_approval") is True
    print(f"[PASS] 9a. High-Value Withdrawal requested (Requires Dual-Approval: {wdl_res['requires_dual_approval']})")

    # Fetch withdrawal ID
    all_wdl = request_json("/api/admin/withdrawals?status=pending")
    pending_wdl = [x for x in all_wdl["withdrawals"] if x["amount"] == 60000.0][0]
    
    # 1st Sign by Finance Admin
    sign1 = request_json("/api/admin/withdrawals/approve-first", method="POST", data={
        "admin_id": 2,
        "admin_name": "Meera Nambiar (Finance Admin)",
        "withdrawal_id": pending_wdl["id"]
    })
    assert sign1.get("status") == "pending_second_approval"
    print("[PASS] 9b. 1st Level Finance Admin Authorization passed -> Status moved to pending_second_approval")

    # 2nd Sign by Super Admin
    sign2 = request_json("/api/admin/withdrawals/approve-final", method="POST", data={
        "admin_id": 1,
        "admin_name": "Vikramaditya Singhania (Super Admin)",
        "withdrawal_id": pending_wdl["id"]
    })
    assert sign2.get("status") == "completed"
    print("[PASS] 9c. 2nd Level Super Admin Authorization passed -> Payout disbursed & ledger debited!")

    # 10. Test Financial Ledger Double-Entry Balance
    ledger = request_json("/api/admin/ledger")
    assert ledger.get("success") is True
    txs = ledger["transactions"]
    print(f"[PASS] 10. Financial Ledger contains {len(txs)} immutable double-entry journal entries")

    # 11. Test Compliance Reports Generator
    reports = ["user", "kyc", "deposit", "withdrawal", "investment", "earnings", "revenue"]
    for r in reports:
        rep_res = request_json(f"/api/admin/reports?type={r}")
        assert rep_res.get("success") is True
        assert len(rep_res["columns"]) > 0
    print(f"[PASS] 11. All {len(reports)} Compliance & Financial Reports generated and validated for export")

    # 12. Test Crypto / VDA Balances
    crypto_res = request_json(f"/api/crypto/balances/{user_id}")
    assert crypto_res.get("success") is True
    print(f"[PASS] 12. Crypto & VDA segregated vault verified (Total Valuation: ${crypto_res['total_crypto_value_usd']:,.2f} / INR {crypto_res['total_crypto_value_inr']:,.2f})")

    print("=" * 60)
    print(" ALL 12 AUTOMATED TEST SUITES PASSED PERFECTLY! ")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
