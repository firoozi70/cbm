// منطق محاسبه چیدمان بار در کانتینر - نسخه ۳
// الگوریتم: چیدمان بلوکی با نقاط اتصال (Extreme Points) + بررسی تکیه‌گاه
// هر محصول در ۶ حالت چرخش امتحان می‌شود و بلوک‌های فشرده در بهترین موقعیت قرار می‌گیرند.
// خروجی شامل موقعیت واقعی تک‌تک جعبه‌ها برای رندر سه‌بعدی تعاملی است.

import { ContainerSpec, ContainerSpec as CS } from "./containers";

/* ---------------------------------- انواع ---------------------------------- */

export interface CartonInput {
  length: number; // سانتی‌متر
  width: number; // سانتی‌متر
  height: number; // سانتی‌متر
  weight: number; // کیلوگرم
  quantity: number; // تعداد کل
  stackable: boolean; // آیا قابل انبارش روی هم است؟
  maxStack: number; // حداکثر لایه انبارش
}

export interface CalculationResult {
  fittingCount: number;
  fittingByVolume: number;
  fittingByWeight: number;
  volumeUtilization: number;
  weightUtilization: number;
  overallUtilization: number;
  totalWeight: number;
  totalVolume: number;
  effectiveLength: number;
  effectiveWidth: number;
  effectiveHeight: number;
  layoutLength: number;
  layoutWidth: number;
  layoutHeight: number;
  usedLength: number;
  usedWidth: number;
  usedHeight: number;
  emptyVolume: number;
  orientationLabel: string;
  warnings: string[];
  allFits: boolean;
}

// یک جعبه برای رندر سه‌بعدی - مختصات واقعی در کانتینر (cm)
export interface BoxInstance {
  x: number; // موقعیت گوشه در طول (cm)
  y: number; // موقعیت گوشه در عرض (cm)
  z: number; // موقعیت گوشه در ارتفاع (cm)
  l: number; // طول مؤثر جعبه (cm)
  w: number; // عرض مؤثر (cm)
  h: number; // ارتفاع مؤثر (cm)
  productId: string;
  color: string;
  seq: number; // ترتیب قرارگیری برای انیمیشن
}

export interface MultiProductInput {
  id: string;
  name: string;
  color: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  quantity: number;
  stackable: boolean;
  maxStack: number;
}

export interface ProductPlacement {
  productId: string;
  name: string;
  color: string;
  // ابعاد مؤثر در این چیدمان (cm)
  effLength: number;
  effWidth: number;
  effHeight: number;
  // تعداد در هر بعد
  layoutL: number;
  layoutW: number;
  layoutH: number;
  // تعداد واقعی که در کانتینر قرار می‌گیرد
  placed: number;
  // تعداد باقی‌مانده
  remaining: number;
  // تعداد کل که جا می‌شد (با حجم)
  maxFitVolume: number;
  // موقعیت اولین بلوک (cm)
  startX: number;
  startY: number;
  startZ: number;
  orientationLabel: string;
}

export interface PalletInstance {
  id: string;
  x: number; // cm
  y: number; // cm
  z: number; // cm (floor = 0)
  l: number; // cm
  w: number; // cm
  h: number; // cm
}

export interface StuffingResult {
  placements: ProductPlacement[];
  // جعبه‌های قرارگرفته برای رندر سه‌بعدی
  boxes: BoxInstance[];
  // آیا جعبه‌ها برای رندر کاهش یافته‌اند؟
  boxesSampled: boolean;
  boxesShown: number;
  // پالت‌های کف کانتینر
  pallets?: PalletInstance[];
  palletCount?: number;
  usePallets?: boolean;
  // تعداد کل کارتن‌های جاگرفته
  totalPlaced: number;
  // تعداد کل کارتن‌های واردشده
  totalInput: number;
  volumeUtilization: number;
  weightUtilization: number;
  totalWeight: number;
  totalVolume: number;
  emptyVolume: number;
  warnings: string[];
  allFit: boolean;
}

export function generateFloorPallets(
  cL: number,
  cW: number,
  palletType = "eur"
): PalletInstance[] {
  let pL = 120;
  let pW = 80;
  let pH = 14.4;

  if (palletType === "eur2") {
    pL = 120;
    pW = 100;
  } else if (palletType === "us") {
    pL = 121.9;
    pW = 101.6;
    pH = 14.0;
  } else if (palletType === "asia") {
    pL = 110;
    pW = 110;
    pH = 13.0;
  } else if (palletType === "asia2") {
    pL = 130;
    pW = 110;
    pH = 13.0;
  }

  const pallets: PalletInstance[] = [];
  const gap = 2; // cm فاصله ایمنی

  // چیدمان ردیفی اولیه بر اساس طول و عرض پالت
  const colsW = Math.max(1, Math.floor((cW + gap) / (pW + gap)));
  const rowsL = Math.max(1, Math.floor((cL + gap) / (pL + gap)));

  const usedW = colsW * pW + (colsW - 1) * gap;
  const startY = Math.max(0, (cW - usedW) / 2);

  let id = 1;
  for (let r = 0; r < rowsL; r++) {
    const x = r * (pL + gap);
    for (let c = 0; c < colsW; c++) {
      const y = startY + c * (pW + gap);
      if (x + pL <= cL + 0.1 && y + pW <= cW + 0.1) {
        pallets.push({
          id: `plt-${id++}`,
          x,
          y,
          z: 0,
          l: pL,
          w: pW,
          h: pH,
        });
      }
    }
  }

  // پر کردن فضای انتهای کانتینر با پالت چرخیده (در صورت امکان)
  const remainingL = cL - (rowsL * (pL + gap));
  if (remainingL >= pW) {
    const turnedCols = Math.max(1, Math.floor((cW + gap) / (pL + gap)));
    const turnedUsedW = turnedCols * pL + (turnedCols - 1) * gap;
    const turnedStartY = Math.max(0, (cW - turnedUsedW) / 2);
    const turnedRows = Math.max(1, Math.floor((remainingL + gap) / (pW + gap)));

    for (let tr = 0; tr < turnedRows; tr++) {
      const x = rowsL * (pL + gap) + tr * (pW + gap);
      for (let tc = 0; tc < turnedCols; tc++) {
        const y = turnedStartY + tc * (pL + gap);
        if (x + pW <= cL + 0.1 && y + pL <= cW + 0.1) {
          pallets.push({
            id: `plt-${id++}`,
            x,
            y,
            z: 0,
            l: pW,
            w: pL,
            h: pH,
          });
        }
      }
    }
  }

  return pallets;
}


/* ------------------------------ ۶ حالت چرخش ------------------------------ */

const orientations = [
  { l: 0, w: 1, h: 2, label: "طول × عرض × ارتفاع" },
  { l: 0, w: 2, h: 1, label: "طول × ارتفاع × عرض" },
  { l: 1, w: 0, h: 2, label: "عرض × طول × ارتفاع" },
  { l: 1, w: 2, h: 0, label: "عرض × ارتفاع × طول" },
  { l: 2, w: 0, h: 1, label: "ارتفاع × طول × عرض" },
  { l: 2, w: 1, h: 0, label: "ارتفاع × عرض × طول" },
];

/* ------------------------------ بلوک‌ها ------------------------------ */

interface Chunk {
  productId: string;
  color: string;
  // تعداد ستون در طول/عرض/لایه (بر حسب تعداد جعبه)
  cols: number;
  rows: number;
  layers: number;
  // ابعاد مؤثر جعبه در این بلوک
  effL: number;
  effW: number;
  effH: number;
  count: number; // تعداد جعبه در بلوک
}

interface PlacedChunk extends Chunk {
  x: number; // موقعیت گوشه (cm)
  y: number;
  z: number;
}

// تولید جعبه‌های محلی یک بلوک (لایه-محور: هر لایه از کف پر می‌شود)
function genChunkBoxes(ch: Chunk): { x: number; y: number; z: number }[] {
  const out: { x: number; y: number; z: number }[] = [];
  let remaining = ch.count;
  for (let layer = 0; layer < ch.layers && remaining > 0; layer++) {
    for (let col = 0; col < ch.cols && remaining > 0; col++) {
      for (let row = 0; row < ch.rows && remaining > 0; row++) {
        out.push({
          x: col * ch.effL,
          y: row * ch.effW,
          z: layer * ch.effH,
        });
        remaining--;
      }
    }
  }
  return out;
}

const EPS = 0.01;

// مساحت همپوشانی دو مستطیل در صفحه
function rectOverlap(
  ax: number, ay: number, al: number, aw: number,
  bx: number, by: number, bl: number, bw: number
): number {
  const ox = Math.min(ax + al, bx + bl) - Math.max(ax, bx);
  const oy = Math.min(ay + aw, by + bw) - Math.max(ay, by);
  return ox > EPS && oy > EPS ? ox * oy : 0;
}

/**
 * محاسبه چیدمان چند محصول مختلف در یک کانتینر (نسخه ۳)
 * - محصولات بر اساس چگالی (سنگین‌تر کف) مرتب می‌شوند
 * - برای هر محصول همه ۶ چرخش امتحان می‌شود و بهترین نتیجه انتخاب می‌گردد
 * - بلوک‌ها با نقاط اتصال و بررسی تکیه‌گاه (۸۵٪) بدون همپوشانی چیده می‌شوند
 * - موقعیت واقعی جعبه‌ها برای رندر سه‌بعدی خروجی داده می‌شود
 */
export function calculateMultiStuffing(
  products: MultiProductInput[],
  container: CS,
  options?: { usePallets?: boolean; palletType?: string }
): StuffingResult {
  const warnings: string[] = [];
  const placements: ProductPlacement[] = [];
  const allBoxes: BoxInstance[] = [];

  const usePallets = !!options?.usePallets;
  const palletType = options?.palletType || "eur";

  // ابعاد کانتینر در cm
  const cL = container.internalLength;
  const cW = container.internalWidth;
  const cH = container.internalHeight;
  const containerVolume = (cL * cW * cH) / 1_000_000; // مترمکعب
  const containerMaxWeight = container.maxPayload;

  // محاسبه پالت‌های کف کانتینر در صورت فعال بودن چیدمان پالت
  const floorPallets = usePallets ? generateFloorPallets(cL, cW, palletType) : [];
  const palletHeight = usePallets && floorPallets.length > 0 ? (floorPallets[0]?.h ?? 14.4) : 0;
  const palletTareWeight = usePallets ? floorPallets.length * 25 : 0; // وزن هر پالت حدود ۲۵ کیلوگرم

  // مرتبسازی: چگالی نزولی (سنگین کف) سپس حجم نزولی
  const sorted = [...products]
    .filter((p) => p.quantity > 0)
    .sort((a, b) => {
      const volA = (a.lengthMm * a.widthMm * a.heightMm) / 1e9; // m³
      const volB = (b.lengthMm * b.widthMm * b.heightMm) / 1e9;
      const densA = volA > 0 ? a.weightKg / volA : 0;
      const densB = volB > 0 ? b.weightKg / volB : 0;
      if (densB !== densA) return densB - densA;
      return volB - volA;
    });

  let remainingWeight = Math.max(0, containerMaxWeight - palletTareWeight);
  let totalWeight = palletTareWeight;
  let totalVolumeCm3 = usePallets ? floorPallets.reduce((acc, p) => acc + (p.l * p.w * p.h), 0) : 0;
  let totalPlaced = 0;
  let totalInput = 0;
  let seq = 0;

  // فضای اشغال‌شده جهانی بین همه محصولات (برای جلوگیری از همپوشانی)
  const globalPlaced: PlacedChunk[] = [];
  const baseZ = palletHeight;
  const globalAnchors: { x: number; y: number; z: number }[] = [
    { x: 0, y: 0, z: baseZ },
  ];
  const anchorKey = (a: { x: number; y: number; z: number }) =>
    `${Math.round(a.x * 10)}_${Math.round(a.y * 10)}_${Math.round(a.z * 10)}`;
  const globalAnchorKeys = new Set([anchorKey(globalAnchors[0])]);

  for (const product of sorted) {
    totalInput += product.quantity;
    const dims = [product.lengthMm / 10, product.widthMm / 10, product.heightMm / 10];

    // وزن قابل استفاده برای این محصول
    const byWeight =
      product.weightKg > 0
        ? Math.max(0, Math.floor(remainingWeight / product.weightKg))
        : product.quantity;

    let bestPlan: {
      placed: number;
      placedChunks: PlacedChunk[];
      newAnchors: { x: number; y: number; z: number }[];
      orientation: (typeof orientations)[number];
      layoutL: number;
      layoutW: number;
      layoutH: number;
      effL: number;
      effW: number;
      effH: number;
    } | null = null;

    // امتحان همه ۶ حالت چرخش
    for (const orient of orientations) {
      const effL = dims[orient.l];
      const effW = dims[orient.w];
      const effH = dims[orient.h];

      if (effL > cL + EPS || effW > cW + EPS || effH > cH + EPS) continue;

      const layoutL = Math.floor(cL / effL);
      const layoutW = Math.floor(cW / effW);
      let maxLayers = Math.floor(cH / effH);
      if (product.maxStack > 0) maxLayers = Math.min(maxLayers, product.maxStack);
      if (!product.stackable) maxLayers = Math.min(maxLayers, 1);
      if (layoutL < 1 || layoutW < 1 || maxLayers < 1) continue;

      const perLayer = layoutL * layoutW;
      const orientCapacity = perLayer * maxLayers;
      const want = Math.min(product.quantity, byWeight, orientCapacity);
      if (want <= 0) continue;

      // ساخت بلوک‌های اولیه
      const initChunks: Chunk[] = [];
      let remaining = Math.min(product.quantity, byWeight);
      while (remaining > 0) {
        const layers = Math.min(maxLayers, Math.ceil(remaining / perLayer));
        const count = Math.min(remaining, layers * perLayer);
        if (count <= 0) break;
        const fullLayers = Math.floor(count / perLayer);
        const last = count % perLayer;
        const cols = fullLayers > 0 ? layoutL : Math.ceil(count / layoutW);
        initChunks.push({
          productId: product.id,
          color: product.color,
          cols,
          rows: layoutW,
          layers: fullLayers > 0 ? fullLayers + (last > 0 ? 1 : 0) : 1,
          effL,
          effW,
          effH,
          count,
        });
        remaining -= count;
      }

      // چیدمان بلوک‌ها با شکستن بازگشتی
      // نقاط اتصال: کپی از حالت جهانی (تا تلاش‌های ناموفق آلوده نکنند)
      const placedChunks: PlacedChunk[] = [];
      const anchors = globalAnchors.map((a) => ({ ...a }));
      const newAnchors: { x: number; y: number; z: number }[] = [];
      let placedCount = 0;
      const queue = [...initChunks];
      let guard = 0;

      while (queue.length > 0 && guard < 500) {
        guard++;
        const chunk = queue.shift()!;
        // بررسی همپوشانی هم با بلوک‌های همین تلاش و هم با بلوک‌های جهانی محصولات قبلی
        const combined = placedChunks.length > 0 ? placedChunks.concat(globalPlaced) : globalPlaced;
        const anchor = findAnchor(chunk, anchors, combined, cL, cW, cH, product, baseZ);
        if (anchor) {
          const placed: PlacedChunk = { ...chunk, x: anchor.x, y: anchor.y, z: anchor.z };
          placedChunks.push(placed);
          placedCount += chunk.count;
          // نقاط اتصال جدید
          const na = [
            { x: anchor.x + chunk.cols * chunk.effL, y: anchor.y, z: anchor.z },
            { x: anchor.x, y: anchor.y + chunk.rows * chunk.effW, z: anchor.z },
            { x: anchor.x, y: anchor.y, z: anchor.z + chunk.layers * chunk.effH },
          ];
          for (const a of na) {
            anchors.push(a);
            newAnchors.push(a);
          }
        } else {
          // شکستن بلوک
          const pieces = splitChunk(chunk);
          if (pieces.length > 1) {
            queue.push(...pieces);
          }
          // اگر قابل شکستن نبود، این بلوک جا نمی‌شود - نادیده گرفته می‌شود
        }
      }

      const isBetter =
        !bestPlan ||
        placedCount > bestPlan.placed ||
        (placedCount === bestPlan.placed && placedChunks.length < bestPlan.placedChunks.length);

      if (isBetter) {
        bestPlan = {
          placed: placedCount,
          placedChunks,
          newAnchors,
          orientation: orient,
          layoutL,
          layoutW,
          layoutH: maxLayers,
          effL,
          effW,
          effH,
        };
      }

      // اگر همه جا گرفت، دیگر چرخش‌های بعدی لازم نیست
      if (placedCount >= Math.min(product.quantity, byWeight)) break;
    }

    // ثبت بلوک‌های بهترین طرح در فضای جهانی
    if (bestPlan && bestPlan.placed > 0) {
      globalPlaced.push(...bestPlan.placedChunks);
      for (const a of bestPlan.newAnchors) {
        const k = anchorKey(a);
        if (!globalAnchorKeys.has(k)) {
          globalAnchorKeys.add(k);
          globalAnchors.push(a);
        }
      }
    }

    // ثبت نتیجه محصول
    const quantity = product.quantity;
    const placed = bestPlan?.placed ?? 0;
    const firstChunk = bestPlan?.placedChunks[0];

    placements.push({
      productId: product.id,
      name: product.name,
      color: product.color,
      effLength: bestPlan?.effL ?? dims[0],
      effWidth: bestPlan?.effW ?? dims[1],
      effHeight: bestPlan?.effH ?? dims[2],
      layoutL: bestPlan?.layoutL ?? 0,
      layoutW: bestPlan?.layoutW ?? 0,
      layoutH: bestPlan?.layoutH ?? 0,
      placed,
      remaining: quantity - placed,
      maxFitVolume: bestPlan ? bestPlan.layoutL * bestPlan.layoutW * bestPlan.layoutH : 0,
      startX: firstChunk?.x ?? 0,
      startY: firstChunk?.y ?? 0,
      startZ: firstChunk?.z ?? 0,
      orientationLabel: bestPlan?.orientation.label ?? "—",
    });

    // ثبت جعبه‌ها با مختصات جهانی
    if (bestPlan) {
      for (const ch of bestPlan.placedChunks) {
        const local = genChunkBoxes(ch);
        for (const b of local) {
          allBoxes.push({
            x: ch.x + b.x,
            y: ch.y + b.y,
            z: ch.z + b.z,
            l: ch.effL,
            w: ch.effW,
            h: ch.effH,
            productId: product.id,
            color: product.color,
            seq: seq++,
          });
        }
      }
    }

    // به‌روزرسانی وزن و حجم
    if (placed > 0 && product.weightKg > 0) {
      remainingWeight -= placed * product.weightKg;
      totalWeight += placed * product.weightKg;
    } else if (placed > 0) {
      totalWeight += 0;
    }
    totalVolumeCm3 += placed * (dims[0] * dims[1] * dims[2]);
    totalPlaced += placed;
  }

  // کاهش تعداد جعبه‌ها برای رندر روان (حداکثر ۲۰۰۰)
  const MAX_RENDER = 2000;
  let boxes = allBoxes;
  let boxesSampled = false;
  if (allBoxes.length > MAX_RENDER) {
    const step = allBoxes.length / MAX_RENDER;
    boxes = [];
    for (let i = 0; i < allBoxes.length && boxes.length < MAX_RENDER; i += step) {
      boxes.push(allBoxes[Math.floor(i)]);
    }
    boxesSampled = true;
  }

  const totalVolumeM3 = totalVolumeCm3 / 1_000_000;
  const volumeUtilization = (totalVolumeM3 / containerVolume) * 100;
  const weightUtilization = (totalWeight / containerMaxWeight) * 100;
  const emptyVolume = containerVolume - totalVolumeM3;
  const allFit = totalPlaced === totalInput;

  if (totalPlaced === 0 && totalInput > 0) {
    warnings.push(
      "هیچ محصولی در کانتینر نمی‌گنجد. ابعاد محصولات را بررسی کنید."
    );
  }
  if (weightUtilization > 95) {
    warnings.push(
      "وزن بار به حد مجاز کانتینر نزدیک است؛ از بارگیری بیش از حد خودداری کنید."
    );
  }
  if (volumeUtilization < 60 && totalPlaced > 0) {
    warnings.push(
      "میزان استفاده از حجم پایین است. می‌توانید با تغییر اندازه یا ترکیب محصولات، بهینه‌تر چیدمان کنید."
    );
  }
  if (!allFit && totalPlaced > 0) {
    warnings.push(
      `از ${totalInput} کارتن واردشده، فقط ${totalPlaced} کارتن در کانتینر جا گرفت. ${totalInput - totalPlaced} کارتن باقی می‌ماند.`
    );
  }

  return {
    placements,
    boxes,
    boxesSampled,
    boxesShown: boxes.length,
    pallets: floorPallets,
    palletCount: floorPallets.length,
    usePallets,
    totalPlaced,
    totalInput,
    volumeUtilization,
    weightUtilization,
    totalWeight,
    totalVolume: totalVolumeM3,
    emptyVolume,
    warnings,
    allFit,
  };
}

/** پیدا کردن بهترین نقطه اتصال برای یک بلوک (کف‌محور: z، سپس x، سپس y) */
function findAnchor(
  chunk: Chunk,
  anchors: { x: number; y: number; z: number }[],
  placed: PlacedChunk[],
  cL: number,
  cW: number,
  cH: number,
  product: MultiProductInput,
  baseZ = 0
): { x: number; y: number; z: number } | null {
  const dl = chunk.cols * chunk.effL;
  const dw = chunk.rows * chunk.effW;
  const dh = chunk.layers * chunk.effH;

  const sorted = [...anchors].sort((a, b) => {
    if (Math.abs(a.z - b.z) > EPS) return a.z - b.z;
    if (Math.abs(a.x - b.x) > EPS) return a.x - b.x;
    return a.y - b.y;
  });

  for (const a of sorted) {
    // محدوده کانتینر
    if (a.x + dl > cL + EPS || a.y + dw > cW + EPS || a.z + dh > cH + EPS) continue;

    // محصولات غیرقابل چیدن فقط روی کف/سطح پالت
    if (!product.stackable && a.z > baseZ + EPS) continue;

    // بررسی همپوشانی با بلوک‌های قرارگرفته
    let overlaps = false;
    for (const p of placed) {
      if (
        a.x < p.x + p.cols * p.effL - EPS &&
        a.x + dl > p.x + EPS &&
        a.y < p.y + p.rows * p.effW - EPS &&
        a.y + dw > p.y + EPS &&
        a.z < p.z + p.layers * p.effH - EPS &&
        a.z + dh > p.z + EPS
      ) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    // بررسی تکیه‌گاه: برای z > baseZ باید ۸۵٪ کف بلوک تکیه‌گاه داشته باشد
    if (a.z > baseZ + EPS) {
      const footprint = dl * dw;
      let support = 0;
      for (const p of placed) {
        const pTop = p.z + p.layers * p.effH;
        if (Math.abs(pTop - a.z) < EPS) {
          support += rectOverlap(
            a.x, a.y, dl, dw,
            p.x, p.y, p.cols * p.effL, p.rows * p.effW
          );
        }
      }
      if (support < footprint * 0.85) continue;

      // محدودیت حداکثر لایه انبارش (روی همان محصول)
      if (product.maxStack > 0) {
        const sameBelow = placed.filter(
          (p) =>
            Math.abs(p.z + p.layers * p.effH - a.z) < EPS &&
            p.productId === chunk.productId &&
            rectOverlap(a.x, a.y, dl, dw, p.x, p.y, p.cols * p.effL, p.rows * p.effW) > 0
        );
        if (sameBelow.length > 0) {
          const layersBelow = Math.round(a.z / chunk.effH);
          if (layersBelow + chunk.layers > product.maxStack) continue;
        }
      }
    }

    return a;
  }
  return null;
}

/** شکستن یک بلوک به دو نیمه (اول لایه، بعد طول، بعد عرض) */
function splitChunk(chunk: Chunk): Chunk[] {
  const boxes = genChunkBoxes(chunk);

  const makePieces = (
    axis: "layers" | "cols" | "rows",
    halfA: number
  ): Chunk[] | null => {
    if (halfA <= 0 || halfA >= (axis === "layers" ? chunk.layers : axis === "cols" ? chunk.cols : chunk.rows)) {
      return null;
    }
    const inA: { x: number; y: number; z: number }[] = [];
    const inB: { x: number; y: number; z: number }[] = [];
    for (const b of boxes) {
      const v = axis === "layers" ? b.z : axis === "cols" ? b.x : b.y;
      const unit = axis === "layers" ? chunk.effH : axis === "cols" ? chunk.effL : chunk.effW;
      if (v < halfA * unit - EPS) inA.push(b);
      else inB.push({ ...b, [axis === "layers" ? "z" : axis === "cols" ? "x" : "y"]: v - halfA * unit });
    }
    if (inA.length === 0 || inB.length === 0) return null;
    const mk = (list: { x: number; y: number; z: number }[], cols: number, rows: number, layers: number): Chunk => {
      // محاسبه ابعاد واقعی از جعبه‌ها
      const maxX = Math.max(...list.map((b) => b.x));
      const maxY = Math.max(...list.map((b) => b.y));
      const maxZ = Math.max(...list.map((b) => b.z));
      return {
        productId: chunk.productId,
        color: chunk.color,
        cols: Math.round(maxX / chunk.effL) + 1,
        rows: Math.round(maxY / chunk.effW) + 1,
        layers: Math.round(maxZ / chunk.effH) + 1,
        effL: chunk.effL,
        effW: chunk.effW,
        effH: chunk.effH,
        count: list.length,
      };
    };
    const colsA = axis === "cols" ? halfA : chunk.cols;
    const rowsA = axis === "rows" ? halfA : chunk.rows;
    const layersA = axis === "layers" ? halfA : chunk.layers;
    const colsB = axis === "cols" ? chunk.cols - halfA : chunk.cols;
    const rowsB = axis === "rows" ? chunk.rows - halfA : chunk.rows;
    const layersB = axis === "layers" ? chunk.layers - halfA : chunk.layers;
    // برای قطعه B ابعاد را از جعبه‌هایش محاسبه می‌کنیم (بعد از شیفت)
    return [mk(inA, colsA, rowsA, layersA), mk(inB, colsB, rowsB, layersB)];
  };

  if (chunk.layers > 1) {
    const r = makePieces("layers", Math.floor(chunk.layers / 2));
    if (r) return r;
  }
  if (chunk.cols > 1) {
    const r = makePieces("cols", Math.floor(chunk.cols / 2));
    if (r) return r;
  }
  if (chunk.rows > 1) {
    const r = makePieces("rows", Math.floor(chunk.rows / 2));
    if (r) return r;
  }
  return [chunk];
}

/* ---------------------- محاسبه تک‌محصولی (ساده) ---------------------- */

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

  for (const orient of orientations) {
    const l = dims[orient.l];
    const w = dims[orient.w];
    const h = dims[orient.h];

    if (l > container.internalLength || w > container.internalWidth || h > container.internalHeight) {
      continue;
    }

    const numL = Math.floor(container.internalLength / l);
    const numW = Math.floor(container.internalWidth / w);
    let numH = Math.floor(container.internalHeight / h);

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

  const cartonsByWeight = Math.floor(container.maxPayload / carton.weight);
  const fittingByVolume = bestFit.count;
  const fittingByWeight = cartonsByWeight;

  const fittingCount = Math.min(fittingByVolume, fittingByWeight, carton.quantity);

  const cartonVolumeCm3 = carton.length * carton.width * carton.height;
  const containerVolumeCm3 =
    container.internalLength * container.internalWidth * container.internalHeight;
  const containerVolumeM3 = containerVolumeCm3 / 1_000_000;
  const totalVolumeM3 = (cartonVolumeCm3 * fittingCount) / 1_000_000;
  const totalWeight = carton.weight * fittingCount;

  const volumeUtilization = (totalVolumeM3 / containerVolumeM3) * 100;
  const weightUtilization = (totalWeight / container.maxPayload) * 100;
  const overallUtilization = Math.min(volumeUtilization, weightUtilization);

  const usedLength = bestFit.effL * bestFit.layoutL;
  const usedWidth = bestFit.effW * bestFit.layoutW;
  const usedHeight = bestFit.effH * bestFit.layoutH;
  const usedVolumeM3 = (usedLength * usedWidth * usedHeight) / 1_000_000;
  const emptyVolume = containerVolumeM3 - usedVolumeM3;

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

/* ---------------------- محاسبه چندباری ساده ---------------------- */

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
  const totalVolume = items.reduce(
    (sum, it) => sum + (it.length * it.width * it.height * it.quantity) / 1_000_000,
    0
  );
  const totalWeight = items.reduce((sum, it) => sum + it.weight * it.quantity, 0);
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


