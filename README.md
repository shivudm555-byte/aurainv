# 🚀 Antigravity Fintech — Modern Investment Platform & Admin Web Panel

An enterprise-grade, modern fintech mobile investment platform with a connected Administrative Control Center, Python Flask backend API, SQLite relational double-entry financial ledger, and Supabase Email Authentication.

---

## 🌟 Key Features

### 📱 User Mobile App (48+ Screens & States)
- **Authentic Device Simulator Frame**: iPhone 16 Pro mockup with Dynamic Island, Status Bar, and Bottom Navigation bar.
- **Supabase Email Authentication**:
  - Email & Password Registration and Sign In.
  - Passwordless Magic Link / Email OTP authentication.
  - Password recovery workflow.
  - Real-time backend ledger synchronization and zero-balance wallet provisioning.
- **KYC Compliance Wizard & Status**: Multi-document verification (PAN, Aadhaar, Passport, Live Selfie, Address Proof) with real-time compliance status tracking.
- **Home Dashboard**: Hero portfolio valuation, cash available, invested principal, today's accrued ROI, lifetime yield, and 1-tap quick action pills.
- **Investment Module & Dynamic Calculator**: Curated institutional & quantitative yield plans, interactive return calculator, lockup schedules, risk disclosures, and 4-digit Transaction PIN confirmation.
- **Earnings & Yield Accruals**: Segregated accounting for principal, daily ROI accruals, 5% referral commissions, platform bonuses, and fees.
- **Wallet & Payment Rails**:
  - Instant UPI QR generator with VPA copy.
  - Bank Transfer (IMPS / NEFT) with 1-click beneficiary copying.
  - Card & NetBanking Gateway Simulator.
  - Bank withdrawals with dynamic 1% fee calculation and penny-drop validation.
- **High-Value Dual-Admin Risk Protection**: Withdrawals >= ₹50,000 automatically enforce multi-sign authorization before bank release.
- **Modular Crypto / VDA Vault**: Segregated asset gateway supporting Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Solana (SOL) with multi-network deposit QR codes and blockchain explorer simulation.
- **Referral Program**: Unique referral links & codes with 5% automated commission tracking.
- **Profile, Bank Accounts, Security & Helpdesk**: Security center with Google Authenticator 2FA toggle, 4-digit PIN setup, linked bank accounts manager, notifications hub, FAQ, and live support ticket messaging thread.

---

### 🖥️ Admin Web Panel
- **Executive KPI Dashboard**: 10 real-time operational metric cards and interactive SVG cashflow, plan allocation, and revenue charts.
- **Role-Based Access Control (RBAC)**: Dynamic switching between Super Admin, Finance Admin, KYC Compliance Admin, and Operations Admin.
- **User Management**: 360-degree user drawer inspection, live wallet balances, investment portfolios, deposit/withdrawal histories, and 1-click activate/suspend buttons.
- **KYC Verification Desk**: Document inspection lightbox with zoom viewer and 1-click verify/rejection dialog with mandatory compliance audit reasons.
- **Investment Management**: Plan builder and editor, APY rate configuration, and active AUM monitor.
- **Earnings Engine**: Automated daily accrual cycle runner and manual ledger adjustment tool with mandatory audit logging.
- **Deposit & Withdrawal Desks**: Payment slip verification, UTR reconciliation, and Dual-Admin multi-sign authorization workflow.
- **Double-Entry Financial Ledger**: Immutable journal explorer tracking debits and credits across 7 segregated accounts (`CASH_INR`, `INVESTMENT_PRINCIPAL`, `ACCRUED_EARNINGS`, `REFERRAL_EARNINGS`, `PLATFORM_FEES`, `CRYPTO_ASSETS`, `PLATFORM_REVENUE`).
- **Compliance Reports**: 7 downloadable reports with instant 1-click CSV export and formatted printable views.
- **Support Helpdesk & System Audit Logs**: Interactive ticket conversation desk and real-time cryptographic audit log explorer.

---

### ⚡ Interactive Split-Screen Live Sync View
The application includes a real-time Split-Screen View:
- **Left**: User Mobile App.
- **Right**: Admin Control Center.
- Any action taken on the mobile app (e.g. deposit, investment, or withdrawal) immediately updates the admin queue, and admin approvals instantaneously reconcile the user's mobile wallet balance.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Python 3.12, Flask 3.0.3, SQLite 3.45, Double-Entry Accounting Ledger Engine.
- **Authentication**: Supabase Auth (Project URL: `https://hcvckfirqlggamffsrvc.supabase.co`).
- **Frontend**: Vanilla JavaScript (ES6+), Modern Vanilla CSS (Design Tokens, Glassmorphism, Dark/Light Themes, HSL Color Palettes, Responsive Viewports), Google Fonts (`Inter`, `Outfit`, `JetBrains Mono`).
- **Security**: PBKDF2 / SHA-256 password hashing, 4-digit Transaction PINs, 2FA Google Authenticator, Immutable Financial Ledger, Role-Based Access Control, Dual-Admin Authorization.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/shivudm555-byte/invest.git
cd invest
```

### 2. Install Dependencies
```bash
pip install flask
```

### 3. Run the Platform
```bash
python run_app.py
```

### 4. Access in Browser
Open **`http://localhost:5000`** in your browser to test the User Mobile App and Admin Control Center.

---

## 🧪 Automated Testing

Run the full end-to-end test suite:
```bash
python backend/test_api_and_ledger.py
```

---

## 📄 License & Compliance Notice

This platform is configured as a demonstration and compliance-ready prototype using simulated payment gateways and test crypto rails. No live fiat or real crypto assets are transferred.
