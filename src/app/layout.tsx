import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";

/* فونت‌ها به‌صورت لوکال سرو می‌شوند (بدون هیچ درخواست خارجی - سازگار با مایکت/دیوار و شبکه ایران) */
const vazirmatn = localFont({
  src: [
    { path: "../fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

const montserrat = localFont({
  src: [
    { path: "../fonts/Montserrat-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Montserrat-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Montserrat-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Montserrat-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

const APP_TITLE = "ماشین‌حساب بار و CBM";
const APP_DESC =
  "ماشین‌حساب فارسی CBM و چیدمان بهینه بار در کانتینر و کامیون — با نمای سه‌بعدی تعاملی. بدون نیاز به نصب، مخصوص موبایل.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${APP_TITLE} | ماشین‌حساب CBM فارسی`,
    template: "%s | ماشین‌حساب بار",
  },
  description: APP_DESC,
  keywords: [
    "ماشین‌حساب CBM",
    "محاسبه حجم بار",
    "چیدمان کانتینر",
    "ماشین‌حساب بار",
    "حمل و نقل",
    "وزن حجمی",
    "پالت",
    "کنتینر",
    "load calculator",
    "CBM calculator",
  ],
  applicationName: APP_TITLE,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ماشین‌حساب بار",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${APP_TITLE} — فارسی و مخصوص موبایل`,
    description: APP_DESC,
    type: "website",
    locale: "fa_IR",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "ماشین‌حساب بار و CBM" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0088ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // پشتیبانی از ناچ و safe-area در گوشی‌ها
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${vazirmatn.variable} font-sans antialiased bg-white text-foreground`}
      >
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
