<?php
/**
 * Elementor Dedicated Widget for Zandesh CBM Calculator.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Zandesh_CBM_Elementor_Widget extends \Elementor\Widget_Base {

	/**
	 * Get widget name.
	 */
	public function get_name() {
		return 'zandesh_cbm_calculator';
	}

	/**
	 * Get widget title.
	 */
	public function get_title() {
		return esc_html__( 'Zandesh CBM & 3D Container', 'zandesh-cbm' );
	}

	/**
	 * Get widget icon.
	 */
	public function get_icon() {
		return 'eicon-archive';
	}

	/**
	 * Get widget categories.
	 */
	public function get_categories() {
		return array( 'general' );
	}

	/**
	 * Get widget keywords.
	 */
	public function get_keywords() {
		return array( 'cbm', 'container', 'shipping', 'freight', '3d', 'calculator', 'zandesh', 'logistics' );
	}

	/**
	 * Register widget controls.
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_content',
			array(
				'label' => esc_html__( 'Calculator Settings', 'zandesh-cbm' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'initial_mode',
			array(
				'label'   => esc_html__( 'Default Mode', 'zandesh-cbm' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => 'load',
				'options' => array(
					'load' => esc_html__( '3D Container Stuffing (چیدمان کانتینر)', 'zandesh-cbm' ),
					'cbm'  => esc_html__( 'CBM Volume Calculator (محاسبه حجم CBM)', 'zandesh-cbm' ),
				),
			)
		);

		$this->add_control(
			'lang',
			array(
				'label'   => esc_html__( 'Language', 'zandesh-cbm' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'default' => 'auto',
				'options' => array(
					'auto' => esc_html__( 'Auto (Site Language / WPML / Polylang)', 'zandesh-cbm' ),
					'fa'   => '🇮🇷 فارسی (Persian)',
					'en'   => '🇬🇧 English',
					'ar'   => '🇸🇦 العربية (Arabic)',
					'zh'   => '🇨🇳 中文 (Chinese)',
					'ru'   => '🇷🇺 Русский (Russian)',
					'es'   => '🇪🇸 Español (Spanish)',
					'tr'   => '🇹🇷 Türkçe (Turkish)',
					'de'   => '🇩🇪 Deutsch (German)',
					'fr'   => '🇫🇷 Français (French)',
				),
			)
		);

		$this->add_control(
			'show_free_badge',
			array(
				'label'        => esc_html__( 'Show "100% Free" Badge', 'zandesh-cbm' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Show', 'zandesh-cbm' ),
				'label_off'    => esc_html__( 'Hide', 'zandesh-cbm' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'show_proforma',
			array(
				'label'        => esc_html__( 'Enable Proforma Generator', 'zandesh-cbm' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'zandesh-cbm' ),
				'label_off'    => esc_html__( 'No', 'zandesh-cbm' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'show_credit',
			array(
				'label'        => esc_html__( 'Show Developer Credit', 'zandesh-cbm' ),
				'type'         => \Elementor\Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Show', 'zandesh-cbm' ),
				'label_off'    => esc_html__( 'Hide', 'zandesh-cbm' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->end_controls_section();

		// Style section
		$this->start_controls_section(
			'section_style',
			array(
				'label' => esc_html__( 'Styling & Colors', 'zandesh-cbm' ),
				'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'primary_color',
			array(
				'label'     => esc_html__( 'Primary Brand Color', 'zandesh-cbm' ),
				'type'      => \Elementor\Controls_Manager::COLOR,
				'default'   => '#0088ff',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render widget output on the frontend.
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		// Enqueue required assets
		wp_enqueue_style( 'zandesh-cbm-frontend' );
		wp_enqueue_script( 'zandesh-cbm-app' );

		$parsed_atts = array(
			'mode'          => $settings['initial_mode'] ?? 'load',
			'lang'          => $settings['lang'] ?? 'auto',
			'primary_color' => ! empty( $settings['primary_color'] ) ? $settings['primary_color'] : '#0088ff',
			'show_proforma' => $settings['show_proforma'] ?? 'yes',
			'show_free'     => $settings['show_free_badge'] ?? 'yes',
			'show_credit'   => $settings['show_credit'] ?? 'yes',
		);

		$lang = $parsed_atts['lang'];
		if ( 'auto' === $lang || empty( $lang ) ) {
			$core = new Zandesh_CBM();
			$lang = $core->get_current_language();
		}

		$is_rtl = is_rtl() || in_array( $lang, array( 'fa', 'ar' ), true );

		include ZANDESH_CBM_PLUGIN_DIR . 'templates/app-container.php';
	}
}
