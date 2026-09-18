<?php
/**
 * Admin settings page class.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Zandesh_CBM_Admin_Settings {

	/**
	 * Init admin hooks.
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Register admin menu.
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'Zandesh CBM Settings', 'zandesh-cbm' ),
			__( 'Zandesh CBM', 'zandesh-cbm' ),
			'manage_options',
			'zandesh-cbm-settings',
			array( $this, 'render_settings_page' ),
			'dashicons-clipboard',
			85
		);
	}

	/**
	 * Enqueue admin scripts & styles.
	 */
	public function enqueue_admin_assets( $hook ) {
		if ( 'toplevel_page_zandesh-cbm-settings' !== $hook ) {
			return;
		}

		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_media();
		wp_enqueue_script( 'wp-color-picker' );

		wp_add_inline_script(
			'wp-color-picker',
			"jQuery(document).ready(function($){
				$('.zandesh-color-picker').wpColorPicker();
				$('#zandesh_upload_logo_btn').on('click', function(e){
					e.preventDefault();
					var custom_uploader = wp.media({
						title: 'Select Company Logo',
						button: { text: 'Use this logo' },
						multiple: false
					}).on('select', function() {
						var attachment = custom_uploader.state().get('selection').first().toJSON();
						$('#zandesh_company_logo').val(attachment.url);
						$('#zandesh_logo_preview').attr('src', attachment.url).show();
					}).open();
				});
			});"
		);
	}

	/**
	 * Register plugin settings.
	 */
	public function register_settings() {
		register_setting(
			'zandesh_cbm_settings_group',
			'zandesh_cbm_options',
			array( $this, 'sanitize_options' )
		);
	}

	/**
	 * Sanitize options.
	 */
	public function sanitize_options( $input ) {
		$sanitized = array();
		$sanitized['default_language'] = ! empty( $input['default_language'] ) ? sanitize_text_field( $input['default_language'] ) : 'fa';
		$sanitized['primary_color']    = ! empty( $input['primary_color'] ) ? sanitize_hex_color( $input['primary_color'] ) : '#0088ff';
		$sanitized['company_name']     = ! empty( $input['company_name'] ) ? sanitize_text_field( $input['company_name'] ) : 'Zandesh Logistics Group';
		$sanitized['company_phone']    = ! empty( $input['company_phone'] ) ? sanitize_text_field( $input['company_phone'] ) : '';
		$sanitized['company_logo']     = ! empty( $input['company_logo'] ) ? esc_url_raw( $input['company_logo'] ) : '';
		$sanitized['default_currency'] = ! empty( $input['default_currency'] ) ? sanitize_text_field( $input['default_currency'] ) : 'USD';
		$sanitized['usd_rate']         = ! empty( $input['usd_rate'] ) ? floatval( $input['usd_rate'] ) : 1;
		$sanitized['show_free_badge']  = isset( $input['show_free_badge'] ) ? 1 : 0;
		$sanitized['show_proforma']    = isset( $input['show_proforma'] ) ? 1 : 0;
		$sanitized['show_credit_link'] = isset( $input['show_credit_link'] ) ? 1 : 0;
		return $sanitized;
	}

	/**
	 * Render settings page.
	 */
	public function render_settings_page() {
		$options = get_option( 'zandesh_cbm_options', array(
			'default_language' => 'fa',
			'primary_color'    => '#0088ff',
			'company_name'     => 'Zandesh Logistics Group',
			'company_phone'    => '+98 21 00000000',
			'company_logo'     => '',
			'default_currency' => 'USD',
			'usd_rate'         => 1,
			'show_free_badge'  => 1,
			'show_proforma'    => 1,
			'show_credit_link' => 1,
		) );
		?>
		<div class="wrap" style="max-width: 900px; font-family: inherit;">
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 15px;">
				<span class="dashicons dashicons-clipboard" style="font-size: 32px; width: 32px; height: 32px; color: #0088ff;"></span>
				<div>
					<h1 style="margin: 0; font-size: 22px;"><?php esc_html_e( 'Zandesh CBM & 3D Container Loading Settings', 'zandesh-cbm' ); ?></h1>
					<p style="margin: 4px 0 0; color: #666; font-size: 13px;"><?php esc_html_e( 'Configure appearance, default language, proforma details, and logistics options.', 'zandesh-cbm' ); ?></p>
				</div>
			</div>

			<form method="post" action="options.php">
				<?php
				settings_fields( 'zandesh_cbm_settings_group' );
				?>

				<div style="background: #fff; border: 1px solid #ccd0d4; padding: 20px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
					<h2 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
						<?php esc_html_e( 'General & Language Settings', 'zandesh-cbm' ); ?>
					</h2>

					<table class="form-table">
						<tr>
							<th scope="row"><label for="default_language"><?php esc_html_e( 'Default Language', 'zandesh-cbm' ); ?></label></th>
							<td>
								<select name="zandesh_cbm_options[default_language]" id="default_language">
									<option value="fa" <?php selected( $options['default_language'] ?? 'fa', 'fa' ); ?>>🇮🇷 فارسی (Persian)</option>
									<option value="en" <?php selected( $options['default_language'] ?? 'fa', 'en' ); ?>>🇬🇧 English</option>
									<option value="ar" <?php selected( $options['default_language'] ?? 'fa', 'ar' ); ?>>🇸🇦 العربية (Arabic)</option>
									<option value="zh" <?php selected( $options['default_language'] ?? 'fa', 'zh' ); ?>>🇨🇳 中文 (Chinese)</option>
									<option value="ru" <?php selected( $options['default_language'] ?? 'fa', 'ru' ); ?>>🇷🇺 Русский (Russian)</option>
									<option value="es" <?php selected( $options['default_language'] ?? 'fa', 'es' ); ?>>🇪🇸 Español (Spanish)</option>
									<option value="tr" <?php selected( $options['default_language'] ?? 'fa', 'tr' ); ?>>🇹🇷 Türkçe (Turkish)</option>
									<option value="de" <?php selected( $options['default_language'] ?? 'fa', 'de' ); ?>>🇩🇪 Deutsch (German)</option>
									<option value="fr" <?php selected( $options['default_language'] ?? 'fa', 'fr' ); ?>>🇫🇷 Français (French)</option>
								</select>
								<p class="description"><?php esc_html_e( 'If WPML or Polylang is installed, the active language is detected automatically.', 'zandesh-cbm' ); ?></p>
							</td>
						</tr>

						<tr>
							<th scope="row"><label for="primary_color"><?php esc_html_e( 'Brand Accent Color', 'zandesh-cbm' ); ?></label></th>
							<td>
								<input type="text" name="zandesh_cbm_options[primary_color]" id="primary_color" class="zandesh-color-picker" value="<?php echo esc_attr( $options['primary_color'] ?? '#0088ff' ); ?>" />
								<p class="description"><?php esc_html_e( 'Primary button, step highlights, and active container colors.', 'zandesh-cbm' ); ?></p>
							</td>
						</tr>

						<tr>
							<th scope="row"><?php esc_html_e( 'Free Badge', 'zandesh-cbm' ); ?></th>
							<td>
								<label>
									<input type="checkbox" name="zandesh_cbm_options[show_free_badge]" value="1" <?php checked( ! empty( $options['show_free_badge'] ) ); ?> />
									<?php esc_html_e( 'Display "100% Free • No Sign-up" SEO badge in header', 'zandesh-cbm' ); ?>
								</label>
							</td>
						</tr>

						<tr>
							<th scope="row"><?php esc_html_e( 'Proforma Invoice', 'zandesh-cbm' ); ?></th>
							<td>
								<label>
									<input type="checkbox" name="zandesh_cbm_options[show_proforma]" value="1" <?php checked( ! empty( $options['show_proforma'] ) ); ?> />
									<?php esc_html_e( 'Enable export freight Proforma Invoice generator & PDF printer', 'zandesh-cbm' ); ?>
								</label>
							</td>
						</tr>

						<tr>
							<th scope="row"><?php esc_html_e( 'Developer Attribution', 'zandesh-cbm' ); ?></th>
							<td>
								<label>
									<input type="checkbox" name="zandesh_cbm_options[show_credit_link]" value="1" <?php checked( ! empty( $options['show_credit_link'] ) ); ?> />
									<?php esc_html_e( 'Display polite "Powered by Zandesh Logistics (zandesh.com)" badge below calculator (Helps support free updates)', 'zandesh-cbm' ); ?>
								</label>
							</td>
						</tr>
					</table>
				</div>

				<div style="background: #fff; border: 1px solid #ccd0d4; padding: 20px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
					<h2 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
						<?php esc_html_e( 'Logistics & Company Details (Proforma Header)', 'zandesh-cbm' ); ?>
					</h2>

					<table class="form-table">
						<tr>
							<th scope="row"><label for="company_name"><?php esc_html_e( 'Company Name', 'zandesh-cbm' ); ?></label></th>
							<td>
								<input type="text" name="zandesh_cbm_options[company_name]" id="company_name" class="regular-text" value="<?php echo esc_attr( $options['company_name'] ?? 'Zandesh Logistics Group' ); ?>" />
							</td>
						</tr>

						<tr>
							<th scope="row"><label for="company_phone"><?php esc_html_e( 'WhatsApp / Phone', 'zandesh-cbm' ); ?></label></th>
							<td>
								<input type="text" name="zandesh_cbm_options[company_phone]" id="company_phone" class="regular-text" value="<?php echo esc_attr( $options['company_phone'] ?? '' ); ?>" placeholder="+98 912 0000000" />
							</td>
						</tr>

						<tr>
							<th scope="row"><label for="zandesh_company_logo"><?php esc_html_e( 'Company Logo', 'zandesh-cbm' ); ?></label></th>
							<td>
								<input type="text" name="zandesh_cbm_options[company_logo]" id="zandesh_company_logo" class="regular-text" value="<?php echo esc_attr( $options['company_logo'] ?? '' ); ?>" />
								<button type="button" class="button" id="zandesh_upload_logo_btn"><?php esc_html_e( 'Upload / Select Logo', 'zandesh-cbm' ); ?></button>
								<div style="margin-top: 10px;">
									<img id="zandesh_logo_preview" src="<?php echo esc_url( $options['company_logo'] ?? '' ); ?>" style="max-height: 50px; <?php echo empty( $options['company_logo'] ) ? 'display:none;' : ''; ?>" alt="Logo Preview" />
								</div>
							</td>
						</tr>

						<tr>
							<th scope="row"><label for="default_currency"><?php esc_html_e( 'Default Currency', 'zandesh-cbm' ); ?></label></th>
							<td>
								<input type="text" name="zandesh_cbm_options[default_currency]" id="default_currency" style="width: 100px;" value="<?php echo esc_attr( $options['default_currency'] ?? 'USD' ); ?>" />
							</td>
						</tr>

						<tr>
							<th scope="row"><label for="usd_rate"><?php esc_html_e( 'USD Exchange Rate', 'zandesh-cbm' ); ?></label></th>
							<td>
								<input type="number" step="any" name="zandesh_cbm_options[usd_rate]" id="usd_rate" style="width: 140px;" value="<?php echo esc_attr( $options['usd_rate'] ?? 1 ); ?>" />
								<p class="description"><?php esc_html_e( 'Optional exchange rate multiplier to calculate local currency automatically.', 'zandesh-cbm' ); ?></p>
							</td>
						</tr>
					</table>
				</div>

				<?php submit_button( __( 'Save Changes', 'zandesh-cbm' ) ); ?>
			</form>

			<div style="background: #f0f6fc; border: 1px solid #c8e1ff; padding: 16px; border-radius: 6px; margin-top: 25px;">
				<h3 style="margin: 0 0 10px; font-size: 14px; color: #0969da;"><?php esc_html_e( '📌 Shortcode Usage Guide', 'zandesh-cbm' ); ?></h3>
				<p style="margin: 0 0 8px; font-size: 13px; color: #333;">
					<?php esc_html_e( 'Paste anywhere in your pages, Elementor shortcode block, or blog posts:', 'zandesh-cbm' ); ?>
				</p>
				<code style="display: block; padding: 10px; background: #fff; border: 1px solid #e1e4e8; border-radius: 4px; font-size: 13px; color: #0088ff;">[zandesh_cbm]</code>
				<p style="margin: 10px 0 6px; font-size: 12px; color: #555;">
					<?php esc_html_e( 'Available Shortcode Attributes:', 'zandesh-cbm' ); ?>
				</p>
				<ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #444; line-height: 1.6;">
					<li><code>[zandesh_cbm mode="load"]</code> — <?php esc_html_e( 'Start with 3D Container Stuffing view', 'zandesh-cbm' ); ?></li>
					<li><code>[zandesh_cbm mode="cbm"]</code> — <?php esc_html_e( 'Start with CBM & Volume calculator', 'zandesh-cbm' ); ?></li>
					<li><code>[zandesh_cbm lang="en"]</code> — <?php esc_html_e( 'Force language (fa, en, ar, zh, ru, es, tr, de, fr)', 'zandesh-cbm' ); ?></li>
					<li><code>[zandesh_cbm primary_color="#e67e22"]</code> — <?php esc_html_e( 'Override brand color for this specific page', 'zandesh-cbm' ); ?></li>
				</ul>
			</div>

			<!-- Zandesh Brand & Services Box (Authority & Backlink) -->
			<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
				<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
					<div>
						<h3 style="margin: 0 0 6px; font-size: 16px; color: #1e293b;">
							🚢 <?php esc_html_e( 'Powered & Supported by Zandesh Logistics Group', 'zandesh-cbm' ); ?>
						</h3>
						<p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; max-width: 600px;">
							<?php esc_html_e( 'Need international freight forwarding, 20ft/40ft container shipping, customs clearance, or foreign trade consulting? Connect with the Zandesh global logistics team.', 'zandesh-cbm' ); ?>
						</p>
					</div>
					<div style="display: flex; gap: 10px; flex-wrap: wrap;">
						<a href="https://zandesh.com" target="_blank" rel="noopener" class="button button-primary" style="background: #0088ff; border-color: #0077e6;">
							<?php esc_html_e( 'Visit Zandesh.com ↗', 'zandesh-cbm' ); ?>
						</a>
						<a href="https://cbm.zandesh.com" target="_blank" rel="noopener" class="button">
							<?php esc_html_e( 'Web App (Cloudflare) ↗', 'zandesh-cbm' ); ?>
						</a>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}
