"use client";

import dynamic from "next/dynamic";
import { ContainerSpec } from "@/lib/containers";
import { StuffingResult } from "@/lib/load-calculation";
import { useTranslation } from "@/i18n/context";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Box,
  Layers3,
  Weight,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  result: StuffingResult;
  container: ContainerSpec;
  onBack: () => void;
  onRestart: () => void;
}

// 3D scene loaded dynamically client-side only
const Scene3D = dynamic(() => import("./scene-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center bg-[#f4faff] sm:h-[430px]">
      <div className="flex flex-col items-center gap-2 text-[rgba(0,0,0,0.45)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#0088ff] border-t-transparent" />
        <span className="text-xs">Initializing 3D Canvas…</span>
      </div>
    </div>
  ),
});

export function ResultStep({ result, container, onBack, onRestart }: Props) {
  const { t, formatNumber, isRtl } = useTranslation();
  const containerName = t.containers.items[container.id]?.name || container.nameEn;

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-sm shadow-xs">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#15354e]">{t.result.title}</span>
          <span className="text-xs text-[rgba(0,0,0,0.45)]">— {containerName}</span>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2.5 py-1.5 rounded-md border border-[#d9d9d9] bg-white hover:bg-[#fafafa] transition-colors"
        >
          <Download className="size-3.5" />
          {t.result.exportPdf}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Box className="size-3.5" />
              {t.result.totalPlaced}
            </div>
            <div className="text-2xl font-bold text-[#0088ff] tabular-nums">
              {formatNumber(result.totalPlaced)}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              / {formatNumber(result.totalInput)}
            </div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Layers3 className="size-3.5" />
              {t.result.volumeUtil}
            </div>
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                result.volumeUtilization >= 70
                  ? "text-[#52c41a]"
                  : result.volumeUtilization >= 50
                  ? "text-[#faad14]"
                  : "text-[#ff4d4f]"
              )}
            >
              {formatNumber(result.volumeUtilization, 1)}%
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              {formatNumber(result.totalVolume, 2)} / {formatNumber(container.capacity, 1)} m³
            </div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Weight className="size-3.5" />
              {t.result.weightUtil}
            </div>
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                result.weightUtilization <= 90 ? "text-[#52c41a]" : "text-[#ff4d4f]"
              )}
            >
              {formatNumber(result.weightUtilization, 1)}%
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              {formatNumber(result.totalWeight)} / {formatNumber(container.maxPayload)} kg
            </div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <TrendingUp className="size-3.5" />
              {t.result.containerCapacity}
            </div>
            <div className="text-2xl font-bold text-[#15354e] tabular-nums">
              {formatNumber(result.emptyVolume, 1)} m³
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              Empty: {formatNumber(100 - result.volumeUtilization, 1)}%
            </div>
          </div>
        </div>

        {/* Overall Status Banner */}
        {result.allFit ? (
          <div className="flex items-center gap-2 p-3 rounded-md bg-[#f6ffed] border border-[#b7eb8f] text-sm">
            <CheckCircle2 className="size-5 text-[#52c41a] shrink-0" />
            <span className="text-[#389e0d] font-medium">{t.result.allFit}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-md bg-[#fffbe6] border border-[#ffe58f] text-sm">
            <AlertTriangle className="size-5 text-[#faad14] shrink-0" />
            <span className="text-[#d48806] font-medium">{t.result.partialFit}</span>
          </div>
        )}

        {/* 3D Visualizer Canvas */}
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden bg-white">
          <div className="px-3 py-2 bg-[#fafafa] border-b border-[#e8e8e8] flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#15354e]">{t.result.stepByStep}</h4>
          </div>
          {result.totalPlaced > 0 ? (
            <Scene3D boxes={result.boxes} container={container} />
          ) : (
            <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">
              <AlertTriangle className="size-10 mx-auto mb-2" />
              No cargo fits within the selected container boundaries.
            </div>
          )}
          {result.boxesSampled && (
            <p className="text-[10px] text-[rgba(0,0,0,0.45)] text-center py-2 border-t border-[#f0f0f0]">
              * Displaying {formatNumber(result.boxesShown)} of {formatNumber(result.totalPlaced)}{" "}
              boxes for optimal rendering performance.
            </p>
          )}
        </div>

        {/* Cargo Placements Table / Cards */}
        <div className="border border-[#e8e8e8] rounded-md overflow-hidden bg-white">
          <div className="px-3 py-2 bg-[#fafafa] border-b border-[#e8e8e8]">
            <h4 className="text-xs font-semibold text-[#15354e]">{t.result.cargoList}</h4>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#f0f0f0]">
            {result.placements.map((p) => (
              <div key={p.productId} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-4 rounded-sm border border-[#d9d9d9] shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs font-semibold text-[#15354e] truncate">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] rounded-full px-2 py-0.5 shrink-0 tabular-nums">
                    {t.result.qtyPlaced}: {formatNumber(p.placed)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between bg-[#fafafa] rounded-sm px-2 py-1">
                    <span className="text-[rgba(0,0,0,0.45)]">Dimensions:</span>
                    <span className="tabular-nums font-medium text-[#15354e]">
                      {formatNumber(p.effLength, 0)}×{formatNumber(p.effWidth, 0)}×
                      {formatNumber(p.effHeight, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-[#fafafa] rounded-sm px-2 py-1">
                    <span className="text-[rgba(0,0,0,0.45)]">Layout:</span>
                    <span className="tabular-nums font-medium text-[#15354e]">
                      {formatNumber(p.layoutL)}×{formatNumber(p.layoutW)}×{formatNumber(p.layoutH)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs min-w-[560px]">
              <thead className="bg-[#fafafa] border-b border-[#e8e8e8]">
                <tr>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    {t.products.color}
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    {t.result.name}
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    Dimensions (cm)
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    Layout (L×W×H)
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    {t.result.qtyPlaced}
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    Remaining
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    Orientation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {result.placements.map((p) => (
                  <tr key={p.productId} className="hover:bg-[#fafafa]">
                    <td className="p-2.5">
                      <div
                        className="size-4 rounded-sm border border-[#d9d9d9]"
                        style={{ backgroundColor: p.color }}
                      />
                    </td>
                    <td className="p-2.5 text-[#15354e] font-medium">{p.name}</td>
                    <td className="p-2.5 tabular-nums">
                      {formatNumber(p.effLength, 1)} × {formatNumber(p.effWidth, 1)} ×{" "}
                      {formatNumber(p.effHeight, 1)}
                    </td>
                    <td className="p-2.5 tabular-nums">
                      {formatNumber(p.layoutL)} × {formatNumber(p.layoutW)} ×{" "}
                      {formatNumber(p.layoutH)}
                    </td>
                    <td className="p-2.5 tabular-nums text-[#52c41a] font-bold">
                      {formatNumber(p.placed)}
                    </td>
                    <td className="p-2.5 tabular-nums text-[#ff4d4f] font-medium">
                      {formatNumber(p.remaining)}
                    </td>
                    <td className="p-2.5 text-[rgba(0,0,0,0.65)] text-[10px]">
                      {p.orientationLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="border border-[#ffe58f] bg-[#fffbe6] rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-[#faad14]" />
              <h4 className="text-xs font-semibold text-[#d48806]">Warnings & Alerts</h4>
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

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-2 p-4 border-t border-[#e8e8e8] bg-[#fafafa]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center px-4 py-2 border border-[#d9d9d9] hover:bg-white text-xs sm:text-sm font-medium rounded-md transition-colors"
        >
          {t.result.back}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 justify-center px-4 py-2 border border-[#d9d9d9] hover:bg-white text-xs sm:text-sm font-medium rounded-md transition-colors"
        >
          <RotateCcw className="size-3.5" />
          {t.result.restart}
        </button>
      </div>
    </div>
  );
}
