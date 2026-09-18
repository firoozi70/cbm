import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";
import { I18nProvider } from "@/i18n/context";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cbm.zandesh.com";
const APP_TITLE = "Free CBM Calculator & 3D Container Loading — Zandesh Logistics | 100% Free, No Sign-up";
const APP_DESC =
  "100% Free online CBM calculator & 3D container stuffing simulator by Zandesh Logistics (zandesh.com). Instant volume calculation for 20ft, 40ft, 40ft HC containers, trucks, and air/ocean chargeable weight. Zero registration required.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_TITLE,
    template: "%s | Zandesh CBM",
  },
  description: APP_DESC,
  keywords: [
    "free cbm calculator",
    "cbm calculator online free",
    "100% free cargo stuffing",
    "container loading calculator",
    "cbm calculator no sign up",
    "zandesh",
    "zandesh cbm",
    "zandesh logistics",
    "3d cargo stuffing free",
    "cubic meter calculator free",
    "volumetric weight calculation",
    "40ft container capacity",
    "20ft container dimensions",
    "air freight chargeable weight",
    "pallet stuffing calculator",
    "shipping container load planner",
    "ماشین حساب cbm رایگان",
    "محاسبه رایگان cbm",
    "محاسبه آنلاین حجم کانتینر",
    "چیدمان سه بعدی کانتینر",
    "سامانه لجستیک زندش",
    "حاسبة CBM مجانية",
    "تحميل الحاويات 3D مجانا",
    "免费CBM计算器",
    "集装箱装箱计算软件免费",
    "бесплатный калькулятор cbm",
    "расчет загрузки контейнера бесплатно",
    "calculadora cbm gratis",
    "ucretsiz cbm hesaplama",
    "kostenloser cbm rechner",
    "calculateur cbm gratuit",
  ],
  applicationName: "Zandesh CBM",
  authors: [{ name: "Zandesh Logistics Group", url: "https://zandesh.com" }],
  creator: "Zandesh Logistics Group",
  publisher: "Zandesh Logistics Group",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zandesh CBM",
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
  alternates: {
    canonical: "/",
    languages: {
      fa: "/?lang=fa",
      en: "/?lang=en",
      ar: "/?lang=ar",
      zh: "/?lang=zh",
      ru: "/?lang=ru",
      es: "/?lang=es",
      tr: "/?lang=tr",
      de: "/?lang=de",
      fr: "/?lang=fr",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Free CBM Calculator & 3D Container Loading — Zandesh Logistics",
    description: APP_DESC,
    url: SITE_URL,
    siteName: "Zandesh CBM Calculator",
    type: "website",
    locale: "en_US",
    alternateLocale: ["fa_IR", "ar_SA", "zh_CN", "ru_RU", "es_ES", "tr_TR", "de_DE", "fr_FR"],
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Zandesh Free CBM & 3D Container Loading Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free CBM Calculator & 3D Container Loading — Zandesh Logistics",
    description: APP_DESC,
    images: ["/icon-512.png"],
  },
  other: {
    "geo.region": "GLOBAL",
    "geo.placename": "Worldwide Ports, Shipping Hubs and Logistics Centers",
    "rating": "General",
    "revisit-after": "1 days",
    "price": "0",
    "priceCurrency": "USD",
  },
};

export const viewport: Viewport = {
  themeColor: "#0088ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Structured Data
  const jsonLdWebapp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Zandesh Free CBM & 3D Container Loading Calculator",
    url: SITE_URL,
    applicationCategory: "LogisticsApplication, BusinessApplication",
    operatingSystem: "All (Web, iOS, Android, Desktop)",
    browserRequirements: "Requires JavaScript and WebGL for 3D simulation",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      category: "Free Logistics Software",
      description: "100% Free online CBM and container loading calculator with no registration required",
    },
    provider: {
      "@type": "Organization",
      name: "Zandesh Logistics Group",
      url: "https://zandesh.com",
    },
    description: APP_DESC,
    featureList: [
      "100% Free with zero registration or sign-up",
      "Interactive 3D container stuffing simulation",
      "CBM (cubic meters) cargo volume calculation",
      "Air and ocean chargeable volumetric weight calculation",
      "ISO 20ft, 40ft, 40ft HC, 45ft HC container and truck support",
      "EUR, US, and Asian pallet standard compatibility",
      "Commercial freight proforma invoice generator",
      "Offline and mobile PWA support",
      "9 languages: Persian, English, Arabic, Chinese, Russian, Spanish, Turkish, German, French",
    ],
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is the Zandesh CBM and Container Loading Calculator completely free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Zandesh CBM Calculator is 100% free with unlimited calculations. You do not need to register, create an account, or provide payment details to access the 3D stuffing simulator, pallet calculations, and proforma generator.",
        },
      },
      {
        "@type": "Question",
        name: "How do you calculate CBM (Cubic Meters) for shipping?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CBM is calculated as Length (m) × Width (m) × Height (m) × Total Quantity. For example, a carton with 50cm × 40cm × 30cm dimensions equals 0.5 × 0.4 × 0.3 = 0.06 m³. A shipment of 100 cartons equals 6 CBM.",
        },
      },
      {
        "@type": "Question",
        name: "How many CBM fit into a 20ft, 40ft, and 40ft High Cube container?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A standard 20ft container holds approximately 25 to 28 practical CBM (33.2 m³ nominal capacity). A 40ft standard container accommodates 54 to 58 practical CBM (67.7 m³ nominal). A 40ft High Cube holds 65 to 68 practical CBM (76.4 m³ nominal) with a height of 2.70 meters.",
        },
      },
      {
        "@type": "Question",
        name: "What is the formula for air freight chargeable volumetric weight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For air cargo (IATA standard), dimensional weight is calculated by Volume in cm³ divided by 6,000 (or 1 CBM = 167 kg). The carrier charges for whichever is higher: the actual gross weight or the volumetric weight.",
        },
      },
      {
        "@type": "Question",
        name: "How does the 3D container loading algorithm optimize cargo space?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our algorithm evaluates 6 spatial package orientations, identifies optimal extreme points in 3D coordinates, respects maximum stacking layers and payload weight, producing a visual step-by-step 3D packing plan.",
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebapp) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = new URLSearchParams(window.location.search);
                  var l = p.get('lang') || localStorage.getItem('cbm_lang') || (navigator.language ? navigator.language.slice(0, 2).toLowerCase() : 'fa');
                  var rtlLangs = ['fa', 'ar'];
                  var isRtl = rtlLangs.indexOf(l) !== -1;
                  document.documentElement.lang = l;
                  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
                  if (isRtl) {
                    document.documentElement.classList.add('rtl');
                    document.documentElement.classList.remove('ltr');
                  } else {
                    document.documentElement.classList.add('ltr');
                    document.documentElement.classList.remove('rtl');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${vazirmatn.variable} font-sans antialiased bg-white text-foreground`}
      >
        <I18nProvider>
          {children}
          <Toaster />
          <PwaRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
