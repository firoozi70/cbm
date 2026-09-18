/**
 * Zandesh CBM WordPress Plugin - Frontend Engine & UI Controller
 */

(function () {
	'use strict';

	// Container Definitions
	var CONTAINERS = {
		'20ft-std': { name: '20ft Standard', l: 5898, w: 2352, h: 2393, maxPayload: 28180, volume: 33.2 },
		'40ft-std': { name: '40ft Standard', l: 12032, w: 2352, h: 2393, maxPayload: 26680, volume: 67.7 },
		'40ft-hc':  { name: '40ft High Cube', l: 12032, w: 2352, h: 2698, maxPayload: 26580, volume: 76.4 },
		'truck-13m':{ name: 'Standard Truck (13.6m)', l: 13600, w: 2450, h: 2700, maxPayload: 24000, volume: 90.0 }
	};

	// 9-Language Dictionary
	var I18N = {
		fa: {
			subbrand: 'سامانه بارگیری زَندِش',
			freeBadge: '۱۰۰٪ رایگان • بدون ثبت‌نام',
			btnLoad: 'چیدمان ۳بعدی کانتینر',
			btnCbm: 'ماشین‌حساب CBM',
			stepProducts: 'محصولات و بسته‌ها',
			stepContainer: 'انتخاب کانتینر یا تریلی',
			stepResult: 'نتیجه چیدمان ۳بعدی',
			productsTitle: 'مشخصات محصولات و بارها',
			productsDesc: 'ابعاد (میلی‌متر)، وزن واحد (کیلوگرم) و تعداد بسته‌ها را مشخص کنید.',
			usePallets: 'چیدمان روی پالت کف',
			thType: 'نوع بسته',
			thName: 'عنوان کالا',
			thL: 'طول (mm)',
			thW: 'عرض (mm)',
			thH: 'ارتفاع (mm)',
			thWt: 'وزن (kg)',
			thQty: 'تعداد',
			thColor: 'رنگ',
			addItem: 'افزودن کالای جدید',
			nextContainer: 'مرحله بعد: انتخاب کانتینر',
			containerTitle: 'انتخاب کانتینر یا تریلی حمل',
			containerDesc: 'کانتینرهای استاندارد دریایی ISO و کامیون‌های جاده‌ای.',
			back: 'بازگشت',
			calcBtn: 'محاسبه چیدمان ۳بعدی',
			volUtil: 'بهره‌وری فضایی (CBM)',
			wtUtil: 'بهره‌وری وزنی (Payload)',
			totalCbm: 'حجم کل بارگیری',
			totalWeight: 'وزن ناخالص کل',
			editCargo: 'ویرایش مشخصات بار',
			btnProforma: 'چاپ پیش‌فاکتور رسمی حمل',
			cbmTitle: 'ماشین‌حساب سریع CBM و وزن حجمی',
			cbmDesc: 'محاسبه فوری مترمکعب بار و وزن قابل احتساب هوایی و دریایی.',
			dimUnit: 'واحد ابعاد',
			airCw: 'وزن حجمی هوایی (۱:۶۰۰۰)',
			seaCw: 'وزن حجمی دریایی (۱:۱۰۰۰)',
			proformaTitle: 'پیش‌فاکتور رسمی کرایه حمل'
		},
		en: {
			subbrand: 'Zandesh Cargo Intelligence',
			freeBadge: '100% Free • No Sign-up',
			btnLoad: '3D Container Stuffing',
			btnCbm: 'CBM Calculator',
			stepProducts: 'Products & Packages',
			stepContainer: 'Select Container',
			stepResult: '3D Stuffing Plan',
			productsTitle: 'Cargo & Product Specifications',
			productsDesc: 'Enter dimensions (mm), unit weight (kg), and package quantity.',
			usePallets: 'Arrange on floor pallets',
			thType: 'Package Type',
			thName: 'Cargo Name',
			thL: 'Length (mm)',
			thW: 'Width (mm)',
			thH: 'Height (mm)',
			thWt: 'Weight (kg)',
			thQty: 'Qty',
			thColor: 'Color',
			addItem: 'Add Item',
			nextContainer: 'Next: Choose Container',
			containerTitle: 'Select Shipping Container or Truck',
			containerDesc: 'ISO standard ocean containers and commercial trucks.',
			back: 'Back',
			calcBtn: 'Calculate 3D Stuffing Plan',
			volUtil: 'Volume Utilization',
			wtUtil: 'Weight Utilization',
			totalCbm: 'Total Cargo Volume',
			totalWeight: 'Total Gross Weight',
			editCargo: 'Edit Cargo',
			btnProforma: 'Print Proforma Invoice',
			cbmTitle: 'Quick CBM & Volumetric Weight Calculator',
			cbmDesc: 'Instant cubic meter and dimensional freight calculation.',
			dimUnit: 'Dimension Unit',
			airCw: 'Air Chargeable Weight (1:6000)',
			seaCw: 'Sea Chargeable Weight (1:1000)',
			proformaTitle: 'Commercial Freight Proforma Invoice'
		},
		ar: {
			subbrand: 'منظومة الشحن من زَندِش',
			freeBadge: 'مجاني ۱۰۰٪ • بدون تسجيل',
			btnLoad: 'تحميل وترتيب الحاوية 3D',
			btnCbm: 'حاسبة CBM',
			stepProducts: 'البضائع والطرود',
			stepContainer: 'اختيار الحاوية',
			stepResult: 'خطة التحميل 3D',
			productsTitle: 'مواصفات البضائع والطرود',
			productsDesc: 'أدخل الأبعاد (ملم)، الوزن والكمية.',
			usePallets: 'ترتيب البضائع على طبالي',
			thType: 'نوع الطرد',
			thName: 'اسم البضاعة',
			thL: 'الطول (mm)',
			thW: 'العرض (mm)',
			thH: 'الارتفاع (mm)',
			thWt: 'الوزن (kg)',
			thQty: 'العدد',
			thColor: 'اللون',
			addItem: 'إضافة طرد جديد',
			nextContainer: 'التالي: اختيار الحاوية',
			containerTitle: 'اختيار الحاوية أو الشاحنة',
			containerDesc: 'حاويات الشحن القياسية والشاحنات الدولية.',
			back: 'رجوع',
			calcBtn: 'حساب التوزيع ثلاثي الأبعاد',
			volUtil: 'نسبة استغلال الحجم',
			wtUtil: 'نسبة استغلال الوزن',
			totalCbm: 'إجمالي الحجم (CBM)',
			totalWeight: 'إجمالي الوزن',
			editCargo: 'تعديل البضائع',
			btnProforma: 'طباعة الفاتورة المبدئية',
			cbmTitle: 'حاسبة CBM والوزن الحجمي السريعة',
			cbmDesc: 'حساب فوري للأمتار المكعبة للشحن الجوي والبحري.',
			dimUnit: 'وحدة القياس',
			airCw: 'الوزن الحجمي الجوي (1:6000)',
			seaCw: 'الوزن الحجمي البحري (1:1000)',
			proformaTitle: 'فاتورة شحن مبدئية'
		},
		zh: {
			subbrand: 'Zandesh 智能装箱配载',
			freeBadge: '100% 免费 • 无需注册',
			btnLoad: '3D集装箱装箱',
			btnCbm: 'CBM体积计算',
			stepProducts: '货物规格与尺寸',
			stepContainer: '选择集装箱柜型',
			stepResult: '3D配载方案',
			productsTitle: '货物与包装规格',
			productsDesc: '输入货物尺寸(mm)、单件重量(kg)与总数量。',
			usePallets: '使用地面托盘排布',
			thType: '包装类型',
			thName: '货物名称',
			thL: '长度 (mm)',
			thW: '宽度 (mm)',
			thH: '高度 (mm)',
			thWt: '重量 (kg)',
			thQty: '数量',
			thColor: '颜色',
			addItem: '添加新货物',
			nextContainer: '下一步: 选择柜型',
			containerTitle: '选择集装箱或卡车',
			containerDesc: '标准海运货柜与公路货运挂车。',
			back: '返回上一步',
			calcBtn: '生成3D装箱配载方案',
			volUtil: '容积利用率',
			wtUtil: '重量利用率',
			totalCbm: '总体积 (CBM)',
			totalWeight: '总毛重',
			editCargo: '修改货物',
			btnProforma: '打印出口形式发票',
			cbmTitle: '快速 CBM 与体积重计算器',
			cbmDesc: '快速测算海运立方与空运体积计费重。',
			dimUnit: '尺寸单位',
			airCw: '空运计费重 (1:6000)',
			seaCw: '海运计费重 (1:1000)',
			proformaTitle: '国际物流形式发票'
		},
		ru: {
			subbrand: 'Логистическая система Zandesh',
			freeBadge: '100% Бесплатно • Без регистрации',
			btnLoad: '3D Загрузка контейнера',
			btnCbm: 'Калькулятор CBM',
			stepProducts: 'Грузы и упаковка',
			stepContainer: 'Выбор контейнера',
			stepResult: '3D Схема погрузки',
			productsTitle: 'Параметры грузов',
			productsDesc: 'Укажите размеры (мм), вес (кг) и количество.',
			usePallets: 'Укладка на паллеты',
			thType: 'Тип упаковки',
			thName: 'Наименование',
			thL: 'Длина (мм)',
			thW: 'Ширина (мм)',
			thH: 'Высота (мм)',
			thWt: 'Вес (кг)',
			thQty: 'Кол-во',
			thColor: 'Цвет',
			addItem: 'Добавить позицию',
			nextContainer: 'Далее: Выбор контейнера',
			containerTitle: 'Выбор морского контейнера или фуры',
			containerDesc: 'Стандартные ISO контейнеры и еврофуры.',
			back: 'Назад',
			calcBtn: 'Рассчитать 3D схему погрузки',
			volUtil: 'Заполнение по объему',
			wtUtil: 'Заполнение по весу',
			totalCbm: 'Общий объем (CBM)',
			totalWeight: 'Общий вес',
			editCargo: 'Изменить груз',
			btnProforma: 'Печать проформы инвойса',
			cbmTitle: 'Быстрый расчет объема CBM',
			cbmDesc: 'Мгновенный расчет кубатуры и объемного веса.',
			dimUnit: 'Единицы измерения',
			airCw: 'Объемный вес авиа (1:6000)',
			seaCw: 'Объемный вес море (1:1000)',
			proformaTitle: 'Проформа инвойс'
		},
		es: {
			subbrand: 'Inteligencia Logística Zandesh',
			freeBadge: '100% Gratis • Sin Registro',
			btnLoad: 'Carga 3D de Contenedores',
			btnCbm: 'Calculadora CBM',
			stepProducts: 'Productos y Bultos',
			stepContainer: 'Seleccionar Contenedor',
			stepResult: 'Plan de Carga 3D',
			productsTitle: 'Especificaciones de la Carga',
			productsDesc: 'Ingrese dimensiones (mm), peso (kg) y cantidades.',
			usePallets: 'Carga sobre pallets en piso',
			thType: 'Tipo de bulto',
			thName: 'Nombre del producto',
			thL: 'Largo (mm)',
			thW: 'Ancho (mm)',
			thH: 'Alto (mm)',
			thWt: 'Peso (kg)',
			thQty: 'Cant.',
			thColor: 'Color',
			addItem: 'Añadir Producto',
			nextContainer: 'Siguiente: Elegir Contenedor',
			containerTitle: 'Seleccionar Contenedor o Camión',
			containerDesc: 'Contenedores marítimos estándar ISO y camiones.',
			back: 'Atrás',
			calcBtn: 'Calcular Plan de Carga 3D',
			volUtil: 'Utilización de Volumen',
			wtUtil: 'Utilización de Peso',
			totalCbm: 'Volumen Total (CBM)',
			totalWeight: 'Peso Bruto Total',
			editCargo: 'Modificar Carga',
			btnProforma: 'Imprimir Factura Proforma',
			cbmTitle: 'Calculadora Rápida de CBM y Peso Tasable',
			cbmDesc: 'Cálculo instantáneo de metros cúbicos para flete aéreo y marítimo.',
			dimUnit: 'Unidad de medida',
			airCw: 'Peso tasable aéreo (1:6000)',
			seaCw: 'Peso tasable marítimo (1:1000)',
			proformaTitle: 'Factura Proforma de Flete'
		},
		tr: {
			subbrand: 'Zandesh Akıllı Yük Sistemi',
			freeBadge: '%100 Ücretsiz • Kayıtsız',
			btnLoad: '3D Konteyner Yükleme',
			btnCbm: 'CBM Hesaplayıcı',
			stepProducts: 'Yük ve Koliler',
			stepContainer: 'Konteyner Seçimi',
			stepResult: '3D Yükleme Planı',
			productsTitle: 'Yük ve Ürün Özellikleri',
			productsDesc: 'Ölçüleri (mm), ağırlığı (kg) ve adedi girin.',
			usePallets: 'Palet taban dizilimi',
			thType: 'Paket Tipi',
			thName: 'Yük Adı',
			thL: 'Uzunluk (mm)',
			thW: 'Genişlik (mm)',
			thH: 'Yükseklik (mm)',
			thWt: 'Ağırlık (kg)',
			thQty: 'Adet',
			thColor: 'Renk',
			addItem: 'Yeni Yük Ekle',
			nextContainer: 'İleri: Konteyner Seçimi',
			containerTitle: 'Konteyner veya Tır Seçin',
			containerDesc: 'Standart ISO denizyolu konteynerleri ve tırlar.',
			back: 'Geri',
			calcBtn: '3D Yükleme Planını Hesapla',
			volUtil: 'Hacim Doluluk Oranı',
			wtUtil: 'Ağırlık Doluluk Oranı',
			totalCbm: 'Toplam CBM Hacmi',
			totalWeight: 'Toplam Brüt Ağırlık',
			editCargo: 'Yükü Düzenle',
			btnProforma: 'Proforma Fatura Yazdır',
			cbmTitle: 'Hızlı CBM ve Hacimsel Ağırlık Hesaplayıcı',
			cbmDesc: 'Hava ve denizyolu için pratik navlun hesaplaması.',
			dimUnit: 'Ölçü Birimi',
			airCw: 'Havayolu Navlun Ağırlığı (1:6000)',
			seaCw: 'Denizyolu Navlun Ağırlığı (1:1000)',
			proformaTitle: 'Navlun Proforma Faturası'
		},
		de: {
			subbrand: 'Zandesh Fracht-Intelligenz',
			freeBadge: '100% Kostenlos • Ohne Registrierung',
			btnLoad: '3D Containerbeladung',
			btnCbm: 'CBM-Rechner',
			stepProducts: 'Frachtstücke & Kartons',
			stepContainer: 'Container wählen',
			stepResult: '3D Stauplan',
			productsTitle: 'Fracht- und Paketspezifikationen',
			productsDesc: 'Maße (mm), Stückgewicht (kg) und Anzahl eingeben.',
			usePallets: 'Palettenbeladung am Boden',
			thType: 'Paketart',
			thName: 'Warenbezeichnung',
			thL: 'Länge (mm)',
			thW: 'Breite (mm)',
			thH: 'Höhe (mm)',
			thWt: 'Gewicht (kg)',
			thQty: 'Menge',
			thColor: 'Farbe',
			addItem: 'Artikel hinzufügen',
			nextContainer: 'Weiter: Container wählen',
			containerTitle: 'Seecontainer oder LKW wählen',
			containerDesc: 'ISO-Standardcontainer und LKWs.',
			back: 'Zurück',
			calcBtn: '3D Stauplan berechnen',
			volUtil: 'Volumennutzung',
			wtUtil: 'Gewichtsnutzung',
			totalCbm: 'Gesamtvolumen (CBM)',
			totalWeight: 'Gesamtgewicht',
			editCargo: 'Ladung bearbeiten',
			btnProforma: 'Proforma-Rechnung drucken',
			cbmTitle: 'Schneller CBM- & Volumengewichtsrechner',
			cbmDesc: 'Sofortige Kubikmeterberechnung für See- und Luftfracht.',
			dimUnit: 'Maßeinheit',
			airCw: 'Luftfracht Frachtgewicht (1:6000)',
			seaCw: 'Seefracht Frachtgewicht (1:1000)',
			proformaTitle: 'Fracht-Proformarechnung'
		},
		fr: {
			subbrand: 'Intelligence Fret Zandesh',
			freeBadge: '100% Gratuit • Sans Inscription',
			btnLoad: 'Empotage Conteneur 3D',
			btnCbm: 'Calculateur CBM',
			stepProducts: 'Marchandises & Colis',
			stepContainer: 'Choisir Conteneur',
			stepResult: 'Plan d\'Empotage 3D',
			productsTitle: 'Spécifications de la cargaison',
			productsDesc: 'Entrez les dimensions (mm), le poids unitaire (kg) et les quantités.',
			usePallets: 'Disposition sur palettes au sol',
			thType: 'Type de colis',
			thName: 'Description',
			thL: 'Longueur (mm)',
			thW: 'Largeur (mm)',
			thH: 'Hauteur (mm)',
			thWt: 'Poids (kg)',
			thQty: 'Qté',
			thColor: 'Couleur',
			addItem: 'Ajouter un article',
			nextContainer: 'Suivant: Choisir Conteneur',
			containerTitle: 'Sélectionner Conteneur ou Camion',
			containerDesc: 'Conteneurs maritimes ISO standard et camions.',
			back: 'Retour',
			calcBtn: 'Calculer l\'empotage 3D',
			volUtil: 'Utilisation du volume',
			wtUtil: 'Utilisation du poids',
			totalCbm: 'Volume total (CBM)',
			totalWeight: 'Poids brut total',
			editCargo: 'Modifier cargaison',
			btnProforma: 'Imprimer Proforma',
			cbmTitle: 'Calculateur rapide de CBM et poids taxable',
			cbmDesc: 'Calcul immédiat des mètres cubes pour fret maritime et aérien.',
			dimUnit: 'Unité de dimension',
			airCw: 'Poids taxable aérien (1:6000)',
			seaCw: 'Poids taxable maritime (1:1000)',
			proformaTitle: 'Facture Proforma de Fret'
		}
	};

	// Widget Class
	function ZandeshCBMWidget(rootEl) {
		this.root = rootEl;
		this.currentMode = rootEl.getAttribute('data-mode') || 'load';
		this.currentLang = rootEl.getAttribute('data-lang') || 'fa';
		this.currentStep = 1;
		this.selectedContainer = '40ft-hc';
		this.items = [
			{ type: 'Boxes', name: 'Item 1', l: 500, w: 400, h: 300, wt: 10, qty: 80, color: '#0088ff' },
			{ type: 'Sacks', name: 'Item 2', l: 1000, w: 450, h: 300, wt: 45, qty: 100, color: '#52c41a' },
			{ type: 'Big bags', name: 'Item 3', l: 1000, w: 1000, h: 1000, wt: 900, qty: 10, color: '#faad14' }
		];
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.cargoMeshes = [];
		this.isWireframe = false;
		this.animStep = 0;

		this.init();
	}

	ZandeshCBMWidget.prototype.init = function () {
		this.applyLanguage(this.currentLang);
		this.bindEvents();
		this.renderProductsTable();
		this.renderContainers();
		this.switchMode(this.currentMode);
		this.updateCbmCalculations();
	};

	ZandeshCBMWidget.prototype.applyLanguage = function (lang) {
		this.currentLang = lang;
		var t = I18N[lang] || I18N.fa;
		var isRtl = (lang === 'fa' || lang === 'ar');
		this.root.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

		var setTxt = function (sel, txt) {
			var el = this.root.querySelector(sel);
			if (el) el.textContent = txt;
		}.bind(this);

		setTxt('.zcbm-i18n-subbrand', t.subbrand);
		setTxt('.zcbm-i18n-free-badge', t.freeBadge);
		setTxt('.zcbm-i18n-btn-load', t.btnLoad);
		setTxt('.zcbm-i18n-btn-cbm', t.btnCbm);
		setTxt('.zcbm-i18n-step-products', t.stepProducts);
		setTxt('.zcbm-i18n-step-container', t.stepContainer);
		setTxt('.zcbm-i18n-step-result', t.stepResult);
		setTxt('.zcbm-i18n-products-title', t.productsTitle);
		setTxt('.zcbm-i18n-products-desc', t.productsDesc);
		setTxt('.zcbm-i18n-use-pallets', t.usePallets);
		setTxt('.zcbm-i18n-th-type', t.thType);
		setTxt('.zcbm-i18n-th-name', t.thName);
		setTxt('.zcbm-i18n-th-l', t.thL);
		setTxt('.zcbm-i18n-th-w', t.thW);
		setTxt('.zcbm-i18n-th-h', t.thH);
		setTxt('.zcbm-i18n-th-wt', t.thWt);
		setTxt('.zcbm-i18n-th-qty', t.thQty);
		setTxt('.zcbm-i18n-th-color', t.thColor);
		setTxt('.zcbm-i18n-add-item', t.addItem);
		setTxt('.zcbm-i18n-next-container', t.nextContainer);
		setTxt('.zcbm-i18n-container-title', t.containerTitle);
		setTxt('.zcbm-i18n-container-desc', t.containerDesc);
		setTxt('.zcbm-i18n-back', t.back);
		setTxt('.zcbm-i18n-calc-btn', t.calcBtn);
		setTxt('.zcbm-i18n-vol-util', t.volUtil);
		setTxt('.zcbm-i18n-wt-util', t.wtUtil);
		setTxt('.zcbm-i18n-total-cbm', t.totalCbm);
		setTxt('.zcbm-i18n-total-weight', t.totalWeight);
		setTxt('.zcbm-i18n-edit-cargo', t.editCargo);
		setTxt('.zcbm-i18n-btn-proforma', t.btnProforma);
		setTxt('.zcbm-i18n-cbm-title', t.cbmTitle);
		setTxt('.zcbm-i18n-cbm-desc', t.cbmDesc);
		setTxt('.zcbm-i18n-dim-unit', t.dimUnit);
		setTxt('.zcbm-i18n-air-cw', t.airCw);
		setTxt('.zcbm-i18n-sea-cw', t.seaCw);
		setTxt('.zcbm-i18n-proforma-title', t.proformaTitle);

		var langSelect = this.root.querySelector('.zcbm-lang-select');
		if (langSelect) langSelect.value = lang;
	};

	ZandeshCBMWidget.prototype.bindEvents = function () {
		var self = this;

		// Mode toggle
		var modeBtns = this.root.querySelectorAll('.zcbm-btn-toggle');
		modeBtns.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var target = this.getAttribute('data-target-mode');
				self.switchMode(target);
			});
		});

		// Language change
		var langSel = this.root.querySelector('.zcbm-lang-select');
		if (langSel) {
			langSel.addEventListener('change', function () {
				self.applyLanguage(this.value);
			});
		}

		// Stepper buttons
		var stepBtns = this.root.querySelectorAll('.zcbm-step-btn');
		stepBtns.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var stp = parseInt(this.getAttribute('data-step'), 10);
				self.goToStep(stp);
			});
		});

		// Next / Prev buttons
		var nextBtns = this.root.querySelectorAll('.zcbm-btn-next-step, .zcbm-btn-calculate');
		nextBtns.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var gotoStep = parseInt(this.getAttribute('data-goto'), 10);
				if (gotoStep === 3) {
					self.calculateAndRender3D();
				}
				self.goToStep(gotoStep);
			});
		});

		var prevBtns = this.root.querySelectorAll('.zcbm-btn-prev-step');
		prevBtns.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var gotoStep = parseInt(this.getAttribute('data-goto'), 10);
				self.goToStep(gotoStep);
			});
		});

		// Add item
		var addBtn = this.root.querySelector('.zcbm-btn-add-item');
		if (addBtn) {
			addBtn.addEventListener('click', function () {
				self.items.push({
					type: 'Boxes',
					name: 'Item ' + (self.items.length + 1),
					l: 500,
					w: 400,
					h: 300,
					wt: 10,
					qty: 20,
					color: '#0088ff'
				});
				self.renderProductsTable();
			});
		}

		// Restart
		var restartBtn = this.root.querySelector('.zcbm-btn-restart');
		if (restartBtn) {
			restartBtn.addEventListener('click', function () {
				self.goToStep(1);
			});
		}

		// 3D Toolbar
		var resetCamBtn = this.root.querySelector('.zcbm-btn-reset-cam');
		if (resetCamBtn) {
			resetCamBtn.addEventListener('click', function () {
				if (self.camera && self.controls) {
					self.camera.position.set(15, 12, 18);
					self.controls.target.set(0, 0, 0);
					self.controls.update();
				}
			});
		}

		var wireframeBtn = this.root.querySelector('.zcbm-btn-wireframe');
		if (wireframeBtn) {
			wireframeBtn.addEventListener('click', function () {
				self.isWireframe = !self.isWireframe;
				self.cargoMeshes.forEach(function (m) {
					if (m.material) m.material.wireframe = self.isWireframe;
				});
			});
		}

		// Quick CBM inputs
		var cbmInputs = this.root.querySelectorAll('.zcbm-cbm-grid input, .zcbm-cbm-grid select');
		cbmInputs.forEach(function (inp) {
			inp.addEventListener('input', function () {
				self.updateCbmCalculations();
			});
		});

		// Proforma Modal
		var openProformaBtn = this.root.querySelector('.zcbm-btn-open-proforma');
		var modal = this.root.querySelector('.zcbm-proforma-modal');
		var closeBtns = this.root.querySelectorAll('.zcbm-modal-close, .zcbm-modal-close-btn, .zcbm-modal-backdrop');

		if (openProformaBtn && modal) {
			openProformaBtn.addEventListener('click', function () {
				self.populateProforma();
				modal.classList.add('open');
			});
		}

		closeBtns.forEach(function (cb) {
			cb.addEventListener('click', function () {
				if (modal) modal.classList.remove('open');
			});
		});

		var printBtn = this.root.querySelector('.zcbm-btn-print');
		if (printBtn) {
			printBtn.addEventListener('click', function () {
				window.print();
			});
		}
	};

	ZandeshCBMWidget.prototype.switchMode = function (mode) {
		this.currentMode = mode;
		var toggles = this.root.querySelectorAll('.zcbm-btn-toggle');
		toggles.forEach(function (b) {
			b.classList.toggle('active', b.getAttribute('data-target-mode') === mode);
		});

		var viewLoad = this.root.querySelector('.zcbm-view-load');
		var viewCbm = this.root.querySelector('.zcbm-view-cbm');

		if (mode === 'load') {
			if (viewLoad) viewLoad.classList.add('active');
			if (viewCbm) viewCbm.classList.remove('active');
		} else {
			if (viewLoad) viewLoad.classList.remove('active');
			if (viewCbm) viewCbm.classList.add('active');
		}
	};

	ZandeshCBMWidget.prototype.goToStep = function (step) {
		this.currentStep = step;
		var stepBtns = this.root.querySelectorAll('.zcbm-step-btn');
		stepBtns.forEach(function (b) {
			var s = parseInt(b.getAttribute('data-step'), 10);
			b.classList.toggle('active', s === step);
		});

		var contents = this.root.querySelectorAll('.zcbm-step-content');
		contents.forEach(function (c) {
			var isTarget = c.classList.contains('zcbm-step-' + step);
			c.classList.toggle('active', isTarget);
		});
	};

	ZandeshCBMWidget.prototype.renderProductsTable = function () {
		var tbody = this.root.querySelector('.zcbm-products-tbody');
		if (!tbody) return;
		tbody.innerHTML = '';

		var self = this;
		this.items.forEach(function (item, idx) {
			var tr = document.createElement('tr');
			tr.innerHTML =
				'<td><select class="zcbm-row-type" data-idx="' + idx + '">' +
				'<option value="Boxes"' + (item.type === 'Boxes' ? ' selected' : '') + '>Boxes</option>' +
				'<option value="Sacks"' + (item.type === 'Sacks' ? ' selected' : '') + '>Sacks</option>' +
				'<option value="Big bags"' + (item.type === 'Big bags' ? ' selected' : '') + '>Big bags</option>' +
				'<option value="Pallets"' + (item.type === 'Pallets' ? ' selected' : '') + '>Pallets</option>' +
				'</select></td>' +
				'<td><input type="text" class="zcbm-row-name" data-idx="' + idx + '" value="' + item.name + '" /></td>' +
				'<td><input type="number" class="zcbm-row-l" data-idx="' + idx + '" value="' + item.l + '" /></td>' +
				'<td><input type="number" class="zcbm-row-w" data-idx="' + idx + '" value="' + item.w + '" /></td>' +
				'<td><input type="number" class="zcbm-row-h" data-idx="' + idx + '" value="' + item.h + '" /></td>' +
				'<td><input type="number" class="zcbm-row-wt" data-idx="' + idx + '" value="' + item.wt + '" /></td>' +
				'<td><input type="number" class="zcbm-row-qty" data-idx="' + idx + '" value="' + item.qty + '" /></td>' +
				'<td><input type="color" class="zcbm-row-color" data-idx="' + idx + '" value="' + item.color + '" /></td>' +
				'<td><button type="button" class="zcbm-row-del" data-idx="' + idx + '" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;">&times;</button></td>';

			tbody.appendChild(tr);
		});

		// Event handlers on row inputs
		tbody.querySelectorAll('input, select').forEach(function (inp) {
			inp.addEventListener('change', function () {
				var idx = parseInt(this.getAttribute('data-idx'), 10);
				var prop = this.className.replace('zcbm-row-', '');
				var val = this.value;
				if (['l', 'w', 'h', 'wt', 'qty'].indexOf(prop) !== -1) {
					val = parseFloat(val) || 0;
				}
				self.items[idx][prop] = val;
			});
		});

		tbody.querySelectorAll('.zcbm-row-del').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var idx = parseInt(this.getAttribute('data-idx'), 10);
				if (self.items.length > 1) {
					self.items.splice(idx, 1);
					self.renderProductsTable();
				}
			});
		});
	};

	ZandeshCBMWidget.prototype.renderContainers = function () {
		var grid = this.root.querySelector('.zcbm-container-grid');
		if (!grid) return;
		grid.innerHTML = '';

		var self = this;
		Object.keys(CONTAINERS).forEach(function (key) {
			var c = CONTAINERS[key];
			var card = document.createElement('div');
			card.className = 'zcbm-cont-card' + (key === self.selectedContainer ? ' selected' : '');
			card.setAttribute('data-cont', key);
			card.innerHTML =
				'<span class="zcbm-cont-name">' + c.name + '</span>' +
				'<div class="zcbm-cont-spec">' +
				'L: ' + (c.l / 1000).toFixed(2) + 'm × W: ' + (c.w / 1000).toFixed(2) + 'm × H: ' + (c.h / 1000).toFixed(2) + 'm<br>' +
				'Volume: <strong>' + c.volume + ' m³</strong> | Max Payload: <strong>' + c.maxPayload.toLocaleString() + ' kg</strong>' +
				'</div>';

			card.addEventListener('click', function () {
				self.selectedContainer = key;
				grid.querySelectorAll('.zcbm-cont-card').forEach(function (cd) {
					cd.classList.remove('selected');
				});
				card.classList.add('selected');
			});

			grid.appendChild(card);
		});
	};

	ZandeshCBMWidget.prototype.calculateAndRender3D = function () {
		var cont = CONTAINERS[this.selectedContainer] || CONTAINERS['40ft-hc'];
		var totalCbm = 0;
		var totalWeight = 0;
		var totalPieces = 0;

		this.items.forEach(function (item) {
			var volM3 = (item.l / 1000) * (item.w / 1000) * (item.h / 1000);
			totalCbm += volM3 * item.qty;
			totalWeight += item.wt * item.qty;
			totalPieces += item.qty;
		});

		var volUtil = Math.min(100, (totalCbm / cont.volume) * 100);
		var wtUtil = Math.min(100, (totalWeight / cont.maxPayload) * 100);

		// Update KPIs
		var volUtilEl = this.root.querySelector('.zcbm-kpi-vol-util');
		var wtUtilEl = this.root.querySelector('.zcbm-kpi-wt-util');
		var cbmEl = this.root.querySelector('.zcbm-kpi-cbm');
		var weightEl = this.root.querySelector('.zcbm-kpi-weight');

		if (volUtilEl) volUtilEl.textContent = volUtil.toFixed(1) + '%';
		if (wtUtilEl) wtUtilEl.textContent = wtUtil.toFixed(1) + '%';
		if (cbmEl) cbmEl.textContent = totalCbm.toFixed(2) + ' m³';
		if (weightEl) weightEl.textContent = totalWeight.toLocaleString() + ' kg';

		// Render Three.js
		this.initThreeJS(cont);
	};

	ZandeshCBMWidget.prototype.initThreeJS = function (cont) {
		var viewport = this.root.querySelector('.zcbm-3d-viewport');
		if (!viewport || typeof THREE === 'undefined') return;

		viewport.innerHTML = '';
		var width = viewport.clientWidth || 600;
		var height = 420;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x0f172a);

		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		this.camera.position.set(16, 12, 20);

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		viewport.appendChild(this.renderer.domElement);

		if (typeof THREE.OrbitControls !== 'undefined') {
			this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
			this.controls.enableDamping = true;
			this.controls.dampingFactor = 0.05;
		}

		// Lighting
		var ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
		this.scene.add(ambientLight);

		var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
		dirLight.position.set(10, 20, 15);
		this.scene.add(dirLight);

		// Container Wireframe Box
		var scale = 0.001;
		var cL = cont.l * scale;
		var cW = cont.w * scale;
		var cH = cont.h * scale;

		var boxGeo = new THREE.BoxGeometry(cL, cH, cW);
		var wireGeo = new THREE.WireframeGeometry(boxGeo);
		var wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
		var containerWire = new THREE.LineSegments(wireGeo, wireMat);
		containerWire.position.set(0, cH / 2, 0);
		this.scene.add(containerWire);

		// Grid floor
		var grid = new THREE.GridHelper(Math.max(cL, cW) * 1.5, 20, 0x475569, 0x1e293b);
		this.scene.add(grid);

		// Pack cargo items
		this.cargoMeshes = [];
		var curX = -cL / 2;
		var curY = 0;
		var curZ = -cW / 2;
		var maxRowH = 0;

		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			var iL = item.l * scale;
			var iW = item.w * scale;
			var iH = item.h * scale;
			var color = new THREE.Color(item.color);

			var itemGeo = new THREE.BoxGeometry(iL, iH, iW);
			var itemMat = new THREE.MeshLambertMaterial({
				color: color,
				wireframe: this.isWireframe,
				transparent: true,
				opacity: 0.95
			});

			for (var q = 0; q < Math.min(item.qty, 120); q++) {
				if (curX + iL > cL / 2) {
					curX = -cL / 2;
					curZ += iW;
				}
				if (curZ + iW > cW / 2) {
					curZ = -cW / 2;
					curY += maxRowH > 0 ? maxRowH : iH;
					maxRowH = 0;
				}
				if (curY + iH > cH) {
					break; // Container full in height
				}

				var mesh = new THREE.Mesh(itemGeo, itemMat);
				mesh.position.set(curX + iL / 2, curY + iH / 2, curZ + iW / 2);

				// Edges
				var edgeGeo = new THREE.EdgesGeometry(itemGeo);
				var edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
				var edges = new THREE.LineSegments(edgeGeo, edgeMat);
				mesh.add(edges);

				this.scene.add(mesh);
				this.cargoMeshes.push(mesh);

				curX += iL;
				if (iH > maxRowH) maxRowH = iH;
			}
		}

		// Animation loop
		var self = this;
		function animate() {
			requestAnimationFrame(animate);
			if (self.controls) self.controls.update();
			self.renderer.render(self.scene, self.camera);
		}
		animate();

		// Handle resize
		window.addEventListener('resize', function () {
			if (!viewport || !self.renderer || !self.camera) return;
			var newW = viewport.clientWidth;
			self.camera.aspect = newW / height;
			self.camera.updateProjectionMatrix();
			self.renderer.setSize(newW, height);
		});
	};

	ZandeshCBMWidget.prototype.updateCbmCalculations = function () {
		var unitEl = this.root.querySelector('.zcbm-cbm-unit');
		var lenEl = this.root.querySelector('.zcbm-cbm-len');
		var widEl = this.root.querySelector('.zcbm-cbm-wid');
		var hgtEl = this.root.querySelector('.zcbm-cbm-hgt');
		var qtyEl = this.root.querySelector('.zcbm-cbm-qty');
		var wtEl = this.root.querySelector('.zcbm-cbm-wt');

		if (!unitEl || !lenEl) return;

		var unit = unitEl.value;
		var l = parseFloat(lenEl.value) || 0;
		var w = parseFloat(widEl.value) || 0;
		var h = parseFloat(hgtEl.value) || 0;
		var qty = parseInt(qtyEl.value, 10) || 1;
		var wt = parseFloat(wtEl.value) || 0;

		// Convert to meters
		var mFactor = 1;
		if (unit === 'cm') mFactor = 0.01;
		else if (unit === 'mm') mFactor = 0.001;
		else if (unit === 'in') mFactor = 0.0254;

		var lM = l * mFactor;
		var wM = w * mFactor;
		var hM = h * mFactor;

		var cbmSingle = lM * wM * hM;
		var totalCbm = cbmSingle * qty;

		// Air Freight: 1 CBM = 167 kg (or Volume in cm3 / 6000)
		var airCw = totalCbm * 167;
		// Sea Freight: 1 CBM = 1000 kg
		var seaCw = totalCbm * 1000;

		var totalCbmEl = this.root.querySelector('.zcbm-cbm-total-val');
		var airCwEl = this.root.querySelector('.zcbm-cbm-air-cw');
		var seaCwEl = this.root.querySelector('.zcbm-cbm-sea-cw');

		if (totalCbmEl) totalCbmEl.textContent = totalCbm.toFixed(3) + ' m³';
		if (airCwEl) airCwEl.textContent = Math.round(airCw).toLocaleString() + ' kg';
		if (seaCwEl) seaCwEl.textContent = Math.round(seaCw).toLocaleString() + ' kg';
	};

	ZandeshCBMWidget.prototype.populateProforma = function () {
		var config = window.zandeshCbmConfig || {};
		var compNameEl = this.root.querySelector('.zcbm-p-company-name');
		var compPhoneEl = this.root.querySelector('.zcbm-p-company-phone');
		var dateEl = this.root.querySelector('.zcbm-p-date');
		var contNameEl = this.root.querySelector('.zcbm-p-cont-name');
		var cbmEl = this.root.querySelector('.zcbm-p-cbm');
		var weightEl = this.root.querySelector('.zcbm-p-weight');
		var itemsEl = this.root.querySelector('.zcbm-p-items');

		if (compNameEl) compNameEl.textContent = config.companyName || 'Zandesh Logistics Group';
		if (compPhoneEl) compPhoneEl.textContent = config.companyPhone || '+98 21 00000000';
		if (dateEl) dateEl.textContent = new Date().toLocaleDateString();

		var cont = CONTAINERS[this.selectedContainer] || CONTAINERS['40ft-hc'];
		if (contNameEl) contNameEl.textContent = cont.name;

		var totalCbm = 0;
		var totalWeight = 0;
		var totalQty = 0;
		this.items.forEach(function (i) {
			totalCbm += ((i.l * i.w * i.h) / 1000000000) * i.qty;
			totalWeight += i.wt * i.qty;
			totalQty += i.qty;
		});

		if (cbmEl) cbmEl.textContent = totalCbm.toFixed(2) + ' m³';
		if (weightEl) weightEl.textContent = totalWeight.toLocaleString() + ' kg';
		if (itemsEl) itemsEl.textContent = totalQty.toLocaleString() + ' pcs';
	};

	// Auto-initialize all widgets on DOM ready
	document.addEventListener('DOMContentLoaded', function () {
		var widgets = document.querySelectorAll('.zandesh-cbm-app-root');
		widgets.forEach(function (w) {
			new ZandeshCBMWidget(w);
		});
	});

	// Support Elementor Frontend Hook
	if (typeof jQuery !== 'undefined') {
		jQuery(window).on('elementor/frontend/init', function () {
			elementorFrontend.hooks.addAction('frontend/element_ready/zandesh_cbm_calculator.default', function ($scope) {
				var w = $scope.find('.zandesh-cbm-app-root')[0];
				if (w) new ZandeshCBMWidget(w);
			});
		});
	}
})();
