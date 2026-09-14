import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ماشین‌حساب بار - SeaRates فارسی",
  description:
    "ابزار محاسبه و چیدمان بار در کانتینر با پشتیبانی کامل از زبان فارسی و راست‌چین. محاسبه تعداد کارتن، درصد استفاده از حجم و وزن مجاز کانتینر.",
  keywords: [
    "محاسبه بار",
    "کانتینر",
    "load calculator",
    "SeaRates",
    "حمل و نقل",
    "چیدمان بار",
    "بار اندازی",
  ],
  authors: [{ name: "SeaRates Persian" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ماشین‌حساب بار",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ماشین‌حساب بار - SeaRates فارسی",
    description:
      "ابزار فارسی و راست‌چین برای محاسبه و چیدمان بار در کانتینر.",
    type: "website",
    locale: "fa_IR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
