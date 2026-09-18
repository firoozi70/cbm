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
import { useTranslation } from "@/i18n/context";
import { FileText, Printer, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProformaData {
  invoiceNo: string;
  issueDate: string; // ISO
  issuerName: string;
  issuerPhone: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  rateBasis: "cbm" | "weight";
  freightRateUsd: number;
  dollarRate: number;
}

interface CalcProps {
  rows: PackageRow[];
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

function defaultInvoiceNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `PF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

export function ProformaDialog({
  rows,
  totals,
  mode,
  unit,
  onClose,
  onIssue,
}: DialogProps) {
  const { t, formatNumber, isRtl } = useTranslation();
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

  const rate = parseFloat(freightRate) || 0;
  const dollar = parseFloat(dollarRate) || 0;
  const basisValue = rateBasis === "cbm" ? totals.totalCbm : totals.chargeableWeight;
  const usdTotal = basisValue * rate;
  const localTotal = dollar > 0 ? usdTotal * dollar : usdTotal;
  const basisLabel = rateBasis === "cbm" ? t.proforma.basisCbm : t.proforma.basisWeight;

  const errors = {
    issuerName: !issuerName.trim(),
    customerName: !customerName.trim(),
    freightRate: !(rate > 0),
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
            {t.proforma.dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {t.cbm.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 mt-1">
          {/* Issuer details */}
          <div>
            <h4 className="text-xs font-semibold text-[#15354e] mb-2">{t.proforma.issuerInfo}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  {t.proforma.issuerName} <b className="text-[#ff4d4f]">*</b>
                </span>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className={cn(field, showErr(errors.issuerName))}
                />
              </label>
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  {t.proforma.phone}
                </span>
                <input
                  type="tel"
                  value={issuerPhone}
                  onChange={(e) => setIssuerPhone(e.target.value)}
                  className={cn(field, "tabular-nums")}
                />
              </label>
            </div>
          </div>

          {/* Customer details */}
          <div>
            <h4 className="text-xs font-semibold text-[#15354e] mb-2">{t.proforma.customerInfo}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  {t.proforma.customerName} <b className="text-[#ff4d4f]">*</b>
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={cn(field, showErr(errors.customerName))}
                />
              </label>
              <label className="block">
                <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
                  {t.proforma.phone}
                </span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={cn(field, "tabular-nums")}
                />
              </label>
            </div>
          </div>

          {/* Invoice Number */}
          <label className="block">
            <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
              {t.proforma.invoiceNo}
            </span>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className={cn(field, "tabular-nums")}
            />
          </label>

          {/* Rates */}
          <div className="border border-[#e8e8e8] rounded-md p-3 bg-[#fafafa] space-y-2.5">
            <h4 className="text-xs font-semibold text-[#15354e]">{t.proforma.freightCalculation}</h4>

            {/* Rate Basis */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[rgba(0,0,0,0.65)] shrink-0">
                {t.proforma.rateBasis}:
              </span>
              <div className="flex rounded-sm border border-[#d9d9d9] overflow-hidden flex-1">
                {(
                  [
                    { v: "cbm" as const, label: t.proforma.basisCbm },
                    { v: "weight" as const, label: t.proforma.basisWeight },
                  ]
                ).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setRateBasis(o.v)}
                    className={cn(
                      "flex-1 py-1.5 text-[11px] font-medium transition-colors cursor-pointer",
                      rateBasis === o.v
                        ? "bg-[#0088ff] text-white"
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
                  {t.proforma.rateUsd} <b className="text-[#ff4d4f]">*</b>
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
                  {t.proforma.dollarExchangeRate}
                </span>
                <input
                  type="number"
                  min="0"
                  value={dollarRate}
                  onChange={(e) => setDollarRate(e.target.value)}
                  placeholder="Optional"
                  className={cn(field, "tabular-nums")}
                />
              </label>
            </div>

            {/* Live Calculation */}
            <div className="rounded-sm bg-[#e6f7ff] border border-[#91caff] p-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[rgba(0,0,0,0.65)]">{t.proforma.rateBasis} ({basisLabel}):</span>
                <span className="font-semibold text-[#15354e] tabular-nums">
                  {formatNumber(basisValue, rateBasis === "cbm" ? 3 : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(0,0,0,0.65)]">{t.proforma.totalUsd}:</span>
                <span className="font-semibold text-[#0088ff] tabular-nums">
                  ${formatNumber(Math.round(usdTotal))} USD
                </span>
              </div>
              {dollar > 0 && (
                <div className="flex justify-between border-t border-[#91caff] pt-1">
                  <span className="text-[rgba(0,0,0,0.65)]">{t.proforma.totalLocal}:</span>
                  <span className="font-bold text-[#52c41a] tabular-nums">
                    {formatNumber(Math.round(localTotal))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <label className="block">
            <span className="block text-[10px] text-[rgba(0,0,0,0.65)] mb-1">
              {t.proforma.notes}
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={cn(field, "h-auto py-2 resize-none leading-relaxed")}
            />
          </label>

          {touched && hasError && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#ff4d4f]">
              <AlertCircle className="size-3.5 shrink-0" />
              {t.products.fillRequired}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-md border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#0088ff] transition-colors"
            >
              {t.proforma.closeBtn}
            </button>
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs rounded-md bg-[#0088ff] text-white font-medium hover:bg-[#40a9ff] active:bg-[#007ae6] transition-colors"
            >
              <Printer className="size-4" />
              {t.proforma.printBtn}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProformaPrint({ data, rows, totals, mode, unit, onDone }: PrintProps) {
  const { t, formatNumber, dir, isRtl } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => window.print(), 250);
    const done = () => onDone();
    window.addEventListener("afterprint", done);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [onDone]);

  const modeInfo = getFreightMode(mode);
  const dateStr = new Date(data.issueDate).toLocaleDateString();
  const basisValue = data.rateBasis === "cbm" ? totals.totalCbm : totals.chargeableWeight;
  const basisLabel = data.rateBasis === "cbm" ? "CBM" : "Kg";
  const usdTotal = basisValue * data.freightRateUsd;
  const localTotal = data.dollarRate > 0 ? usdTotal * data.dollarRate : usdTotal;

  const items = useMemo(
    () =>
      rows
        .map((r) => {
          const info = getPackageType(r.type);
          let l = 0,
            w = 0,
            h = 0;
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
          const f = unit === "cm" ? 10 : 1;
          const typeName =
            r.type === "pallet"
              ? t.cbm.pallets[r.palletType] || r.palletType
              : t.cbm.types[r.type] || r.type;

          return {
            id: r.id,
            desc: typeName,
            dims:
              info.shape === "round"
                ? `⌀${formatNumber(l / f)} × ${formatNumber(h / f)}`
                : `${formatNumber(l / f)} × ${formatNumber(w / f)} × ${formatNumber(h / f)}`,
            qty: parseInt(r.quantity) || 0,
            weight: parseFloat(r.weight) || 0,
            totalWeight: (parseFloat(r.weight) || 0) * (parseInt(r.quantity) || 0),
          };
        })
        .filter((it) => it.qty > 0),
    [rows, unit, t, formatNumber]
  );

  const th = "border border-[#d9d9d9] bg-[#f5f5f5] p-2 text-[11px] font-semibold text-[#15354e]";
  const td = "border border-[#d9d9d9] p-2 text-[11px] text-[#15354e]";

  return createPortal(
    <div dir={dir} className="print-portal" style={{ fontFamily: "inherit" }}>
      <div className="max-w-[800px] mx-auto bg-white text-[#15354e] p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#15354e] pb-3 mb-4">
          <div>
            <h1 className="text-xl font-bold">{t.proforma.dialogTitle}</h1>
            <p className="text-[11px] mt-1 text-[rgba(0,0,0,0.65)]">
              {t.proforma.invoiceNo}: {data.invoiceNo} — {t.proforma.issueDate}: {dateStr}
            </p>
          </div>
          <div className={isRtl ? "text-left" : "text-right"}>
            <p className="text-sm font-bold">LoadCalc</p>
            <p className="text-[10px] text-[rgba(0,0,0,0.65)]">CBM & 3D Cargo Calculator</p>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-[#d9d9d9] rounded-sm p-3">
            <h2 className="text-[11px] font-bold mb-1.5 text-[#0088ff]">{t.proforma.issuerInfo}</h2>
            <p className="text-[11px] font-semibold">{data.issuerName}</p>
            {data.issuerPhone && (
              <p className="text-[11px] text-[rgba(0,0,0,0.65)] tabular-nums mt-0.5">
                {t.proforma.phone}: {data.issuerPhone}
              </p>
            )}
          </div>
          <div className="border border-[#d9d9d9] rounded-sm p-3">
            <h2 className="text-[11px] font-bold mb-1.5 text-[#0088ff]">{t.proforma.customerInfo}</h2>
            <p className="text-[11px] font-semibold">{data.customerName}</p>
            {data.customerPhone && (
              <p className="text-[11px] text-[rgba(0,0,0,0.65)] tabular-nums mt-0.5">
                {t.proforma.phone}: {data.customerPhone}
              </p>
            )}
          </div>
        </div>

        {/* Cargo Table */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className={cn(th, "w-8")}>#</th>
              <th className={th}>{t.products.name}</th>
              <th className={th}>
                {t.products.length} ({unit.toUpperCase()})
              </th>
              <th className={th}>{t.products.quantity}</th>
              <th className={th}>{t.products.weight} (kg)</th>
              <th className={th}>{t.cbm.grossWeight} (kg)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id}>
                <td className={cn(td, "text-center tabular-nums")}>{formatNumber(i + 1)}</td>
                <td className={cn(td, "font-medium")}>{it.desc}</td>
                <td className={cn(td, "tabular-nums text-center")}>{it.dims}</td>
                <td className={cn(td, "text-center tabular-nums")}>{formatNumber(it.qty)}</td>
                <td className={cn(td, "text-center tabular-nums")}>{formatNumber(it.weight, 1)}</td>
                <td className={cn(td, "text-center tabular-nums")}>
                  {formatNumber(Math.round(it.totalWeight))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary & Totals */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-[#d9d9d9] rounded-sm p-3 space-y-1.5 text-[11px]">
            <h2 className="font-bold text-[#0088ff] mb-1">{t.result.cargoList}</h2>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.cbm.quantity}:</span>
              <span className="font-semibold tabular-nums">{formatNumber(totals.totalPackages)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.cbm.totalCbm}:</span>
              <span className="font-semibold tabular-nums">
                {formatNumber(totals.totalCbm, 3)} m³
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.cbm.totalWeight}:</span>
              <span className="font-semibold tabular-nums">
                {formatNumber(Math.round(totals.totalWeight))} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.cbm.chargeableWeight}:</span>
              <span className="font-semibold tabular-nums">
                {formatNumber(Math.round(totals.chargeableWeight))} kg
              </span>
            </div>
          </div>

          <div className="border-2 border-[#15354e] rounded-sm p-3 space-y-1.5 text-[11px]">
            <h2 className="font-bold text-[#0088ff] mb-1">{t.proforma.freightCalculation}</h2>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.proforma.rateBasis}:</span>
              <span className="font-semibold tabular-nums">
                {formatNumber(basisValue, data.rateBasis === "cbm" ? 3 : 0)} {basisLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.proforma.rateUsd}:</span>
              <span className="font-semibold tabular-nums">
                ${formatNumber(data.freightRateUsd, 2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(0,0,0,0.65)]">{t.proforma.totalUsd}:</span>
              <span className="font-semibold tabular-nums">${formatNumber(Math.round(usdTotal))}</span>
            </div>
            {data.dollarRate > 0 && (
              <div className="flex justify-between border-t-2 border-[#15354e] pt-1.5 mt-1">
                <span className="font-bold text-sm">{t.proforma.totalLocal}:</span>
                <span className="font-bold text-sm tabular-nums">
                  {formatNumber(Math.round(localTotal))}
                </span>
              </div>
            )}
          </div>
        </div>

        {data.notes && (
          <div className="border border-[#d9d9d9] rounded-sm p-3 mb-4">
            <h2 className="text-[11px] font-bold text-[#0088ff] mb-1">{t.proforma.notes}</h2>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}

        <div className="border-t border-[#d9d9d9] pt-2.5 text-[10px] text-[rgba(0,0,0,0.65)] leading-relaxed">
          <p>{t.footer.disclaimer}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
