/**
 * تولید آیکون‌های PNG از SVG برای انتشار (مایکت / PWA / WebView)
 * خروجی: icon-192.png, icon-512.png, apple-touch-icon.png, favicon-32.png, maskable-512.png
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const PUB = "/home/z/my-project/public";
const svg = readFileSync(resolve(PUB, "icon.svg"), "utf-8");

const CONTENT = `
  <!-- کانتینر -->
  <g fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <rect x="30" y="56" width="132" height="84" rx="5"/>
  </g>
  <rect x="38" y="102" width="26" height="30" rx="2" fill="#ffffff" opacity="0.95"/>
  <rect x="70" y="102" width="26" height="30" rx="2" fill="#ffffff" opacity="0.75"/>
  <rect x="102" y="102" width="26" height="30" rx="2" fill="#ffffff" opacity="0.55"/>
  <rect x="134" y="102" width="20" height="30" rx="2" fill="#ffffff" opacity="0.35"/>
  <rect x="38" y="64" width="26" height="32" rx="2" fill="#ffffff" opacity="0.85"/>
  <rect x="70" y="64" width="26" height="32" rx="2" fill="#ffffff" opacity="0.65"/>
  <rect x="102" y="64" width="26" height="32" rx="2" fill="#ffffff" opacity="0.45"/>
  <rect x="134" y="64" width="20" height="32" rx="2" fill="#ffffff" opacity="0.28"/>
  <line x1="96" y1="147" x2="96" y2="156" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>`;

// نسخه maskable: بک‌گراند کامل (بدون گوشه گرد) + محتوا در ناحیه امن ۷۸٪
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0091ff"/>
      <stop offset="1" stop-color="#006fe0"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="url(#bg)"/>
  <g transform="translate(96 96) scale(0.78) translate(-96 -96)">${CONTENT}</g>
</svg>`;

async function main() {
  const jobs = [
    { svg, size: 192, out: "icon-192.png" },
    { svg, size: 512, out: "icon-512.png" },
    { svg, size: 180, out: "apple-touch-icon.png" },
    { svg, size: 32, out: "favicon-32.png" },
    { svg: maskableSvg, size: 512, out: "maskable-512.png" },
  ];
  for (const j of jobs) {
    await sharp(Buffer.from(j.svg))
      .resize(j.size, j.size)
      .png({ compressionLevel: 9 })
      .toFile(resolve(PUB, j.out));
    console.log("OK", j.out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
