<?php
/**
 * Plugin Name: Antigravity Fintech — Modern Investment Platform & Admin Control Center
 * Plugin URI: https://github.com/shivudm555-byte/invest
 * Description: An institutional-grade fintech mobile investment platform, double-entry financial accounting ledger, dual-admin withdrawal authorization, Supabase email auth, and interactive administrative control center.
 * Version: 2.5.0
 * Author: Antigravity Deepmind & shivudm555-byte
 * Author URI: https://github.com/shivudm555-byte
 * Text Domain: antigravity-fintech
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('AGY_FINTECH_VERSION', '2.5.0');
define('AGY_FINTECH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('AGY_FINTECH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('AGY_FINTECH_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Autoload Core Classes
require_once AGY_FINTECH_PLUGIN_DIR . 'includes/class-database.php';
require_once AGY_FINTECH_PLUGIN_DIR . 'includes/class-ledger-engine.php';
require_once AGY_FINTECH_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once AGY_FINTECH_PLUGIN_DIR . 'includes/class-admin-menu.php';
require_once AGY_FINTECH_PLUGIN_DIR . 'includes/class-cron.php';
require_once AGY_FINTECH_PLUGIN_DIR . 'includes/class-shortcodes.php';

/**
 * Main Plugin Class
 */
class Antigravity_Fintech {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Activation & Deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));

        // Initialize Modules
        add_action('plugins_loaded', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
    }

    public function activate() {
        AGY_Database::create_tables();
        AGY_Database::seed_initial_data();
        AGY_Cron::schedule_events();
        flush_rewrite_rules();
    }

    public function deactivate() {
        AGY_Cron::clear_events();
        flush_rewrite_rules();
    }

    public function init() {
        // Initialize REST API & Admin
        AGY_REST_API::init();
        AGY_Admin_Menu::init();
        AGY_Cron::init();
        AGY_Shortcodes::init();
    }

    public function enqueue_frontend_assets() {
        // Enqueue Google Fonts
        wp_enqueue_style('agy-google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@500;600;700;800;900&display=swap', array(), null);

        // Core Styles
        wp_enqueue_style('agy-base-css', AGY_FINTECH_PLUGIN_URL . 'assets/css/base.css', array(), AGY_FINTECH_VERSION);
        wp_enqueue_style('agy-web-portal-css', AGY_FINTECH_PLUGIN_URL . 'assets/css/web-portal.css', array('agy-base-css'), AGY_FINTECH_VERSION);
        wp_enqueue_style('agy-admin-css', AGY_FINTECH_PLUGIN_URL . 'assets/css/admin-panel.css', array('agy-base-css'), AGY_FINTECH_VERSION);
        wp_enqueue_style('agy-components-css', AGY_FINTECH_PLUGIN_URL . 'assets/css/components.css', array('agy-base-css'), AGY_FINTECH_VERSION);

        // Supabase JS SDK
        wp_enqueue_script('supabase-sdk', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', array(), '2.0.0', true);

        // Core JS Controllers
        wp_enqueue_script('agy-api-js', AGY_FINTECH_PLUGIN_URL . 'assets/js/api.js', array('supabase-sdk'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-store-js', AGY_FINTECH_PLUGIN_URL . 'assets/js/store.js', array('agy-api-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-supabase-auth', AGY_FINTECH_PLUGIN_URL . 'assets/js/supabase_auth.js', array('agy-api-js', 'supabase-sdk'), AGY_FINTECH_VERSION, true);

        // Web Portal Controller
        wp_enqueue_script('agy-web-portal', AGY_FINTECH_PLUGIN_URL . 'assets/js/web/web_portal.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-dash', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/dashboard.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-invest', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/investment.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-earnings', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/earnings.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-wallet', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/wallet.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-crypto', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/crypto.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-referral', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/referral.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-profile', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/profile.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-support', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/support.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-mobile-router', AGY_FINTECH_PLUGIN_URL . 'assets/js/mobile/router.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);

        // Admin Controllers
        wp_enqueue_script('agy-admin-dash', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/dashboard.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-users', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/user_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-kyc', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/kyc_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-invest', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/invest_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-earnings', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/earnings_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-deposits', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/deposit_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-withdrawals', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/withdraw_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-crypto', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/crypto_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-ledger', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/ledger_view.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-reports', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/reports.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-tickets', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/tickets_mgmt.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-audit', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/audit_logs.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);
        wp_enqueue_script('agy-admin-nav', AGY_FINTECH_PLUGIN_URL . 'assets/js/admin/admin_nav.js', array('agy-store-js'), AGY_FINTECH_VERSION, true);

        // App Bootstrapper
        wp_enqueue_script('agy-app-js', AGY_FINTECH_PLUGIN_URL . 'assets/js/app.js', array('agy-mobile-router', 'agy-admin-nav'), AGY_FINTECH_VERSION, true);

        // Localize Script with WP REST API URL & Nonce
        wp_localize_script('agy-api-js', 'agy_wp_vars', array(
            'rest_url' => esc_url_raw(rest_url('antigravity/v1')),
            'nonce'    => wp_create_nonce('wp_rest'),
            'ajax_url' => admin_url('admin-ajax.php'),
            'user_id'  => get_current_user_id()
        ));
    }

    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'antigravity') !== false) {
            $this->enqueue_frontend_assets();
        }
    }
}

// Instantiate Plugin
Antigravity_Fintech::get_instance();
