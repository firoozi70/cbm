# Worklog - ماشین‌حساب بار (Load Calculator) فارسی - نسخه ۲

---
Task ID: v2
Agent: main (Super Z)
Task: بازنویسی کامل ابزار برای شبیه‌سازی دقیق ظاهر و عملکرد سایت اصلی SeaRates Load Calculator

Work Log:
- باز کردن سایت اصلی https://www.searates.com/load-calculator/ با agent-browser
- گرفتن اسکرین‌شات و استخراج styling واقعی سایت:
  * رنگ اصلی: #0088ff (آبی روشن SeaRates)
  * رنگ سرتیتر: #15354e (سرمه‌ای تیره)
  * فونت: Montserrat
  * Border radius: 5px برای دکمه‌ها، 4px برای input ها
  * ساختار: wizard با ۳ مرحله (PRODUCTS → CONTAINERS & TRUCKS → STUFFING RESULT)
  * جدول محصولات با ستون‌های: Type, Product Name, Length, Width, Height, Weight, Quantity, Color, Stack
  * تولبار: Add Group, Import, Export
  * Checkbox: Use pallets
- بازنویسی globals.css با پالت SeaRates (آبی روشن، سرمه‌ای، سفید)، استایل‌های Ant Design (.sr-btn-primary, .sr-btn-default, .sr-input)
- به‌روزرسانی layout.tsx با فونت Montserrat + Vazirmatn
- ساخت کامپوننت‌های جدید:
  * wizard-stepper.tsx: نوار استپر ۳ مرحله‌ای با شماره‌های دایره‌ای، تیک سبز برای کامل‌شده، رنگ آبی برای فعال
  * products-step.tsx: جدول محصولات با ساختار دقیق همانند اصلی (انتخاب نوع، نام، ابعاد mm، وزن kg، تعداد، انتخاب رنگ، toggle چیدن)
  * containers-step.tsx: گرید کارت‌های کانتینر (5 نوع) + کامیون (4 نوع) با نمایش ابعاد و وزن مجاز
  * result-step.tsx: 4 شاخص اصلی، پیغام وضعیت، SVG ایزومتریک چیدمان، جدول جزئیات محصولات، هشدارها
- افزودن PRODUCT_TYPES به containers.ts (8 نوع: Boxes, Sacks, Big bags, Barrels, Pallets, Drums, Crates, Bundles)
- افزودن TRUCKS به containers-step (3T, 5T, 10T, Semitrailer)
- افزودن calculateMultiStuffing به load-calculation.ts: پشتیبانی از چند محصول، محاسبه بهترین چرخش برای هر محصول، پیگیری فضای استفاده‌شده
- بازنویسی کامل page.tsx:
  * هدر سفید با لوگو SeaRates و منوی دسکتاپ/موبایل
  * عنوان صفحه "محاسبه بار و چیدمان"
  * WizardStepper در زیر عنوان
  * ۳ مرحله با انیمیشن fade-in-up
  * بخش محتوای پایین با ۳ مزیت اصلی (ترجمه فارسی متن اصلی)
  * بخش "ماشین‌حساب اختصاصی" با دکمه درخواست قیمت
  * فوتر سرمه‌ای
- حذف فایل‌های قدیمی: cargo-form, container-selector, results-panel
- تست کامل با Agent Browser:
  * مرحله ۱ (محصولات): ۳ محصول پیش‌فرض با ابعاد mm، انواع مختلف
  * مرحله ۲ (کانتینرها): انتخاب از 5 کانتینر + 4 کامیون
  * مرحله ۳ (نتیجه): محاسبه و نمایش بصری 3D، شاخص‌ها، جدول جزئیات
- تست موبایل (412×915) و دسکتاپ (1280×900) - هر دو به‌خوبی رندر شدند
- بدون خطای lint یا کنسول

Stage Summary:
- نسخه ۲ کاملا بازنویسی شد تا ظاهر و عملکرد سایت اصلی SeaRates رو شبیه‌سازی کنه
- تفاوت کلیدی با نسخه اول:
  * به جای فرم ساده، ساختار wizard ۳ مرحله‌ای
  * به جای سبز-آبی، از پالت آبی SeaRates (#0088ff, #15354e) استفاده می‌شود
  * به جای کارت‌های سفارشی، جدول محصولات مشابه اصلی با type/namedimensions/color/stack
  * به جای 5 کانتینر، 5 کانتینر + 4 کامیون
  * به جای محاسبه ۱ محصول، چند محصول همزمان در یک کانتینر
  * واحدها mm/kg هستند (همانند اصلی) نه چندگانه
  * هدر و فوتر سفید/سرمه‌ای شبیه اصلی
  * بخش محتوای پایین با ۳ مزیت (ترجمه متن اصلی)
- همه محاسبات صحیح: ۳ محصول (80+100+10=190 کارتن) همگی جا گرفتند، 41.8٪ حجم و 53.6٪ وزن
