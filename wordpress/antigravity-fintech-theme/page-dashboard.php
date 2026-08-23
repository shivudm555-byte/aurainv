<?php
/**
 * Template Name: Fintech User Dashboard Portal
 *
 * @package Antigravity_Fintech_Theme
 * @version 2.5.0
 */

get_header();
?>

<main id="web-content-viewport" class="web-main-content">
    <?php
    if (shortcode_exists('antigravity_fintech')) {
        echo do_shortcode('[antigravity_fintech mode="user_dashboard"]');
    } else {
        ?>
        <div style="text-align: center; padding: 40px;">
            <h2>User Investment Dashboard</h2>
            <p style="color: var(--text-muted);">Please ensure the Antigravity Fintech Plugin is activated.</p>
        </div>
        <?php
    }
    ?>
</main>

<?php
get_footer();
