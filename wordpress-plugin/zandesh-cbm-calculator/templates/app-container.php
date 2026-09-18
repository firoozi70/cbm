<?php
/**
 * Main application template container.
 *
 * @var array $parsed_atts
 * @var string $lang
 * @var bool $is_rtl
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$unique_id = 'zcbm-' . wp_generate_uuid4();
$primary_color = esc_attr( $parsed_atts['primary_color'] );
?>
<div id="<?php echo esc_attr( $unique_id ); ?>"
     class="zandesh-cbm-app-root"
     dir="<?php echo $is_rtl ? 'rtl' : 'ltr'; ?>"
     data-mode="<?php echo esc_attr( $parsed_atts['mode'] ); ?>"
     data-lang="<?php echo esc_attr( $lang ); ?>"
     data-show-proforma="<?php echo esc_attr( $parsed_atts['show_proforma'] ); ?>"
     style="--zcbm-primary: <?php echo $primary_color; ?>;">

	<!-- Header Bar inside Widget -->
	<div class="zcbm-header-bar">
		<div class="zcbm-brand-group">
			<div class="zcbm-logo-icon">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 10.189V14M12 2v3M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
				</svg>
			</div>
			<div>
				<span class="zcbm-brand-name">Zandesh CBM</span>
				<span class="zcbm-brand-tagline zcbm-i18n-subbrand"></span>
			</div>
		</div>

		<div class="zcbm-header-actions">
			<?php if ( 'yes' === $parsed_atts['show_free'] ) : ?>
				<span class="zcbm-free-pill zcbm-i18n-free-badge">100% Free</span>
			<?php endif; ?>

			<div class="zcbm-mode-toggle">
				<button type="button" class="zcbm-btn-toggle active" data-target-mode="load">
					<span class="zcbm-i18n-btn-load">3D Container Stuffing</span>
				</button>
				<button type="button" class="zcbm-btn-toggle" data-target-mode="cbm">
					<span class="zcbm-i18n-btn-cbm">CBM Calculator</span>
				</button>
			</div>

			<!-- Language selector -->
			<select class="zcbm-lang-select">
				<option value="fa" <?php selected( $lang, 'fa' ); ?>>🇮🇷 فارسی</option>
				<option value="en" <?php selected( $lang, 'en' ); ?>>🇬🇧 English</option>
				<option value="ar" <?php selected( $lang, 'ar' ); ?>>🇸🇦 العربية</option>
				<option value="zh" <?php selected( $lang, 'zh' ); ?>>🇨🇳 中文</option>
				<option value="ru" <?php selected( $lang, 'ru' ); ?>>🇷🇺 Русский</option>
				<option value="es" <?php selected( $lang, 'es' ); ?>>🇪🇸 Español</option>
				<option value="tr" <?php selected( $lang, 'tr' ); ?>>🇹🇷 Türkçe</option>
				<option value="de" <?php selected( $lang, 'de' ); ?>>🇩🇪 Deutsch</option>
				<option value="fr" <?php selected( $lang, 'fr' ); ?>>🇫🇷 Français</option>
			</select>
		</div>
	</div>

	<!-- Mode 1: 3D Container Stuffing Wizard -->
	<div class="zcbm-view-panel zcbm-view-load active">
		<!-- Stepper Navigation -->
		<div class="zcbm-stepper">
			<button type="button" class="zcbm-step-btn active" data-step="1">
				<span class="zcbm-step-num">1</span>
				<span class="zcbm-step-label zcbm-i18n-step-products">Products & Cargo</span>
			</button>
			<span class="zcbm-step-arrow">›</span>
			<button type="button" class="zcbm-step-btn" data-step="2">
				<span class="zcbm-step-num">2</span>
				<span class="zcbm-step-label zcbm-i18n-step-container">Select Container</span>
			</button>
			<span class="zcbm-step-arrow">›</span>
			<button type="button" class="zcbm-step-btn" data-step="3">
				<span class="zcbm-step-num">3</span>
				<span class="zcbm-step-label zcbm-i18n-step-result">3D Result & Plan</span>
			</button>
		</div>

		<!-- Step 1: Products Input Table -->
		<div class="zcbm-step-content zcbm-step-1 active">
			<div class="zcbm-card">
				<div class="zcbm-card-header">
					<div>
						<h3 class="zcbm-card-title zcbm-i18n-products-title">Products & Cargo Packages</h3>
						<p class="zcbm-card-subtitle zcbm-i18n-products-desc">Enter package dimensions, gross weight, and quantities.</p>
					</div>
					<div class="zcbm-card-controls">
						<label class="zcbm-checkbox-label">
							<input type="checkbox" id="zcbm-use-pallets-<?php echo esc_attr( $unique_id ); ?>" class="zcbm-input-pallets" />
							<span class="zcbm-i18n-use-pallets">Arrange on floor pallets</span>
						</label>
					</div>
				</div>

				<div class="zcbm-table-responsive">
					<table class="zcbm-products-table">
						<thead>
							<tr>
								<th class="zcbm-i18n-th-type">Type</th>
								<th class="zcbm-i18n-th-name">Cargo Name</th>
								<th class="zcbm-i18n-th-l">Length (mm)</th>
								<th class="zcbm-i18n-th-w">Width (mm)</th>
								<th class="zcbm-i18n-th-h">Height (mm)</th>
								<th class="zcbm-i18n-th-wt">Weight (kg)</th>
								<th class="zcbm-i18n-th-qty">Qty</th>
								<th class="zcbm-i18n-th-color">Color</th>
								<th></th>
							</tr>
						</thead>
						<tbody class="zcbm-products-tbody">
							<!-- Populated dynamically via JS -->
						</tbody>
					</table>
				</div>

				<div class="zcbm-card-footer">
					<button type="button" class="zcbm-btn zcbm-btn-secondary zcbm-btn-add-item">
						+ <span class="zcbm-i18n-add-item">Add Item</span>
					</button>
					<button type="button" class="zcbm-btn zcbm-btn-primary zcbm-btn-next-step" data-goto="2">
						<span class="zcbm-i18n-next-container">Next: Choose Container</span> →
					</button>
				</div>
			</div>
		</div>

		<!-- Step 2: Container Selection -->
		<div class="zcbm-step-content zcbm-step-2">
			<div class="zcbm-card">
				<div class="zcbm-card-header">
					<div>
						<h3 class="zcbm-card-title zcbm-i18n-container-title">Choose Shipping Container or Truck</h3>
						<p class="zcbm-card-subtitle zcbm-i18n-container-desc">Standard ISO shipping containers and road trucks.</p>
					</div>
				</div>

				<div class="zcbm-container-grid">
					<!-- Container options dynamically rendered -->
				</div>

				<div class="zcbm-card-footer">
					<button type="button" class="zcbm-btn zcbm-btn-secondary zcbm-btn-prev-step" data-goto="1">
						← <span class="zcbm-i18n-back">Back</span>
					</button>
					<button type="button" class="zcbm-btn zcbm-btn-primary zcbm-btn-calculate" data-goto="3">
						<span class="zcbm-i18n-calc-btn">Calculate 3D Stuffing Plan</span> ⚡
					</button>
				</div>
			</div>
		</div>

		<!-- Step 3: 3D Visualization & KPIs -->
		<div class="zcbm-step-content zcbm-step-3">
			<div class="zcbm-result-layout">
				<!-- 3D Canvas Box -->
				<div class="zcbm-canvas-box">
					<div class="zcbm-3d-viewport">
						<!-- Three.js renders here -->
					</div>
					<div class="zcbm-3d-toolbar">
						<button type="button" class="zcbm-tool-btn zcbm-btn-reset-cam" title="Reset View">🎥 Reset</button>
						<button type="button" class="zcbm-tool-btn zcbm-btn-wireframe" title="Toggle Wireframe">🔲 Wireframe</button>
						<div class="zcbm-anim-stepper">
							<button type="button" class="zcbm-tool-btn zcbm-anim-prev">◀</button>
							<span class="zcbm-anim-count">0 / 0</span>
							<button type="button" class="zcbm-tool-btn zcbm-anim-next">▶</button>
						</div>
					</div>
				</div>

				<!-- Result Sidebar & KPIs -->
				<div class="zcbm-kpi-sidebar">
					<div class="zcbm-kpi-cards">
						<div class="zcbm-kpi-card">
							<span class="zcbm-kpi-label zcbm-i18n-vol-util">Volume Utilization</span>
							<span class="zcbm-kpi-val zcbm-kpi-vol-util">0%</span>
						</div>
						<div class="zcbm-kpi-card">
							<span class="zcbm-kpi-label zcbm-i18n-wt-util">Weight Utilization</span>
							<span class="zcbm-kpi-val zcbm-kpi-wt-util">0%</span>
						</div>
						<div class="zcbm-kpi-card">
							<span class="zcbm-kpi-label zcbm-i18n-total-cbm">Total Cargo Volume</span>
							<span class="zcbm-kpi-val zcbm-kpi-cbm">0.00 m³</span>
						</div>
						<div class="zcbm-kpi-card">
							<span class="zcbm-kpi-label zcbm-i18n-total-weight">Total Cargo Weight</span>
							<span class="zcbm-kpi-val zcbm-kpi-weight">0 kg</span>
						</div>
					</div>

					<div class="zcbm-action-buttons">
						<button type="button" class="zcbm-btn zcbm-btn-secondary zcbm-btn-restart">
							↺ <span class="zcbm-i18n-edit-cargo">Edit Cargo</span>
						</button>
						<?php if ( 'yes' === $parsed_atts['show_proforma'] ) : ?>
							<button type="button" class="zcbm-btn zcbm-btn-primary zcbm-btn-open-proforma">
								📄 <span class="zcbm-i18n-btn-proforma">Print Proforma Invoice</span>
							</button>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Mode 2: Quick CBM Calculator -->
	<div class="zcbm-view-panel zcbm-view-cbm">
		<div class="zcbm-card">
			<div class="zcbm-card-header">
				<h3 class="zcbm-card-title zcbm-i18n-cbm-title">Quick CBM & Volumetric Weight Calculator</h3>
				<p class="zcbm-card-subtitle zcbm-i18n-cbm-desc">Fast cubic meter calculation for sea, air, and road freight quotes.</p>
			</div>

			<div class="zcbm-cbm-grid">
				<div class="zcbm-input-group">
					<label class="zcbm-i18n-dim-unit">Dimension Unit</label>
					<select class="zcbm-cbm-unit">
						<option value="cm" selected>Centimeters (cm)</option>
						<option value="m">Meters (m)</option>
						<option value="mm">Millimeters (mm)</option>
						<option value="in">Inches (in)</option>
					</select>
				</div>
				<div class="zcbm-input-group">
					<label class="zcbm-i18n-th-l">Length</label>
					<input type="number" class="zcbm-cbm-len" value="50" min="0" />
				</div>
				<div class="zcbm-input-group">
					<label class="zcbm-i18n-th-w">Width</label>
					<input type="number" class="zcbm-cbm-wid" value="40" min="0" />
				</div>
				<div class="zcbm-input-group">
					<label class="zcbm-i18n-th-h">Height</label>
					<input type="number" class="zcbm-cbm-hgt" value="30" min="0" />
				</div>
				<div class="zcbm-input-group">
					<label class="zcbm-i18n-th-qty">Quantity (Boxes)</label>
					<input type="number" class="zcbm-cbm-qty" value="100" min="1" />
				</div>
				<div class="zcbm-input-group">
					<label class="zcbm-i18n-th-wt">Unit Weight (kg)</label>
					<input type="number" class="zcbm-cbm-wt" value="10" min="0" />
				</div>
			</div>

			<div class="zcbm-cbm-results">
				<div class="zcbm-cbm-res-box">
					<span class="zcbm-res-label zcbm-i18n-total-cbm">Total CBM</span>
					<span class="zcbm-res-val zcbm-cbm-total-val">6.000 m³</span>
				</div>
				<div class="zcbm-cbm-res-box">
					<span class="zcbm-res-label zcbm-i18n-air-cw">Air Chargeable Weight (1:6000)</span>
					<span class="zcbm-res-val zcbm-cbm-air-cw">1,000 kg</span>
				</div>
				<div class="zcbm-cbm-res-box">
					<span class="zcbm-res-label zcbm-i18n-sea-cw">Sea Chargeable Weight (1:1000)</span>
					<span class="zcbm-res-val zcbm-cbm-sea-cw">6,000 kg</span>
				</div>
			</div>
		</div>
	</div>

	<?php if ( 'yes' === ( $parsed_atts['show_credit'] ?? 'yes' ) ) : ?>
		<!-- Polite Developer Attribution (Complies with WP.org / Markets guidelines) -->
		<div class="zcbm-widget-credit-bar">
			<a href="https://zandesh.com" target="_blank" rel="noopener" class="zcbm-credit-link">
				<span><?php echo ( 'fa' === $lang || 'ar' === $lang ) ? 'توسعه‌یافته توسط سامانه هوشمند زَندِش' : 'Powered by Zandesh Logistics'; ?></span>
				<strong class="zcbm-credit-brand">zandesh.com ↗</strong>
			</a>
		</div>
	<?php endif; ?>

	<!-- Proforma Modal Container -->
	<div class="zcbm-modal zcbm-proforma-modal">
		<div class="zcbm-modal-backdrop"></div>
		<div class="zcbm-modal-dialog">
			<div class="zcbm-modal-header">
				<h3 class="zcbm-i18n-proforma-title">Freight Proforma Invoice</h3>
				<button type="button" class="zcbm-modal-close">&times;</button>
			</div>
			<div class="zcbm-modal-body">
				<div class="zcbm-proforma-paper" id="zcbm-printable-proforma">
					<div class="zcbm-proforma-top">
						<div>
							<h2 class="zcbm-p-company-name">Zandesh Logistics Group</h2>
							<p class="zcbm-p-company-phone">+98 21 00000000</p>
						</div>
						<div class="zcbm-p-meta">
							<p><strong>INVOICE NO:</strong> <span class="zcbm-p-inv-no">#ZCBM-8921</span></p>
							<p><strong>DATE:</strong> <span class="zcbm-p-date"></span></p>
						</div>
					</div>
					<hr class="zcbm-divider" />
					<div class="zcbm-p-details">
						<table class="zcbm-p-summary-table">
							<thead>
								<tr>
									<th>Description</th>
									<th>Details</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Container Type</td>
									<td class="zcbm-p-cont-name">40ft High Cube</td>
								</tr>
								<tr>
									<td>Total Volume (CBM)</td>
									<td class="zcbm-p-cbm">0.00 m³</td>
								</tr>
								<tr>
									<td>Total Gross Weight</td>
									<td class="zcbm-p-weight">0 kg</td>
								</tr>
								<tr>
									<td>Total Cartons / Packages</td>
									<td class="zcbm-p-items">0 pcs</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="zcbm-p-footer">
						<p class="zcbm-p-note">Generated via Zandesh CBM Freight Intelligence Software (cbm.zandesh.com)</p>
					</div>
				</div>
			</div>
			<div class="zcbm-modal-footer">
				<button type="button" class="zcbm-btn zcbm-btn-secondary zcbm-modal-close-btn">Close</button>
				<button type="button" class="zcbm-btn zcbm-btn-primary zcbm-btn-print">🖨️ Print / Save PDF</button>
			</div>
		</div>
	</div>
</div>
