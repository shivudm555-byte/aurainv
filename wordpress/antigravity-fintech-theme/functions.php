<?php
/**
 * Antigravity Fintech Theme Functions & Definitions
 *
 * @package Antigravity_Fintech_Theme
 * @version 2.5.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function agy_theme_setup() {
    // Make theme available for translation
    load_theme_textdomain('antigravity-fintech-theme', get_template_directory() . '/languages');

    // Add default posts and comments RSS feed links to head
    add_theme_support('automatic-feed-links');

    // Title tag support
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages
    add_theme_support('post-thumbnails');

    // Switch default core markup for search form, comment form, etc. to output valid HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));

    // Register primary navigation menu
    register_nav_menus(array(
        'primary-menu' => __('Primary Header Navigation', 'antigravity-fintech-theme'),
        'footer-menu'  => __('Footer Compliance Navigation', 'antigravity-fintech-theme')
    ));

    // Support responsive embeds & Gutenberg alignwide
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
}
add_action('after_setup_theme', 'agy_theme_setup');

/**
 * Enqueue scripts and styles.
 */
function agy_theme_scripts() {
    // Google Fonts
    wp_enqueue_style(
        'agy-theme-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@500;600;700;800;900&display=swap',
        array(),
        null
    );

    // Theme Main Stylesheet
    wp_enqueue_style('agy-theme-style', get_stylesheet_uri(), array(), '2.5.0');

    // Plugin / Core Fintech Styles (if plugin assets exist)
    $plugin_url = plugins_url('antigravity-fintech/');
    wp_enqueue_style('agy-base-css', $plugin_url . 'assets/css/base.css', array(), '2.5.0');
    wp_enqueue_style('agy-web-portal-css', $plugin_url . 'assets/css/web-portal.css', array('agy-base-css'), '2.5.0');
    wp_enqueue_style('agy-admin-css', $plugin_url . 'assets/css/admin-panel.css', array('agy-base-css'), '2.5.0');
    wp_enqueue_style('agy-components-css', $plugin_url . 'assets/css/components.css', array('agy-base-css'), '2.5.0');

    // Core Scripts
    wp_enqueue_script('supabase-sdk', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', array(), '2.0.0', true);
    wp_enqueue_script('agy-api-js', $plugin_url . 'assets/js/api.js', array(), '2.5.0', true);
    wp_enqueue_script('agy-store-js', $plugin_url . 'assets/js/store.js', array('agy-api-js'), '2.5.0', true);
    wp_enqueue_script('agy-web-portal-js', $plugin_url . 'assets/js/web/web_portal.js', array('agy-store-js'), '2.5.0', true);
    wp_enqueue_script('agy-app-js', $plugin_url . 'assets/js/app.js', array('agy-web-portal-js'), '2.5.0', true);

    // Localize Script for REST Nonces
    wp_localize_script('agy-api-js', 'agy_settings', array(
        'root'  => esc_url_raw(rest_url('antigravity/v1/')),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('wp_enqueue_scripts', 'agy_theme_scripts');

/**
 * Register Custom Post Types for Investment Plans if plugin is not active
 */
function agy_theme_register_cpts() {
    if (!class_exists('Antigravity_Fintech')) {
        register_post_type('agy_plan', array(
            'labels' => array(
                'name'               => __('Investment Plans', 'antigravity-fintech-theme'),
                'singular_name'      => __('Investment Plan', 'antigravity-fintech-theme'),
                'add_new'            => __('Add New Plan', 'antigravity-fintech-theme'),
                'add_new_item'       => __('Add New Investment Plan', 'antigravity-fintech-theme'),
                'edit_item'          => __('Edit Investment Plan', 'antigravity-fintech-theme'),
            ),
            'public'       => true,
            'has_archive'  => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-chart-line',
            'supports'     => array('title', 'editor', 'thumbnail', 'custom-fields')
        ));
    }
}
add_action('init', 'agy_theme_register_cpts');
