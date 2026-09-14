// تست الگوریتم چیدمان
import { calculateMultiStuffing } from "../src/lib/load-calculation";
import { CONTAINERS } from "../src/lib/containers";

const products = [
  { id: "p1", name: "کارتن ۱", color: "#0088ff", lengthMm: 500, widthMm: 400, heightMm: 300, weightKg: 10, quantity: 80, stackable: true, maxStack: 0 },
  { id: "p2", name: "کیسه", color: "#52c41a", lengthMm: 1000, widthMm: 450, heightMm: 300, weightKg: 45, quantity: 100, stackable: true, maxStack: 0 },
  { id: "p3", name: "کیسه بزرگ", color: "#faad14", lengthMm: 1000, widthMm: 1000, heightMm: 1000, weightKg: 900, quantity: 10, stackable: true, maxStack: 0 },
];

const container = CONTAINERS.find((c) => c.id === "40ft-std")!;
const result = calculateMultiStuffing(products, container);

console.log("totalPlaced:", result.totalPlaced, "/", result.totalInput);
console.log("volumeUtil:", result.volumeUtilization.toFixed(1), "%");
for (const p of result.placements) {
  console.log(`  ${p.name}: placed=${p.placed} remaining=${p.remaining} orient=${p.orientationLabel}`);
}

// بررسی همپوشانی جعبه‌ها
const boxes = result.boxes;
console.log("boxes:", boxes.length);
let overlaps = 0;
const EPS = 0.02;
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const ox = Math.min(a.x + a.l, b.x + b.l) - Math.max(a.x, b.x);
    const oy = Math.min(a.y + a.w, b.y + b.w) - Math.max(a.y, b.y);
    const oz = Math.min(a.z + a.h, b.z + b.h) - Math.max(a.z, b.z);
    if (ox > EPS && oy > EPS && oz > EPS) {
      overlaps++;
      if (overlaps <= 5) {
        console.log("  OVERLAP:", a.productId, `(${a.x},${a.y},${a.z} ${a.l}x${a.w}x${a.h})`, "vs", b.productId, `(${b.x},${b.y},${b.z} ${b.l}x${b.w}x${b.h})`);
      }
    }
  }
}
console.log("total overlaps:", overlaps);

// مرزهای کانتینر
let out = 0;
const cL = container.internalLength, cW = container.internalWidth, cH = container.internalHeight;
for (const b of boxes) {
  if (b.x < -EPS || b.y < -EPS || b.z < -EPS || b.x + b.l > cL + EPS || b.y + b.w > cW + EPS || b.z + b.h > cH + EPS) {
    out++;
    if (out <= 5) console.log("  OUT:", b.productId, `(${b.x},${b.y},${b.z} ${b.l}x${b.w}x${b.h})`);
  }
}
console.log("out of container:", out);
