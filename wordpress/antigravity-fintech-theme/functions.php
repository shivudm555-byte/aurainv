<?php
if (!defined('ABSPATH')) {
    exit;
}

function agy_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
}
add_action('after_setup_theme', 'agy_theme_setup');

function agy_theme_scripts() {
    // Fonts
    wp_enqueue_style('agy-theme-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@500;600;700;800;900&display=swap', array(), null);

    // If plugin is active, plugin handles enqueues. If standalone theme, we can load fallback styles
    if (!class_exists('Antigravity_Fintech')) {
        // Enqueue plugin assets if installed in plugin directory
        $plugin_url = content_url('plugins/antigravity-fintech/');
        wp_enqueue_style('agy-base-css', $plugin_url . 'assets/css/base.css', array(), '2.5.0');
        wp_enqueue_style('agy-mobile-css', $plugin_url . 'assets/css/mobile-app.css', array('agy-base-css'), '2.5.0');
        wp_enqueue_style('agy-admin-css', $plugin_url . 'assets/css/admin-panel.css', array('agy-base-css'), '2.5.0');
        wp_enqueue_style('agy-components-css', $plugin_url . 'assets/css/components.css', array('agy-base-css'), '2.5.0');
    }
}
add_action('wp_enqueue_scripts', 'agy_theme_scripts');
