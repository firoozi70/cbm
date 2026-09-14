"use client";

import { ContainerSpec, faNumber } from "@/lib/containers";
import { StuffingResult, ProductPlacement } from "@/lib/load-calculation";
import { faNumber as faN } from "@/lib/containers";
import { AlertTriangle, CheckCircle2, Download, Box, Layers3, Weight, TrendingUp } from "lucide-react";

interface Props {
  result: StuffingResult;
  container: ContainerSpec;
  onBack: () => void;
  onRestart: () => void;
}

// بصری‌سازی ایزومتریک 3D از کانتینر با کارتن‌های چیده‌شده
function StuffingVisualization({ result, container }: { result: StuffingResult; container: ContainerSpec }) {
  // ابعاد کانتینر به پیکسل
  // طول کانتینر بزرگتر است، بنابراین آن را به ۴۵۰ پیکسل مقیاس می‌کنیم
  const SCALE = 460 / Math.max(container.internalLength, 1);
  const cl = container.internalLength * SCALE;
  const cw = container.internalWidth * SCALE;
  const ch = container.internalHeight * SCALE;

  // تنظیمات ایزومتریک
  const angle = Math.PI / 6;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // ابعاد نهایی SVG
  const W = cl * cos + cw * cos + 80;
  const H = ch + Math.max(cl, cw) * sin + 60;

  // مبدأ (گوشه پایین-جلو)
  const originX = 40 + cw * cos;
  const originY = H - ch - 30;

  // تبدیل 3D → 2D ایزومتریک
  // x = طول کانتینر، y = عرض، z = ارتفاع
  const project = (x: number, y: number, z: number) => {
    const px = originX + x * cos - y * cos;
    const py = originY - z + x * sin + y * sin;
    return { px, py };
  };

  // رسم یک جعبه 3D با ۵ رویه
  const drawBox = (
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number,
    fill: string,
    strokeColor = "#15354e",
    opacity = 1
  ) => {
    const corners = [
      project(x, y, z),
      project(x + w, y, z),
      project(x + w, y + d, z),
      project(x, y + d, z),
      project(x, y, z + h),
      project(x + w, y, z + h),
      project(x + w, y + d, z + h),
      project(x, y + d, z + h),
    ];

    const faces = [
      { pts: [0, 1, 5, 4], op: opacity * 1.0 }, // front
      { pts: [1, 2, 6, 5], op: opacity * 0.78 }, // right
      { pts: [3, 2, 6, 7], op: opacity * 0.6 }, // back
      { pts: [0, 3, 7, 4], op: opacity * 0.85 }, // left
      { pts: [4, 5, 6, 7], op: opacity * 1.15 }, // top
    ];

    return faces.map((f) => ({
      d: `M ${corners[f.pts[0]].px},${corners[f.pts[0]].py} ` +
        f.pts.slice(1).map((i) => `L ${corners[i].px},${corners[i].py}`).join(" ") +
        " Z",
      fill,
      op: f.op,
    }));
  };

  // قاب کانتینر
  const containerFaces = drawBox(0, 0, 0, cl, cw, ch, "transparent", "#d9d9d9", 1);

  // رسم کارتن‌های هر محصول - فقط تعداد محدود برای جلوگیری از کندی
  const cartonElements: React.ReactNode[] = [];
  const MAX_PER_PRODUCT = 60; // حداکثر ۶۰ جعبه برای هر محصول برای رسم
  let cartonIndex = 0;

  for (const placement of result.placements) {
    if (placement.placed === 0) continue;

    // ابعاد هر جعبه در پیکسل
    const bw = placement.effLength * SCALE;
    const bd = placement.effWidth * SCALE;
    const bh = placement.effHeight * SCALE;

    // تعداد واقعی برای رسم (محدودشده)
    const drawCount = Math.min(placement.placed, MAX_PER_PRODUCT);
    const perRow = placement.layoutL;
    const rowsPerLayer = placement.layoutW;

    for (let i = 0; i < drawCount; i++) {
      const layer = Math.floor(i / (perRow * rowsPerLayer));
      const inLayer = i % (perRow * rowsPerLayer);
      const row = Math.floor(inLayer / perRow);
      const col = inLayer % perRow;

      const x = placement.startX * SCALE + col * bw;
      const y = row * bd;
      const z = layer * bh;

      // اگر جعله بیرون از کانتینر بود، نکش
      if (x + bw > cl + 1 || y + bd > cw + 1 || z + bh > ch + 1) continue;

      const faces = drawBox(
        x,
        y,
        z,
        bw,
        bd,
        bh,
        placement.color,
        "rgba(21, 53, 78, 0.4)",
        0.92
      );

      faces.forEach((f, fi) => {
        cartonElements.push(
          <path
            key={`p-${placement.productId}-${i}-${fi}`}
            d={f.d}
            fill={f.fill}
            stroke="rgba(21, 53, 78, 0.5)"
            strokeWidth={0.4}
            opacity={f.op}
          />
        );
      });
      cartonIndex++;
    }
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-fa rounded-md bg-gradient-to-br from-[#e6f7ff] to-[#fafafa] p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto max-h-[460px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* سایه زیر */}
        <ellipse
          cx={W / 2}
          cy={H - 8}
          rx={W / 2.5}
          ry={5}
          fill="rgba(0, 0, 0, 0.08)"
        />

        {/* کانتینر - قاب نقطه‌چین */}
        {containerFaces.map((f, i) => (
          <path
            key={`cont-${i}`}
            d={f.d}
            fill="rgba(255, 255, 255, 0.05)"
            stroke="#d9d9d9"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
        ))}

        {/* کارتن‌ها */}
        {cartonElements}

        {/* برچسب ابعاد کانتینر */}
        <text
          x={W / 2}
          y={H - 1}
          textAnchor="middle"
          fontSize="10"
          fill="rgba(0, 0, 0, 0.45)"
          fontFamily="inherit"
        >
          {faNumber(container.internalLength, 0)} × {faNumber(container.internalWidth, 0)} × {faNumber(container.internalHeight, 0)} سانتی‌متر
        </text>
      </svg>
    </div>
  );
}

export function ResultStep({ result, container, onBack, onRestart }: Props) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-sm">
      {/* تولبار بالایی */}
      <div className="flex items-center justify-between p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#15354e]">
            نتیجه چیدمان
          </span>
          <span className="text-xs text-[rgba(0,0,0,0.45)]">— {container.nameFa}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2 py-1 rounded transition-colors"
        >
          <Download className="size-3.5" />
          خروجی PDF
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* شاخص‌ها */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Box className="size-3.5" />
              تعداد کل جاگرفته
            </div>
            <div className="text-2xl font-bold text-[#0088ff] tabular-nums">
              {faN(result.totalPlaced)}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              از {faN(result.totalInput)} محصول
            </div>
          </div>
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Layers3 className="size-3.5" />
              اشغال حجم
            </div>
            <div className={`text-2xl font-bold tabular-nums ${result.volumeUtilization >= 70 ? "text-[#52c41a]" : result.volumeUtilization >= 50 ? "text-[#faad14]" : "text-[#ff4d4f]"}`}>
              {faN(result.volumeUtilization, 1)}٪
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              {faN(result.totalVolume, 2)} / {faN(container.capacity, 1)} مترمکعب
            </div>
          </div>
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Weight className="size-3.5" />
              اشغال وزن
            </div>
            <div className={`text-2xl font-bold tabular-nums ${result.weightUtilization <= 90 ? "text-[#52c41a]" : "text-[#ff4d4f]"}`}>
              {faN(result.weightUtilization, 1)}٪
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              {faN(result.totalWeight)} / {faN(container.maxPayload)} کیلوگرم
            </div>
          </div>
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <TrendingUp className="size-3.5" />
              فضای خالی
            </div>
            <div className="text-2xl font-bold text-[#15354e] tabular-nums">
              {faN(result.emptyVolume, 1)} م³
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              فضای استفاده‌نشده
            </div>
          </div>
        </div>

        {/* وضعیت کلی */}
        {result.allFit ? (
          <div className="flex items-center gap-2 p-3 rounded-md bg-[#f6ffed] border border-[#b7eb8f] text-sm">
            <CheckCircle2 className="size-5 text-[#52c41a]" />
            <span className="text-[#389e0d]">
              همه محصولات با موفقیت در کانتینر جا گرفتند. چیدمان بهینه است.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-md bg-[#fffbe6] border border-[#ffe58f] text-sm">
            <AlertTriangle className="size-5 text-[#faad14]" />
            <span className="text-[#d48806]">
              همه محصولات در یک کانتینر جا نمی‌گیرند. برای باقی‌مانده، کانتینر دیگری نیاز دارید.
            </span>
          </div>
        )}

        {/* بصری‌سازی */}
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-[#fafafa] border-b border-[#e8e8e8]">
            <h4 className="text-xs font-semibold text-[#15354e]">
              نمای ایزومتریک چیدمان در کانتینر
            </h4>
          </div>
          {result.totalPlaced > 0 ? (
            <StuffingVisualization result={result} container={container} />
          ) : (
            <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">
              <AlertTriangle className="size-10 mx-auto mb-2" />
              هیچ محصولی در کانتینر نمی‌گنجد. ابعاد را بررسی کنید.
            </div>
          )}
          <p className="text-[10px] text-[rgba(0,0,0,0.45)] text-center py-2 border-t border-[#f0f0f0]">
            * این نمایش نمایی است و برای جلوگیری از کندی، حداکثر ۶۰ جعبه برای هر محصول رسم می‌شود.
          </p>
        </div>

        {/* جزئیات هر محصول */}
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-[#fafafa] border-b border-[#e8e8e8]">
            <h4 className="text-xs font-semibold text-[#15354e]">
              جزئیات چیدمان هر محصول
            </h4>
          </div>
          <div className="overflow-x-auto scrollbar-fa">
            <table className="w-full text-xs">
              <thead className="bg-[#fafafa] border-b border-[#e8e8e8]">
                <tr>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">رنگ</th>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">نام محصول</th>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">ابعاد مؤثر (cm)</th>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">چیدمان L×W×H</th>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">جاگرفته</th>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">باقی‌مانده</th>
                  <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">جهت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {result.placements.map((p) => (
                  <tr key={p.productId} className="hover:bg-[#fafafa]">
                    <td className="p-2">
                      <div
                        className="size-4 rounded-sm border border-[#d9d9d9]"
                        style={{ backgroundColor: p.color }}
                      />
                    </td>
                    <td className="p-2 text-[#15354e] font-medium">{p.name}</td>
                    <td className="p-2 tabular-nums">
                      {faN(p.effLength, 1)} × {faN(p.effWidth, 1)} × {faN(p.effHeight, 1)}
                    </td>
                    <td className="p-2 tabular-nums">
                      {faN(p.layoutL)} × {faN(p.layoutW)} × {faN(p.layoutH)}
                    </td>
                    <td className="p-2 tabular-nums text-[#52c41a] font-medium">
                      {faN(p.placed)}
                    </td>
                    <td className="p-2 tabular-nums text-[#ff4d4f]">
                      {faN(p.remaining)}
                    </td>
                    <td className="p-2 text-[rgba(0,0,0,0.65)] text-[10px]">
                      {p.orientationLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* هشدارها */}
        {result.warnings.length > 0 && (
          <div className="border border-[#ffe58f] bg-[#fffbe6] rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-[#faad14]" />
              <h4 className="text-xs font-semibold text-[#d48806]">هشدارها و یادآوری‌ها</h4>
            </div>
            <ul className="space-y-1.5">
              {result.warnings.map((w, i) => (
                <li key={i} className="text-xs text-[#ad6800] flex items-start gap-1.5">
                  <span className="text-[#faad14] mt-0.5">•</span>
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* نوار پایین */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-[#e8e8e8] bg-[#fafafa]">
        <button
          type="button"
          onClick={onBack}
          className="sr-btn-default text-sm"
        >
          قبلی
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="sr-btn-default text-sm"
          >
            شروع مجدد
          </button>
        </div>
      </div>
    </div>
  );
}
