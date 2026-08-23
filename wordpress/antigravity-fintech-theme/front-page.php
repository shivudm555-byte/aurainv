<?php
/**
 * Front Page Template for Antigravity Fintech Theme
 *
 * @package Antigravity_Fintech_Theme
 * @version 2.5.0
 */

get_header();
?>

<main id="web-content-viewport" class="web-main-content">
    <?php
    if (shortcode_exists('antigravity_fintech')) {
        echo do_shortcode('[antigravity_fintech mode="public_home"]');
    } else {
        // Fallback static rendering if plugin is not active
        ?>
        <section class="hero-section">
            <div class="hero-badge">
                <span>⚡ Next-Generation Digital Asset Management</span>
            </div>

            <h1 class="hero-headline">
                Invest Smarter. Manage Your Growth.
            </h1>

            <p class="hero-subheading">
                A modern digital platform designed to help you manage investments, track your portfolio and monitor your financial activity from one secure dashboard.
            </p>

            <div class="hero-cta-group">
                <a href="<?php echo esc_url(home_url('/dashboard/')); ?>" class="btn btn-primary btn-lg">
                    🚀 Open User Dashboard
                </a>
                <a href="<?php echo esc_url(home_url('/investment-plans/')); ?>" class="btn btn-secondary btn-lg">
                    📊 Explore Investment Plans
                </a>
                <a href="<?php echo esc_url(home_url('/register/')); ?>" class="btn btn-ghost btn-lg">
                    Create Free Account →
                </a>
            </div>
        </section>
        <?php
    }
    ?>
</main>

<?php
get_footer();
