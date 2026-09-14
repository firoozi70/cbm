"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getPackageType,
  getPalletType,
  getFreightMode,
  type PackageRow,
  type CbmTotals,
  type FreightMode,
  type CbmLengthUnit,
} from "@/lib/cbm";
import { faNumber } from "@/lib/containers";
import { FileText, Printer, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- انواع ----------------------------- */

export interface ProformaData {
  invoiceNo: string;
  issueDate: string; // ISO
  issuerName: string;
  issuerPhone: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  rateBasis: "cbm" | "weight"; // مبنای نرخ حمل: مترمکعب یا وزن قابل احتساب
  freightRateUsd: number; // نرخ حمل (دلار)
  dollarRate: number; // نرخ هر دلار به تومان (دستی)
}

interface CalcProps {
  rows: PackageRow[]; // ابعاد بر حسب میلی‌متر
  totals: CbmTotals;
  mode: FreightMode;
  unit: CbmLengthUnit;
}

interface DialogProps extends CalcProps {
  onClose: () => void;
  onIssue: (data: ProformaData) => void;
}

interface PrintProps extends CalcProps {
  data: ProformaData;
  onDone: () => void;
}

const UNIT_LABEL: Record<CbmLengthUnit, string> = { mm: "میلی‌متر", cm: "سانتی‌متر" };

function defaultInvoiceNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `PF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** شرح کالا برای جدول پیش‌فاکتور */
function itemDesc(row: PackageRow): string {
  if (row.type === "pallet") {
    const pt = getPalletType(row.palletType);
    return pt.fa;
  }
  return getPackageType(row.type).fa;
}

/** ابعاد یک بسته (mm) به‌صورت متن */
function itemDims(row: PackageRow): string {
  const info = getPackageType(row.type);
  if (info.shape === "round") {
    const d = parseFloat(row.diameter) || 0;
    const second = parseFloat(info.roundSecond === "length" ? row.length : row.height) || 0;
    return `⌀${faNumber(d)} × ${faNumber(second)}`;
  }
  const l = parseFloat(row.length) || 0;
  const w = parseFloat(row.width) || 0;
  const h = parseFloat(row.height) || 0;
  return `${faNumber(l)} × ${faNumber(w)} × ${faNumber(h)}`;
}

/* ----------------------------- دیالوگ صدور ----------------------------- */

export function ProformaDialog({
  rows,
  totals,
  mode,
  unit,
  onClose,
  onIssue,
}: DialogProps) {
  // کامپوننت با هر باز شدن از نو mount می‌شود؛ مقادیر اولیه اینجا تازه تولید می‌شوند
  const [invoiceNo, setInvoiceNo] = useState(() => defaultInvoiceNo());
  const [issuerName, setIssuerName] = useState("");
  const [issuerPhone, setIssuerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [rateBasis, setRateBasis] = useState<"cbm" | "weight">("cbm");
  const [freightRate, setFreightRate] = useState("");
  const [dollarRate, setDollarRate] = useState("");
  const [touched, setTouched] = useState(false);

  const modeInfo = getFreightMode(mode);
  const rate = parseFloat(freightRate) || 0;
  const dollar = parseFloat(dollarRate) || 0;
  const basisValue = rateBasis === "cbm" ? totals.totalCbm : totals.chargeableWeight;
  const usdTotal = basisValue * rate;
  const tomanTotal = usdTotal * dollar;
  const basisLabel = rateBasis === "cbm" ? "مترمکعب (CBM)" : "کیلوگرم (وزن قابل احتساب)";

  const errors = {
    issuerName: !issuerName.trim(),
    customerName: !customerName.trim(),
    freightRate: !(rate > 0),
    dollarRate: !(dollar > 0),
  };
  const hasError = Object.values(errors).some(Boolean);
  const showErr = (bad: boolean) =>
    touched && bad ? "border-[#ff4d4f] focus:border-[#ff4d4f]" : "";

  const submit = () => {
    setTouched(true);
    if (hasError) return;
    onIssue({
      invoiceNo: invoiceNo.trim() || defaultInvoiceNo(),
      issueDate: new Date().toISOString(),
      issuerName: issuerName.trim(),
      issuerPhone: issuerPhone.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      notes: notes.trim(),
      rateBasis,
      freightRateUsd: rate,
      dollarRate: dollar,
    });
  };

  const field =
    "w-full h-9 px-2.5 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none";

  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-[#0088ff]" />
            صدور پیش‌فاکتور (PDF)
          </DialogTitle>
          <DialogDescription className="text-right text-xs leading-relaxed">
            مشخصات خود و مشتری، نرخ حمل دلاری و نرخ دلار را وارد کنید تا پیش‌فاکتور ساخته شود.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 mt-1">
          {/* مشخصات صادرکننده */}
          <div>
            <h4 className="text-xs font-semibold text-[#15354e] mb-2">مشخصات صادرکننده (شما)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  نام / شرکت <b className="text-[#ff4d4f]">*</b>
                </span>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  placeholder="مثلاً: شرکت بازرگانی آرمان"
                  className={cn(field, showErr(errors.issuerName))}
                />
              </label>
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">شماره تماس</span>
                <input
                  type="tel"
                  value={issuerPhone}
                  onChange={(e) => setIssuerPhone(e.target.value)}
                  placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                  className={cn(field, "tabular-nums")}
                />
              </label>
            </div>
          </div>

          {/* مشخصات مشتری */}
          <div>
            <h4 className="text-xs font-semibold text-[#15354e] mb-2">مشخصات مشتری (خریدار)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  نام مشتری <b className="text-[#ff4d4f]">*</b>
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="نام شخص یا شرکت"
                  className={cn(field, showErr(errors.customerName))}
                />
              </label>
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">شماره تماس</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                  className={cn(field, "tabular-nums")}
                />
              </label>
            </div>
          </div>

          {/* شماره پیش‌فاکتور */}
          <label className="block">
            <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">شماره پیش‌فاکتور</span>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className={cn(field, "tabular-nums")}
            />
          </label>

          {/* نرخ‌ها */}
          <div className="border border-[#e8e8e8] rounded-md p-3 bg-[#fafafa] space-y-2.5">
            <h4 className="text-xs font-semibold text-[#15354e]">نرخ‌ها (ورود دستی)</h4>

            {/* مبنای محاسبه */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[rgba(0,0,0,0.65)] shrink-0">مبنای نرخ:</span>
              <div className="flex rounded-sm border border-[#d9d9d9] overflow-hidden flex-1">
                {(
                  [
                    { v: "cbm" as const, label: "مترمکعب" },
                    { v: "weight" as const, label: "کیلوگرم" },
                  ]
                ).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setRateBasis(o.v)}
                    className={cn(
                      "flex-1 py-2 text-[11px] transition-colors min-h-[36px]",
                      rateBasis === o.v
                        ? "bg-[#0088ff] text-white font-medium"
                        : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  نرخ حمل (دلار) <b className="text-[#ff4d4f]">*</b>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={freightRate}
                  onChange={(e) => setFreightRate(e.target.value)}
                  placeholder="0"
                  className={cn(field, "tabular-nums", showErr(errors.freightRate))}
                />
              </label>
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  نرخ هر دلار (تومان) <b className="text-[#ff4d4f]">*</b>
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={dollarRate}
                  onChange={(e) => setDollarRate(e.target.value)}
                  placeholder="0"
                  className={cn(field, "tabular-nums", showErr(errors.dollarRate))}
                />
              </label>
            </div>

            {/* محاسبه زنده */}
            <div className="rounded-sm bg-[#e6f7ff] border border-[#91caff] p-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[rgba(0,0,0,0.65)]">مبنا ({basisLabel}):</span>
                <span className="font-semibold text-[#15354e] tabular-nums">
                  {faNumber(basisValue, rateBasis === "cbm" ? 3 : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(0,0,0,0.65)]">جمع کرایه حمل:</span>
                <span className="font-semibold text-[#0088ff] tabular-nums">
                  {faNumber(Math.round(usdTotal))} دلار
                </span>
              </div>
              <div className="flex justify-between border-t border-[#91caff] pt-1">
                <span className="text-[rgba(0,0,0,0.65)]">معادل تومانی:</span>
                <span className="font-bold text-[#52c41a] tabular-nums">
                  {faNumber(Math.round(tomanTotal))} تومان
                </span>
              </div>
            </div>
          </div>

          {/* توضیحات */}
          <label className="block">
            <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
              توضیحات (اختیاری — در پیش‌فاکتور چاپ می‌شود)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="شرایط پرداخت، اعتبار پیش‌فاکتور و..."
              className={cn(field, "h-auto py-2 resize-none leading-relaxed")}
            />
          </label>

          {/* خطا */}
          {touched && hasError && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#ff4d4f]">
              <AlertCircle className="size-3.5 shrink-0" />
              لطفاً فیلدهای ستاره‌دار را کامل و درست وارد کنید.
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs rounded-sm border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#0088ff] hover:text-[#0088ff] transition-colors min-h-[44px]"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs rounded-sm bg-[#0088ff] text-white font-medium hover:bg-[#40a9ff] active:bg-[#007ae6] transition-colors min-h-[44px]"
            >
              <Printer className="size-4" />
              صدور و چاپ PDF
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- سند چاپ ----------------------------- */

export function ProformaPrint({ data, rows, totals, mode, unit, onDone }: PrintProps) {
  // پس از رندر، دیالوگ چاپ مرورگر باز شود
  useEffect(() => {
    const t = setTimeout(() => window.print(), 250);
    const done = () => onDone();
    window.addEventListener("afterprint", done);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [onDone]);

  const modeInfo = getFreightMode(mode);
  const dateFa = new Date(data.issueDate).toLocaleDateString("fa-IR");
  const basisValue =
    data.rateBasis === "cbm" ? totals.totalCbm : totals.chargeableWeight;
  const basisLabel = data.rateBasis === "cbm" ? "مترمکعب" : "کیلوگرم";
  const usdTotal = basisValue * data.freightRateUsd;
  const tomanTotal = usdTotal * data.dollarRate;

  // آیتم‌های جدول (ابعاد rows بر حسب میلی‌متر است)
  const items = useMemo(
    () =>
      rows
        .map((r) => {
          const info = getPackageType(r.type);
          let l = 0, w = 0, h = 0;
          if (info.shape === "round") {
            const d = parseFloat(r.diameter) || 0;
            l = d;
            w = d;
            h = parseFloat(info.roundSecond === "length" ? r.length : r.height) || 0;
          } else {
            l = parseFloat(r.length) || 0;
            w = parseFloat(r.width) || 0;
            h = parseFloat(r.height) || 0;
          }
          const f = unit === "cm" ? 10 : 1; // نمایش در واحد انتخابی
          return {
            id: r.id,
            desc: itemDesc(r),
            dims:
              info.shape === "round"
                ? `⌀${faNumber(l / f)} × ${faNumber(h / f)}`
                : `${faNumber(l / f)} × ${faNumber(w / f)} × ${faNumber(h / f)}`,
            qty: parseInt(r.quantity) || 0,
            weight: parseFloat(r.weight) || 0,
            totalWeight: (parseFloat(r.weight) || 0) * (parseInt(r.quantity) || 0),
          };
        })
        .filter((it) => it.qty > 0),
    [rows, unit]
  );

  const th = "border border-[#d9d9d9] bg-[#f5f5f5] p-2 text-[11px] font-semibold text-[#15354e]";
  const td = "border border-[#d9d9d9] p-2 text-[11px] text-[#15354e]";

  return createPortal(
    <div
      dir="rtl"
      className="print-portal"
      style={{ fontFamily: "inherit" }}
    >
      <div className="max-w-[800px] mx-auto bg-white text-[#15354e] p-6">
        {/* سربرگ */}
        <div className="flex items-start justify-between border-b-2 border-[#15354e] pb-3 mb-4">
          <div>
            <h1 className="text-xl font-bold">پیش‌فاکتور فروش و خدمات حمل</h1>
            <p className="text-[11px] mt-1 text-[rgba(0,0,0,0.65)]">
              شماره: {data.invoiceNo} — تاریخ: {dateFa}
            </p>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">LoadCalc</p>
            <p className="text-[10px] text-[rgba(0,0,0,0.65)]">ماشین‌حساب بار و CBM</p>
          </div>
        </div>

        {/* طرفین */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-[#d9d9d9] rounded-sm p-3">
            <h2 className="text-[11px] font-bold mb-1.5 text-[#0088ff]">صادرکننده</h2>
            <p className="text-[11px] font-semibold">{data.issuerName}</p>
            {data.issuerPhone && (
              <p className="text-[11px] text-[rgba(0,0,0,0.65)] tabular-nums mt-0.5">
                تلفن: {data.issuerPhone}
              </p>
            )}
          </div>
          <div className="border border-[#d9d9d9] rounded-sm p-3">
            <h2 className="text-[11px] font-bold mb-1.5 text-[#0088ff]">خریدار</h2>
            <p className="text-[11px] font-semibold">{data.customerName}</p>
            {data.customerPhone && (
              <p className="text-[11px] text-[rgba(0,0,0,0.65)] tabular-nums mt-0.5">
                تلفن: {data.customerPhone}
              </p>
            )}
          </div>
        </div>

        {/* جدول اقلام */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className={cn(th, "w-8")}>#</th>
              <th className={th}>شرح کالا / بسته‌بندی</th>
              <th className={th}>
                ابعاد واحد ({UNIT_LABEL[unit]})
              </th>
              <th className={th}>تعداد</th>
              <th className={th}>وزن واحد (kg)</th>
              <th className={th}>وزن کل (kg)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td className={cn(td, "text-center tabular-nums")}>{faNumber(i + 1)}</td>
                <td className={cn(td, "font-medium")}>{it.desc}</td>
                <td className={cn(td, "tabular-nums text-center")}>{it.dims}</td>
                <td className={cn(td, "text-center tabular-nums")}>{faNumber(it.qty)}</td>
                <td className={cn(td, "text-center tabular-nums")}>{faNumber(it.weight, 1)}</td>
                <td className={cn(td, "text-center tabular-nums")}>{faNumber(Math.round(it.totalWeight))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* خلاصه بار */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-[#d9d9d9] rounded-sm p-3 space-y-1.5 text-[11px]">
            <h2 className="font-bold text-[#0088ff] mb-1">خلاصه بار</h2>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">تعداد کل اقلام:</span>
              <span className="font-semibold tabular-nums">{faNumber(totals.totalPackages)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">حجم کل:</span>
              <span className="font-semibold tabular-nums">{faNumber(totals.totalCbm, 3)} م³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">وزن واقعی:</span>
              <span className="font-semibold tabular-nums">
                {faNumber(Math.round(totals.totalWeight))} کیلوگرم
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">شیوه حمل:</span>
              <span className="font-semibold">{modeInfo.fa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">وزن قابل احتساب (W/M):</span>
              <span className="font-semibold tabular-nums">
                {faNumber(Math.round(totals.chargeableWeight))} کیلوگرم
              </span>
            </div>
          </div>

          {/* محاسبه مالی */}
          <div className="border-2 border-[#15354e] rounded-sm p-3 space-y-1.5 text-[11px]">
            <h2 className="font-bold text-[#0088ff] mb-1">محاسبه کرایه حمل</h2>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">مبنای محاسبه:</span>
              <span className="font-semibold tabular-nums">
                {faNumber(basisValue, data.rateBasis === "cbm" ? 3 : 0)} {basisLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">
                نرخ حمل (دلار بر {basisLabel}):
              </span>
              <span className="font-semibold tabular-nums">{faNumber(data.freightRateUsd, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">جمع کرایه (دلار):</span>
              <span className="font-semibold tabular-nums">{faNumber(Math.round(usdTotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">نرخ هر دلار (تومان):</span>
              <span className="font-semibold tabular-nums">{faNumber(data.dollarRate)}</span>
            </div>
            <div
              className="flex justify-between border-t-2 border-[#15354e] pt-1.5 mt-1"
              style={{ printColorAdjust: "exact" }}
            >
              <span className="font-bold text-sm">مبلغ قابل پرداخت:</span>
              <span className="font-bold text-sm tabular-nums">
                {faNumber(Math.round(tomanTotal))} تومان
              </span>
            </div>
          </div>
        </div>

        {/* توضیحات */}
        {data.notes && (
          <div className="border border-[#d9d9d9] rounded-sm p-3 mb-4">
            <h2 className="text-[11px] font-bold text-[#0088ff] mb-1">توضیحات</h2>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}

        {/* یادداشت پایانی */}
        <div className="border-t border-[#d9d9d9] pt-2.5 text-[10px] text-[rgba(0,0,0,0.65)] leading-relaxed">
          <p>
            این پیش‌فاکتور صرفاً به‌منظور استعلام و اعلام مبلغ اولیه صادر شده و جنبه سند رسمی گمرکی و
            بانکی ندارد. مبالغ بر اساس ابعاد و وزن اعلامی محاسبه شده و پس از بازرسی نهایی بار ممکن است
            اصلاح شود.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
