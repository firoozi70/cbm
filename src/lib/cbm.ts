// ماشین‌حساب CBM - امکانات استاندارد بین‌المللی
// انواع بسته، استانداردهای پالت (اروپا، آمریکا، آسیا و...) و شیوه‌های حمل (دریایی، هوایی، زمینی، ریلی)

/* ----------------------------- انواع بسته ----------------------------- */

export type PackageType =
  | "pallet" // پالت (پیش‌فرض)
  | "carton" // کارتن
  | "cylinder" // استوانه
  | "roll" // رول
  | "packet" // پاکت
  | "bag" // کیسه
  | "crate" // صندوق
  | "drum"; // بشکه

export interface PackageTypeInfo {
  value: PackageType;
  fa: string;
  en: string;
  // نوع ابعاد: مستطیلی (طول/عرض/ارتفاع) یا گرد (قطر + ارتفاع/طول)
  shape: "rect" | "round";
  // برای شکل گرد، بعد دوم چه نامی دارد؟
  roundSecond?: "height" | "length";
}

export const PACKAGE_TYPES: PackageTypeInfo[] = [
  { value: "pallet", fa: "پالت", en: "Pallet", shape: "rect" },
  { value: "carton", fa: "کارتن", en: "Carton", shape: "rect" },
  { value: "cylinder", fa: "استوانه", en: "Cylinder", shape: "round", roundSecond: "height" },
  { value: "roll", fa: "رول", en: "Roll", shape: "round", roundSecond: "length" },
  { value: "packet", fa: "پاکت", en: "Packet", shape: "rect" },
  { value: "bag", fa: "کیسه", en: "Bag", shape: "rect" },
  { value: "crate", fa: "صندوق", en: "Crate", shape: "rect" },
  { value: "drum", fa: "بشکه", en: "Drum", shape: "round", roundSecond: "height" },
];

export function getPackageType(t: PackageType): PackageTypeInfo {
  return PACKAGE_TYPES.find((p) => p.value === t) ?? PACKAGE_TYPES[0];
}

/* ------------------------ استانداردهای پالت ------------------------ */

export interface PalletTypeInfo {
  value: string;
  fa: string;
  en: string;
  // ابعاد رویه پالت بر حسب میلی‌متر
  length: number;
  width: number;
  // حداکثر ارتفاع بار مجاز روی پالت (میلی‌متر)
  maxLoadHeight: number;
  note?: string;
}

export const PALLET_TYPES: PalletTypeInfo[] = [
  {
    value: "eur",
    fa: "پالت اروپایی",
    en: "EUR / EUR 1",
    length: 1200,
    width: 800,
    maxLoadHeight: 1800,
    note: "پرکاربردترین پالت اروپا - ۱۲۰۰×۸۰۰ میلی‌متر",
  },
  {
    value: "eur2",
    fa: "پالت اروپایی ۲",
    en: "EUR 2",
    length: 1200,
    width: 1000,
    maxLoadHeight: 1800,
    note: "پالت صنعتی اروپا - ۱۲۰۰×۱۰۰۰ میلی‌متر",
  },
  {
    value: "us",
    fa: "پالت آمریکایی",
    en: "US / GMA",
    length: 1219,
    width: 1016,
    maxLoadHeight: 1800,
    note: "پالت استاندارد آمریکا - ۴۸×۴۰ اینچ",
  },
  {
    value: "asia",
    fa: "پالت آسیایی",
    en: "ASIA",
    length: 1100,
    width: 1100,
    maxLoadHeight: 1800,
    note: "پالت متداول آسیا - ۱۱۰۰×۱۱۰۰ میلی‌متر",
  },
  {
    value: "asia2",
    fa: "پالت آسیایی ۲",
    en: "ASIA 2",
    length: 1300,
    width: 1100,
    maxLoadHeight: 1800,
    note: "پالت بزرگ آسیا - ۱۳۰۰×۱۱۰۰ میلی‌متر",
  },
  {
    value: "custom",
    fa: "سفارشی",
    en: "Custom",
    length: 0,
    width: 0,
    maxLoadHeight: 1800,
    note: "ورود دستی ابعاد پالت",
  },
];

export function getPalletType(v: string): PalletTypeInfo {
  return PALLET_TYPES.find((p) => p.value === v) ?? PALLET_TYPES[0];
}

/* --------------------------- شیوه‌های حمل --------------------------- */

export type FreightMode = "sea" | "air" | "road" | "rail";

export interface FreightModeInfo {
  value: FreightMode;
  fa: string;
  en: string;
  // ضریب وزن حجمی: هر مترمکعب معادل چند کیلوگرم است
  factor: number;
  // تقسیم‌کننده حجم برای وزن حجمی (cm³ به kg)
  divider: number;
  icon: "ship" | "plane" | "truck" | "train";
  hint: string;
}

export const FREIGHT_MODES: FreightModeInfo[] = [
  {
    value: "sea",
    fa: "دریایی",
    en: "Sea / Ocean",
    factor: 1000,
    divider: 1000,
    icon: "ship",
    hint: "هر ۱ مترمکعب = ۱۰۰۰ کیلوگرم وزن حجمی",
  },
  {
    value: "air",
    fa: "هوایی",
    en: "Air",
    factor: 167,
    divider: 6000,
    icon: "plane",
    hint: "هر ۱ مترمکعب = ۱۶۷ کیلوگرم (۶۰۰۰ سانتی‌مترمکعب = ۱ کیلوگرم)",
  },
  {
    value: "road",
    fa: "زمینی",
    en: "Road / Truck",
    factor: 333,
    divider: 3000,
    icon: "truck",
    hint: "هر ۱ مترمکعب = ۳۳۳ کیلوگرم (۳۰۰۰ سانتی‌مترمکعب = ۱ کیلوگرم)",
  },
  {
    value: "rail",
    fa: "ریلی",
    en: "Rail",
    factor: 500,
    divider: 2000,
    icon: "train",
    hint: "هر ۱ مترمکعب = ۵۰۰ کیلوگرم (۲۰۰۰ سانتی‌مترمکعب = ۱ کیلوگرم)",
  },
];

export function getFreightMode(m: FreightMode): FreightModeInfo {
  return FREIGHT_MODES.find((f) => f.value === m) ?? FREIGHT_MODES[0];
}

/* --------------------------- محاسبات CBM --------------------------- */

export interface PackageRow {
  id: string;
  type: PackageType;
  // برای پالت: نوع استاندارد پالت
  palletType: string;
  // ابعاد بر حسب میلی‌متر
  length: string;
  width: string;
  height: string;
  // قطر برای اشکال گرد (mm)
  diameter: string;
  // وزن هر بسته (kg)
  weight: string;
  // تعداد
  quantity: string;
}

export interface PackageCbmResult {
  cbm: number; // حجم یک بسته (m³)
  totalCbm: number; // حجم کل (تعداد × حجم)
  totalWeight: number; // وزن کل (kg)
  count: number;
  valid: boolean;
}

/** محاسبه حجم یک بسته بر حسب مترمکعب (ورودی: میلی‌متر) */
export function calcPackageCbm(row: PackageRow): PackageCbmResult {
  const qty = parseInt(row.quantity) || 0;
  const weight = parseFloat(row.weight) || 0;
  const info = getPackageType(row.type);

  let l: number, w: number, h: number;
  if (info.shape === "round") {
    const d = parseFloat(row.diameter) || 0;
    const second = parseFloat(info.roundSecond === "length" ? row.length : row.height) || 0;
    l = d;
    w = d;
    h = second;
  } else {
    l = parseFloat(row.length) || 0;
    w = parseFloat(row.width) || 0;
    h = parseFloat(row.height) || 0;
  }

  const valid = l > 0 && w > 0 && h > 0 && qty > 0;
  // برای اشکال گرد (استوانه/رول/بشکه): حجم = (π/4) × قطر² × ارتفاع
  const shapeFactor = info.shape === "round" ? Math.PI / 4 : 1;
  const cbm = (shapeFactor * l * w * h) / 1_000_000_000; // mm³ → m³
  const totalCbm = valid ? cbm * qty : 0;

  return {
    cbm,
    totalCbm,
    totalWeight: valid ? weight * qty : 0,
    count: qty,
    valid,
  };
}

export interface CbmTotals {
  totalPackages: number;
  totalCbm: number;
  totalWeight: number;
  // وزن حجمی بر اساس شیوه حمل انتخابی
  volumetricWeight: number;
  // وزن قابل احتساب (بیشینه وزن واقعی و حجمی)
  chargeableWeight: number;
  // وزن قابل احتساب برای همه شیوه‌ها (برای مقایسه)
  byMode: Record<FreightMode, { volumetric: number; chargeable: number }>;
}

export function calcCbmTotals(rows: PackageRow[], mode: FreightMode): CbmTotals {
  let totalPackages = 0;
  let totalCbm = 0;
  let totalWeight = 0;

  for (const row of rows) {
    const r = calcPackageCbm(row);
    totalPackages += r.count;
    totalCbm += r.totalCbm;
    totalWeight += r.totalWeight;
  }

  const byMode = {} as Record<FreightMode, { volumetric: number; chargeable: number }>;
  for (const m of FREIGHT_MODES) {
    const volumetric = totalCbm * m.factor;
    byMode[m.value] = {
      volumetric,
      chargeable: Math.max(totalWeight, volumetric),
    };
  }

  const selected = getFreightMode(mode);
  const volumetricWeight = totalCbm * selected.factor;

  return {
    totalPackages,
    totalCbm,
    totalWeight,
    volumetricWeight,
    chargeableWeight: Math.max(totalWeight, volumetricWeight),
    byMode,
  };
}

/* ----------------------------- واحد اندازه ----------------------------- */

export type CbmLengthUnit = "mm" | "cm";

export const CBM_LENGTH_UNITS: { value: CbmLengthUnit; label: string; toMm: number }[] = [
  { value: "mm", label: "میلی‌متر", toMm: 1 },
  { value: "cm", label: "سانتی‌متر", toMm: 10 },
];
