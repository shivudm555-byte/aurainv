# 🚀 Antigravity Fintech — Modern Investment & Digital Assets WordPress Platform

An institutional-grade, modern fintech investment and digital-assets platform built for WordPress. Features a complete public marketing website, a 14-section User Wealth Dashboard, a 15-desk Administrative Control Center, strict double-entry financial ledger accounting, multi-tiered KYC compliance, and downloadable installable WordPress Theme & Plugin packages.

---

## 🌟 Platform Components

### 🌐 1. Public Marketing Website
- **Hero Section**: "Invest Smarter. Manage Your Growth." headline, subheading, and a realistic live simulated dashboard preview with portfolio valuations, SVG growth chart, and recent transaction feeds.
- **4-Step "How It Works"**: Create Account → Complete KYC → Choose Investment Option → Track Your Portfolio.
- **Investment Plans Marketplace**: Starter Yield, Growth Alpha, and Premium Institutional cards with indicative daily returns, lockup durations, risk ratings, and an interactive dynamic yield calculator.
- **Digital Assets (VDA) Hub**: Multi-chain support for Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Solana (SOL) with cold-storage architecture.
- **Enterprise Security Center**: 2FA, isolated 4-digit Transaction PINs, multi-sign dual admin approvals, and 256-bit encryption.
- **Dedicated Public Pages**: Full standalone views for **About Us**, **How It Works**, **Investment Plans**, **Digital Assets**, **Security Architecture**, **Categorized FAQ Accordion**, and **Contact Us**.
- **5 Regulatory & Legal Pages**: Complete prose templates for **Terms & Conditions**, **Privacy Policy**, **Risk Disclosure**, **KYC / AML Policy**, and **Cookie Policy**.

---

### 📱 2. User Wealth Dashboard (14 Connected Sections)
1. **Executive Dashboard**: Real-time Net Worth, Available Cash, Locked Principal, and Accrued Yield with interactive SVG area chart.
2. **Active Investments**: Live contracts, days active counter, daily accruals, and lockup maturity tracking.
3. **Investment Plans**: Plan browser, duration filters, and strategy subscription modal with 4-digit PIN confirmation.
4. **Earnings & Accruals**: Segregated accounting for daily ROI, referral commissions, and platform bonuses.
5. **Wallet & Banking**: Available vs. locked balances, beneficiary bank manager, and transaction statement.
6. **Instant Deposit Desk**: Mock UPI QR generator with merchant VPA and IMPS/NEFT reference uploader.
7. **Bank Withdrawals**: Dynamic 1% fee calculation, 4-digit PIN + OTP verification, and automatic dual-admin routing for high values (≥ ₹50,000).
8. **Double-Entry Financial Ledger**: Immutable user transaction history with downloadable official financial receipts.
9. **Digital Assets (VDA)**: Multi-token balances, wallet addresses, and simulated blockchain explorer.
10. **Referral Program**: Unique referral links and codes with 5% automated commission tracking.
11. **Notifications Center**: Real-time event notifications for yield credits, security alerts, and KYC updates.
12. **Investor Profile & KYC**: Personal details and multi-document KYC upload wizard (PAN, Aadhaar, Passport, Selfie).
13. **Security Center**: Google Authenticator 2FA toggle, 4-digit PIN configuration, and session log.
14. **Support Helpdesk**: Categorized support ticket creation and live communication thread.

---

### 🖥️ 3. WordPress Administrative Control Center
- **Executive KPI Dashboard**: 10 real-time operational metric cards and SVG cashflow, plan allocation, and revenue charts.
- **Role-Based Access Control (RBAC)**: 5 segregated admin roles (`Super Admin`, `Finance Admin`, `KYC Admin`, `Operations Admin`, `Support Admin`).
- **User Management**: 360-degree user drawer inspection, live balances, active investments, and 1-click status toggling (Active / Suspended).
- **KYC Compliance Desk**: Document inspection lightbox with zoom viewer and 1-click verify/reject dialog with mandatory audit reasons.
- **Investment Plan Manager**: CRUD plan editor, APY configuration, min/max limits, and duration settings.
- **Daily Accruals Engine**: 24-hour yield engine simulator and manual ledger adjustment tool with audit tracking.
- **Deposit & Withdrawal Desks**: Payment slip verification, UTR reconciliation, and Dual-Admin multi-sign authorization.
- **Double-Entry Financial Ledger**: Immutable journal explorer tracking debits and credits across 7 segregated accounts (`CASH_INR`, `INVESTMENT_PRINCIPAL`, `ACCRUED_EARNINGS`, `REFERRAL_EARNINGS`, `PLATFORM_FEES`, `CRYPTO_ASSETS`, `PLATFORM_REVENUE`).
- **7 Compliance Reports**: Downloadable reports with 1-click CSV export, Excel compatibility, and printable views.
- **Cryptographic Audit Trail**: Real-time audit logs capturing actor, IP address, and payload diffs.

---

### 📦 4. WordPress Plugin & Theme Ecosystem (`wordpress/`)
- **Ready-to-Install Plugin**: `wordpress/antigravity-fintech.zip` (14 MySQL tables, REST API, native WP-Admin menus, shortcodes, WP-Cron daily accruals).
- **Companion Theme**: `wordpress/antigravity-fintech-theme.zip` (Dedicated templates for `front-page.php`, `page-dashboard.php`, `header.php`, `footer.php`, `functions.php`).
- **Gutenberg & Elementor Shortcodes**: `[antigravity_fintech mode="public_home|user_dashboard|admin_panel"]`.

---

## 🛠️ Quick Start (Live Demo)

### 1. Start Platform
```powershell
python run_app.py
```

### 2. Access in Browser
Open **`http://localhost:5000`** in your browser.
- Browse all public pages (**Home**, **How It Works**, **Investment Plans**, **Digital Assets**, **Security**, **About**, **FAQ**, **Contact**, **Legal**).
- Test the **User Dashboard** with real-time investments, deposits, withdrawals, and referrals.
- Click **Admin Panel** to switch to the administrative control center.
- Download **`antigravity-fintech.zip`** and **`antigravity-fintech-theme.zip`** directly from the top navbar.

---

## 🧪 Automated Testing

Run the full end-to-end test suite:
```powershell
python backend/test_api_and_ledger.py
```

---

## 📄 Regulatory & Prototype Notice

This platform is configured as an institutional demonstration prototype using simulated payment gateways and testnet crypto rails. No live fiat currency or real cryptocurrency funds are processed in this environment.
