"use client";

import { useMemo, useState } from "react";
import {
  PACKAGE_TYPES,
  PALLET_TYPES,
  FREIGHT_MODES,
  calcPackageCbm,
  calcCbmTotals,
  getPackageType,
  getPalletType,
  type PackageRow,
  type PackageType,
  type FreightMode,
  type CbmLengthUnit,
} from "@/lib/cbm";
import { useTranslation } from "@/i18n/context";
import { ProformaDialog, ProformaPrint, type ProformaData } from "./proforma";
import {
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  Ship,
  Plane,
  Truck,
  TrainFront,
  Package,
  Boxes,
  Weight,
  Scale,
  FileSpreadsheet,
  FileText,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODE_ICONS = {
  ship: Ship,
  plane: Plane,
  truck: Truck,
  train: TrainFront,
} as const;

const UNIT_FACTOR: Record<CbmLengthUnit, number> = { mm: 1, cm: 10 };

let idCounter = 0;
function newRow(type: PackageType = "pallet"): PackageRow {
  idCounter += 1;
  const pt = type === "pallet" ? getPalletType("eur") : null;
  return {
    id: `pkg-${Date.now()}-${idCounter}`,
    type,
    palletType: type === "pallet" ? "eur" : "eur",
    length: type === "pallet" ? String(pt?.length ?? 1200) : type === "roll" ? "600" : "500",
    width: type === "pallet" ? String(pt?.width ?? 800) : type === "roll" ? "0" : "400",
    height: type === "pallet" ? "1000" : type === "roll" ? "0" : "300",
    diameter: type === "roll" || type === "cylinder" || type === "drum" ? "400" : "0",
    weight: type === "pallet" ? "250" : "10",
    quantity: type === "pallet" ? "10" : "50",
  };
}

export function CbmCalculator() {
  const { t, formatNumber, isRtl } = useTranslation();
  const [rows, setRows] = useState<PackageRow[]>([newRow("pallet")]);
  const [mode, setMode] = useState<FreightMode>("sea");
  const [unit, setUnit] = useState<CbmLengthUnit>("mm");
  const [proformaOpen, setProformaOpen] = useState(false);
  const [proformaData, setProformaData] = useState<ProformaData | null>(null);

  const unitLabels: Record<CbmLengthUnit, string> = {
    mm: t.cbm.unitMm,
    cm: t.cbm.unitCm,
  };

  // Convert input values to mm for core calculation
  const rowsMm = useMemo<PackageRow[]>(
    () =>
      rows.map((r) => ({
        ...r,
        length: String((parseFloat(r.length) || 0) * UNIT_FACTOR[unit]),
        width: String((parseFloat(r.width) || 0) * UNIT_FACTOR[unit]),
        height: String((parseFloat(r.height) || 0) * UNIT_FACTOR[unit]),
        diameter: String((parseFloat(r.diameter) || 0) * UNIT_FACTOR[unit]),
      })),
    [rows, unit]
  );

  const results = useMemo(() => rowsMm.map((r) => calcPackageCbm(r)), [rowsMm]);
  const totals = useMemo(() => calcCbmTotals(rowsMm, mode), [rowsMm, mode]);
  const selectedMode = FREIGHT_MODES.find((m) => m.value === mode)!;

  const mmToUnit = (mm: number) => String(Math.round((mm / UNIT_FACTOR[unit]) * 100) / 100);

  const changeUnit = (u: CbmLengthUnit) => {
    if (u === unit) return;
    const from = UNIT_FACTOR[unit];
    const to = UNIT_FACTOR[u];
    const conv = (v: string) => {
      const n = parseFloat(v) || 0;
      return String(Math.round(((n * from) / to) * 100) / 100);
    };
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        length: conv(r.length),
        width: conv(r.width),
        height: conv(r.height),
        diameter: conv(r.diameter),
      }))
    );
    setUnit(u);
  };

  const updateRow = (id: string, field: keyof PackageRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: value };
        if (field === "type") {
          const tp = value as PackageType;
          const info = getPackageType(tp);
          if (info.shape === "round") {
            next.width = "0";
            next.height = info.roundSecond === "length" ? "0" : next.height;
            next.length = info.roundSecond === "length" ? next.length : "0";
            if (tp === "drum" && (parseFloat(next.diameter) || 0) === 0)
              next.diameter = mmToUnit(600);
            if (tp === "cylinder" && (parseFloat(next.diameter) || 0) === 0)
              next.diameter = mmToUnit(400);
            if (tp === "roll" && (parseFloat(next.diameter) || 0) === 0)
              next.diameter = mmToUnit(400);
            if (info.roundSecond === "height" && (parseFloat(next.height) || 0) === 0)
              next.height = mmToUnit(900);
            if (info.roundSecond === "length" && (parseFloat(next.length) || 0) === 0)
              next.length = mmToUnit(1200);
          } else {
            next.diameter = "0";
            if ((parseFloat(next.length) || 0) === 0) next.length = mmToUnit(500);
            if ((parseFloat(next.width) || 0) === 0) next.width = mmToUnit(400);
            if ((parseFloat(next.height) || 0) === 0) next.height = mmToUnit(300);
          }
          if (tp === "pallet") {
            next.palletType = "eur";
            const pt = getPalletType("eur");
            next.length = mmToUnit(pt.length);
            next.width = mmToUnit(pt.width);
            if ((parseFloat(next.height) || 0) === 0) next.height = mmToUnit(1000);
          }
        }
        if (field === "palletType" && next.type === "pallet") {
          const pt = getPalletType(value);
          if (pt.value !== "custom") {
            next.length = mmToUnit(pt.length);
            next.width = mmToUnit(pt.width);
          }
        }
        return next;
      })
    );
  };

  const addRow = () => setRows((prev) => [...prev, newRow("pallet")]);
  const duplicateRow = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setRows((prev) => [...prev, { ...row, id: `pkg-${Date.now()}-${++idCounter}` }]);
  };
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const applyPresetDims = (id: string, dims: { length: number; width: number }) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, length: mmToUnit(dims.length), width: mmToUnit(dims.width) }
          : r
      )
    );
  };

  const hasValid = totals.totalPackages > 0 && totals.totalCbm > 0;

  return (
    <div className="space-y-4">
      {/* Dimension Unit Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-[#e8e8e8] rounded-sm p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-4 text-[#0088ff]" />
          <span className="text-sm font-semibold text-[#15354e]">{t.cbm.title}</span>
        </div>
        <div className="flex rounded-md border border-[#d9d9d9] overflow-hidden">
          {(["mm", "cm"] as CbmLengthUnit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => changeUnit(u)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                unit === u
                  ? "bg-[#0088ff] text-white"
                  : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
              )}
            >
              {unitLabels[u]} ({u.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* Transport / Freight Modes */}
      <div className="bg-white border border-[#e8e8e8] rounded-sm shadow-xs">
        <div className="p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
          <h3 className="text-sm font-semibold text-[#15354e]">{t.cbm.compareModes}</h3>
          <p className="hidden sm:block text-xs text-[rgba(0,0,0,0.65)] mt-1">
            {t.cbm.subtitle}
          </p>
        </div>
        <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {FREIGHT_MODES.map((m) => {
            const Icon = MODE_ICONS[m.icon];
            const active = mode === m.value;
            const tByMode = totals.byMode[m.value];
            const modeMeta = t.cbm.modes[m.value] || { title: m.en, hint: m.hint };

            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={cn(
                  "rounded-md border-2 p-3 transition-all text-start cursor-pointer",
                  active
                    ? "border-[#0088ff] bg-[#e6f7ff]/70 shadow-xs"
                    : "border-[#e8e8e8] bg-white hover:border-[#0088ff]"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={cn(
                        "size-4",
                        active ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.45)]"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold truncate",
                        active ? "text-[#0088ff]" : "text-[#15354e]"
                      )}
                    >
                      {modeMeta.title.split("(")[0]}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase text-[rgba(0,0,0,0.45)]">
                    {m.en.split(" ")[0]}
                  </span>
                </div>
                <div className="text-[10px] text-[rgba(0,0,0,0.65)] tabular-nums">
                  1 m³ = {formatNumber(m.factor)} kg
                </div>
                <div className="text-[10px] mt-1 pt-1 border-t border-[#f0f0f0] text-[rgba(0,0,0,0.65)]">
                  {t.cbm.chargeableWeight}:{" "}
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      active ? "text-[#0088ff]" : "text-[#15354e]"
                    )}
                  >
                    {hasValid ? `${formatNumber(Math.round(tByMode.chargeable))} kg` : "—"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Package Rows */}
      <div className="bg-white border border-[#e8e8e8] rounded-sm shadow-xs">
        <div className="flex items-center justify-between p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
          <div>
            <h3 className="text-sm font-semibold text-[#15354e]">{t.cbm.addPackage}</h3>
          </div>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          {rows.map((row, idx) => {
            const info = getPackageType(row.type);
            const res = results[idx];
            const isRound = info.shape === "round";
            const isPallet = row.type === "pallet";
            return (
              <div key={row.id} className="p-3">
                {/* Row Header */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0088ff] text-[11px] font-bold text-white shrink-0">
                    {formatNumber(idx + 1)}
                  </span>

                  {/* Package Type Dropdown */}
                  <div className="relative flex-1 min-w-[130px]">
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.id, "type", e.target.value)}
                      className={cn(
                        "w-full h-8 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none bg-white appearance-none",
                        isRtl ? "pr-2 pl-7" : "pl-2 pr-7"
                      )}
                    >
                      {PACKAGE_TYPES.map((pt) => (
                        <option key={pt.value} value={pt.value}>
                          {t.cbm.types[pt.value] || pt.en}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 size-3.5 text-[rgba(0,0,0,0.45)] pointer-events-none",
                        isRtl ? "left-2" : "right-2"
                      )}
                    />
                  </div>

                  {/* Pallet Type Dropdown */}
                  {isPallet && (
                    <div className="relative flex-1 min-w-[150px]">
                      <select
                        value={row.palletType}
                        onChange={(e) => {
                          updateRow(row.id, "palletType", e.target.value);
                          const pt = getPalletType(e.target.value);
                          if (pt.value !== "custom") applyPresetDims(row.id, pt);
                        }}
                        className={cn(
                          "w-full h-8 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none bg-white appearance-none",
                          isRtl ? "pr-2 pl-7" : "pl-2 pr-7"
                        )}
                      >
                        {PALLET_TYPES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {t.cbm.pallets[p.value] || p.en}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 size-3.5 text-[rgba(0,0,0,0.45)] pointer-events-none",
                          isRtl ? "left-2" : "right-2"
                        )}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-1 ms-auto">
                    <button
                      type="button"
                      onClick={() => duplicateRow(row.id)}
                      className="inline-flex items-center justify-center text-[rgba(0,0,0,0.45)] hover:text-[#0088ff] p-1.5 rounded transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="inline-flex items-center justify-center text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Dimension Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {isRound ? (
                    <>
                      <label className="block lg:col-span-1">
                        <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                          {t.cbm.diameter} ({unitLabels[unit]})
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={row.diameter}
                          onChange={(e) => updateRow(row.id, "diameter", e.target.value)}
                          className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                        />
                      </label>
                      <label className="block lg:col-span-1">
                        <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                          {info.roundSecond === "length" ? t.cbm.length : t.cbm.height} (
                          {unitLabels[unit]})
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={info.roundSecond === "length" ? row.length : row.height}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              info.roundSecond === "length" ? "length" : "height",
                              e.target.value
                            )
                          }
                          className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="block lg:col-span-1">
                        <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                          {t.cbm.length} ({unitLabels[unit]})
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={row.length}
                          onChange={(e) => updateRow(row.id, "length", e.target.value)}
                          className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                        />
                      </label>
                      <label className="block lg:col-span-1">
                        <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                          {t.cbm.width} ({unitLabels[unit]})
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={row.width}
                          onChange={(e) => updateRow(row.id, "width", e.target.value)}
                          className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                        />
                      </label>
                      <label className="block lg:col-span-1">
                        <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                          {t.cbm.height} ({unitLabels[unit]})
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={row.height}
                          onChange={(e) => updateRow(row.id, "height", e.target.value)}
                          className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                        />
                      </label>
                    </>
                  )}

                  <label className="block lg:col-span-1">
                    <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                      {t.cbm.weightPerPkg}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.weight}
                      onChange={(e) => updateRow(row.id, "weight", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </label>

                  <label className="block lg:col-span-1">
                    <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                      {t.cbm.quantity}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </label>

                  {/* Calculated CBM Output for Row */}
                  <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-1 bg-[#f6fbff] border border-[#d6eaff] rounded-sm px-2.5 py-1.5">
                    <span className="text-[10px] text-[rgba(0,0,0,0.65)]">{t.cbm.totalCbm}</span>
                    <span className="text-sm font-bold text-[#0088ff] tabular-nums">
                      {res.valid ? `${formatNumber(res.totalCbm, 3)} m³` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-[#fafafa] border-t border-[#f0f0f0]">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0088ff] hover:text-[#40a9ff] px-3 py-2 rounded-md hover:bg-[#e6f7ff] transition-colors"
          >
            <Plus className="size-4" />
            {t.cbm.addPackage}
          </button>
        </div>
      </div>

      {/* Aggregated Calculation Totals */}
      <div className="bg-white border border-[#e8e8e8] rounded-sm shadow-xs">
        <div className="p-3 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#15354e]">{t.cbm.totalCbm}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setProformaOpen(true)}
              disabled={!hasValid}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-[#15354e] text-white font-medium hover:bg-[#1f4a6b] active:bg-[#12293c] transition-colors disabled:opacity-40"
            >
              <FileText className="size-3.5" />
              {t.cbm.proformaBtn}
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Boxes className="size-3.5" />
              {t.cbm.quantity}
            </div>
            <div className="text-2xl font-bold text-[#15354e] tabular-nums">
              {formatNumber(totals.totalPackages)}
            </div>
          </div>

          <div className="border-2 border-[#0088ff] rounded-md p-3 text-center bg-[#e6f7ff]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Package className="size-3.5" />
              {t.cbm.totalCbm}
            </div>
            <div className="text-2xl font-bold text-[#0088ff] tabular-nums">
              {formatNumber(totals.totalCbm, 3)}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">m³</div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Weight className="size-3.5" />
              {t.cbm.totalWeight}
            </div>
            <div className="text-2xl font-bold text-[#15354e] tabular-nums">
              {formatNumber(Math.round(totals.totalWeight))}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">kg</div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Scale className="size-3.5" />
              {t.cbm.volumetricWeight}
            </div>
            <div className="text-2xl font-bold text-[#faad14] tabular-nums">
              {formatNumber(Math.round(totals.volumetricWeight))}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              kg (1 m³ = {formatNumber(selectedMode.factor)} kg)
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 border-2 border-[#52c41a] rounded-md p-3 text-center bg-[#f6ffed]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <CircleDollarSign className="size-3.5" />
              {t.cbm.chargeableWeight}
            </div>
            <div className="text-2xl font-bold text-[#52c41a] tabular-nums">
              {formatNumber(Math.round(totals.chargeableWeight))}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">kg</div>
          </div>
        </div>
      </div>

      {/* Proforma Dialog */}
      {proformaOpen && (
        <ProformaDialog
          rows={rowsMm}
          totals={totals}
          mode={mode}
          unit={unit}
          onClose={() => setProformaOpen(false)}
          onIssue={(d) => {
            setProformaData(d);
            setProformaOpen(false);
          }}
        />
      )}

      {/* Proforma Print View */}
      {proformaData && (
        <ProformaPrint
          data={proformaData}
          rows={rowsMm}
          totals={totals}
          mode={mode}
          unit={unit}
          onDone={() => setProformaData(null)}
        />
      )}
    </div>
  );
}
