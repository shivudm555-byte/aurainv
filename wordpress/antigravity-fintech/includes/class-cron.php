<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_Cron {

    public static function init() {
        add_action('agy_daily_accrual_cycle', array(__CLASS__, 'execute_daily_accruals'));
    }

    public static function schedule_events() {
        if (!wp_next_scheduled('agy_daily_accrual_cycle')) {
            wp_schedule_event(time(), 'daily', 'agy_daily_accrual_cycle');
        }
    }

    public static function clear_events() {
        $timestamp = wp_next_scheduled('agy_daily_accrual_cycle');
        if ($timestamp) {
            wp_unschedule_event($timestamp, 'agy_daily_accrual_cycle');
        }
    }

    public static function execute_daily_accruals() {
        global $wpdb;

        $active_investments = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}agy_user_investments WHERE status = 'active'", ARRAY_A);
        if (empty($active_investments)) return;

        foreach ($active_investments as $inv) {
            $daily_yield = round($inv['principal_amount'] * ($inv['daily_roi_pct'] / 100), 2);
            $new_total_accrued = floatval($inv['total_accrued']) + $daily_yield;
            $new_days = intval($inv['days_completed']) + 1;
            $status = ($new_days >= intval($inv['duration_days'])) ? 'matured' : 'active';

            $wpdb->update(
                "{$wpdb->prefix}agy_user_investments",
                array(
                    'total_accrued' => $new_total_accrued,
                    'days_completed' => $new_days,
                    'status' => $status,
                    'last_accrual_date' => current_time('mysql')
                ),
                array('id' => $inv['id'])
            );

            // Post double entry for interest distribution
            AGY_Ledger_Engine::post_double_entry(
                'TX-' . strtoupper(substr(wp_generate_uuid4(), 0, 8)),
                array(
                    array('account_code' => 'PLATFORM_REVENUE', 'debit' => $daily_yield, 'credit' => 0),
                    array('account_code' => 'ACCRUED_EARNINGS', 'debit' => 0, 'credit' => $daily_yield)
                ),
                'ACCRUAL_PAYOUT',
                $inv['user_id'],
                $inv['investment_code'],
                "Daily yield distribution {$inv['daily_roi_pct']}%",
                "Automated WP-Cron cycle",
                "WP_CRON_ENGINE"
            );

            AGY_Ledger_Engine::sync_user_wallet($inv['user_id']);
        }
    }
}
