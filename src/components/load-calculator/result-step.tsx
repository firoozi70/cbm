"use client";

import dynamic from "next/dynamic";
import { ContainerSpec, faNumber } from "@/lib/containers";
import { faNumber as faN } from "@/lib/containers";
import { StuffingResult } from "@/lib/load-calculation";
import { AlertTriangle, CheckCircle2, Download, Box, Layers3, Weight, TrendingUp } from "lucide-react";

interface Props {
  result: StuffingResult;
  container: ContainerSpec;
  onBack: () => void;
  onRestart: () => void;
}

// صحنه سه‌بعدی تعاملی - فقط سمت کلاینت رندر می‌شود
const Scene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center bg-[#f4faff] sm:h-[430px]">
      <div className="flex flex-col items-center gap-2 text-[rgba(0,0,0,0.45)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#0088ff] border-t-transparent" />
        <span className="text-xs">در حال آماده‌سازی نمای سه‌بعدی…</span>
      </div>
    </div>
  ),
});

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
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2 py-2 rounded transition-colors min-h-[44px] sm:min-h-0"
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
            <CheckCircle2 className="size-5 text-[#52c41a] shrink-0" />
            <span className="text-[#389e0d]">
              همه محصولات با موفقیت در کانتینر جا گرفتند. چیدمان بهینه است.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-md bg-[#fffbe6] border border-[#ffe58f] text-sm">
            <AlertTriangle className="size-5 text-[#faad14] shrink-0" />
            <span className="text-[#d48806]">
              همه محصولات در یک کانتینر جا نمی‌گیرند. برای باقی‌مانده، کانتینر دیگری نیاز دارید.
            </span>
          </div>
        )}

        {/* بصری‌سازی سه‌بعدی تعاملی */}
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-[#fafafa] border-b border-[#e8e8e8]">
            <h4 className="text-xs font-semibold text-[#15354e]">
              نمای سه‌بعدی تعاملی چیدمان در کانتینر
            </h4>
          </div>
          {result.totalPlaced > 0 ? (
            <Scene3D boxes={result.boxes} container={container} />
          ) : (
            <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">
              <AlertTriangle className="size-10 mx-auto mb-2" />
              هیچ محصولی در کانتینر نمی‌گنجد. ابعاد را بررسی کنید.
            </div>
          )}
          {result.boxesSampled && (
            <p className="text-[10px] text-[rgba(0,0,0,0.45)] text-center py-2 border-t border-[#f0f0f0]">
              * به دلیل تعداد بالای جعبه‌ها، {faNumber(result.boxesShown)} جعبه از {faNumber(result.totalPlaced)} جعبه نمایش داده می‌شود.
            </p>
          )}
        </div>

        {/* جزئیات هر محصول */}
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-[#fafafa] border-b border-[#e8e8e8]">
            <h4 className="text-xs font-semibold text-[#15354e]">
              جزئیات چیدمان هر محصول
            </h4>
          </div>
          <div className="overflow-x-auto scrollbar-fa">
            <table className="w-full text-xs min-w-[560px]">
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
