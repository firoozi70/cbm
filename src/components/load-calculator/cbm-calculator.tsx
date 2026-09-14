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
import { faNumber } from "@/lib/containers";
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
const UNIT_LABEL: Record<CbmLengthUnit, string> = { mm: "میلی‌متر", cm: "سانتی‌متر" };

let idCounter = 0;
function newRow(type: PackageType = "pallet"): PackageRow {
  idCounter += 1;
  const pt = type === "pallet" ? getPalletType("eur") : null;
  return {
    id: `pkg-${Date.now()}-${idCounter}`,
    type,
    palletType: type === "pallet" ? "eur" : "eur",
    // پیش‌فرض‌ها بر اساس نوع بسته
    length: type === "pallet" ? String(pt?.length ?? 1200) : type === "roll" ? "600" : "500",
    width: type === "pallet" ? String(pt?.width ?? 800) : type === "roll" ? "0" : "400",
    height: type === "pallet" ? "1000" : type === "roll" ? "0" : "300",
    diameter: type === "roll" || type === "cylinder" || type === "drum" ? "400" : "0",
    weight: type === "pallet" ? "250" : "10",
    quantity: type === "pallet" ? "10" : "50",
  };
}

export function CbmCalculator() {
  // پیش‌فرض: یک ردیف پالت انتخاب شده
  const [rows, setRows] = useState<PackageRow[]>([newRow("pallet")]);
  const [mode, setMode] = useState<FreightMode>("sea");
  const [unit, setUnit] = useState<CbmLengthUnit>("mm");

  const results = useMemo(() => rows.map((r) => calcPackageCbm(r)), [rows]);
  const totals = useMemo(() => calcCbmTotals(rows, mode), [rows, mode]);
  const selectedMode = FREIGHT_MODES.find((m) => m.value === mode)!;

  const updateRow = (id: string, field: keyof PackageRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: value };
        // با تغییر نوع بسته، فیلدهای نامربوط صفر شوند
        if (field === "type") {
          const t = value as PackageType;
          const info = getPackageType(t);
          if (info.shape === "round") {
            next.width = "0";
            next.height = info.roundSecond === "length" ? "0" : next.height;
            next.length = info.roundSecond === "length" ? next.length : "0";
            if (t === "drum" && (parseFloat(next.diameter) || 0) === 0) next.diameter = "600";
            if (t === "cylinder" && (parseFloat(next.diameter) || 0) === 0) next.diameter = "400";
            if (t === "roll" && (parseFloat(next.diameter) || 0) === 0) next.diameter = "400";
            if (info.roundSecond === "height" && (parseFloat(next.height) || 0) === 0) next.height = "900";
            if (info.roundSecond === "length" && (parseFloat(next.length) || 0) === 0) next.length = "1200";
          } else {
            next.diameter = "0";
            if ((parseFloat(next.length) || 0) === 0) next.length = "500";
            if ((parseFloat(next.width) || 0) === 0) next.width = "400";
            if ((parseFloat(next.height) || 0) === 0) next.height = "300";
          }
          if (t === "pallet") {
            next.palletType = "eur";
            const pt = getPalletType("eur");
            next.length = String(pt.length);
            next.width = String(pt.width);
            if ((parseFloat(next.height) || 0) === 0) next.height = "1000";
          }
        }
        // با تغییر نوع پالت، ابعاد به‌روزرسانی شوند
        if (field === "palletType" && next.type === "pallet") {
          const pt = getPalletType(value);
          if (pt.value !== "custom") {
            next.length = String(pt.length);
            next.width = String(pt.width);
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
        r.id === id ? { ...r, length: String(dims.length), width: String(dims.width) } : r
      )
    );
  };

  const hasValid = totals.totalPackages > 0 && totals.totalCbm > 0;

  return (
    <div className="space-y-4">
      {/* واحد اندازه‌گیری */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-[#e8e8e8] rounded-sm p-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-4 text-[#0088ff]" />
          <span className="text-sm font-semibold text-[#15354e]">واحد اندازه‌گیری</span>
        </div>
        <div className="flex rounded-md border border-[#d9d9d9] overflow-hidden">
          {(["mm", "cm"] as CbmLengthUnit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                "px-4 py-1.5 text-xs transition-colors",
                unit === u
                  ? "bg-[#0088ff] text-white"
                  : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
              )}
            >
              {UNIT_LABEL[u]} ({u.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* شیوه حمل */}
      <div className="bg-white border border-[#e8e8e8] rounded-sm">
        <div className="p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
          <h3 className="text-sm font-semibold text-[#15354e]">شیوه حمل و نقل</h3>
          <p className="text-xs text-[rgba(0,0,0,0.65)] mt-1">
            وزن حجمی بر اساس ضریب استاندارد هر شیوه حمل محاسبه می‌شود.
          </p>
        </div>
        <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {FREIGHT_MODES.map((m) => {
            const Icon = MODE_ICONS[m.icon];
            const active = mode === m.value;
            const t = totals.byMode[m.value];
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={cn(
                  "text-right rounded-md border-2 p-3 transition-all",
                  active
                    ? "border-[#0088ff] bg-[#e6f7ff]"
                    : "border-[#e8e8e8] bg-white hover:border-[#0088ff]"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("size-4", active ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.45)]")} />
                    <span className={cn("text-xs font-bold", active ? "text-[#0088ff]" : "text-[#15354e]")}>
                      {m.fa}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase text-[rgba(0,0,0,0.45)]">{m.en.split(" ")[0]}</span>
                </div>
                <div className="text-[10px] text-[rgba(0,0,0,0.65)] tabular-nums">
                  ۱ م³ = {faNumber(m.factor)} کیلوگرم
                </div>
                <div className="text-[10px] mt-1 pt-1 border-t border-[#f0f0f0] text-[rgba(0,0,0,0.65)]">
                  قابل احتساب:{" "}
                  <span className={cn("font-semibold tabular-nums", active ? "text-[#0088ff]" : "text-[#15354e]")}>
                    {hasValid ? `${faNumber(Math.round(t.chargeable))} کیلوگرم` : "—"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* بسته‌ها */}
      <div className="bg-white border border-[#e8e8e8] rounded-sm">
        <div className="flex items-center justify-between p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
          <div>
            <h3 className="text-sm font-semibold text-[#15354e]">اقلام بار</h3>
            <p className="text-xs text-[rgba(0,0,0,0.65)] mt-1">
              نوع بسته، ابعاد، وزن و تعداد را وارد کنید. حجم هر بسته (CBM) خودکار محاسبه می‌شود.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          {rows.map((row, idx) => {
            const info = getPackageType(row.type);
            const res = results[idx];
            const isRound = info.shape === "round";
            const isPallet = row.type === "pallet";
            const palletInfo = getPalletType(row.palletType);
            return (
              <div key={row.id} className="p-3">
                {/* سربرگ ردیف: شماره، نوع بسته، حذف/کپی */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0088ff] text-[11px] font-bold text-white shrink-0">
                    {faNumber(idx + 1)}
                  </span>

                  {/* نوع بسته */}
                  <div className="relative flex-1 min-w-[130px]">
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.id, "type", e.target.value)}
                      className="w-full h-8 px-2 pl-7 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none bg-white appearance-none"
                      aria-label="نوع بسته"
                    >
                      {PACKAGE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.fa} ({t.en})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-[rgba(0,0,0,0.45)] pointer-events-none" />
                  </div>

                  {/* نوع پالت */}
                  {isPallet && (
                    <div className="relative flex-1 min-w-[150px]">
                      <select
                        value={row.palletType}
                        onChange={(e) => {
                          updateRow(row.id, "palletType", e.target.value);
                          const pt = getPalletType(e.target.value);
                          if (pt.value !== "custom") applyPresetDims(row.id, pt);
                        }}
                        className="w-full h-8 px-2 pl-7 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none bg-white appearance-none"
                        aria-label="استاندارد پالت"
                      >
                        {PALLET_TYPES.map((p) => (
                          <option key={p.value} value={p.value}>
                            پالت {p.fa}
                            {p.value !== "custom" ? ` - ${faNumber(p.length)}×${faNumber(p.width)}` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-[rgba(0,0,0,0.45)] pointer-events-none" />
                    </div>
                  )}

                  <div className="flex items-center gap-0.5 mr-auto">
                    <button
                      type="button"
                      onClick={() => duplicateRow(row.id)}
                      className="text-[rgba(0,0,0,0.45)] hover:text-[#0088ff] p-1.5 rounded transition-colors"
                      title="کپی ردیف"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="حذف ردیف"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* یادداشت پالت */}
                {isPallet && palletInfo.note && (
                  <p className="text-[10px] text-[rgba(0,0,0,0.45)] mb-2 -mt-1">
                    {palletInfo.note}
                  </p>
                )}

                {/* فیلدها */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {isRound ? (
                    <>
                      <label className="block lg:col-span-1">
                        <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                          قطر ({UNIT_LABEL[unit]})
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
                          {info.roundSecond === "length" ? "طول رول" : "ارتفاع"} ({UNIT_LABEL[unit]})
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
                          طول ({UNIT_LABEL[unit]})
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
                          عرض ({UNIT_LABEL[unit]})
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
                          ارتفاع ({UNIT_LABEL[unit]})
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
                      وزن هر بسته (kg)
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
                    <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">تعداد</span>
                    <input
                      type="number"
                      min="0"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </label>

                  {/* CBM هر بسته */}
                  <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-1 bg-[#f6fbff] border border-[#d6eaff] rounded-sm px-2.5 py-1.5">
                    <span className="text-[10px] text-[rgba(0,0,0,0.65)]">حجم کل ردیف</span>
                    <span className="text-sm font-bold text-[#0088ff] tabular-nums">
                      {res.valid ? `${faNumber(res.totalCbm, 3)} م³` : "—"}
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
            className="inline-flex items-center gap-1.5 text-xs text-[#0088ff] hover:text-[#40a9ff] px-2 py-1.5 rounded transition-colors"
          >
            <Plus className="size-4" />
            افزودن قلم بار (پالت یا بسته)
          </button>
        </div>
      </div>

      {/* نتایج */}
      <div className="bg-white border border-[#e8e8e8] rounded-sm">
        <div className="p-3 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#15354e]">نتیجه محاسبه CBM</h3>
          <span className="text-[10px] text-[rgba(0,0,0,0.45)]">
            شیوه حمل: {selectedMode.fa}
          </span>
        </div>

        <div className="p-3 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Boxes className="size-3.5" />
              تعداد اقلام
            </div>
            <div className="text-2xl font-bold text-[#15354e] tabular-nums">
              {faNumber(totals.totalPackages)}
            </div>
          </div>

          <div className="border-2 border-[#0088ff] rounded-md p-3 text-center bg-[#e6f7ff]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Package className="size-3.5" />
              حجم کل (CBM)
            </div>
            <div className="text-2xl font-bold text-[#0088ff] tabular-nums">
              {faNumber(totals.totalCbm, 3)}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">متر مکعب</div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Weight className="size-3.5" />
              وزن واقعی
            </div>
            <div className="text-2xl font-bold text-[#15354e] tabular-nums">
              {faNumber(Math.round(totals.totalWeight))}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">کیلوگرم</div>
          </div>

          <div className="border border-[#e8e8e8] rounded-md p-3 text-center bg-[#fafafa]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <Scale className="size-3.5" />
              وزن حجمی
            </div>
            <div className="text-2xl font-bold text-[#faad14] tabular-nums">
              {faNumber(Math.round(totals.volumetricWeight))}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              کیلوگرم (۱م³={faNumber(selectedMode.factor)}kg)
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 border-2 border-[#52c41a] rounded-md p-3 text-center bg-[#f6ffed]">
            <div className="flex items-center justify-center gap-1 text-xs text-[rgba(0,0,0,0.65)] mb-1.5">
              <CircleDollarSign className="size-3.5" />
              وزن قابل احتساب
            </div>
            <div className="text-2xl font-bold text-[#52c41a] tabular-nums">
              {faNumber(Math.round(totals.chargeableWeight))}
            </div>
            <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">
              بیشینه وزن واقعی و حجمی
            </div>
          </div>
        </div>

        {/* مقایسه شیوه‌های حمل */}
        {hasValid && (
          <div className="border-t border-[#f0f0f0] p-3">
            <h4 className="text-xs font-semibold text-[#15354e] mb-2">
              مقایسه وزن قابل احتساب در شیوه‌های حمل
            </h4>
            <div className="overflow-x-auto scrollbar-fa">
              <table className="w-full text-xs min-w-[420px]">
                <thead className="bg-[#fafafa] border-b border-[#e8e8e8]">
                  <tr>
                    <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">شیوه حمل</th>
                    <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">ضریب</th>
                    <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">وزن حجمی</th>
                    <th className="text-right p-2 font-medium text-[rgba(0,0,0,0.65)]">وزن قابل احتساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {FREIGHT_MODES.map((m) => {
                    const Icon = MODE_ICONS[m.icon];
                    const t = totals.byMode[m.value];
                    const active = m.value === mode;
                    return (
                      <tr
                        key={m.value}
                        className={cn("cursor-pointer transition-colors", active ? "bg-[#e6f7ff]" : "hover:bg-[#fafafa]")}
                        onClick={() => setMode(m.value)}
                      >
                        <td className="p-2">
                          <span className="inline-flex items-center gap-1.5 font-medium text-[#15354e]">
                            <Icon className={cn("size-3.5", active ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.45)]")} />
                            {m.fa}
                            {active && <span className="text-[9px] text-[#0088ff]">(انتخاب‌شده)</span>}
                          </span>
                        </td>
                        <td className="p-2 tabular-nums text-[rgba(0,0,0,0.65)]">
                          ۱م³ = {faNumber(m.factor)} kg
                        </td>
                        <td className="p-2 tabular-nums">{faNumber(Math.round(t.volumetric))} کیلوگرم</td>
                        <td className={cn("p-2 tabular-nums font-bold", active ? "text-[#0088ff]" : "text-[#15354e]")}>
                          {faNumber(Math.round(t.chargeable))} کیلوگرم
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[rgba(0,0,0,0.45)] mt-2 leading-relaxed">
              {selectedMode.hint}. وزن قابل احتساب مبنای محاسبه کرایه حمل است؛ هرگاه وزن حجمی از وزن واقعی بیشتر
              شود، کرایه بر اساس وزن حجمی محاسبه می‌شود (W/M).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
