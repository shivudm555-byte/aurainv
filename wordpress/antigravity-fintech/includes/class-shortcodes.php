<?php
if (!defined('ABSPATH')) {
    exit;
}

class AGY_Shortcodes {

    public static function init() {
        add_shortcode('antigravity_fintech', array(__CLASS__, 'render_fintech_app'));
        add_shortcode('antigravity_admin', array(__CLASS__, 'render_admin_app'));
    }

    public static function render_fintech_app($atts = array()) {
        $atts = shortcode_atts(array(
            'mode' => 'split_sync' // 'split_sync', 'mobile_frame', 'mobile_full', 'admin_panel'
        ), $atts, 'antigravity_fintech');

        ob_start();
        ?>
        <div id="toast-container"></div>
        <div id="app-shell" class="agy-wp-embedded" style="min-height: 850px; background: var(--bg-primary);">
            <header class="platform-top-bar">
                <div class="brand-badge">
                    <div class="logo-icon">₳</div>
                    <div>
                        <span>ANTIGRAVITY</span>
                        <span class="badge-sub">FINTECH PRO</span>
                    </div>
                </div>
                <div class="view-mode-tabs">
                    <button class="view-tab-btn <?php echo ($atts['mode'] === 'mobile_frame') ? 'active' : ''; ?>" data-mode="mobile_frame"><span>📱</span> Mobile View</button>
                    <button class="view-tab-btn <?php echo ($atts['mode'] === 'mobile_full') ? 'active' : ''; ?>" data-mode="mobile_full"><span>📲</span> Full Mobile</button>
                    <button class="view-tab-btn <?php echo ($atts['mode'] === 'admin_panel') ? 'active' : ''; ?>" data-mode="admin_panel"><span>🖥️</span> Admin Panel</button>
                    <button class="view-tab-btn <?php echo ($atts['mode'] === 'split_sync') ? 'active' : ''; ?>" data-mode="split_sync"><span>⚡</span> Split-Screen Sync</button>
                </div>
                <div class="top-bar-actions">
                    <div class="user-quick-picker">
                        <span>👤 Mobile User:</span>
                        <select id="global-user-picker">
                            <option value="5" selected>Rahul Sharma (KYC Verified - ₹50k)</option>
                            <option value="6">Priya Patel (KYC Pending - ₹25k)</option>
                            <option value="7">Amit Verma (HNW - Pending ₹80k Wdl)</option>
                            <option value="8">Kavita Reddy (KYC Rejected)</option>
                        </select>
                    </div>
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

            <main id="workspace-view-container" class="workspace-container">
                <!-- Mobile Simulator -->
                <section id="mobile-app-wrapper" class="mobile-view-wrapper">
                    <div class="phone-simulator-frame">
                        <div class="phone-notch-area"><div class="notch-camera"></div><div class="notch-sensor"></div></div>
                        <div class="phone-status-bar">
                            <span id="phone-time-clock">9:41</span>
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

                <!-- Admin Control Center -->
                <section id="admin-app-wrapper" class="admin-layout-wrapper">
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
        <?php
        return ob_get_clean();
    }

    public static function render_admin_app() {
        return self::render_fintech_app(array('mode' => 'admin_panel'));
    }
}
