# 📦 CBM & 3D Container Stuffing Calculator | محاسبه‌گر CBM و بارچینی سه‌بعدی کانتینر

[![GitHub Repository](https://img.shields.io/badge/GitHub-firoozi70%2Fcbm-blue?logo=github)](https://github.com/firoozi70/cbm)
[![Website](https://img.shields.io/badge/Website-zandesh.com-emerald)](https://zandesh.com)
[![Support Email](https://img.shields.io/badge/Email-info%40zandesh.com-red?logo=gmail)](mailto:info@zandesh.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-black?logo=three.js)](https://threejs.org/)
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange?logo=cloudflare)](https://pages.cloudflare.com/)

سیستم پیشرفته و بین‌المللی محاسبه حجم (CBM)، چیدمان هوشمند و بارچینی سه‌بعدی کانتینرها و تریلرهای بین‌المللی با شبیه‌سازی بلادرنگ WebGL/Three.js، بهینه‌سازی توزیع وزن و ابعاد، پشتیبانی از ۹ زبان جهانی، و قابلیت ادغام کامل با وردپرس و وب‌سایت‌های سازمانی.

An advanced, international 3D container stuffing and CBM calculation web application powered by Next.js 16, React 19, Three.js, and Tailwind CSS.

---

## 🌐 زبان‌های پشتیبانی‌شده | Supported Languages
سیستم به صورت خودکار جهت صفحه (RTL/LTR)، فونت‌ها، اعداد و تمامی تعاریف قطعات، کانتینرها و نام پیش‌فرض ردیف‌ها و گروه‌ها را با تغییر زبان بومی‌سازی می‌کند:
- 🇮🇷 **فارسی (Persian)**
- 🇬🇧 **English**
- 🇨🇳 **中文 (Chinese)**
- 🇹🇷 **Türkçe (Turkish)**
- 🇸🇦 **العربية (Arabic)**
- 🇷🇺 **Русский (Russian)**
- 🇩🇪 **Deutsch (German)**
- 🇫🇷 **Français (French)**
- 🇪🇸 **Español (Spanish)**

---

## ✨ امکانات و قابلیت‌های کلیدی | Key Features

1. **محاسبه دقیق CBM و وزن بار**:
   - محاسبه خودکار حجم مکعبی کل (CBM)، وزن ناخالص کل و مقایسه آن با حداکثر ظرفیت مجاز کانتینر یا تریلر.
   - هشدار آنی اضافه بار (Overweight) یا پر شدن بیش از حد حجم (Overfill).

2. **نمایشگر سه‌بعدی تعاملی (3D Interactive Viewer)**:
   - چرخش ۳۶۰ درجه، زوم و جابجایی (OrbitControls).
   - انیمیشن بارچینی لایه به لایه و بررسی نحوه قرارگیری هر بسته.
   - ابعاد و خط‌کش‌های دقیق طولی، عرضی و ارتفاعی روی هر محور.
   - نمایش محورهای جهت بار (طول × عرض × ارتفاع) و رنگ‌بندی تفکیک‌شده کالاها.

3. **کانتینرها و وسایل حمل استاندارد بین‌المللی**:
   - کانتینر ۲۰ فوت استاندارد (20ft Standard - 20GP)
   - کانتینر ۴۰ فوت استاندارد (40ft Standard - 40GP)
   - کانتینر ۴۰ فوت های‌کیوب (40ft High Cube - 40HQ)
   - کانتینر ۴۵ فوت های‌کیوب (45ft High Cube - 45HQ)
   - تریلی چادری و کفی ترانزیت (Standard Curtainsider Truck / Trailer)
   - امکان تعریف کانتینر یا کامیون با ابعاد و وزن سفارشی.

4. **مدیریت گروه‌ها و کالاها**:
   - افزودن نامحدود گروه‌های کالا با قابلیت نام‌گذاری سفارشی یا تغییر زبان در لحظه.
   - تعیین رنگ اختصاصی برای هر کالا جهت تشخیص آسان در مدل ۳D.
   - تعیین قابلیت چیدمان مجاز (امکان چرخش در محور طول، عرض یا ارتفاع).

5. **خروجی و گزارش‌گیری**:
   - چاپ مستقیم گزارش و ذخیره فایل PDF شامل تمام جزئیات فنی و پکینگ لیست بارچینی.
   - آماده برای اشتراک‌گذاری با ترخیص‌کاران و خطوط کشتیرانی.

---

## 🚀 استقرار و دیپلوی روی Cloudflare Pages | Cloudflare Pages Deployment

پروژه به صورت استاتیک اکسپورت (`output: "export"`) پیکربندی شده است و بهینه‌ترین حالت میزبانی را روی شبکه جهانی کلودفلر (Cloudflare Pages) فراهم می‌کند:

### گام به گام استقرار از طریق گیت‌هاب (GitHub Integration):
1. وارد کنترل پنل [Cloudflare Dashboard](https://dash.cloudflare.com/) شوید.
2. از منوی کناری به بخش **Compute (Workers & Pages)** > **Create** > **Pages** بروید.
3. گزینه **Connect to Git** را انتخاب کرده و مخزن `firoozi70/cbm` را برگزینید.
4. تنظیمات ساخت (Build Settings) را دقیقاً مطابق زیر وارد کنید:
   - **Framework preset**: `None` یا `Next.js (Static HTML Export)`
   - **Build command**: `bun run build` یا `npm run build`
   - **Build output directory**: `out`
5. در بخش **Environment variables**:
   - متغیر `NODE_VERSION` را با مقدار `20` یا بالاتر اضافه کنید.
6. روی **Save and Deploy** کلیک کنید.
7. پس از پایان ساخت، نرم‌افزار روی دامنه اختصاصی کلودفلر (مانند `https://cbm-xxx.pages.dev`) در سراسر جهان در دسترس است.

> 💡 **نکته پاکسازی کش (Cache Invalidation)**:
> بعد از هر بار `git push origin main`، کلودفلر به طور خودکار استقرار جدید را انجام می‌دهد. اگر در مرورگر تغییرات را ندیدید، حافظه موقت (Cache) مرورگر را پاک کنید (یا کلید `Ctrl + F5` را فشار دهید) یا از تب Purge Cache کلودفلر اقدام نمایید.

---

## 🔌 راهنمای اتصال و ادغام با وردپرس | WordPress Integration

برای اضافه کردن این محاسبه‌گر به سایت وردپرسی خود (مثل `zandesh.com`)، چند روش استاندارد در دسترس است:

### روش ۱: آی‌فریم واکنش‌گرا در برگه یا المنتور (توصیه شده و سریع‌ترین روش)
یک المان **HTML سفارشی (Custom HTML)** در ویرایشگر وردپرس یا المنتور قرار داده و کد زیر را وارد کنید:

```html
<div class="cbm-calculator-wrapper" style="position: relative; width: 100%; min-height: 900px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <iframe
    src="https://cbm-xxx.pages.dev" 
    title="CBM & Container Stuffing 3D Calculator"
    style="width: 100%; height: 100%; min-height: 920px; border: none; display: block;"
    loading="lazy"
    allow="fullscreen">
  </iframe>
</div>
```
*(آدرس `https://cbm-xxx.pages.dev` را با آدرس دامنه کلودفلر یا ساب‌دامین اختصاصی خود جایگزین کنید).*

### روش ۲: ایجاد شورت‌کد اختصاصی در وردپرس (Shortcode)
کافیست کد زیر را در انتهای فایل `functions.php` پوسته فرزند (Child Theme) یا افزونه Code Snippets قرار دهید:

```php
function render_cbm_calculator_shortcode($atts) {
    $a = shortcode_atts(array(
        'url' => 'https://cbm-xxx.pages.dev',
        'height' => '950px'
    ), $atts);

    return '<div style="width:100%; min-height:' . esc_attr($a['height']) . '; border-radius:12px; overflow:hidden;">
        <iframe src="' . esc_url($a['url']) . '" style="width:100%; height:' . esc_attr($a['height']) . '; border:none;" allowfullscreen></iframe>
    </div>';
}
add_shortcode('cbm_calculator', 'render_cbm_calculator_shortcode');
```
سپس در هر برگه یا نوشته با شورت‌کد `[cbm_calculator]` نرم‌افزار را لود کنید.

### روش ۳: ساب‌فولدر یا ساب‌دامین اختصاصی (مثلاً `cbm.zandesh.com` یا `zandesh.com/cbm`)
- می‌توانید در DNS دامنه خود یک رکورد CNAME با نام `cbm` به دامنه `xxx.pages.dev` ارجاع دهید و در بخش Custom Domains کلودفلر آن را متصل نمایید تا روی آدرس شیک و رسمی شرکت لود شود.

*برای راهنمای جامع‌تر و کدهای پیشرفته، فایل اختصاصی [WORDPRESS_INTEGRATION.md](./WORDPRESS_INTEGRATION.md) را مطالعه کنید.*

---

## 💻 راه‌اندازی و توسعه محلی | Local Development

برای اجرای پروژه روی سیستم شخصی:

```bash
# ۱. کلون کردن ریپازیتوری
git clone https://github.com/firoozi70/cbm.git
cd cbm-web

# ۲. نصب پکیج‌ها (با Bun یا npm)
bun install
# یا
npm install

# ۳. اجرای سرور توسعه محلی
bun run dev
# یا
npm run dev
```

سپس آدرس `http://localhost:3000` را در مرورگر باز کنید.

برای تست ساخت استاتیک:
```bash
bun run build
```
پوشه خروجی نهایی به نام `out/` ایجاد خواهد شد.

---

## 📞 ارتباط، پشتیبانی و توسعه اختصاصی | Contact & Support

این پروژه با بالاترین استانداردهای مهندسی نرم‌افزار لجستیک و طراحی رابط کاربری پیاده‌سازی شده است. برای طرح هرگونه سوال، سفارش ابزارهای اختصاصی، یا پشتیبانی فنی با ما در تماس باشید:

- 📧 **پست الکترونیکی (Email)**: [info@zandesh.com](mailto:info@zandesh.com)
- 🌐 **وب‌سایت رسمی (Website)**: [zandesh.com](https://zandesh.com)
- 🐙 **مخزن گیت‌هاب (GitHub Repository)**: [https://github.com/firoozi70/cbm](https://github.com/firoozi70/cbm)

---
© ۲۰۲۶ کلیه حقوق برای **Zandesh Logistics** و توسعه‌دهندگان پروژه محفوظ است.
