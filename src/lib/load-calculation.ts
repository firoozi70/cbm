// منطق محاسبه چیدمان بار در کانتینر
// الگوریتم: امتحان هر ۶ حالت چرخش کارتن و انتخاب بیشترین تعداد

import { ContainerSpec } from "./containers";

export interface CartonInput {
  length: number; // سانتی‌متر
  width: number; // سانتی‌متر
  height: number; // سانتی‌متر
  weight: number; // کیلوگرم
  quantity: number; // تعداد کل
  stackable: boolean; // آیا قابل انبارش روی هم است؟
  maxStack: number; // حداکثر لایه انبارش
}

export interface LayerInfo {
  // تعداد کارتن در هر سطر (طول × عرض)
  perRow: number;
  rows: number;
  layers: number;
  orientationLabel: string;
  totalInLayout: number;
}

export interface CalculationResult {
  // تعداد کارتن‌هایی که در کانتینر جا می‌شوند (با در نظر گرفتن وزن)
  fittingCount: number;
  // تعداد کارتن‌هایی که با حجم جا می‌شدند (بدون در نظر گرفتن وزن)
  fittingByVolume: number;
  // تعداد کارتن‌هایی که با وزن مجاز جا می‌شدند
  fittingByWeight: number;
  // درصد استفاده از حجم کانتینر
  volumeUtilization: number;
  // درصد استفاده از وزن مجاز
  weightUtilization: number;
  // درصد استفاده کلی (کمینه حجم و وزن)
  overallUtilization: number;
  // وزن کل بار
  totalWeight: number;
  // حجم کل بار
  totalVolume: number;
  // ابعاد کارتن در حالت انتخاب شده (cm)
  effectiveLength: number;
  effectiveWidth: number;
  effectiveHeight: number;
  // اطلاعیات چیدمان (تعداد در طول، عرض، ارتفاع)
  layoutLength: number;
  layoutWidth: number;
  layoutHeight: number;
  // اندازه‌های اشغال شده
  usedLength: number;
  usedWidth: number;
  usedHeight: number;
  // فضای خالی
  emptyVolume: number;
  // چیدمان توضیح
  orientationLabel: string;
  // هشدارها
  warnings: string[];
  // آیا همه کارتن‌ها جا می‌شوند؟
  allFits: boolean;
}

// ۶ حالت چرخش ممکن برای یک جعبه (با ابعاد a,b,c)
const orientations = [
  { l: 0, w: 1, h: 2, label: "طول × عرض × ارتفاع" },
  { l: 0, w: 2, h: 1, label: "طول × ارتفاع × عرض" },
  { l: 1, w: 0, h: 2, label: "عرض × طول × ارتفاع" },
  { l: 1, w: 2, h: 0, label: "عرض × ارتفاع × طول" },
  { l: 2, w: 0, h: 1, label: "ارتفاع × طول × عرض" },
  { l: 2, w: 1, h: 0, label: "ارتفاع × عرض × طول" },
];

/**
 * محاسبه بیشترین تعداد کارتن که در یک کانتینر جا می‌شود
 * با امتحان همه ۶ حالت چرخش و انتخاب بهترین
 */
export function calculateLoad(
  carton: CartonInput,
  container: ContainerSpec
): CalculationResult {
  const warnings: string[] = [];

  const dims = [carton.length, carton.width, carton.height];
  let bestFit = {
    count: 0,
    layoutL: 0,
    layoutW: 0,
    layoutH: 0,
    label: orientations[0].label,
    effL: dims[0],
    effW: dims[1],
    effH: dims[2],
  };

  // امتحان همه ۶ حالت چرخش
  for (const orient of orientations) {
    const l = dims[orient.l];
    const w = dims[orient.w];
    const h = dims[orient.h];

    // اگر هر بُعد کارتن بزرگتر از کانتینر باشد، این حالت رد می‌شود
    if (
      l > container.internalLength ||
      w > container.internalWidth ||
      h > container.internalHeight
    ) {
      continue;
    }

    // تعداد در طول، عرض، ارتفاع
    const numL = Math.floor(container.internalLength / l);
    const numW = Math.floor(container.internalWidth / w);
    let numH = Math.floor(container.internalHeight / h);

    // اگر قابل انبارش و حداکثر لایه مشخص شده
    if (!carton.stackable && carton.maxStack > 0) {
      numH = Math.min(numH, carton.maxStack);
    } else if (carton.maxStack > 0) {
      numH = Math.min(numH, carton.maxStack);
    }

    const total = numL * numW * numH;
    if (total > bestFit.count) {
      bestFit = {
        count: total,
        layoutL: numL,
        layoutW: numW,
        layoutH: numH,
        label: orient.label,
        effL: l,
        effW: w,
        effH: h,
      };
    }
  }

  // محدودیت وزن
  const cartonsByWeight = Math.floor(container.maxPayload / carton.weight);
  const fittingByVolume = bestFit.count;
  const fittingByWeight = cartonsByWeight;

  // تعداد واقعی = کمترین مقدار بین ظرفیت حجمی و وزنی، و تعداد کل کارتن کاربر
  const fittingCount = Math.min(
    fittingByVolume,
    fittingByWeight,
    carton.quantity
  );

  // محاسبات حجم و وزن
  const cartonVolumeCm3 =
    carton.length * carton.width * carton.height;
  const containerVolumeCm3 =
    container.internalLength *
    container.internalWidth *
    container.internalHeight;
  const containerVolumeM3 = containerVolumeCm3 / 1_000_000; // متر مکعب
  const totalVolumeM3 = (cartonVolumeCm3 * fittingCount) / 1_000_000;
  const totalWeight = carton.weight * fittingCount;

  // درصد استفاده
  const volumeUtilization = (totalVolumeM3 / containerVolumeM3) * 100;
  const weightUtilization = (totalWeight / container.maxPayload) * 100;
  const overallUtilization = Math.min(volumeUtilization, weightUtilization);

  // ابعاد اشغال شده
  const usedLength = bestFit.effL * bestFit.layoutL;
  const usedWidth = bestFit.effW * bestFit.layoutW;
  const usedHeight = bestFit.effH * bestFit.layoutH;
  const usedVolumeM3 = (usedLength * usedWidth * usedHeight) / 1_000_000;
  const emptyVolume = containerVolumeM3 - usedVolumeM3;

  // هشدارها
  if (carton.weight === 0) {
    warnings.push("وزن کارتن صفر است؛ لطفاً وزن را وارد کنید.");
  }
  if (bestFit.count === 0) {
    warnings.push(
      "ابعاد کارتن بزرگتر از ابعاد داخلی کانتینر است. با هیچ چرخشی جا نمی‌شود."
    );
  }
  if (fittingByWeight < fittingByVolume) {
    warnings.push(
      `محدودیت وزن مجاز کانتینر مانع از پر کردن کامل حجم می‌شود. حداکثر ${fittingByWeight} کارتن با توجه به وزن مجاز جا می‌گیرد.`
    );
  }
  if (carton.quantity < fittingByVolume && carton.quantity < fittingByWeight) {
    warnings.push(
      "تعداد کارتن وارد شده کمتر از ظرفیت کانتینر است؛ بخش بزرگی از کانتینر خالی می‌ماند."
    );
  }
  if (volumeUtilization < 60 && bestFit.count > 0) {
    warnings.push(
      "میزان استفاده از حجم پایین است. می‌توانید با تغییر اندازه کارتن یا ترکیب بارها، بهینه‌تر چیدمان کنید."
    );
  }
  if (weightUtilization > 90) {
    warnings.push(
      "وزن بار به حد مجاز کانتینر نزدیک است؛ از بارگیری بیش از حد خودداری کنید."
    );
  }

  const allFits = fittingCount >= carton.quantity;

  return {
    fittingCount,
    fittingByVolume,
    fittingByWeight,
    volumeUtilization,
    weightUtilization,
    overallUtilization,
    totalWeight,
    totalVolume: totalVolumeM3,
    effectiveLength: bestFit.effL,
    effectiveWidth: bestFit.effW,
    effectiveHeight: bestFit.effH,
    layoutLength: bestFit.layoutL,
    layoutWidth: bestFit.layoutW,
    layoutHeight: bestFit.layoutH,
    usedLength,
    usedWidth,
    usedHeight,
    emptyVolume,
    orientationLabel: bestFit.label,
    warnings,
    allFits,
  };
}

// محاسبه وزن و حجم برای حالت چند نوع بار
export interface MultiCargoItem {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

export interface MultiCargoResult {
  totalVolume: number;
  totalWeight: number;
  totalCartons: number;
  byContainer: {
    container: ContainerSpec;
    fillPercentage: number;
    estimatedContainers: number;
  }[];
  recommendedContainer?: ContainerSpec;
}

export function calculateMultiCargo(
  items: MultiCargoItem[],
  containers: ContainerSpec[]
): MultiCargoResult {
  const totalVolume =
    items.reduce(
      (sum, it) => sum + (it.length * it.width * it.height * it.quantity) / 1_000_000,
      0
    );
  const totalWeight = items.reduce(
    (sum, it) => sum + it.weight * it.quantity,
    0
  );
  const totalCartons = items.reduce((sum, it) => sum + it.quantity, 0);

  const byContainer = containers.map((container) => {
    const fillByVolume = (totalVolume / container.capacity) * 100;
    const fillByWeight = (totalWeight / container.maxPayload) * 100;
    const maxFill = Math.max(fillByVolume, fillByWeight);
    const estimated = Math.ceil(maxFill / 100);
    return {
      container,
      fillPercentage: Math.min(maxFill, 100),
      estimatedContainers: estimated,
    };
  });

  // پیشنهاد: کانتینری که با کمترین تعداد کل بار را جا می‌دهد و کمترین حجم خالی دارد
  const recommended = byContainer.reduce((best, curr) => {
    if (!best) return curr;
    if (curr.estimatedContainers < best.estimatedContainers) return curr;
    return best;
  }, byContainer[0]);

  return {
    totalVolume,
    totalWeight,
    totalCartons,
    byContainer,
    recommendedContainer: recommended?.container,
  };
}
