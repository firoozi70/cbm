import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Vazirmatn از Google Fonts برای فارسی
import { Vazirmatn } from "next/font/google";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ماشین‌حساب بار و چیدمان | SeaRates فارسی",
  description:
    "ابزار هوشمند محاسبه و چیدمان بهینه بار در کانتینر و کامیون. نسخه فارسی و راست‌چین ابزار SeaRates Load Calculator.",
  keywords: [
    "محاسبه بار",
    "چیدمان کانتینر",
    "load calculator",
    "SeaRates",
    "حمل و نقل",
    "بار اندازی",
  ],
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
    title: "ماشین‌حساب بار و چیدمان - SeaRates فارسی",
    description:
      "ابزار فارسی و راست‌چین برای محاسبه و چیدمان بهینه بار در کانتینر.",
    type: "website",
    locale: "fa_IR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0088ff",
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
        className={`${montserrat.variable} ${vazirmatn.variable} font-sans antialiased bg-white text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
