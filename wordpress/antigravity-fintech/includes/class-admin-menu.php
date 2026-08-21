<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_Admin_Menu {

    public static function init() {
        add_action('admin_menu', array(__CLASS__, 'register_admin_menus'));
    }

    public static function register_admin_menus() {
        $cap = 'manage_options';

        // Top Level Menu
        add_menu_page(
            __('Antigravity Fintech', 'antigravity-fintech'),
            __('⚡ Antigravity Fintech', 'antigravity-fintech'),
            $cap,
            'antigravity-fintech',
            array(__CLASS__, 'render_admin_dashboard'),
            'dashicons-chart-area',
            25
        );

        // Submenus
        add_submenu_page('antigravity-fintech', __('Executive Dashboard', 'antigravity-fintech'), __('Dashboard', 'antigravity-fintech'), $cap, 'antigravity-fintech', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('User Management', 'antigravity-fintech'), __('Users', 'antigravity-fintech'), $cap, 'agy-users', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('KYC Verification Desk', 'antigravity-fintech'), __('KYC Desk', 'antigravity-fintech'), $cap, 'agy-kyc', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Investment Plans', 'antigravity-fintech'), __('Investments', 'antigravity-fintech'), $cap, 'agy-investments', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Daily Accruals Engine', 'antigravity-fintech'), __('Accruals Engine', 'antigravity-fintech'), $cap, 'agy-accruals', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Deposits Desk', 'antigravity-fintech'), __('Deposits', 'antigravity-fintech'), $cap, 'agy-deposits', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Dual-Approval Payouts', 'antigravity-fintech'), __('Withdrawals', 'antigravity-fintech'), $cap, 'agy-withdrawals', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Crypto & VDA Admin', 'antigravity-fintech'), __('Crypto VDA', 'antigravity-fintech'), $cap, 'agy-crypto', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Double-Entry Ledger', 'antigravity-fintech'), __('Ledger Explorer', 'antigravity-fintech'), $cap, 'agy-ledger', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Compliance Reports', 'antigravity-fintech'), __('Reports (CSV)', 'antigravity-fintech'), $cap, 'agy-reports', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Support Tickets', 'antigravity-fintech'), __('Support Helpdesk', 'antigravity-fintech'), $cap, 'agy-support', array(__CLASS__, 'render_admin_dashboard'));
        add_submenu_page('antigravity-fintech', __('Settings & Audit Trail', 'antigravity-fintech'), __('Settings', 'antigravity-fintech'), $cap, 'agy-settings', array(__CLASS__, 'render_admin_dashboard'));
    }

    public static function render_admin_dashboard() {
        ?>
        <div class="wrap" style="margin: 0; padding: 0;">
            <div id="app-shell" style="min-height: calc(100vh - 50px); background: var(--bg-primary);">
                <div id="toast-container"></div>
                <header class="platform-top-bar" style="margin-top: 10px;">
                    <div class="brand-badge">
                        <div class="logo-icon">₳</div>
                        <div>
                            <span>ANTIGRAVITY</span>
                            <span class="badge-sub">FINTECH PRO (WP)</span>
                        </div>
                    </div>
                    <div class="view-mode-tabs">
                        <button class="view-tab-btn" data-mode="mobile_frame"><span>📱</span> Mobile View</button>
                        <button class="view-tab-btn" data-mode="mobile_full"><span>📲</span> Full Mobile</button>
                        <button class="view-tab-btn active" data-mode="admin_panel"><span>🖥️</span> Admin Web Panel</button>
                        <button class="view-tab-btn" data-mode="split_sync"><span>⚡</span> Split-Screen Live Sync</button>
                    </div>
                    <div class="top-bar-actions">
                        <div class="user-quick-picker">
                            <span>🛡️ Admin:</span>
                            <select id="admin-role-picker">
                                <option value="super_admin" selected>Super Admin (Singhania)</option>
                                <option value="finance_admin">Finance Admin (Nambiar)</option>
                                <option value="kyc_admin">KYC Admin (Iyer)</option>
                                <option value="ops_admin">Ops Admin (Sen)</option>
                            </select>
                        </div>
                        <button id="theme-toggle-btn" class="icon-btn">🌙</button>
                    </div>
                </header>

                <main id="workspace-view-container" class="workspace-container" style="min-height: 800px;">
                    <!-- LEFT: Mobile View -->
                    <section id="mobile-app-wrapper" class="mobile-view-wrapper" style="display: none;">
                        <div class="phone-simulator-frame">
                            <div class="phone-notch-area"><div class="notch-camera"></div><div class="notch-sensor"></div></div>
                            <div class="phone-status-bar">
                                <span>9:41</span>
                                <div class="status-bar-icons"><span>5G</span><span>📶</span><span>🔋 98%</span></div>
                            </div>
                            <div class="mobile-screen-viewport">
                                <div id="mobile-screen-content" class="screen-content-scroll"></div>
                                <nav id="mobile-bottom-nav" class="phone-bottom-nav">
                                    <button class="nav-tab-item active" data-screen="home"><span class="nav-icon">🏠</span><span>Home</span></button>
                                    <button class="nav-tab-item" data-screen="invest_plans"><span class="nav-icon">🚀</span><span>Invest</span></button>
                                    <button class="nav-tab-item" data-screen="wallet"><span class="nav-icon">💳</span><span>Wallet</span></button>
                                    <button class="nav-tab-item" data-screen="transactions"><span class="nav-icon">📋</span><span>History</span></button>
                                    <button class="nav-tab-item" data-screen="profile"><span class="nav-icon">👤</span><span>Profile</span></button>
                                </nav>
                                <div class="phone-home-indicator"></div>
                            </div>
                        </div>
                    </section>

                    <!-- RIGHT: Admin Layout -->
                    <section id="admin-app-wrapper" class="admin-layout-wrapper" style="display: flex;">
                        <aside class="admin-sidebar">
                            <div class="admin-sidebar-header">
                                <div class="admin-brand-title"><span style="color: var(--primary);">⚡</span> Antigravity Admin</div>
                                <div class="admin-role-badge-box"><span id="admin-current-role-tag" class="role-tag">Super Administrator</span></div>
                            </div>
                            <nav class="admin-nav-menu">
                                <div class="nav-section-heading">Overview</div>
                                <button class="admin-nav-item active" data-tab="dashboard"><span>📊</span> Executive Dashboard</button>
                                <div class="nav-section-heading">User & Compliance</div>
                                <button class="admin-nav-item" data-tab="users"><span>👥</span> User Management</button>
                                <button class="admin-nav-item" data-tab="kyc"><span>🪪</span> KYC Verification Desk</button>
                                <div class="nav-section-heading">Investments & Earnings</div>
                                <button class="admin-nav-item" data-tab="investments"><span>💼</span> Investment Plans</button>
                                <button class="admin-nav-item" data-tab="earnings"><span>📈</span> Daily Accruals Engine</button>
                                <div class="nav-section-heading">Banking & Liquidity</div>
                                <button class="admin-nav-item" data-tab="deposits"><span>📥</span> Deposits Desk</button>
                                <button class="admin-nav-item" data-tab="withdrawals"><span>📤</span> Dual-Approval Desk</button>
                                <button class="admin-nav-item" data-tab="crypto"><span>🪙</span> Crypto & VDA Admin</button>
                                <div class="nav-section-heading">Financial Ledger</div>
                                <button class="admin-nav-item" data-tab="ledger"><span>📖</span> Double-Entry Ledger</button>
                                <button class="admin-nav-item" data-tab="reports"><span>📋</span> Compliance Reports</button>
                                <div class="nav-section-heading">Operations & Support</div>
                                <button class="admin-nav-item" data-tab="tickets"><span>💬</span> Support Helpdesk</button>
                                <button class="admin-nav-item" data-tab="audit"><span>🛡️</span> System Audit Logs</button>
                                <button class="admin-nav-item" data-tab="settings"><span>⚙️</span> Platform Settings</button>
                            </nav>
                        </aside>
                        <div id="admin-content-viewport" class="admin-main-viewport"></div>
                    </section>
                </main>
            </div>
        </div>
        <?php
    }
}
