<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_Database {

    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // 1. Users table (or extension of wp_users)
        $table_users = $wpdb->prefix . 'agy_users';
        $sql_users = "CREATE TABLE $table_users (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            wp_user_id bigint(20) DEFAULT 0,
            full_name varchar(150) NOT NULL,
            email varchar(150) NOT NULL,
            phone varchar(50) DEFAULT '',
            password_hash varchar(255) NOT NULL,
            pin_hash varchar(255) DEFAULT '',
            role varchar(50) DEFAULT 'user',
            status varchar(50) DEFAULT 'active',
            kyc_status varchar(50) DEFAULT 'not_submitted',
            referral_code varchar(50) NOT NULL,
            referred_by varchar(50) DEFAULT NULL,
            is_2fa_enabled tinyint(1) DEFAULT 0,
            last_login datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY email (email),
            UNIQUE KEY referral_code (referral_code)
        ) $charset_collate;";
        dbDelta($sql_users);

        // 2. User Profiles
        $table_profiles = $wpdb->prefix . 'agy_user_profiles';
        $sql_profiles = "CREATE TABLE $table_profiles (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            dob varchar(50) DEFAULT '',
            address text DEFAULT '',
            city varchar(100) DEFAULT '',
            state varchar(100) DEFAULT '',
            country varchar(100) DEFAULT 'India',
            postal_code varchar(20) DEFAULT '',
            avatar_url varchar(255) DEFAULT '',
            PRIMARY KEY  (id),
            UNIQUE KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta($sql_profiles);

        // 3. KYC Records
        $table_kyc = $wpdb->prefix . 'agy_kyc_records';
        $sql_kyc = "CREATE TABLE $table_kyc (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            doc_type varchar(50) NOT NULL,
            id_number varchar(100) NOT NULL,
            doc_front_url varchar(255) DEFAULT '',
            doc_back_url varchar(255) DEFAULT '',
            selfie_url varchar(255) DEFAULT '',
            address_proof_url varchar(255) DEFAULT '',
            status varchar(50) DEFAULT 'pending',
            rejection_reason text DEFAULT '',
            reviewed_by varchar(100) DEFAULT '',
            reviewed_at datetime DEFAULT NULL,
            submitted_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta($sql_kyc);

        // 4. Bank Accounts
        $table_banks = $wpdb->prefix . 'agy_bank_accounts';
        $sql_banks = "CREATE TABLE $table_banks (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            bank_name varchar(150) NOT NULL,
            account_number varchar(100) NOT NULL,
            ifsc_code varchar(50) NOT NULL,
            account_holder varchar(150) NOT NULL,
            is_primary tinyint(1) DEFAULT 0,
            is_verified tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta($sql_banks);

        // 5. Investment Plans
        $table_plans = $wpdb->prefix . 'agy_investment_plans';
        $sql_plans = "CREATE TABLE $table_plans (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(150) NOT NULL,
            slug varchar(150) NOT NULL,
            tagline varchar(255) DEFAULT '',
            description text DEFAULT '',
            min_amount decimal(15,2) NOT NULL,
            max_amount decimal(15,2) NOT NULL,
            duration_days int(11) NOT NULL,
            daily_roi_pct decimal(8,4) NOT NULL,
            payout_frequency varchar(50) DEFAULT 'daily',
            principal_return tinyint(1) DEFAULT 1,
            risk_level varchar(50) DEFAULT 'Moderate',
            status varchar(50) DEFAULT 'active',
            badge_text varchar(50) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY slug (slug)
        ) $charset_collate;";
        dbDelta($sql_plans);

        // 6. User Investments
        $table_inv = $wpdb->prefix . 'agy_user_investments';
        $sql_inv = "CREATE TABLE $table_inv (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            investment_code varchar(100) NOT NULL,
            user_id bigint(20) NOT NULL,
            plan_id bigint(20) NOT NULL,
            principal_amount decimal(15,2) NOT NULL,
            daily_roi_pct decimal(8,4) NOT NULL,
            duration_days int(11) NOT NULL,
            days_completed int(11) DEFAULT 0,
            total_accrued decimal(15,2) DEFAULT 0.00,
            status varchar(50) DEFAULT 'active',
            start_date datetime DEFAULT CURRENT_TIMESTAMP,
            maturity_date datetime NOT NULL,
            last_accrual_date datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY investment_code (investment_code)
        ) $charset_collate;";
        dbDelta($sql_inv);

        // 7. Wallets
        $table_wallets = $wpdb->prefix . 'agy_wallets';
        $sql_wallets = "CREATE TABLE $table_wallets (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            cash_balance decimal(15,2) DEFAULT 0.00,
            invested_balance decimal(15,2) DEFAULT 0.00,
            accrued_balance decimal(15,2) DEFAULT 0.00,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta($sql_wallets);

        // 8. Ledger Accounts
        $table_l_acc = $wpdb->prefix . 'agy_ledger_accounts';
        $sql_l_acc = "CREATE TABLE $table_l_acc (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            code varchar(50) NOT NULL,
            name varchar(150) NOT NULL,
            account_type varchar(50) NOT NULL,
            balance decimal(15,2) DEFAULT 0.00,
            PRIMARY KEY  (id),
            UNIQUE KEY code (code)
        ) $charset_collate;";
        dbDelta($sql_l_acc);

        // 9. Ledger Transactions (Double-Entry Source of Truth)
        $table_l_tx = $wpdb->prefix . 'agy_ledger_transactions';
        $sql_l_tx = "CREATE TABLE $table_l_tx (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            transaction_id varchar(100) NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            ledger_account_code varchar(50) NOT NULL,
            debit_amount decimal(15,2) DEFAULT 0.00,
            credit_amount decimal(15,2) DEFAULT 0.00,
            balance_after decimal(15,2) NOT NULL,
            transaction_type varchar(50) NOT NULL,
            reference_id varchar(100) DEFAULT '',
            description text DEFAULT '',
            audit_reason text DEFAULT '',
            created_by varchar(100) DEFAULT 'SYSTEM',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta($sql_l_tx);

        // 10. Deposits
        $table_dep = $wpdb->prefix . 'agy_deposits';
        $sql_dep = "CREATE TABLE $table_dep (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            deposit_code varchar(100) NOT NULL,
            user_id bigint(20) NOT NULL,
            amount decimal(15,2) NOT NULL,
            payment_method varchar(50) NOT NULL,
            utr_ref varchar(100) NOT NULL,
            proof_file varchar(255) DEFAULT '',
            status varchar(50) DEFAULT 'pending',
            rejection_reason text DEFAULT '',
            reviewed_by varchar(100) DEFAULT '',
            reviewed_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY deposit_code (deposit_code)
        ) $charset_collate;";
        dbDelta($sql_dep);

        // 11. Withdrawals
        $table_wdl = $wpdb->prefix . 'agy_withdrawals';
        $sql_wdl = "CREATE TABLE $table_wdl (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            withdrawal_code varchar(100) NOT NULL,
            user_id bigint(20) NOT NULL,
            bank_account_id bigint(20) DEFAULT NULL,
            amount decimal(15,2) NOT NULL,
            fee decimal(15,2) DEFAULT 0.00,
            net_amount decimal(15,2) NOT NULL,
            payout_method varchar(50) DEFAULT 'BANK_TRANSFER',
            destination_details text DEFAULT '',
            status varchar(50) DEFAULT 'pending',
            requires_dual_approval tinyint(1) DEFAULT 0,
            first_approval_by bigint(20) DEFAULT NULL,
            first_approval_admin_name varchar(100) DEFAULT '',
            first_approval_at datetime DEFAULT NULL,
            final_approval_by bigint(20) DEFAULT NULL,
            final_approval_admin_name varchar(100) DEFAULT '',
            final_approval_at datetime DEFAULT NULL,
            rejection_reason text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY withdrawal_code (withdrawal_code)
        ) $charset_collate;";
        dbDelta($sql_wdl);

        // 12. Crypto Transactions
        $table_crypto = $wpdb->prefix . 'agy_crypto_transactions';
        $sql_crypto = "CREATE TABLE $table_crypto (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            tx_hash varchar(100) NOT NULL,
            user_id bigint(20) NOT NULL,
            asset varchar(20) NOT NULL,
            amount decimal(18,8) NOT NULL,
            fiat_value_inr decimal(15,2) NOT NULL,
            type varchar(50) NOT NULL,
            network varchar(50) NOT NULL,
            destination_address varchar(150) NOT NULL,
            status varchar(50) DEFAULT 'completed',
            confirmations int(11) DEFAULT 12,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY tx_hash (tx_hash)
        ) $charset_collate;";
        dbDelta($sql_crypto);

        // 13. Support Tickets & Messages
        $table_tickets = $wpdb->prefix . 'agy_support_tickets';
        $sql_tickets = "CREATE TABLE $table_tickets (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            ticket_code varchar(100) NOT NULL,
            user_id bigint(20) NOT NULL,
            subject varchar(255) NOT NULL,
            category varchar(50) NOT NULL,
            priority varchar(50) DEFAULT 'medium',
            status varchar(50) DEFAULT 'open',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY ticket_code (ticket_code)
        ) $charset_collate;";
        dbDelta($sql_tickets);

        $table_msgs = $wpdb->prefix . 'agy_ticket_messages';
        $sql_msgs = "CREATE TABLE $table_msgs (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            ticket_id bigint(20) NOT NULL,
            sender_type varchar(50) NOT NULL,
            sender_name varchar(150) NOT NULL,
            message text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta($sql_msgs);

        // 14. Audit Logs & Settings
        $table_audit = $wpdb->prefix . 'agy_audit_logs';
        $sql_audit = "CREATE TABLE $table_audit (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            admin_id bigint(20) DEFAULT NULL,
            admin_name varchar(150) NOT NULL,
            action varchar(100) NOT NULL,
            target_type varchar(50) NOT NULL,
            target_id varchar(100) DEFAULT '',
            details_json text DEFAULT '',
            ip_address varchar(50) DEFAULT '127.0.0.1',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta($sql_audit);

        $table_settings = $wpdb->prefix . 'agy_settings';
        $sql_settings = "CREATE TABLE $table_settings (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            setting_key varchar(100) NOT NULL,
            setting_value text DEFAULT '',
            updated_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY setting_key (setting_key)
        ) $charset_collate;";
        dbDelta($sql_settings);
    }

    public static function seed_initial_data() {
        global $wpdb;

        // Check if already seeded
        $plans_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}agy_investment_plans");
        if ($plans_count > 0) return;

        // Seed Ledger Accounts
        $ledger_accounts = array(
            array('CASH_INR', 'Platform Cash Balance (INR)', 'LIABILITY'),
            array('INVESTMENT_PRINCIPAL', 'Customer Invested Principal', 'LIABILITY'),
            array('ACCRUED_EARNINGS', 'Customer Accrued Yield Returns', 'LIABILITY'),
            array('REFERRAL_EARNINGS', 'Customer Referral Commission Balance', 'LIABILITY'),
            array('PLATFORM_FEES', 'Platform Withdrawal & Operational Fees', 'REVENUE'),
            array('CRYPTO_ASSETS', 'Segregated Crypto Custodial Reserves', 'ASSET'),
            array('PLATFORM_REVENUE', 'Gross Platform Revenue & Spreads', 'REVENUE')
        );
        foreach ($ledger_accounts as $la) {
            $wpdb->insert("{$wpdb->prefix}agy_ledger_accounts", array(
                'code' => $la[0],
                'name' => $la[1],
                'account_type' => $la[2],
                'balance' => 0.00
            ));
        }

        // Seed Investment Plans
        $plans = array(
            array('Liquid Starter Growth', 'liquid-starter', 'Daily liquidity with flexible compounding', 1000.0, 50000.0, 30, 0.0411, 'Low', 'active', 'POPULAR'),
            array('Alpha Yield Staking', 'alpha-yield', 'Enhanced institutional fixed returns', 5000.0, 200000.0, 90, 0.0548, 'Moderate', 'active', 'HIGH YIELD'),
            array('Institutional Wealth Builder', 'institutional-wealth', 'Long term capital growth & bond backing', 25000.0, 1000000.0, 180, 0.0685, 'Moderate', 'active', 'FEATURED'),
            array('Green Infrastructure Bond', 'green-infrastructure', 'Sovereign asset-backed renewable energy fund', 10000.0, 500000.0, 365, 0.0493, 'Low', 'active', 'ESG IMPACT'),
            array('Quantum Arbitrage Fund', 'quantum-arbitrage', 'Algorithmic cross-market momentum strategy', 50000.0, 2500000.0, 60, 0.0822, 'High', 'active', 'EXCLUSIVE')
        );
        foreach ($plans as $p) {
            $wpdb->insert("{$wpdb->prefix}agy_investment_plans", array(
                'name' => $p[0],
                'slug' => $p[1],
                'tagline' => $p[2],
                'min_amount' => $p[3],
                'max_amount' => $p[4],
                'duration_days' => $p[5],
                'daily_roi_pct' => $p[6],
                'risk_level' => $p[7],
                'status' => $p[8],
                'badge_text' => $p[9]
            ));
        }

        // Seed Settings
        $settings = array(
            'dual_approval_threshold' => '50000',
            'withdrawal_fee_pct' => '1.0',
            'min_withdrawal_amount' => '500',
            'crypto_module_enabled' => 'true',
            'platform_currency' => 'INR',
            'referral_commission_pct' => '5.0'
        );
        foreach ($settings as $k => $v) {
            $wpdb->insert("{$wpdb->prefix}agy_settings", array('setting_key' => $k, 'setting_value' => $v));
        }

        // Seed Users
        $hash_pw = hash('sha256', 'Fintech@123');
        $hash_pin = hash('sha256', '1234');
        $users = array(
            array('Vikramaditya Singhania', 'admin.super@antigravity.io', '+91 98111 00001', 'super_admin', 'approved', 'SUPER01'),
            array('Meera Nambiar', 'admin.finance@antigravity.io', '+91 98111 00002', 'finance_admin', 'approved', 'FIN02'),
            array('Suresh Iyer', 'admin.kyc@antigravity.io', '+91 98111 00003', 'kyc_admin', 'approved', 'KYC03'),
            array('Ananya Sen', 'admin.ops@antigravity.io', '+91 98111 00004', 'ops_admin', 'approved', 'OPS04'),
            array('Rahul Sharma', 'rahul.sharma@gmail.com', '+91 98200 12345', 'user', 'approved', 'RAHUL77'),
            array('Priya Patel', 'priya.patel@gmail.com', '+91 98200 67890', 'user', 'pending', 'PRIYA88'),
            array('Amit Verma', 'amit.verma@outlook.com', '+91 98200 11223', 'user', 'approved', 'AMIT99'),
            array('Kavita Reddy', 'kavita.reddy@yahoo.com', '+91 98200 44556', 'user', 'rejected', 'KAVITA55')
        );

        foreach ($users as $u) {
            $wpdb->insert("{$wpdb->prefix}agy_users", array(
                'full_name' => $u[0],
                'email' => $u[1],
                'phone' => $u[2],
                'password_hash' => $hash_pw,
                'pin_hash' => $hash_pin,
                'role' => $u[3],
                'status' => 'active',
                'kyc_status' => $u[4],
                'referral_code' => $u[5]
            ));
            $user_id = $wpdb->insert_id;

            $wpdb->insert("{$wpdb->prefix}agy_user_profiles", array(
                'user_id' => $user_id,
                'dob' => '1990-05-15',
                'address' => '402 Cyber Heights, Tech Boulevard',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'country' => 'India'
            ));

            $cash = ($user_id == 5) ? 32500.0 : (($user_id == 7) ? 95000.0 : 0.0);
            $inv = ($user_id == 5) ? 50000.0 : (($user_id == 7) ? 200000.0 : 0.0);
            $acc = ($user_id == 5) ? 246.0 : (($user_id == 7) ? 1450.0 : 0.0);

            $wpdb->insert("{$wpdb->prefix}agy_wallets", array(
                'user_id' => $user_id,
                'cash_balance' => $cash,
                'invested_balance' => $inv,
                'accrued_balance' => $acc
            ));

            $wpdb->insert("{$wpdb->prefix}agy_bank_accounts", array(
                'user_id' => $user_id,
                'bank_name' => 'HDFC Bank Ltd',
                'account_number' => '5010029000' . sprintf('%04d', $user_id),
                'ifsc_code' => 'HDFC0001234',
                'account_holder' => $u[0],
                'is_primary' => 1,
                'is_verified' => 1
            ));
        }
    }
}
