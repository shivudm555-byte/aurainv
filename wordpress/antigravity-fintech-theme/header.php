<?php
/**
 * Header Template for Antigravity Fintech Theme
 *
 * @package Antigravity_Fintech_Theme
 * @version 2.5.0
 */
if (!defined('ABSPATH')) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> data-theme="dark">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="app-shell" class="web-app-container">
    <header class="web-navbar">
        <div class="web-nav-left">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="web-brand">
                <div class="web-brand-logo">₳</div>
                <div class="web-brand-text">
                    <span class="web-brand-title"><?php bloginfo('name'); ?></span>
                    <span class="web-brand-subtitle"><?php bloginfo('description'); ?></span>
                </div>
            </a>

            <nav class="web-nav-links" id="web-nav-links-menu">
                <a href="<?php echo esc_url(home_url('/')); ?>" class="web-nav-link active">
                    <span>🏠</span> Home
                </a>
                <a href="<?php echo esc_url(home_url('/how-it-works/')); ?>" class="web-nav-link">
                    <span>⚡</span> How It Works
                </a>
                <a href="<?php echo esc_url(home_url('/investment-plans/')); ?>" class="web-nav-link">
                    <span>📊</span> Investment Plans
                </a>
                <a href="<?php echo esc_url(home_url('/digital-assets/')); ?>" class="web-nav-link">
                    <span>🪙</span> Digital Assets
                </a>
                <a href="<?php echo esc_url(home_url('/security/')); ?>" class="web-nav-link">
                    <span>🛡️</span> Security
                </a>
                <a href="<?php echo esc_url(home_url('/about/')); ?>" class="web-nav-link">
                    <span>🏛️</span> About
                </a>
                <a href="<?php echo esc_url(home_url('/faq/')); ?>" class="web-nav-link">
                    <span>❓</span> FAQ
                </a>
                <a href="<?php echo esc_url(home_url('/contact/')); ?>" class="web-nav-link">
                    <span>✉️</span> Contact
                </a>
            </nav>
        </div>

        <div class="web-nav-right">
            <?php if (is_user_logged_in()) : ?>
                <a href="<?php echo esc_url(home_url('/dashboard/')); ?>" class="btn btn-primary btn-sm" style="font-weight: 700;">
                    <span>🚀</span> User Dashboard
                </a>
                <a href="<?php echo esc_url(wp_logout_url(home_url('/'))); ?>" class="btn btn-secondary btn-sm">
                    Logout
                </a>
            <?php else : ?>
                <a href="<?php echo esc_url(home_url('/login/')); ?>" class="btn btn-secondary btn-sm">
                    Login
                </a>
                <a href="<?php echo esc_url(home_url('/register/')); ?>" class="btn btn-primary btn-sm" style="font-weight: 700;">
                    Get Started
                </a>
            <?php endif; ?>

            <button id="theme-toggle-btn" class="icon-btn" title="Toggle Light/Dark Theme">
                🌙
            </button>
        </div>
    </header>
