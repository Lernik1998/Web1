<?php
/**
 * Plugin Name: Processed Content API
 * Description: Adds a REST API endpoint that returns WordPress content with shortcodes processed
 * Version: 1.0
 * Author: Custom
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register custom REST API endpoint for processed content
 */
add_action('rest_api_init', function () {
    register_rest_route('processed-content/v1', '/page/(?P<slug>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'get_processed_page_by_slug',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Get page by slug with processed content (shortcodes rendered)
 */
function get_processed_page_by_slug($request) {
    $slug = $request->get_param('slug');
    
    // Get page by slug
    $args = array(
        'name' => $slug,
        'post_type' => 'page',
        'post_status' => 'publish',
        'numberposts' => 1
    );
    
    $posts = get_posts($args);
    
    if (empty($posts)) {
        return new WP_Error('no_page', 'Page not found', array('status' => 404));
    }
    
    $page = $posts[0];
    
    // Load Visual Composer shortcodes if available
    if (class_exists('WPBMap') && method_exists('WPBMap', 'addAllMappedShortcodes')) {
        WPBMap::addAllMappedShortcodes();
    }
    
    // Get content with shortcodes processed
    $content = $page->post_content;
    $processed_content = apply_filters('the_content', $content);
    
    // Get custom CSS from Visual Composer
    $vc_custom_css = get_post_meta($page->ID, '_wpb_shortcodes_custom_css', true);
    
    // Build response
    $response = array(
        'id' => $page->ID,
        'title' => array(
            'rendered' => get_the_title($page->ID)
        ),
        'content' => array(
            'rendered' => $processed_content,
            'raw' => $content
        ),
        'excerpt' => array(
            'rendered' => wp_trim_words($processed_content, 55)
        ),
        'slug' => $page->post_name,
        'link' => get_permalink($page->ID),
        'custom_css' => $vc_custom_css ? $vc_custom_css : null
    );
    
    return rest_ensure_response($response);
}
