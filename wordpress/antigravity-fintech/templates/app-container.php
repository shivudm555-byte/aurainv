<?php
/**
 * Full Page Canvas Application Template
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
<body <?php body_class('agy-canvas-page'); ?> style="margin: 0; padding: 0; background: #0B0E14; overflow-x: hidden;">

<?php
echo AGY_Shortcodes::render_fintech_app();
?>

<?php wp_footer(); ?>
</body>
</html>
