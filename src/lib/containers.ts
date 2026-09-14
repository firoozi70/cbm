// داده‌های مشخصات کانتینرهای استاندارد بین‌المللی
// منبع: استاندارد ISO 668 و داده‌های شرکتی SeaRates

export interface ContainerSpec {
  id: string;
  nameFa: string;
  nameEn: string;
  // ابعاد داخلی بر حسب سانتی‌متر
  internalLength: number; // طول داخلی
  internalWidth: number; // عرض داخلی
  internalHeight: number; // ارتفاع داخلی
  // ابعاد خارجی بر حسب سانتی‌متر (برای نمایش)
  externalLength: number;
  externalWidth: number;
  externalHeight: number;
  // حداکثر وزن بار بر حسب کیلوگرم
  maxPayload: number;
  // وزن خالص کانتینر
  tareWeight: number;
  // حداکثر وزن ناخالص
  maxGrossWeight: number;
  // حجم داخلی بر حسب متر مکعب
  capacity: number;
  // نوع (خشک / های‌کیوب)
  type: "standard" | "high-cube";
  // توضیح کوتاه
  description: string;
}

export const CONTAINERS: ContainerSpec[] = [
  {
    id: "20ft-std",
    nameFa: "کانتینر ۲۰ فوتی استاندارد",
    nameEn: "20ft Standard",
    internalLength: 589.8,
    internalWidth: 235.2,
    internalHeight: 239.3,
    externalLength: 605.8,
    externalWidth: 243.8,
    externalHeight: 259.1,
    maxPayload: 28200,
    tareWeight: 2200,
    maxGrossWeight: 30400,
    capacity: 33.2,
    type: "standard",
    description: "مناسب برای بارهای سنگین و متراکم",
  },
  {
    id: "40ft-std",
    nameFa: "کانتینر ۴۰ فوتی استاندارد",
    nameEn: "40ft Standard",
    internalLength: 1203.2,
    internalWidth: 235.2,
    internalHeight: 239.3,
    externalLength: 1219.2,
    externalWidth: 243.8,
    externalHeight: 259.1,
    maxPayload: 26680,
    tareWeight: 3700,
    maxGrossWeight: 30480,
    capacity: 67.7,
    type: "standard",
    description: "پرکاربردترین نوع کانتینر در تجارت جهانی",
  },
  {
    id: "40ft-hc",
    nameFa: "کانتینر ۴۰ فوتی های‌کیوب",
    nameEn: "40ft High Cube",
    internalLength: 1203.2,
    internalWidth: 235.2,
    internalHeight: 269.8,
    externalLength: 1219.2,
    externalWidth: 243.8,
    externalHeight: 289.6,
    maxPayload: 26510,
    tareWeight: 3900,
    maxGrossWeight: 30480,
    capacity: 76.4,
    type: "high-cube",
    description: "ارتفاع بیشتر، مناسب برای بارهای حجیم و سبک",
  },
  {
    id: "45ft-hc",
    nameFa: "کانتینر ۴۵ فوتی های‌کیوب",
    nameEn: "45ft High Cube",
    internalLength: 1355.6,
    internalWidth: 235.2,
    internalHeight: 269.8,
    externalLength: 1371.6,
    externalWidth: 243.8,
    externalHeight: 289.6,
    maxPayload: 27380,
    tareWeight: 3900,
    maxGrossWeight: 32900,
    capacity: 86.0,
    type: "high-cube",
    description: "بزرگ‌ترین کانتینر استاندارد، حداکثر ظرفیت",
  },
  {
    id: "20ft-std-light",
    nameFa: "کانتینر ۲۰ فوتی سبک",
    nameEn: "20ft Light",
    internalLength: 589.8,
    internalWidth: 235.2,
    internalHeight: 239.3,
    externalLength: 605.8,
    externalWidth: 243.8,
    externalHeight: 259.1,
    maxPayload: 22130,
    tareWeight: 1900,
    maxGrossWeight: 24000,
    capacity: 33.2,
    type: "standard",
    description: "وزن کمتر، مناسب برای بارهای سبک‌تر",
  },
];

// واحد‌های اندازه‌گیری
export type LengthUnit = "cm" | "m" | "in" | "ft";
export type WeightUnit = "kg" | "g" | "lb" | "t";

export const LENGTH_UNITS: { value: LengthUnit; label: string; toCm: number }[] = [
  { value: "cm", label: "سانتی‌متر", toCm: 1 },
  { value: "m", label: "متر", toCm: 100 },
  { value: "in", label: "اینچ", toCm: 2.54 },
  { value: "ft", label: "فوت", toCm: 30.48 },
];

export const WEIGHT_UNITS: { value: WeightUnit; label: string; toKg: number }[] = [
  { value: "kg", label: "کیلوگرم", toKg: 1 },
  { value: "g", label: "گرم", toKg: 0.001 },
  { value: "lb", label: "پوند", toKg: 0.4536 },
  { value: "t", label: "تن", toKg: 1000 },
];

// تبدیل ابعاد به سانتی‌متر
export function toCm(value: number, unit: LengthUnit): number {
  const u = LENGTH_UNITS.find((u) => u.value === unit);
  return u ? value * u.toCm : value;
}

// تبدیل وزن به کیلوگرم
export function toKg(value: number, unit: WeightUnit): number {
  const u = WEIGHT_UNITS.find((u) => u.value === unit);
  return u ? value * u.toKg : value;
}

// فرمت اعداد به فارسی
export function faNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
