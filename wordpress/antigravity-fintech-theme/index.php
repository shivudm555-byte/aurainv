<?php
/**
 * Main Template File for Antigravity Fintech Theme
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
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?> style="margin: 0; padding: 0; background: #0B0E14; overflow-x: hidden;">

<?php
if (shortcode_exists('antigravity_fintech')) {
    echo do_shortcode('[antigravity_fintech]');
} else {
    ?>
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; color: #fff; text-align: center; padding: 20px;">
        <h1 style="font-family: sans-serif;">⚡ Antigravity Fintech Platform</h1>
        <p style="color: #94A3B8;">Please ensure the <strong>Antigravity Fintech Plugin</strong> is installed and activated to load the interactive investment engine.</p>
    </div>
    <?php
}
?>

<?php wp_footer(); ?>
</body>
</html>
