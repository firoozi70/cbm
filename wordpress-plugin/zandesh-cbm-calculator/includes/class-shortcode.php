<?php
/**
 * Shortcode handler for [zandesh_cbm].
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Zandesh_CBM_Shortcode {

	/**
	 * Init shortcode hook.
	 */
	public function init() {
		add_shortcode( 'zandesh_cbm', array( $this, 'render_shortcode' ) );
	}

	/**
	 * Render shortcode HTML.
	 */
	public function render_shortcode( $atts ) {
		// Enqueue required assets
		wp_enqueue_style( 'zandesh-cbm-frontend' );
		wp_enqueue_script( 'zandesh-cbm-app' );

		// Shortcode attributes
		$options = get_option( 'zandesh_cbm_options', array() );

		$defaults = array(
			'mode'          => 'load', // 'load' or 'cbm'
			'lang'          => 'auto', // 'auto' or 'fa', 'en', 'ar', 'zh', 'ru', etc.
			'container'     => '40ft-std',
			'primary_color' => ! empty( $options['primary_color'] ) ? $options['primary_color'] : '#0088ff',
			'show_proforma' => isset( $options['show_proforma'] ) ? ( $options['show_proforma'] ? 'yes' : 'no' ) : 'yes',
			'show_free'     => isset( $options['show_free_badge'] ) ? ( $options['show_free_badge'] ? 'yes' : 'no' ) : 'yes',
			'show_credit'   => isset( $options['show_credit_link'] ) ? ( $options['show_credit_link'] ? 'yes' : 'no' ) : 'yes',
		);

		$parsed_atts = shortcode_atts( $defaults, $atts, 'zandesh_cbm' );

		// Determine language
		$lang = $parsed_atts['lang'];
		if ( 'auto' === $lang || empty( $lang ) ) {
			$core = new Zandesh_CBM();
			$lang = $core->get_current_language();
		}

		$is_rtl = is_rtl() || in_array( $lang, array( 'fa', 'ar' ), true );

		ob_start();
		include ZANDESH_CBM_PLUGIN_DIR . 'templates/app-container.php';
		return ob_get_clean();
	}
}
