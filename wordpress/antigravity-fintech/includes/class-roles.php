<?php
/**
 * Role-Based Access Control (RBAC) for Antigravity Fintech
 *
 * @package Antigravity_Fintech
 * @version 2.5.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class AGY_Roles {

    public static function init() {
        add_action('init', array(__CLASS__, 'register_roles'));
    }

    public static function register_roles() {
        // 1. Super Admin
        add_role('agy_super_admin', __('Fintech Super Admin', 'antigravity-fintech'), array(
            'read'                   => true,
            'manage_agy_fintech'     => true,
            'manage_agy_users'       => true,
            'manage_agy_kyc'         => true,
            'manage_agy_plans'       => true,
            'manage_agy_investments' => true,
            'manage_agy_earnings'    => true,
            'manage_agy_deposits'    => true,
            'manage_agy_withdrawals' => true,
            'manage_agy_ledger'      => true,
            'manage_agy_reports'     => true,
            'manage_agy_tickets'     => true,
            'manage_agy_audit'       => true,
            'manage_agy_settings'    => true,
            'sign_agy_dual_approval' => true
        ));

        // 2. Finance Admin
        add_role('agy_finance_admin', __('Fintech Finance Admin', 'antigravity-fintech'), array(
            'read'                   => true,
            'manage_agy_deposits'    => true,
            'manage_agy_withdrawals' => true,
            'manage_agy_ledger'      => true,
            'manage_agy_reports'     => true,
            'manage_agy_earnings'    => true,
            'sign_agy_dual_approval' => true
        ));

        // 3. KYC Compliance Admin
        add_role('agy_kyc_admin', __('Fintech KYC Admin', 'antigravity-fintech'), array(
            'read'               => true,
            'manage_agy_kyc'     => true,
            'manage_agy_users'   => true,
            'manage_agy_reports' => true
        ));

        // 4. Operations Admin
        add_role('agy_ops_admin', __('Fintech Operations Admin', 'antigravity-fintech'), array(
            'read'                   => true,
            'manage_agy_plans'       => true,
            'manage_agy_investments' => true,
            'manage_agy_tickets'     => true,
            'manage_agy_reports'     => true
        ));

        // 5. Support Admin
        add_role('agy_support_admin', __('Fintech Support Admin', 'antigravity-fintech'), array(
            'read'               => true,
            'manage_agy_tickets' => true,
            'manage_agy_users'   => true
        ));

        // 6. Investor / Client
        add_role('agy_investor', __('Fintech Investor', 'antigravity-fintech'), array(
            'read'                 => true,
            'access_agy_dashboard' => true
        ));

        // Ensure Administrator has all capabilities
        $admin = get_role('administrator');
        if ($admin) {
            $admin->add_cap('manage_agy_fintech');
            $admin->add_cap('manage_agy_users');
            $admin->add_cap('manage_agy_kyc');
            $admin->add_cap('manage_agy_plans');
            $admin->add_cap('manage_agy_investments');
            $admin->add_cap('manage_agy_earnings');
            $admin->add_cap('manage_agy_deposits');
            $admin->add_cap('manage_agy_withdrawals');
            $admin->add_cap('manage_agy_ledger');
            $admin->add_cap('manage_agy_reports');
            $admin->add_cap('manage_agy_tickets');
            $admin->add_cap('manage_agy_audit');
            $admin->add_cap('manage_agy_settings');
            $admin->add_cap('sign_agy_dual_approval');
        }
    }
}
