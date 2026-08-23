<?php
/**
 * Footer Template for Antigravity Fintech Theme
 *
 * @package Antigravity_Fintech_Theme
 * @version 2.5.0
 */
if (!defined('ABSPATH')) {
    exit;
}
?>
    <footer class="web-footer">
        <div class="web-footer-grid">
            <div class="web-footer-col">
                <div class="web-brand">
                    <div class="web-brand-logo">₳</div>
                    <div class="web-brand-text">
                        <span class="web-brand-title"><?php bloginfo('name'); ?></span>
                        <span class="web-brand-subtitle">Fintech Pro</span>
                    </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-top: 8px;">
                    An institutional-grade digital investment and virtual digital assets platform built for WordPress. Featuring double-entry accounting ledgers, algorithmic yield strategies, and cryptographic security.
                </p>
            </div>

            <div class="web-footer-col">
                <div class="web-footer-title">Platform</div>
                <a href="<?php echo esc_url(home_url('/')); ?>" class="web-footer-link">Home</a>
                <a href="<?php echo esc_url(home_url('/how-it-works/')); ?>" class="web-footer-link">How It Works</a>
                <a href="<?php echo esc_url(home_url('/investment-plans/')); ?>" class="web-footer-link">Investment Plans</a>
                <a href="<?php echo esc_url(home_url('/digital-assets/')); ?>" class="web-footer-link">Digital Assets</a>
                <a href="<?php echo esc_url(home_url('/security/')); ?>" class="web-footer-link">Security Architecture</a>
            </div>

            <div class="web-footer-col">
                <div class="web-footer-title">Company & Help</div>
                <a href="<?php echo esc_url(home_url('/about/')); ?>" class="web-footer-link">About Us</a>
                <a href="<?php echo esc_url(home_url('/faq/')); ?>" class="web-footer-link">FAQ & Helpdesk</a>
                <a href="<?php echo esc_url(home_url('/contact/')); ?>" class="web-footer-link">Contact Support</a>
                <a href="<?php echo esc_url(home_url('/dashboard/#support')); ?>" class="web-footer-link">Submit Ticket</a>
            </div>

            <div class="web-footer-col">
                <div class="web-footer-title">Investor Portal</div>
                <a href="<?php echo esc_url(home_url('/dashboard/')); ?>" class="web-footer-link">User Dashboard</a>
                <a href="<?php echo esc_url(home_url('/dashboard/#investments')); ?>" class="web-footer-link">Active Investments</a>
                <a href="<?php echo esc_url(home_url('/dashboard/#wallet')); ?>" class="web-footer-link">Wallet & Deposits</a>
                <a href="<?php echo esc_url(home_url('/dashboard/#referrals')); ?>" class="web-footer-link">Referral Program</a>
                <a href="<?php echo esc_url(home_url('/register/')); ?>" class="web-footer-link">Register Account</a>
            </div>

            <div class="web-footer-col">
                <div class="web-footer-title">Compliance & Legal</div>
                <a href="<?php echo esc_url(home_url('/terms/')); ?>" class="web-footer-link">Terms & Conditions</a>
                <a href="<?php echo esc_url(home_url('/privacy/')); ?>" class="web-footer-link">Privacy Policy</a>
                <a href="<?php echo esc_url(home_url('/risk-disclosure/')); ?>" class="web-footer-link">Risk Disclosure</a>
                <a href="<?php echo esc_url(home_url('/kyc-aml-policy/')); ?>" class="web-footer-link">KYC / AML Policy</a>
                <a href="<?php echo esc_url(home_url('/cookie-policy/')); ?>" class="web-footer-link">Cookie Policy</a>
            </div>
        </div>

        <div class="web-footer-disclaimer">
            <strong>IMPORTANT PROTOTYPE & REGULATORY NOTICE:</strong> This website is an institutional demonstration and functional prototype of the Antigravity Fintech platform. Do not process real customer money or live cryptocurrency in this environment. The platform is engineered with mock transaction data and simulated banking/crypto rails so that regulated financial and virtual digital asset functionalities can be enabled only after appropriate legal, KYC/AML, tax, and regulatory compliance reviews under applicable jurisdictional laws. Indicative returns shown on investment plans are simulated algorithmic projections and do not constitute guaranteed profits or risk-free investments.
        </div>

        <div class="web-footer-bottom">
            <span>© <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</span>
            <span>WordPress Enterprise Fintech Engine v2.5.0</span>
        </div>
    </footer>
</div>

<?php wp_footer(); ?>
</body>
</html>
