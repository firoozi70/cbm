// تست حالت‌های مرزی الگوریتم چیدمان
import { calculateMultiStuffing } from "../src/lib/load-calculation";
import { CONTAINERS } from "../src/lib/containers";

const c40 = CONTAINERS.find((c) => c.id === "40ft-std")!;
const c20 = CONTAINERS.find((c) => c.id === "20ft-std")!;

function check(name: string, products: any[], container: any) {
  const r = calculateMultiStuffing(products, container);
  const boxes = r.boxes;
  let overlaps = 0;
  const EPS = 0.02;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const ox = Math.min(a.x + a.l, b.x + b.l) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.w, b.y + b.w) - Math.max(a.y, b.y);
      const oz = Math.min(a.z + a.h, b.z + b.h) - Math.max(a.z, b.z);
      if (ox > EPS && oy > EPS && oz > EPS) overlaps++;
    }
  }
  let out = 0;
  for (const b of boxes) {
    if (b.x < -EPS || b.y < -EPS || b.z < -EPS || b.x + b.l > container.internalLength + EPS || b.y + b.w > container.internalWidth + EPS || b.z + b.h > container.internalHeight + EPS) out++;
  }
  console.log(
    `${name}: placed=${r.totalPlaced}/${r.totalInput} boxes=${boxes.length} overlaps=${overlaps} out=${out} vol=${r.volumeUtilization.toFixed(1)}%`
  );
  return r;
}

// ۱: یک محصول ساده
check("single-product", [
  { id: "a", name: "کارتن", color: "#0088ff", lengthMm: 500, widthMm: 400, heightMm: 300, weightKg: 10, quantity: 100, stackable: true, maxStack: 0 },
], c40);

// ۲: غیرقابل چیدن (stackable=false)
check("no-stack", [
  { id: "a", name: "ماشین", color: "#ff4d4f", lengthMm: 1800, widthMm: 1200, heightMm: 1500, weightKg: 800, quantity: 6, stackable: false, maxStack: 0 },
], c40);

// ۳: maxStack=2
check("max-stack-2", [
  { id: "a", name: "جعبه", color: "#52c41a", lengthMm: 600, widthMm: 500, heightMm: 400, weightKg: 20, quantity: 200, stackable: true, maxStack: 2 },
], c40);

// ۴: محصولی که اصلاً جا نمی‌شود
check("too-big", [
  { id: "a", name: "موتور", color: "#faad14", lengthMm: 2500, widthMm: 1500, heightMm: 2000, weightKg: 2000, quantity: 2, stackable: true, maxStack: 0 },
], c20);

// ۵: محدودیت وزن
check("weight-limit", [
  { id: "a", name: "سنگین", color: "#722ed1", lengthMm: 1000, widthMm: 1000, heightMm: 500, weightKg: 3000, quantity: 20, stackable: true, maxStack: 0 },
], c20);

// ۶: چند محصول با ترکیب سخت + پالت‌مانند
check("mixed-hard", [
  { id: "a", name: "پالت آجر", color: "#ff4d4f", lengthMm: 1200, widthMm: 1000, heightMm: 1400, weightKg: 1200, quantity: 6, stackable: false, maxStack: 0 },
  { id: "b", name: "کارتن کوچک", color: "#0088ff", lengthMm: 400, widthMm: 300, heightMm: 250, weightKg: 8, quantity: 300, stackable: true, maxStack: 0 },
  { id: "c", name: "بشکه", color: "#13c2c2", lengthMm: 600, widthMm: 600, heightMm: 900, weightKg: 120, quantity: 15, stackable: true, maxStack: 0 },
], c40);

// ۷: تعداد صفر
check("zero-qty", [
  { id: "a", name: "خالی", color: "#0088ff", lengthMm: 500, widthMm: 400, heightMm: 300, weightKg: 10, quantity: 0, stackable: true, maxStack: 0 },
], c40);

// ۸: تعداد زیاد (نمونه‌برداری برای رندر)
check("huge-qty", [
  { id: "a", name: "ریز", color: "#0088ff", lengthMm: 200, widthMm: 150, heightMm: 100, weightKg: 2, quantity: 5000, stackable: true, maxStack: 0 },
], c40);
