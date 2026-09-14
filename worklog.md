# Worklog - ماشین‌حساب بار (Load Calculator) فارسی

---
Task ID: main
Agent: main (Super Z)
Task: شبیه‌سازی ابزار Load Calculator سایت SeaRates به فارسی و راست‌چین برای موبایل (اندروید و iOS)

Work Log:
- بارگذاری skill fullstack-dev و راه‌اندازی محیط Next.js 16
- ساخت فایل `src/lib/containers.ts` با داده‌های ۵ کانتینر استاندارد (20ft, 40ft, 40ft HC, 45ft HC, 20ft Light) شامل ابعاد داخلی/خارجی، وزن مجاز، حجم و توضیحات فارسی
- ساخت فایل `src/lib/load-calculation.ts` با الگوریتم چیدمان بهینه (امتحان هر ۶ حالت چرخش کارتن)، محاسبه درصد استفاده از حجم/وزن، تولید هشدارها
- به‌روزرسانی `src/app/layout.tsx` با lang="fa" dir="rtl"، فونت Vazirmatn، metadata با manifest PWA
- بازنویسی `src/app/globals.css` با پالت آبی-سبز دریایی، پشتیبانی کامل از RTL و اعداد فارسی
- ساخت کامپوننت‌های:
  - `cargo-form.tsx`: فرم ورودی ابعاد/وزن/تعداد کارتن با قابلیت افزودن چند کارتن، انتخاب واحد (cm/m/in/ft و kg/g/lb/t)، switch قابل انبارش
  - `container-selector.tsx`: انتخاب کانتینر با کارت‌های بصری
  - `results-panel.tsx`: پنل نتایج شامل شاخص‌ها، Progress bar ها، نمایش ایزومتریک چیدمان با SVG، هشدارها
- صفحه اصلی `src/app/page.tsx`: چیدمان واکنش‌گرا با grid 1-col در موبایل و 2-col در دسکتاپ، هدر sticky، فوتر sticky-to-bottom
- افزودن PWA: `public/manifest.json` + `public/icon.svg` (آیکون کانتینر با جعبه‌ها)
- تست با Agent Browser در viewport موبایل (412×915) و دسکتاپ (1280×800) - همه چیز رندر شد، اعداد فارسی، چیدمان RTL، محاسبات صحیح

Stage Summary:
- نوع پروژه: وب‌اپلیکیشن Next.js 16 واکنش‌گرا (PWA) که روی اندروید و iOS در مرورگر اجرا می‌شود
- زبان: فارسی کامل با dir="rtl"
- فونت: Vazirmatn از Google Fonts
- عملکرد شبیه‌سازی شده از SeaRates Load Calculator:
  * ورودی چند کارتن با ابعاد و وزن
  * انتخاب از ۵ نوع کانتینر استاندارد
  * محاسبه چیدمان بهینه با الگوریتم امتحان ۶ چرخش
  * نمایش تعداد جاگرفته، درصد حجم/وزن، چیدمان توصیفی
  * نمایش ایزومتریک SVG از چیدمان کارتن‌ها در کانتینر
  * هشدارهای هوشمند (وزن مجاز، حجم کم استفاده‌شده، تعداد کمتر از ظرفیت)
  * راهنما داخل اپلیکیشن
- قابلیت نصب به عنوان اپ روی موبایل (Add to Home Screen) با manifest و appleWebApp metadata
- بدون خطای lint یا console - همه چیز با موفقیت اجرا شد
