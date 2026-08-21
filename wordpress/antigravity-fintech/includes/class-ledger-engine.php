<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_Ledger_Engine {

    /**
     * Post balanced double-entry transaction to immutable ledger
     */
    public static function post_double_entry($transaction_id, $postings, $transaction_type, $user_id = null, $reference_id = '', $description = '', $audit_reason = '', $created_by = 'SYSTEM') {
        global $wpdb;

        $total_debits = 0.0;
        $total_credits = 0.0;

        foreach ($postings as $p) {
            $total_debits += floatval($p['debit']);
            $total_credits += floatval($p['credit']);
        }

        if (round($total_debits, 2) !== round($total_credits, 2)) {
            return array('success' => false, 'message' => "Ledger Imbalance: Debits ($total_debits) != Credits ($total_credits)");
        }

        foreach ($postings as $p) {
            $code = $p['account_code'];
            $debit = floatval($p['debit']);
            $credit = floatval($p['credit']);

            // Get account
            $acc = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_ledger_accounts WHERE code = %s", $code));
            if (!$acc) {
                $wpdb->insert("{$wpdb->prefix}agy_ledger_accounts", array(
                    'code' => $code,
                    'name' => ucwords(str_replace('_', ' ', $code)),
                    'account_type' => 'LIABILITY',
                    'balance' => 0.00
                ));
                $acc = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}agy_ledger_accounts WHERE code = %s", $code));
            }

            $current_balance = floatval($acc->balance);
            $new_balance = in_array($acc->account_type, array('ASSET', 'EXPENSE'))
                ? ($current_balance + $debit - $credit)
                : ($current_balance + $credit - $debit);

            // Update account balance
            $wpdb->update("{$wpdb->prefix}agy_ledger_accounts", array('balance' => $new_balance), array('code' => $code));

            // Insert immutable transaction entry
            $wpdb->insert("{$wpdb->prefix}agy_ledger_transactions", array(
                'transaction_id' => $transaction_id,
                'user_id' => $user_id,
                'ledger_account_code' => $code,
                'debit_amount' => $debit,
                'credit_amount' => $credit,
                'balance_after' => $new_balance,
                'transaction_type' => $transaction_type,
                'reference_id' => $reference_id,
                'description' => $description,
                'audit_reason' => $audit_reason,
                'created_by' => $created_by
            ));
        }

        if ($user_id) {
            self::sync_user_wallet($user_id);
        }

        return array('success' => true, 'transaction_id' => $transaction_id);
    }

    /**
     * Reconcile and synchronize user wallet balance
     */
    public static function sync_user_wallet($user_id) {
        global $wpdb;

        // Deposits
        $total_dep = floatval($wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}agy_deposits WHERE user_id = %d AND status = 'approved'", $user_id
        )));

        // Investments Active Principal
        $active_inv = floatval($wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(principal_amount), 0) FROM {$wpdb->prefix}agy_user_investments WHERE user_id = %d AND status = 'active'", $user_id
        )));

        // Total Accrued Yield
        $total_accrued = floatval($wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(total_accrued), 0) FROM {$wpdb->prefix}agy_user_investments WHERE user_id = %d", $user_id
        )));

        // Withdrawals
        $total_wdl = floatval($wpdb->get_var($wpdb->prepare(
            "SELECT COALESCE(SUM(amount), 0) FROM {$wpdb->prefix}agy_withdrawals WHERE user_id = %d AND status != 'rejected'", $user_id
        )));

        // Net Cash Balance = Deposits - Active Investments - Withdrawals
        $cash_balance = max(0.0, $total_dep - $active_inv - $total_wdl);

        $wpdb->update(
            "{$wpdb->prefix}agy_wallets",
            array(
                'cash_balance' => $cash_balance,
                'invested_balance' => $active_inv,
                'accrued_balance' => $total_accrued,
                'updated_at' => current_time('mysql')
            ),
            array('user_id' => $user_id)
        );
    }
}
