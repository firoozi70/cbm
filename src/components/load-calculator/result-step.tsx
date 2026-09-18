"use client";

import dynamic from "next/dynamic";
import { type ContainerSpec } from "@/lib/containers";
import { type MultiStuffingResult } from "@/lib/load-calculation";
import { type ProductRow, getProductDisplayName, isDefaultItemName } from "./products-step";
import { useTranslation } from "@/i18n/context";
import {
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Maximize2,
  Box,
  Layers3,
  Weight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  result: MultiStuffingResult;
  container: ContainerSpec;
  products?: ProductRow[];
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

export function ResultStep({ result, container, products, onBack, onRestart }: Props) {
  const { t, formatNumber, isRtl, locale } = useTranslation();
  const containerName = t.containers.items[container.id]?.name || container.nameEn;

  const getLocalizedWarning = (w: string) => {
    if (w.includes("استفاده از حجم پایین است") || w.includes("volume") || w.includes("Volume")) {
      const messages: Record<string, string> = {
        fa: "میزان استفاده از حجم پایین است. می‌توانید با تغییر اندازه یا ترکیب محصولات، بهینه‌تر چیدمان کنید.",
        en: "Volume utilization is low. Consider adjusting cargo dimensions or product mix to optimize loading.",
        ar: "نسبة استغلال الحجم منخفضة. يمكنك تحسين التحميل بتعديل الأبعاد أو مزيج البضائع.",
        zh: "容积利用率较低。建议调整货物尺寸或包装组合以优化装载。",
        ru: "Коэффициент использования объема низкий. Отрегулируйте размеры или состав груза для оптимизации.",
        es: "La utilización del volumen es baja. Considere ajustar las dimensiones o la mezcla de productos.",
        tr: "Hacim kullanım oranı düşük. Yük kombinasyonunu veya boyutları ayarlayarak yüklemeyi optimize edebilirsiniz.",
        de: "Die Volumenauslastung ist gering. Passen Sie Maße oder Ladungsmischung für eine bessere Auslastung an.",
        fr: "Le taux d'utilisation du volume est faible. Ajustez les dimensions ou la combinaison de produits.",
      };
      return messages[locale] || messages.en;
    }
    if (w.includes("وزن بار به حد مجاز") || w.includes("weight") || w.includes("Weight")) {
      const messages: Record<string, string> = {
        fa: "وزن بار به حد مجاز کانتینر نزدیک است؛ از بارگیری بیش از حد خودداری کنید.",
        en: "Cargo weight is near the container maximum payload limit; avoid overloading.",
        ar: "وزن البضائع قريب من الحمولة القصوى للحاوية؛ تجنب زيادة الوزن.",
        zh: "货物重量接近集装箱最大承载限制，请注意避免超载。",
        ru: "Вес груза близок к максимальной грузоподъемности контейнера; избегайте перегруза.",
        es: "El peso de la carga está cerca del límite máximo del contenedor; evite sobrecargas.",
        tr: "Yük ağırlığı konteyner sınırına yakın; aşırı yüklemeden kaçının.",
        de: "Das Ladungsgewicht liegt nahe der Nutzlastgrenze des Containers; Überladung vermeiden.",
        fr: "Le poids du fret est proche de la charge utile maximale; évitez les surcharges.",
      };
      return messages[locale] || messages.en;
    }
    if (w.includes("هیچ محصولی") || w.includes("No cargo") || w.includes("none")) {
      const messages: Record<string, string> = {
        fa: "هیچ محصولی در کانتینر نمی‌گنجد. ابعاد محصولات را بررسی کنید.",
        en: "No cargo fits within the selected container boundaries. Please check dimensions.",
        ar: "لا توجد بضائع تتسع داخل الحاوية المحددة. يرجى التحقق من الأبعاد.",
        zh: "所选集装箱无法容纳任何货物，请检查货物尺寸。",
        ru: "Ни один груз не помещается в контейнер. Проверьте габариты.",
        es: "Ninguna mercancía cabe en el contenedor seleccionado. Verifique las dimensiones.",
        tr: "Seçilen konteynere hiçbir ürün sığmıyor. Boyutları kontrol edin.",
        de: "Keine Ladung passt in den gewählten Container. Bitte Maße prüfen.",
        fr: "Aucun colis ne rentre dans le conteneur sélectionné. Veuillez vérifier les dimensions.",
      };
      return messages[locale] || messages.en;
    }
    if (w.includes("کارتن باقی می‌ماند") || w.includes("باقی") || w.includes("remain")) {
      const totalInput = result.totalInput;
      const totalPlaced = result.totalPlaced;
      const remaining = totalInput - totalPlaced;
      const messages: Record<string, string> = {
        fa: `از ${formatNumber(totalInput)} واحد واردشده، فقط ${formatNumber(totalPlaced)} واحد در کانتینر جا گرفت. ${formatNumber(remaining)} واحد باقی می‌ماند.`,
        en: `Out of ${formatNumber(totalInput)} total items, only ${formatNumber(totalPlaced)} fit into the container. ${formatNumber(remaining)} items remain.`,
        ar: `من أصل ${formatNumber(totalInput)} عنصر، تم تحميل ${formatNumber(totalPlaced)} فقط. تبقى ${formatNumber(remaining)} عنصر.`,
        zh: `在输入的 ${formatNumber(totalInput)} 件货物中，仅成功装入 ${formatNumber(totalPlaced)} 件，尚余 ${formatNumber(remaining)} 件。`,
        ru: `Из ${formatNumber(totalInput)} позиций загружено только ${formatNumber(totalPlaced)}. Осталось ${formatNumber(remaining)} шт.`,
        es: `De ${formatNumber(totalInput)} bultos ingresados, solo se cargaron ${formatNumber(totalPlaced)}. Quedan ${formatNumber(remaining)} restantes.`,
        tr: `Girilen ${formatNumber(totalInput)} üründen yalnızca ${formatNumber(totalPlaced)} yüklendi. ${formatNumber(remaining)} ürün kaldı.`,
        de: `Von ${formatNumber(totalInput)} Packstücken wurden nur ${formatNumber(totalPlaced)} geladen. ${formatNumber(remaining)} verbleiben.`,
        fr: `Sur ${formatNumber(totalInput)} colis saisis, seulement ${formatNumber(totalPlaced)} ont été chargés. ${formatNumber(remaining)} restent.`,
      };
      return messages[locale] || messages.en;
    }
    return w;
  };

  const getLocalizedOrientation = (label: string) => {
    if (!label || label === "—") return "—";
    const parts = label.split("×").map((s) => s.trim());
    if (parts.length !== 3) return label;

    const termMap: Record<string, Record<string, string>> = {
      طول: {
        fa: "طول",
        en: "Length",
        ar: "الطول",
        zh: "长",
        ru: "Длина",
        tr: "Uzunluk",
        es: "Largo",
        de: "Länge",
        fr: "Longueur",
      },
      عرض: {
        fa: "عرض",
        en: "Width",
        ar: "العرض",
        zh: "宽",
        ru: "Ширина",
        tr: "Genişlik",
        es: "Ancho",
        de: "Breite",
        fr: "Largeur",
      },
      ارتفاع: {
        fa: "ارتفاع",
        en: "Height",
        ar: "الارتفاع",
        zh: "高",
        ru: "Высота",
        tr: "Yükseklik",
        es: "Alto",
        de: "Höhe",
        fr: "Hauteur",
      },
    };

    const locParts = parts.map((part) => termMap[part]?.[locale] || termMap[part]?.en || part);
    return locParts.join(" × ");
  };

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
            {result.placements.map((p) => {
              const prod = products?.find((x) => x.id === p.productId);
              const prodIdx = products?.findIndex((x) => x.id === p.productId) ?? -1;
              const displayName = prod
                ? getProductDisplayName(prod, prodIdx >= 0 ? prodIdx : 0, t, locale, formatNumber)
                : (!isDefaultItemName(p.name)
                    ? p.name
                    : `${t.products.item} ${locale === "fa" ? formatNumber(1) : "1"}`);
              const dimLabel = locale === "fa" ? "ابعاد" : locale === "ar" ? "الأبعاد" : locale === "zh" ? "尺寸" : locale === "ru" ? "Размеры" : locale === "tr" ? "Boyutlar" : locale === "es" ? "Dimensiones" : locale === "de" ? "Maße" : locale === "fr" ? "Dimensions" : "Dimensions";
              const layoutLabel = locale === "fa" ? "چیدمان" : locale === "ar" ? "التوزيع" : locale === "zh" ? "排列" : locale === "ru" ? "Раскладка" : locale === "tr" ? "Düzen" : locale === "es" ? "Disposición" : locale === "de" ? "Anordnung" : locale === "fr" ? "Disposition" : "Layout";

              return (
                <div key={p.productId} className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-4 rounded-sm border border-[#d9d9d9] shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-xs font-semibold text-[#15354e] truncate">{displayName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#52c41a] bg-[#f6ffed] border border-[#b7eb8f] rounded-full px-2 py-0.5 shrink-0 tabular-nums">
                      {t.result.qtyPlaced}: {formatNumber(p.placed)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between bg-[#fafafa] rounded-sm px-2 py-1">
                      <span className="text-[rgba(0,0,0,0.45)]">{dimLabel}:</span>
                      <span className="tabular-nums font-medium text-[#15354e]">
                        {formatNumber(p.effLength, 0)}×{formatNumber(p.effWidth, 0)}×{formatNumber(p.effHeight, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between bg-[#fafafa] rounded-sm px-2 py-1">
                      <span className="text-[rgba(0,0,0,0.45)]">{layoutLabel}:</span>
                      <span className="tabular-nums font-medium text-[#15354e]">
                        {formatNumber(p.layoutL)}×{formatNumber(p.layoutW)}×{formatNumber(p.layoutH)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    {locale === "fa" ? "ابعاد (سانتی‌متر)" : locale === "ar" ? "الأبعاد (سم)" : locale === "zh" ? "尺寸 (cm)" : locale === "ru" ? "Размеры (см)" : locale === "tr" ? "Boyutlar (cm)" : locale === "es" ? "Dimensiones (cm)" : locale === "de" ? "Maße (cm)" : locale === "fr" ? "Dimensions (cm)" : "Dimensions (cm)"}
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    {locale === "fa" ? "چیدمان (ط×ع×ا)" : locale === "ar" ? "التوزيع (ط×ع×ا)" : locale === "zh" ? "排列 (长×宽×高)" : locale === "ru" ? "Раскладка (Д×Ш×В)" : locale === "tr" ? "Düzen (U×G×Y)" : locale === "es" ? "Disposición (L×A×A)" : locale === "de" ? "Anordnung (L×B×H)" : locale === "fr" ? "Disposition (L×L×H)" : "Layout (L×W×H)"}
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
                    {locale === "fa" ? "باقیمانده" : locale === "ar" ? "المتبقي" : locale === "zh" ? "剩余" : locale === "ru" ? "Остаток" : locale === "tr" ? "Kalan" : locale === "es" ? "Restante" : locale === "de" ? "Verbleibend" : locale === "fr" ? "Restant" : "Remaining"}
                  </th>
                  <th
                    className={cn(
                      "p-2.5 font-semibold text-[rgba(0,0,0,0.65)]",
                      isRtl ? "text-right" : "text-left"
                    )}
                  >
                    {locale === "fa" ? "جهت" : locale === "ar" ? "الاتجاه" : locale === "zh" ? "摆放方向" : locale === "ru" ? "Ориентация" : locale === "tr" ? "Yönlendirme" : locale === "es" ? "Orientación" : locale === "de" ? "Ausrichtung" : locale === "fr" ? "Orientation" : "Orientation"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {result.placements.map((p) => {
                  const prod = products?.find((x) => x.id === p.productId);
                  const prodIdx = products?.findIndex((x) => x.id === p.productId) ?? -1;
                  const displayName = prod
                    ? getProductDisplayName(prod, prodIdx >= 0 ? prodIdx : 0, t, locale, formatNumber)
                    : (!isDefaultItemName(p.name)
                        ? p.name
                        : `${t.products.item} ${locale === "fa" ? formatNumber(1) : "1"}`);
                  return (
                    <tr key={p.productId} className="hover:bg-[#fafafa]">
                      <td className="p-2.5">
                        <div
                          className="size-4 rounded-sm border border-[#d9d9d9]"
                          style={{ backgroundColor: p.color }}
                        />
                      </td>
                      <td className="p-2.5 text-[#15354e] font-medium">{displayName}</td>
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
                        {getLocalizedOrientation(p.orientationLabel)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="border border-[#ffe58f] bg-[#fffbe6] rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-[#faad14]" />
              <h4 className="text-xs font-semibold text-[#d48806]">
                {locale === "fa" ? "هشدارها و نکات چیدمان" : locale === "ar" ? "تنبيهات وملاحظات" : locale === "zh" ? "装载警告与提示" : locale === "ru" ? "Предупреждения и рекомендации" : locale === "tr" ? "Uyarılar ve İpuçları" : locale === "de" ? "Warnungen & Hinweise" : locale === "fr" ? "Avertissements & Conseils" : locale === "es" ? "Alertas y Advertencias" : "Warnings & Alerts"}
              </h4>
            </div>
            <ul className="space-y-1.5">
              {result.warnings.map((w, i) => (
                <li key={i} className="text-xs text-[#ad6800] flex items-start gap-1.5">
                  <span className="text-[#faad14] mt-0.5">•</span>
                  <span className="leading-relaxed">{getLocalizedWarning(w)}</span>
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
