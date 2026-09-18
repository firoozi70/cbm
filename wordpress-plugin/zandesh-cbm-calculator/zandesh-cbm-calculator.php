<?php
/**
 * Plugin Name: Zandesh CBM — 3D Container Loading & Volume Calculator
 * Plugin URI:  https://cbm.zandesh.com
 * Description: 100% Free interactive 3D shipping container loading planner, CBM volume calculator, and freight proforma invoice generator. Fully compatible with Elementor, WPML, Polylang and custom shortcodes.
 * Version:     1.0.0
 * Author:      Zandesh Logistics Group
 * Author URI:  https://zandesh.com
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: zandesh-cbm
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// Define plugin constants
define( 'ZANDESH_CBM_VERSION', '1.0.0' );
define( 'ZANDESH_CBM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ZANDESH_CBM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ZANDESH_CBM_PLUGIN_FILE', __FILE__ );

/**
 * Load plugin textdomain for internationalization.
 */
function zandesh_cbm_load_textdomain() {
	load_plugin_textdomain(
		'zandesh-cbm',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages/'
	);
}
add_action( 'plugins_loaded', 'zandesh_cbm_load_textdomain' );

/**
 * Include core classes.
 */
require_once ZANDESH_CBM_PLUGIN_DIR . 'includes/class-zandesh-cbm.php';
require_once ZANDESH_CBM_PLUGIN_DIR . 'includes/class-admin-settings.php';
require_once ZANDESH_CBM_PLUGIN_DIR . 'includes/class-shortcode.php';

// Initialize core plugin
function zandesh_cbm_init() {
	$plugin = new Zandesh_CBM();
	$plugin->run();

	// Initialize admin settings in admin area
	if ( is_admin() ) {
		$admin = new Zandesh_CBM_Admin_Settings();
		$admin->init();
	}

	// Initialize shortcode
	$shortcode = new Zandesh_CBM_Shortcode();
	$shortcode->init();
}
add_action( 'init', 'zandesh_cbm_init' );

/**
 * Register Elementor widget if Elementor is active.
 */
function zandesh_cbm_register_elementor_widget() {
	if ( did_action( 'elementor/loaded' ) ) {
		require_once ZANDESH_CBM_PLUGIN_DIR . 'includes/class-elementor-widget.php';
		\Elementor\Plugin::instance()->widgets_manager->register( new \Zandesh_CBM_Elementor_Widget() );
	}
}
add_action( 'elementor/widgets/register', 'zandesh_cbm_register_elementor_widget' );

/**
 * Add settings action link on plugins page.
 */
function zandesh_cbm_action_links( $links ) {
	$settings_link = '<a href="' . admin_url( 'admin.php?page=zandesh-cbm-settings' ) . '">' . __( 'Settings', 'zandesh-cbm' ) . '</a>';
	array_unshift( $links, $settings_link );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'zandesh_cbm_action_links' );
