# 🔌 راهنمای جامع اتصال نرم‌افزار بارچینی CBM به سایت وردپرس (WordPress Integration)

این سند روش‌های مختلف یکپارچه‌سازی محاسبه‌گر پیشرفته CBM و بارچینی سه‌بعدی را با وب‌سایت‌های وردپرسی (شامل قالب‌های اختصاصی، المنتور، ویژوال کامپوزر و ساب‌دامین) به تفصیل توضیح می‌دهد.

---

## 📑 فهرست مطالب
1. [روش ۱: تعبیه با آی‌فریم در المنتور و گوتنبرگ (سریع و آسان)](#روش-۱-تعبیه-با-آیفریم-در-المنتور-و-گوتنبرگ)
2. [روش ۲: ایجاد شورت‌کد اختصاصی در وردپرس (Shortcode)](#روش-۲-ایجاد-شورتکد-اختصاصی-در-وردپرس)
3. [روش ۳: اتصال از طریق ساب‌دامین با دامنه اختصاصی شرکت](#روش-۳-اتصال-از-طریق-سابدامین-با-دامنه-اختصاصی-شرکت)
4. [روش ۴: ساب‌فولدر از طریق Nginx Reverse Proxy (مثلاً zandesh.com/cbm)](#روش-۴-سابفولدر-از-طریق-nginx-reverse-proxy)
5. [تنظیمات ریسپانسیو و حل مشکل اسکرول در موبایل](#تنظیمات-ریسپانسیو-و-حل-مشکل-اسکرول-در-موبایل)
6. [پشتیبانی و سوالات فنی](#پشتیبانی-و-سوالات-فنی)

---

## روش ۱: تعبیه با آی‌فریم در المنتور و گوتنبرگ

### گام‌ها در المنتور (Elementor):
1. برگه مورد نظر خود (مثلاً «محاسبه حجم و بارچینی کانتینر») را با المنتور ویرایش کنید.
2. یک سکشن تمام‌عرض (Full Width) ایجاد کنید.
3. ویجت **کد HTML (HTML Widget)** را به صفحه بکشید.
4. کد HTML زیر را درون آن قرار دهید:

```html
<div class="cbm-embed-container">
  <iframe 
    id="cbmCalculatorFrame"
    src="https://firoozi70.github.io/cbm/" 
    title="محاسبه‌گر CBM و بارچینی سه‌بعدی"
    allow="fullscreen"
    loading="lazy">
  </iframe>
</div>

<style>
.cbm-embed-container {
  position: relative;
  width: 100%;
  min-height: 900px;
  margin: 20px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  background: #ffffff;
}
.cbm-embed-container iframe {
  width: 100%;
  height: 920px;
  border: none;
  display: block;
}
@media (max-width: 768px) {
  .cbm-embed-container {
    min-height: 800px;
    border-radius: 10px;
  }
  .cbm-embed-container iframe {
    height: 850px;
  }
}
</style>
```

> ⚠️ **نکته**: آدرس `src` در کد فوق را به آدرس دامنه Cloudflare Pages خود (مثلاً `https://cbm-xxx.pages.dev`) یا دامنه اختصاصی تغییر دهید.

---

## روش ۲: ایجاد شورت‌کد اختصاصی در وردپرس

با استفاده از شورت‌کد، کارشناسان محتوای سایت می‌توانند تنها با نوشتن `[cbm_calculator]` در هر نوشته، برگه یا پاپ‌آپ، نرم‌افزار را اجرا کنند.

کد زیر را در انتهای فایل `functions.php` پوسته خود (یا با افزونه **WPCode / Code Snippets**) اضافه کنید:

```php
<?php
/**
 * شورت‌کد اختصاصی محاسبه‌گر بارچینی کانتینر
 * استفاده: [cbm_calculator] یا [cbm_calculator height="950px" url="https://..."]
 */
function zandesh_cbm_calculator_shortcode($atts) {
    $attributes = shortcode_atts(array(
        'url'    => 'https://cbm.zandesh.com', // آدرس پیش‌فرض محاسبه‌گر
        'height' => '920px',
        'class'  => 'zandesh-cbm-frame'
    ), $atts);

    ob_start();
    ?>
    <div class="cbm-shortcode-wrapper" style="width: 100%; min-height: <?php echo esc_attr($attributes['height']); ?>; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); margin: 25px 0;">
        <iframe 
            src="<?php echo esc_url($attributes['url']); ?>" 
            class="<?php echo esc_attr($attributes['class']); ?>"
            style="width: 100%; height: <?php echo esc_attr($attributes['height']); ?>; border: none; display: block;" 
            loading="lazy" 
            allowfullscreen>
        </iframe>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('cbm_calculator', 'zandesh_cbm_calculator_shortcode');
```

---

## روش ۳: اتصال از طریق ساب‌دامین با دامنه اختصاصی شرکت

زیباترین و حرفه‌ای‌ترین راه‌حل، بالا آوردن نرم‌افزار روی ساب‌دامین رسمی شرکت (مثلاً `cbm.zandesh.com`) است:

1. وارد کنترل پنل Cloudflare شوید.
2. به بخش پروژه Pages خود بروید و تب **Custom Domains** را انتخاب کنید.
3. روی **Set up a custom domain** کلیک کرده و آدرس `cbm.zandesh.com` را وارد کنید.
4. کلودفلر به طور خودکار رکورد DNS و گواهینامه امنیتی SSL رایگان را صادر می‌کند.
5. حال در منوی بالای وردپرس، یک لینک ساده در فهرست (Menu) به `https://cbm.zandesh.com` با عنوان **«محاسبه CBM و بارچینی سه‌بعدی»** قرار دهید.

---

## روش ۴: ساب‌فولدر از طریق Nginx Reverse Proxy

اگر هاست وردپرس شما از وب‌سرور Nginx استفاده می‌کند و می‌خواهید محاسبه‌گر روی آدرس `https://zandesh.com/cbm/` بالا بیاید:

در فایل کانفیگ Nginx سایت، بلوک زیر را درون بلوک `server { ... }` قرار دهید:

```nginx
location /cbm/ {
    proxy_pass https://cbm-xxx.pages.dev/;
    proxy_set_header Host cbm-xxx.pages.dev;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_ssl_server_name on;
}
```

---

## تنظیمات ریسپانسیو و حل مشکل اسکرول در موبایل

برای جلوگیری از اسکرول ناخواسته هنگام تعامل کاربر با نمایشگر سه‌بعدی (Three.js) در صفحات لمسی موبایل، پیشنهاد می‌شود ارتفاع مناسب (حداقل `800px`) به آی‌فریم داده شود تا کاربر بتواند صفحه را از حاشیه‌ها اسکرول کند و در داخل کادر به راحتی مدل کانتینر را بچرخاند.

---

## 📞 پشتیبانی و سوالات فنی

برای راهنمایی بیشتر، سفارشی‌سازی فرمت‌های خروجی و ادغام عمیق با پایگاه داده وردپرس (WooCommerce / CRM):
- 📧 ایمیل رسمی: [info@zandesh.com](mailto:info@zandesh.com)
- 🌐 وب‌سایت: [zandesh.com](https://zandesh.com)
- 🐙 مخزن گیت‌هاب: [https://github.com/firoozi70/cbm](https://github.com/firoozi70/cbm)
