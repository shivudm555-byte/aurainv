<?php
/**
 * Main Template File for Antigravity Fintech Theme
 *
 * @package Antigravity_Fintech_Theme
 * @version 2.5.0
 */
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>

<main id="web-content-viewport" class="web-main-content">
    <?php
    if (shortcode_exists('antigravity_fintech')) {
        echo do_shortcode('[antigravity_fintech]');
    } elseif (have_posts()) {
        while (have_posts()) {
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('web-card-panel'); ?>>
                <h1 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800;"><?php the_title(); ?></h1>
                <div class="entry-content" style="margin-top: 16px; line-height: 1.7; color: var(--text-secondary);">
                    <?php the_content(); ?>
                </div>
            </article>
            <?php
        }
    } else {
        ?>
        <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh; flex-direction: column; color: #fff; text-align: center; padding: 20px;">
            <h1 style="font-family: var(--font-display); font-size: 2rem;">⚡ Antigravity Fintech Platform</h1>
            <p style="color: #94A3B8; max-width: 600px; margin-top: 10px;">
                Please ensure the <strong>Antigravity Fintech Plugin</strong> is installed and activated to load the interactive investment and digital assets engine.
            </p>
        </div>
        <?php
    }
    ?>
</main>

<?php
get_footer();
