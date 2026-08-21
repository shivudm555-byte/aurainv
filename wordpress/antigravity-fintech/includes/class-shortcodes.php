<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_Shortcodes {

    public static function init() {
        add_shortcode('antigravity_fintech', array(__CLASS__, 'render_fintech_app'));
        add_shortcode('antigravity_admin', array(__CLASS__, 'render_admin_app'));

        // Register custom page template in page editor dropdown
        add_filter('theme_page_templates', array(__CLASS__, 'add_page_template'));
        add_filter('template_include', array(__CLASS__, 'load_page_template'));
    }

    public static function add_page_template($templates) {
        $templates['agy-fintech-canvas.php'] = __('⚡ Fintech Investment Platform (Full Page Canvas)', 'antigravity-fintech');
        return $templates;
    }

    public static function load_page_template($template) {
        if (is_page()) {
            $page_template = get_post_meta(get_the_ID(), '_wp_page_template', true);
            if ('agy-fintech-canvas.php' === $page_template) {
                $custom_template = AGY_FINTECH_PLUGIN_DIR . 'templates/app-container.php';
                if (file_exists($custom_template)) {
                    return $custom_template;
                }
            }
        }
        return $template;
    }

    public static function render_fintech_app($atts = array()) {
        ob_start();
        ?>
        <div id="toast-container"></div>
        <div id="app-shell" class="web-app-container agy-wp-embedded" style="min-height: 800px; background: var(--bg-primary);">
            <header class="web-navbar">
                <div class="web-nav-left">
                    <a href="javascript:void(0)" class="web-brand" onclick="WebPortal.setActiveTab('dashboard')">
                        <div class="web-brand-logo">₳</div>
                        <div class="web-brand-text">
                            <span class="web-brand-title">ANTIGRAVITY</span>
                            <span class="web-brand-subtitle">Fintech Pro</span>
                        </div>
                    </a>
                    <nav class="web-nav-links" id="web-nav-links-menu">
                        <button class="web-nav-link active" data-tab="dashboard"><span>📊</span> Dashboard</button>
                        <button class="web-nav-link" data-tab="plans"><span>🚀</span> Invest Plans</button>
                        <button class="web-nav-link" data-tab="wallet"><span>💳</span> Wallet & Banking</button>
                        <button class="web-nav-link" data-tab="crypto"><span>🪙</span> Crypto VDA</button>
                        <button class="web-nav-link" data-tab="referrals"><span>🤝</span> Referrals</button>
                        <button class="web-nav-link" data-tab="profile"><span>👤</span> Profile</button>
                        <button class="web-nav-link" data-tab="support"><span>💬</span> Support</button>
                    </nav>
                </div>
                <div class="web-nav-right">
                    <div class="user-quick-picker">
                        <span>👤 User:</span>
                        <select id="global-user-picker">
                            <option value="5" selected>Rahul Sharma (KYC Verified - ₹50k)</option>
                            <option value="6">Priya Patel (KYC Pending - ₹25k)</option>
                            <option value="7">Amit Verma (HNW - Pending ₹80k)</option>
                            <option value="8">Kavita Reddy (KYC Rejected)</option>
                        </select>
                    </div>
                    <button id="web-admin-toggle-btn" class="btn btn-secondary btn-sm" onclick="App.toggleAdminMode()"><span>🖥️</span> Admin Panel</button>
                    <button id="theme-toggle-btn" class="icon-btn">🌙</button>
                </div>
            </header>

            <!-- Main Web Viewport -->
            <main id="web-content-viewport" class="web-main-content">
                <!-- Populated dynamically by WebPortal -->
            </main>

            <!-- Embedded Admin Layout (Toggled on demand) -->
            <section id="admin-app-wrapper" class="admin-layout-wrapper" style="display: none; min-height: 800px;">
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
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_admin_app() {
        return self::render_fintech_app(array('mode' => 'admin_panel'));
    }
}
