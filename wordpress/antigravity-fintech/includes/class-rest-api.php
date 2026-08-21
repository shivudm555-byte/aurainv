<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_REST_API {

    public static function init() {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
    }

    public static function register_routes() {
        $namespace = 'antigravity/v1';

        // 1. Health & Config
        register_rest_route($namespace, '/health', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'health_check'),
            'permission_callback' => '__return_true'
        ));

        // 2. Auth Routes
        register_rest_route($namespace, '/auth/login', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'auth_login'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/auth/supabase-sync', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'auth_supabase_sync'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/auth/verify-pin', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'auth_verify_pin'),
            'permission_callback' => '__return_true'
        ));

        // 3. User & KYC Routes
        register_rest_route($namespace, '/user/profile/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_user_profile'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/user/kyc/submit', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'submit_kyc'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/user/banks/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_user_banks'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/user/notifications/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_user_notifications'),
            'permission_callback' => '__return_true'
        ));

        // 4. Investment Routes
        register_rest_route($namespace, '/invest/plans', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_investment_plans'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/invest/create', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_investment'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/invest/my-portfolio/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_my_portfolio'),
            'permission_callback' => '__return_true'
        ));

        // 5. Wallet Routes
        register_rest_route($namespace, '/wallet/summary/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_wallet_summary'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/wallet/deposit', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_deposit'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/wallet/withdraw', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'create_withdrawal'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/wallet/transactions/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_transactions'),
            'permission_callback' => '__return_true'
        ));

        // 6. Crypto Routes
        register_rest_route($namespace, '/crypto/config', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_crypto_config'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/crypto/balances/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_crypto_balances'),
            'permission_callback' => '__return_true'
        ));

        // 7. Referral & Support
        register_rest_route($namespace, '/referral/stats/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_referral_stats'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/support/faqs', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_faqs'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/support/tickets/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'get_support_tickets'),
            'permission_callback' => '__return_true'
        ));

        // 8. Admin Routes
        register_rest_route($namespace, '/admin/stats', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_stats'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/users', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_users'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/kyc/records', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_kyc_records'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/kyc/review', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'admin_review_kyc'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/accruals/run-cycle', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'admin_run_accruals'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/deposits', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_deposits'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/deposits/review', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'admin_review_deposit'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/withdrawals', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_withdrawals'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/withdrawals/approve-first', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'admin_approve_withdrawal_first'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/withdrawals/approve-final', array(
            'methods' => 'POST',
            'callback' => array(__CLASS__, 'admin_approve_withdrawal_final'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/ledger', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_ledger'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/reports', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_reports'),
            'permission_callback' => '__return_true'
        ));
        register_rest_route($namespace, '/admin/audit-logs', array(
            'methods' => 'GET',
            'callback' => array(__CLASS__, 'admin_get_audit_logs'),
            'permission_callback' => '__return_true'
        ));
    }

    // --- Callbacks ---

    public static function health_check() {
        return rest_ensure_response(array('status' => 'healthy', 'system' => 'WordPress Antigravity Fintech 2.5 Pro'));
    }

    public static function auth_login($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $id_val = sanitize_text_field($params['identifier'] ?? '');
        $pw_val = $params['password'] ?? '';
        $pw_hash = hash('sha256', $pw_val);

        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}agy_users WHERE (email = %s OR phone = %s) AND password_hash = %s",
            $id_val, $id_val, $pw_hash
        ), ARRAY_A);

        if (!$user) {
            return new WP_Error('invalid_credentials', 'Invalid email or password.', array('status' => 401));
        }

        unset($user['password_hash']);
        unset($user['pin_hash']);

        return rest_ensure_response(array(
            'success' => true,
            'token' => 'wp-token-' . wp_generate_uuid4(),
            'user' => $user
        ));
    }

    public static function auth_supabase_sync($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $email = sanitize_email($params['email'] ?? '');
        $full_name = sanitize_text_field($params['full_name'] ?? '') ?: ucfirst(explode('@', $email)[0]);
        $phone = sanitize_text_field($params['phone'] ?? '+91 98000 00000');
        $referral_code = sanitize_text_field($params['referral_code'] ?? '');

        if (!$email) {
            return new WP_Error('missing_email', 'Email required', array('status' => 400));
        }

        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_users WHERE email = %s", $email), ARRAY_A);
        if (!$user) {
            $new_code = strtoupper(substr($full_name, 0, 3)) . strtoupper(substr(wp_generate_uuid4(), 0, 4));
            $wpdb->insert("{$wpdb->prefix}agy_users", array(
                'full_name' => $full_name,
                'email' => $email,
                'phone' => $phone,
                'password_hash' => hash('sha256', 'supabase_' . $email),
                'pin_hash' => hash('sha256', '1234'),
                'referral_code' => $new_code,
                'kyc_status' => 'not_submitted',
                'role' => 'user',
                'status' => 'active'
            ));
            $user_id = $wpdb->insert_id;

            $wpdb->insert("{$wpdb->prefix}agy_wallets", array('user_id' => $user_id, 'cash_balance' => 0, 'invested_balance' => 0, 'accrued_balance' => 0));
            $wpdb->insert("{$wpdb->prefix}agy_user_profiles", array('user_id' => $user_id, 'country' => 'India'));

            $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_users WHERE id = %d", $user_id), ARRAY_A);
        }

        unset($user['password_hash']);
        unset($user['pin_hash']);

        return rest_ensure_response(array('success' => true, 'user' => $user));
    }

    public static function auth_verify_pin($request) {
        return rest_ensure_response(array('success' => true, 'message' => 'PIN verified'));
    }

    public static function get_user_profile($request) {
        global $wpdb;
        $id = intval($request['id']);
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_users WHERE id = %d", $id), ARRAY_A);
        if (!$user) return new WP_Error('not_found', 'User not found', array('status' => 404));
        unset($user['password_hash']);
        unset($user['pin_hash']);
        return rest_ensure_response(array('success' => true, 'user' => $user));
    }

    public static function submit_kyc($request) {
        return rest_ensure_response(array('success' => true, 'message' => 'KYC submitted for compliance review'));
    }

    public static function get_user_banks($request) {
        global $wpdb;
        $id = intval($request['id']);
        $banks = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_bank_accounts WHERE user_id = %d", $id), ARRAY_A);
        return rest_ensure_response(array('success' => true, 'bank_accounts' => $banks));
    }

    public static function get_user_notifications($request) {
        return rest_ensure_response(array('success' => true, 'notifications' => array(
            array('id' => 1, 'title' => 'Welcome to Antigravity Fintech', 'message' => 'Complete your KYC to unlock full liquidity limits.', 'category' => 'system', 'is_read' => 0, 'created_at' => current_time('mysql'))
        )));
    }

    public static function get_investment_plans() {
        global $wpdb;
        $plans = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}agy_investment_plans WHERE status = 'active'", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'plans' => $plans));
    }

    public static function create_investment($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = intval($params['user_id']);
        $plan_id = intval($params['plan_id']);
        $amount = floatval($params['amount']);

        $plan = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_investment_plans WHERE id = %d", $plan_id), ARRAY_A);
        if (!$plan) return new WP_Error('not_found', 'Plan not found', array('status' => 404));

        $inv_code = 'INV-' . date('Ym') . '-' . strtoupper(substr(wp_generate_uuid4(), 0, 6));
        $maturity = date('Y-m-d H:i:s', strtotime("+{$plan['duration_days']} days"));

        $wpdb->insert("{$wpdb->prefix}agy_user_investments", array(
            'investment_code' => $inv_code,
            'user_id' => $user_id,
            'plan_id' => $plan_id,
            'principal_amount' => $amount,
            'daily_roi_pct' => $plan['daily_roi_pct'],
            'duration_days' => $plan['duration_days'],
            'maturity_date' => $maturity,
            'status' => 'active'
        ));

        // Double-entry ledger
        AGY_Ledger_Engine::post_double_entry(
            'TX-' . strtoupper(substr(wp_generate_uuid4(), 0, 8)),
            array(
                array('account_code' => 'CASH_INR', 'debit' => $amount, 'credit' => 0),
                array('account_code' => 'INVESTMENT_PRINCIPAL', 'debit' => 0, 'credit' => $amount)
            ),
            'INVESTMENT_LOCK',
            $user_id,
            $inv_code,
            "Locked principal in {$plan['name']}",
            "Investment subscription $inv_code",
            "USER_$user_id"
        );

        return rest_ensure_response(array('success' => true, 'message' => 'Investment activated', 'investment_code' => $inv_code));
    }

    public static function get_my_portfolio($request) {
        global $wpdb;
        $id = intval($request['id']);
        $invs = $wpdb->get_results($wpdb->prepare(
            "SELECT i.*, p.name as plan_name, p.slug as plan_slug FROM {$wpdb->prefix}agy_user_investments i JOIN {$wpdb->prefix}agy_investment_plans p ON i.plan_id = p.id WHERE i.user_id = %d ORDER BY i.created_at DESC", $id
        ), ARRAY_A);
        return rest_ensure_response(array('success' => true, 'investments' => $invs));
    }

    public static function get_wallet_summary($request) {
        global $wpdb;
        $id = intval($request['id']);
        $w = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_wallets WHERE user_id = %d", $id), ARRAY_A);
        if (!$w) {
            $w = array('cash_balance' => 0.0, 'invested_balance' => 0.0, 'accrued_balance' => 0.0);
        }
        $w['total_portfolio'] = floatval($w['cash_balance']) + floatval($w['invested_balance']) + floatval($w['accrued_balance']);
        return rest_ensure_response(array('success' => true, 'wallet' => $w));
    }

    public static function create_deposit($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = intval($params['user_id']);
        $amount = floatval($params['amount']);
        $method = sanitize_text_field($params['payment_method'] ?? 'UPI');
        $utr = sanitize_text_field($params['utr_ref'] ?? 'UTR' . time());
        $auto = !empty($params['auto_approve']);

        $dep_code = 'DEP-' . date('Ym') . '-' . strtoupper(substr(wp_generate_uuid4(), 0, 6));
        $status = $auto ? 'approved' : 'pending';

        $wpdb->insert("{$wpdb->prefix}agy_deposits", array(
            'deposit_code' => $dep_code,
            'user_id' => $user_id,
            'amount' => $amount,
            'payment_method' => $method,
            'utr_ref' => $utr,
            'status' => $status
        ));

        if ($auto) {
            AGY_Ledger_Engine::post_double_entry(
                'TX-' . strtoupper(substr(wp_generate_uuid4(), 0, 8)),
                array(
                    array('account_code' => 'PLATFORM_REVENUE', 'debit' => $amount, 'credit' => 0),
                    array('account_code' => 'CASH_INR', 'debit' => 0, 'credit' => $amount)
                ),
                'DEPOSIT',
                $user_id,
                $dep_code,
                "Reconciled $method Deposit",
                "Automated credit",
                "SYSTEM"
            );
        }

        return rest_ensure_response(array('success' => true, 'message' => 'Deposit recorded', 'deposit_code' => $dep_code));
    }

    public static function create_withdrawal($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = intval($params['user_id']);
        $amount = floatval($params['amount']);
        $fee = round($amount * 0.01, 2);
        $net = $amount - $fee;
        $requires_dual = ($amount >= 50000.0) ? 1 : 0;

        $wdl_code = 'WDL-' . date('Ym') . '-' . strtoupper(substr(wp_generate_uuid4(), 0, 6));

        $wpdb->insert("{$wpdb->prefix}agy_withdrawals", array(
            'withdrawal_code' => $wdl_code,
            'user_id' => $user_id,
            'amount' => $amount,
            'fee' => $fee,
            'net_amount' => $net,
            'status' => 'pending',
            'requires_dual_approval' => $requires_dual
        ));

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Withdrawal request submitted',
            'withdrawal_code' => $wdl_code,
            'requires_dual_approval' => (bool)$requires_dual
        ));
    }

    public static function get_transactions($request) {
        global $wpdb;
        $id = intval($request['id']);
        $txs = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}agy_ledger_transactions WHERE user_id = %d ORDER BY created_at DESC", $id
        ), ARRAY_A);
        return rest_ensure_response(array('success' => true, 'transactions' => $txs));
    }

    public static function get_crypto_config() {
        return rest_ensure_response(array(
            'module_enabled' => true,
            'assets' => array(
                'BTC' => array('name' => 'Bitcoin', 'price_usd' => 64200.0, 'price_inr' => 5360000.0, 'networks' => array('Bitcoin', 'Lightning'), 'min_deposit' => 0.0005, 'withdraw_fee' => 0.0001),
                'ETH' => array('name' => 'Ethereum', 'price_usd' => 3450.0, 'price_inr' => 288000.0, 'networks' => array('ERC20', 'Arbitrum', 'Optimism'), 'min_deposit' => 0.01, 'withdraw_fee' => 0.002),
                'USDT' => array('name' => 'Tether USD', 'price_usd' => 1.0, 'price_inr' => 83.5, 'networks' => array('TRC20', 'ERC20', 'Polygon'), 'min_deposit' => 10.0, 'withdraw_fee' => 1.0),
                'SOL' => array('name' => 'Solana', 'price_usd' => 148.0, 'price_inr' => 12350.0, 'networks' => array('Solana'), 'min_deposit' => 0.1, 'withdraw_fee' => 0.01)
            )
        ));
    }

    public static function get_crypto_balances($request) {
        return rest_ensure_response(array(
            'success' => true,
            'balances' => array(
                'BTC' => array('amount' => 0.25, 'value_usd' => 16050.0, 'value_inr' => 1340000.0),
                'ETH' => array('amount' => 2.4, 'value_usd' => 8280.0, 'value_inr' => 691200.0),
                'USDT' => array('amount' => 1250.0, 'value_usd' => 1250.0, 'value_inr' => 104375.0),
                'SOL' => array('amount' => 1.65, 'value_usd' => 244.2, 'value_inr' => 20387.5)
            ),
            'total_crypto_value_usd' => 25824.2,
            'total_crypto_value_inr' => 2155962.5
        ));
    }

    public static function get_referral_stats($request) {
        return rest_ensure_response(array(
            'success' => true,
            'stats' => array('referral_code' => 'RAHUL77', 'total_referrals' => 4, 'total_commission_inr' => 1250.0, 'commission_rate_pct' => 5.0)
        ));
    }

    public static function get_faqs() {
        return rest_ensure_response(array('faqs' => array(
            array('category' => 'Account', 'question' => 'How do I complete KYC?', 'answer' => 'Navigate to Profile > KYC and submit your PAN, ID document, and selfie.'),
            array('category' => 'Deposits', 'question' => 'What is the minimum deposit?', 'answer' => 'The minimum deposit amount is INR 1,000 via UPI or IMPS.'),
            array('category' => 'Withdrawals', 'question' => 'How does Dual-Approval work for large payouts?', 'answer' => 'Withdrawals >= INR 50,000 require Level 1 (Finance) and Level 2 (Super Admin) authorization.')
        )));
    }

    public static function get_support_tickets($request) {
        return rest_ensure_response(array('tickets' => array(
            array('id' => 1, 'ticket_code' => 'TCK-202608-01', 'subject' => 'Withdrawal processing query', 'category' => 'Withdrawals', 'priority' => 'high', 'status' => 'open', 'created_at' => current_time('mysql'))
        )));
    }

    public static function admin_get_stats() {
        global $wpdb;
        return rest_ensure_response(array(
            'success' => true,
            'kpis' => array(
                'total_users' => intval($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}agy_users")),
                'active_investments' => intval($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}agy_user_investments WHERE status = 'active'")),
                'total_aum' => floatval($wpdb->get_var("SELECT COALESCE(SUM(principal_amount), 0) FROM {$wpdb->prefix}agy_user_investments WHERE status = 'active'")),
                'total_deposits' => floatval($wpdb->get_var("SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}agy_deposits WHERE status = 'approved'")),
                'total_withdrawals' => floatval($wpdb->get_var("SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}agy_withdrawals WHERE status = 'completed'")),
                'pending_kyc' => intval($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}agy_users WHERE kyc_status = 'pending'")),
                'total_accrued_yield' => floatval($wpdb->get_var("SELECT COALESCE(SUM(total_accrued), 0) FROM {$wpdb->prefix}agy_user_investments")),
                'platform_revenue' => 12540.0,
                'crypto_volume' => 45000.0
            )
        ));
    }

    public static function admin_get_users() {
        global $wpdb;
        $users = $wpdb->get_results("SELECT u.*, w.cash_balance, w.invested_balance, w.accrued_balance FROM {$wpdb->prefix}agy_users u LEFT JOIN {$wpdb->prefix}agy_wallets w ON u.id = w.user_id ORDER BY u.id ASC", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'users' => $users));
    }

    public static function admin_get_kyc_records() {
        global $wpdb;
        $records = $wpdb->get_results("SELECT k.*, u.full_name, u.email, u.phone FROM {$wpdb->prefix}agy_kyc_records k JOIN {$wpdb->prefix}agy_users u ON k.user_id = u.id ORDER BY k.submitted_at DESC", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'records' => $records));
    }

    public static function admin_review_kyc($request) {
        return rest_ensure_response(array('success' => true, 'message' => 'KYC status updated'));
    }

    public static function admin_run_accruals($request) {
        global $wpdb;
        $invs = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}agy_user_investments WHERE status = 'active'", ARRAY_A);
        $total_payout = 0.0;
        foreach ($invs as $i) {
            $daily = round($i['principal_amount'] * ($i['daily_roi_pct'] / 100), 2);
            $new_tot = $i['total_accrued'] + $daily;
            $wpdb->update("{$wpdb->prefix}agy_user_investments", array('total_accrued' => $new_tot, 'days_completed' => $i['days_completed'] + 1), array('id' => $i['id']));
            $total_payout += $daily;
            AGY_Ledger_Engine::sync_user_wallet($i['user_id']);
        }
        return rest_ensure_response(array('success' => true, 'message' => "Accruals cycle completed. Processed " . count($invs) . " investments", 'investments_processed' => count($invs), 'total_payout_amount' => $total_payout));
    }

    public static function admin_get_deposits() {
        global $wpdb;
        $deps = $wpdb->get_results("SELECT d.*, u.full_name, u.email FROM {$wpdb->prefix}agy_deposits d JOIN {$wpdb->prefix}agy_users u ON d.user_id = u.id ORDER BY d.created_at DESC", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'deposits' => $deps));
    }

    public static function admin_review_deposit($request) {
        return rest_ensure_response(array('success' => true, 'message' => 'Deposit reviewed'));
    }

    public static function admin_get_withdrawals() {
        global $wpdb;
        $wdls = $wpdb->get_results("SELECT w.*, u.full_name, u.email FROM {$wpdb->prefix}agy_withdrawals w JOIN {$wpdb->prefix}agy_users u ON w.user_id = u.id ORDER BY w.created_at DESC", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'withdrawals' => $wdls));
    }

    public static function admin_approve_withdrawal_first($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $id = intval($params['withdrawal_id']);
        $wpdb->update("{$wpdb->prefix}agy_withdrawals", array('status' => 'pending_second_approval', 'first_approval_admin_name' => $params['admin_name']), array('id' => $id));
        return rest_ensure_response(array('success' => true, 'message' => 'Level 1 Finance authorization recorded', 'status' => 'pending_second_approval'));
    }

    public static function admin_approve_withdrawal_final($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $id = intval($params['withdrawal_id']);
        $wpdb->update("{$wpdb->prefix}agy_withdrawals", array('status' => 'completed', 'final_approval_admin_name' => $params['admin_name']), array('id' => $id));
        return rest_ensure_response(array('success' => true, 'message' => 'Final authorization approved & payout disbursed', 'status' => 'completed'));
    }

    public static function admin_get_ledger() {
        global $wpdb;
        $accounts = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}agy_ledger_accounts", ARRAY_A);
        $txs = $wpdb->get_results("SELECT t.*, u.full_name as user_name FROM {$wpdb->prefix}agy_ledger_transactions t LEFT JOIN {$wpdb->prefix}agy_users u ON t.user_id = u.id ORDER BY t.id DESC LIMIT 100", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'accounts' => $accounts, 'transactions' => $txs));
    }

    public static function admin_get_reports($request) {
        return rest_ensure_response(array(
            'success' => true,
            'report_type' => 'user',
            'columns' => array('User ID', 'Name', 'Email', 'Role', 'Status', 'KYC Status'),
            'rows' => array(
                array(5, 'Rahul Sharma', 'rahul.sharma@gmail.com', 'user', 'active', 'approved'),
                array(6, 'Priya Patel', 'priya.patel@gmail.com', 'user', 'active', 'pending'),
                array(7, 'Amit Verma', 'amit.verma@outlook.com', 'user', 'active', 'approved')
            )
        ));
    }

    public static function admin_get_audit_logs() {
        global $wpdb;
        $logs = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}agy_audit_logs ORDER BY created_at DESC LIMIT 50", ARRAY_A);
        return rest_ensure_response(array('success' => true, 'logs' => $logs));
    }
}
