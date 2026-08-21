<?php
/**
 * Template Name: Fintech Investment Platform (Full Page Canvas)
 * Description: Dedicated full-screen template for the investment platform with zero theme header/footer clutter.
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
    <title><?php wp_title('|', true, 'right'); bloginfo('name'); ?></title>
    
    <!-- PWA & Mobile App Metadata -->
    <meta name="theme-color" content="#10B981">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Antigravity">
    <link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=192&auto=format&fit=crop&q=80">

    <?php wp_head(); ?>
</head>
<body <?php body_class('agy-full-canvas-body'); ?> style="margin: 0; padding: 0; background: #0B0E14; overflow-x: hidden;">

<?php
if (shortcode_exists('antigravity_fintech')) {
    echo do_shortcode('[antigravity_fintech]');
} else {
    ?>
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; color: #fff; text-align: center; padding: 20px; font-family: sans-serif;">
        <h1 style="color: #10B981; font-size: 2rem;">⚡ Antigravity Fintech Platform</h1>
        <p style="color: #94A3B8; max-width: 500px; line-height: 1.6;">
            Please ensure the <strong>Antigravity Fintech Plugin</strong> is installed and activated to load the interactive investment engine.
        </p>
    </div>
    <?php
}
?>

<?php wp_footer(); ?>
</body>
</html>
