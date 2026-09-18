<?php
/**
 * The core plugin class.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Zandesh_CBM {

	/**
	 * Initialize hooks.
	 */
	public function run() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_assets' ) );
	}

	/**
	 * Register frontend assets (loaded on demand via shortcode or Elementor widget).
	 */
	public function register_assets() {
		// Three.js CDN bundle
		wp_register_script(
			'threejs',
			'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
			array(),
			'r128',
			true
		);

		// OrbitControls for Three.js
		wp_register_script(
			'threejs-orbitcontrols',
			'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
			array( 'threejs' ),
			'r128',
			true
		);

		// Frontend styles
		wp_register_style(
			'zandesh-cbm-frontend',
			ZANDESH_CBM_PLUGIN_URL . 'assets/css/cbm-frontend.css',
			array(),
			ZANDESH_CBM_VERSION
		);

		// Frontend app script
		wp_register_script(
			'zandesh-cbm-app',
			ZANDESH_CBM_PLUGIN_URL . 'assets/js/cbm-app.js',
			array( 'threejs', 'threejs-orbitcontrols' ),
			ZANDESH_CBM_VERSION,
			true
		);

		// Pass server-side options and translations to client
		$options = get_option( 'zandesh_cbm_options', array() );
		$current_lang = $this->get_current_language();

		wp_localize_script(
			'zandesh-cbm-app',
			'zandeshCbmConfig',
			array(
				'pluginUrl'       => ZANDESH_CBM_PLUGIN_URL,
				'siteUrl'         => site_url(),
				'currentLang'     => $current_lang,
				'isRtl'           => is_rtl() || in_array( $current_lang, array( 'fa', 'ar' ), true ),
				'primaryColor'    => ! empty( $options['primary_color'] ) ? sanitize_hex_color( $options['primary_color'] ) : '#0088ff',
				'companyName'     => ! empty( $options['company_name'] ) ? sanitize_text_field( $options['company_name'] ) : 'Zandesh Logistics Group',
				'companyPhone'    => ! empty( $options['company_phone'] ) ? sanitize_text_field( $options['company_phone'] ) : '+98 21 00000000',
				'companyLogo'     => ! empty( $options['company_logo'] ) ? esc_url( $options['company_logo'] ) : '',
				'defaultCurrency' => ! empty( $options['default_currency'] ) ? sanitize_text_field( $options['default_currency'] ) : 'USD',
				'usdRate'         => ! empty( $options['usd_rate'] ) ? floatval( $options['usd_rate'] ) : 1,
				'showFreeBadge'   => isset( $options['show_free_badge'] ) ? (bool) $options['show_free_badge'] : true,
				'showProforma'    => isset( $options['show_proforma'] ) ? (bool) $options['show_proforma'] : true,
			)
		);
	}

	/**
	 * Detect active language (WPML, Polylang, or WordPress core).
	 */
	public function get_current_language() {
		// Check Polylang
		if ( function_exists( 'pll_current_language' ) ) {
			$pll_lang = pll_current_language();
			if ( ! empty( $pll_lang ) ) {
				return strtolower( substr( $pll_lang, 0, 2 ) );
			}
		}

		// Check WPML
		if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
			return strtolower( substr( ICL_LANGUAGE_CODE, 0, 2 ) );
		}

		// Check URL parameter (?lang=fa)
		if ( isset( $_GET['lang'] ) && ! empty( $_GET['lang'] ) ) {
			$req_lang = sanitize_text_field( wp_unslash( $_GET['lang'] ) );
			if ( in_array( $req_lang, array( 'fa', 'en', 'ar', 'zh', 'ru', 'es', 'tr', 'de', 'fr' ), true ) ) {
				return $req_lang;
			}
		}

		// Fallback to WordPress locale
		$locale = get_locale();
		$lang_code = strtolower( substr( $locale, 0, 2 ) );

		$supported = array( 'fa', 'en', 'ar', 'zh', 'ru', 'es', 'tr', 'de', 'fr' );
		if ( in_array( $lang_code, $supported, true ) ) {
			return $lang_code;
		}

		// Global fallback
		$options = get_option( 'zandesh_cbm_options', array() );
		return ! empty( $options['default_language'] ) ? $options['default_language'] : 'fa';
	}
}
