"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { PRODUCT_TYPES } from "@/lib/containers";
import { PALLET_TYPES, getPalletType } from "@/lib/cbm";
import { useTranslation } from "@/i18n/context";
import { Plus, Copy, Trash2, ChevronDown, Download, Upload, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface ProductRow {
  id: string;
  groupId: string;
  type: string;
  name: string;
  isCustomName?: boolean;
  length: string; // mm
  width: string;
  height: string;
  weight: string; // kg
  quantity: string;
  color: string;
  stackable: boolean;
  maxStack: string;
}

export interface Group {
  id: string;
  name: string;
  isCustomName?: boolean;
}

export const ALL_ITEM_WORDS = [
  "ردیف", "item", "البند", "项", "позиция", "ítem", "kalem", "position",
  "ligne", "artikel", "article", "öğe", "عنصر", "الردیف", "条目"
];

export const ALL_GROUP_WORDS = [
  "گروه", "group", "المجموعة", "مجموعة", "组", "分组", "группа",
  "grupo", "grup", "gruppe", "groupe"
];

export function isDefaultItemName(name?: string): boolean {
  if (!name || !name.trim()) return true;
  const lower = name.trim().toLowerCase();
  return ALL_ITEM_WORDS.some((w) => lower.startsWith(w));
}

export function isDefaultGroupName(name?: string): boolean {
  if (!name || !name.trim()) return true;
  const lower = name.trim().toLowerCase();
  return ALL_GROUP_WORDS.some((w) => lower.startsWith(w));
}

export function getProductDisplayName(
  p: { name?: string; isCustomName?: boolean },
  index: number,
  t: { products: { item: string } },
  locale: string,
  formatNumber: (n: number) => string
): string {
  if (p.isCustomName && p.name && !isDefaultItemName(p.name)) {
    return p.name;
  }
  const numStr = locale === "fa" ? formatNumber(index + 1) : String(index + 1);
  return `${t.products.item} ${numStr}`;
}

export function getGroupDisplayName(
  g: { name?: string; isCustomName?: boolean },
  index: number,
  t: { products: { group: string } },
  locale: string,
  formatNumber: (n: number) => string
): string {
  if (g.isCustomName && g.name && !isDefaultGroupName(g.name)) {
    return g.name;
  }
  const numStr = locale === "fa" ? formatNumber(index + 1) : String(index + 1);
  return `${t.products.group} ${numStr}`;
}

interface Props {
  groups: Group[];
  products: ProductRow[];
  setGroups: (g: Group[]) => void;
  setProducts: (p: ProductRow[]) => void;
  usePallets: boolean;
  setUsePallets: (v: boolean) => void;
  palletType?: string;
  setPalletType?: (v: string) => void;
  onNext: () => void;
  onBack?: () => void;
}

const DEFAULT_COLORS = [
  "#0088ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
  "#a0d911",
  "#2f54eb",
];

function PalletIllustration({
  lengthMm = 1200,
  widthMm = 800,
  heightMm = 144,
}: {
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center p-3 bg-[#fdfbf7] rounded-lg border border-[#ebd8c1] shadow-xs select-none w-full">
      <svg
        viewBox="0 0 280 160"
        className="w-full max-w-[240px] h-auto drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow under pallet */}
        <ellipse cx="140" cy="142" rx="105" ry="13" fill="#000000" fillOpacity="0.08" />

        {/* Bottom deck runners (3 runners) */}
        <path d="M50 120 L95 138 L100 135 L55 117 Z" fill="#8c6239" />
        <path d="M95 138 L200 102 L205 99 L100 135 Z" fill="#a67941" />
        <path d="M85 108 L130 126 L135 123 L90 105 Z" fill="#8c6239" />
        <path d="M130 126 L235 90 L240 87 L135 123 Z" fill="#a67941" />

        {/* 9 Solid spacer blocks with forklift pockets */}
        <path d="M50 108 L66 114 L66 120 L50 114 Z" fill="#8c6239" />
        <path d="M66 114 L80 109 L80 115 L66 120 Z" fill="#a67941" />
        <path d="M50 108 L66 114 L80 109 L64 103 Z" fill="#cba16c" />

        <path d="M90 123 L106 129 L106 135 L90 129 Z" fill="#8c6239" />
        <path d="M106 129 L120 124 L120 130 L106 135 Z" fill="#a67941" />
        <path d="M90 123 L106 129 L120 124 L104 118 Z" fill="#cba16c" />

        <path d="M190 89 L206 95 L206 101 L190 95 Z" fill="#8c6239" />
        <path d="M206 95 L220 90 L220 96 L206 101 Z" fill="#a67941" />
        <path d="M190 89 L206 95 L220 90 L204 84 Z" fill="#cba16c" />

        <path d="M125 79 L141 85 L141 91 L125 85 Z" fill="#8c6239" />
        <path d="M141 85 L155 80 L155 86 L141 91 Z" fill="#a67941" />
        <path d="M125 79 L141 85 L155 80 L139 74 Z" fill="#cba16c" />

        <path d="M225 55 L241 61 L241 67 L225 61 Z" fill="#8c6239" />
        <path d="M241 61 L255 56 L255 62 L241 67 Z" fill="#a67941" />
        <path d="M225 55 L241 61 L255 56 L239 50 Z" fill="#cba16c" />

        {/* Stringer cross boards */}
        <path d="M48 104 L105 126 L235 81 L178 59 Z" fill="#b98a54" opacity="0.4" />

        {/* 5 Top Deck Slats */}
        <path d="M45 100 L175 55 L190 60 L60 105 Z" fill="#d8af7a" stroke="#b3874f" strokeWidth="0.75" />
        <path d="M45 100 L60 105 L60 108 L45 103 Z" fill="#a67941" />
        <path d="M60 105 L190 60 L190 63 L60 108 Z" fill="#8c6239" />

        <path d="M63 106 L193 61 L206 66 L76 111 Z" fill="#dfb784" stroke="#b3874f" strokeWidth="0.75" />
        <path d="M63 106 L76 111 L76 114 L63 109 Z" fill="#a67941" />
        <path d="M76 111 L206 66 L206 69 L76 114 Z" fill="#8c6239" />

        <path d="M79 112 L209 67 L222 72 L92 117 Z" fill="#d8af7a" stroke="#b3874f" strokeWidth="0.75" />
        <path d="M79 112 L92 117 L92 120 L79 115 Z" fill="#a67941" />
        <path d="M92 117 L222 72 L222 75 L92 120 Z" fill="#8c6239" />

        <path d="M95 118 L225 73 L238 78 L108 123 Z" fill="#dfb784" stroke="#b3874f" strokeWidth="0.75" />
        <path d="M95 118 L108 123 L108 126 L95 121 Z" fill="#a67941" />
        <path d="M108 123 L238 78 L238 81 L108 126 Z" fill="#8c6239" />

        <path d="M111 124 L241 79 L254 84 L124 129 Z" fill="#d8af7a" stroke="#b3874f" strokeWidth="0.75" />
        <path d="M111 124 L124 129 L124 132 L111 127 Z" fill="#a67941" />
        <path d="M124 129 L254 84 L254 87 L124 132 Z" fill="#8c6239" />

        {/* EUR / EPAL Stamp Markings */}
        <rect x="68" y="115" width="8" height="4" rx="1" fill="#7a4e23" fillOpacity="0.7" />
        <rect x="110" y="130" width="8" height="4" rx="1" fill="#7a4e23" fillOpacity="0.7" />

        {/* Dimension indicator lines */}
        <path d="M35 104 L165 59" stroke="#0088ff" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M172 52 L245 77" stroke="#52c41a" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>

      {/* Dimension badges */}
      <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-[#ebd8c1] text-[11px] font-semibold text-[#8c6239] tabular-nums">
        <span className="text-[#0088ff]">{lengthMm} mm L</span>
        <span className="text-[#52c41a]">{widthMm} mm W</span>
        <span className="text-[#b97a38]">{heightMm} mm H</span>
      </div>
    </div>
  );
}

export function ProductsStep({
  groups,
  products,
  setGroups,
  setProducts,
  usePallets,
  setUsePallets,
  palletType = "eur",
  setPalletType,
  onNext,
}: Props) {
  const { t, formatNumber, isRtl, locale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPallet = getPalletType(palletType || "eur");
  const showPalletSection = usePallets || products.some((p) => p.type === "Pallets");

  const addGroup = () => {
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      name: "",
      isCustomName: false,
    };
    setGroups([...groups, newGroup]);
    setProducts([
      ...products,
      {
        id: `prod-${Date.now()}`,
        groupId: newGroup.id,
        type: "Boxes",
        name: "",
        isCustomName: false,
        length: "500",
        width: "400",
        height: "300",
        weight: "10",
        quantity: "80",
        color: DEFAULT_COLORS[products.length % DEFAULT_COLORS.length],
        stackable: true,
        maxStack: "0",
      },
    ]);
  };

  const addProduct = (groupId: string) => {
    const newProd: ProductRow = {
      id: `prod-${Date.now()}`,
      groupId,
      type: "Boxes",
      name: "",
      isCustomName: false,
      length: "500",
      width: "400",
      height: "300",
      weight: "10",
      quantity: "10",
      color: DEFAULT_COLORS[products.length % DEFAULT_COLORS.length],
      stackable: true,
      maxStack: "0",
    };
    setProducts([...products, newProd]);
  };

  const updateProduct = (
    id: string,
    field: keyof ProductRow,
    value: string | boolean,
    isCustomNameParam?: boolean
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id !== id) return p;
        if (field === "name") {
          const strVal = String(value);
          const isCustom =
            isCustomNameParam !== undefined
              ? isCustomNameParam
              : strVal.trim().length > 0 && !isDefaultItemName(strVal);
          return {
            ...p,
            name: strVal,
            isCustomName: isCustom,
          };
        }
        return { ...p, [field]: value };
      })
    );
  };

  const duplicateProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setProducts([
      ...products,
      { ...prod, id: `prod-${Date.now()}`, name: `${prod.name || t.products.item} (Copy)`, isCustomName: true },
    ]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
    setProducts(products.filter((p) => p.groupId !== groupId));
  };

  const renameGroup = (groupId: string, name: string, isCustom = true) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              name,
              isCustomName: isCustom && name.trim().length > 0 && !isDefaultGroupName(name),
            }
          : g
      )
    );
  };

  const hasProducts = products.length > 0;

  /* ---------- Export & Import JSON ---------- */
  const handleExport = () => {
    try {
      const data = {
        app: "load-calculator",
        version: 1,
        exportedAt: new Date().toISOString(),
        groups,
        products,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cargo-manifest-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: t.products.exportExcel, description: "Cargo file exported successfully." });
    } catch {
      toast({ title: "Export Error", variant: "destructive" });
    }
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (
          !Array.isArray(data.groups) ||
          !Array.isArray(data.products) ||
          data.products.length === 0
        ) {
          throw new Error("bad format");
        }
        const validTypes = PRODUCT_TYPES.map((pt) => pt.en);
        const stamp = Date.now();
        const idMap = new Map<string, string>();
        const importedGroups: Group[] = data.groups.map(
          (g: { id?: string; name?: string; isCustomName?: boolean }, i: number) => {
            const id = `grp-${stamp}-${i}`;
            idMap.set(String(g.id), id);
            const rawName = String(g.name ?? "");
            const isCustom =
              g.isCustomName !== undefined
                ? Boolean(g.isCustomName)
                : rawName.trim().length > 0 && !isDefaultGroupName(rawName);
            return { id, name: rawName, isCustomName: isCustom };
          }
        );
        const importedProducts: ProductRow[] = data.products.map(
          (p: Record<string, unknown>, i: number) => {
            const type = validTypes.includes(String(p.type)) ? String(p.type) : "Boxes";
            const num = (v: unknown, def = "0") => {
              const n = parseFloat(String(v));
              return Number.isFinite(n) && n >= 0 ? String(n) : def;
            };
            const rawName = String(p.name ?? "").slice(0, 60);
            const isCustom =
              p.isCustomName !== undefined
                ? Boolean(p.isCustomName)
                : rawName.trim().length > 0 && !isDefaultItemName(rawName);
            return {
              id: `prod-${stamp}-${i}`,
              groupId: idMap.get(String(p.groupId)) ?? importedGroups[0].id,
              type,
              name: rawName,
              isCustomName: isCustom,
              length: num(p.length, "500"),
              width: num(p.width, "400"),
              height: num(p.height, "300"),
              weight: num(p.weight, "10"),
              quantity: num(p.quantity, "1"),
              color: /^#[0-9a-fA-F]{6}$/.test(String(p.color)) ? String(p.color) : "#0088ff",
              stackable: Boolean(p.stackable),
              maxStack: num(p.maxStack, "0"),
            };
          }
        );
        setGroups(importedGroups);
        setProducts(importedProducts);
        toast({
          title: t.products.importExcel,
          description: `${formatNumber(importedProducts.length)} items loaded.`,
        });
      } catch {
        toast({
          title: "Invalid file",
          description: "Please provide a valid JSON manifest file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-sm shadow-xs">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addGroup}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#0088ff] hover:text-[#40a9ff] px-2.5 py-1.5 rounded-md hover:bg-[#e6f7ff] transition-colors"
          >
            <Plus className="size-4" />
            {t.products.addGroup}
          </button>
          <span className="text-[#d9d9d9]">|</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2.5 py-1.5 rounded-md hover:bg-white transition-colors"
          >
            <Upload className="size-4" />
            {t.products.importExcel}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2.5 py-1.5 rounded-md hover:bg-white transition-colors"
          >
            <Download className="size-4" />
            {t.products.exportExcel}
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-[rgba(0,0,0,0.75)] font-medium select-none">
          <input
            type="checkbox"
            checked={usePallets}
            onChange={(e) => setUsePallets(e.target.checked)}
            className="size-4 accent-[#0088ff] rounded"
          />
          {t.products.usePallets}
        </label>
      </div>

      {/* Cargo Groups */}
      {groups.map((group, groupIdx) => {
        const groupProducts = products.filter((p) => p.groupId === group.id);
        const defaultGroupName = getGroupDisplayName({ isCustomName: false }, groupIdx, t, locale, formatNumber);
        const displayGroupName = getGroupDisplayName(group, groupIdx, t, locale, formatNumber);

        return (
          <div key={group.id} className="border-b border-[#e8e8e8] last:border-0">
            {/* Group Header */}
            <div className="flex items-center justify-between gap-2 p-3 bg-[#f8fafc] border-b border-[#e8e8e8]">
              <div className="flex items-center gap-2 flex-1">
                <Lock className="size-4 text-[#0088ff]" />
                <input
                  type="text"
                  value={displayGroupName}
                  placeholder={defaultGroupName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isCustom = val.trim().length > 0 && !isDefaultGroupName(val);
                    renameGroup(group.id, val, isCustom);
                  }}
                  className="bg-transparent border-0 text-sm font-semibold text-[#15354e] focus:outline-none focus:ring-1 focus:ring-[#0088ff] rounded px-1"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] p-1.5 rounded transition-colors"
                  title="Remove group"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {/* Desktop Column Headers */}
            <div className="hidden lg:grid grid-cols-[130px_1fr_90px_90px_90px_90px_80px_50px_50px_45px] gap-2 p-2.5 bg-white text-xs font-semibold text-[rgba(0,0,0,0.65)] border-b border-[#f0f0f0]">
              <div>{t.products.type}</div>
              <div>{t.products.name}</div>
              <div>{t.products.length}</div>
              <div>{t.products.width}</div>
              <div>{t.products.height}</div>
              <div>{t.products.weight}</div>
              <div>{t.products.quantity}</div>
              <div className="text-center">{t.products.color}</div>
              <div className="text-center">{t.products.stackable}</div>
              <div></div>
            </div>

            {/* Product Rows */}
            <div className="divide-y divide-[#f0f0f0]">
              {groupProducts.length === 0 && (
                <div className="p-6 text-center text-sm text-[rgba(0,0,0,0.45)]">
                  {t.products.fillRequired}
                </div>
              )}
              {groupProducts.map((p, pIdx) => {
                const globalIndex = products.findIndex((x) => x.id === p.id);
                const displayIdx = globalIndex >= 0 ? globalIndex : pIdx;
                const defaultProdName = getProductDisplayName({ isCustomName: false }, displayIdx, t, locale, formatNumber);
                const displayProdName = getProductDisplayName(p, displayIdx, t, locale, formatNumber);

                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-2 lg:grid-cols-[130px_1fr_90px_90px_90px_90px_80px_50px_50px_45px] gap-2 p-2.5 items-center bg-white hover:bg-[#fafafa] transition-colors"
                  >
                    {/* Type */}
                    <div className="relative col-span-2 lg:col-span-1">
                      <select
                        value={p.type}
                        onChange={(e) => updateProduct(p.id, "type", e.target.value)}
                        className={cn(
                          "w-full h-8 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none bg-white appearance-none",
                          isRtl ? "pr-2 pl-7" : "pl-2 pr-7"
                        )}
                      >
                        {PRODUCT_TYPES.map((pt) => (
                          <option key={pt.en} value={pt.en}>
                            {t.products.productTypes[pt.en] || pt.en}
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

                    {/* Name */}
                    <input
                      type="text"
                      value={displayProdName}
                      placeholder={defaultProdName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isCustom = val.trim().length > 0 && !isDefaultItemName(val);
                        updateProduct(p.id, "name", val, isCustom);
                      }}
                      className="col-span-2 lg:col-span-1 h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none"
                    />

                  {/* Length */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">
                      {t.products.length}
                    </span>
                    <input
                      type="number"
                      value={p.length}
                      onChange={(e) => updateProduct(p.id, "length", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Width */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">
                      {t.products.width}
                    </span>
                    <input
                      type="number"
                      value={p.width}
                      onChange={(e) => updateProduct(p.id, "width", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">
                      {t.products.height}
                    </span>
                    <input
                      type="number"
                      value={p.height}
                      onChange={(e) => updateProduct(p.id, "height", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">
                      {t.products.weight}
                    </span>
                    <input
                      type="number"
                      value={p.weight}
                      onChange={(e) => updateProduct(p.id, "weight", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">
                      {t.products.quantity}
                    </span>
                    <input
                      type="number"
                      value={p.quantity}
                      onChange={(e) => updateProduct(p.id, "quantity", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Color */}
                  <div className="flex justify-center">
                    <input
                      type="color"
                      value={p.color}
                      onChange={(e) => updateProduct(p.id, "color", e.target.value)}
                      className="size-8 border border-[#d9d9d9] rounded-sm cursor-pointer p-0.5 bg-white"
                      title={t.products.color}
                    />
                  </div>

                  {/* Stackable */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => updateProduct(p.id, "stackable", !p.stackable)}
                      className={cn(
                        "size-8 inline-flex items-center justify-center rounded-sm border transition-colors",
                        p.stackable
                          ? "bg-[#52c41a]/10 border-[#52c41a] text-[#52c41a]"
                          : "bg-white border-[#d9d9d9] text-[rgba(0,0,0,0.45)]"
                      )}
                      title={t.products.stackable}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="2" y="9" width="12" height="4" rx="0.5" />
                        <rect x="3" y="4" width="10" height="3" rx="0.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Action icons */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => duplicateProduct(p.id)}
                      className="text-[rgba(0,0,0,0.45)] hover:text-[#0088ff] p-1.5 rounded transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] p-1.5 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Add Product Line */}
            <div className="p-2.5 bg-[#fafafa] border-t border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => addProduct(group.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0088ff] hover:text-[#40a9ff] px-3 py-1.5 rounded-md hover:bg-[#e6f7ff] transition-colors"
              >
                <Plus className="size-3.5" />
                {t.products.addCargo}
              </button>
            </div>
          </div>
        );
      })}

      {/* Pallet Configuration & Preview Card (Appears under cargo when usePallets is enabled or Pallet type is selected) */}
      {showPalletSection && (
        <div className="m-3 sm:m-4 p-4 rounded-lg border-2 border-[#ebd8c1] bg-[#fdfbf7] shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Visual Pallet Diagram / Image */}
            <div className="w-full md:w-[260px] shrink-0">
              <PalletIllustration
                lengthMm={currentPallet.length || 1200}
                widthMm={currentPallet.width || 800}
                heightMm={144}
              />
              <div className="text-center mt-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold text-[#8c6239] bg-[#f4e8da] rounded-full border border-[#d8be9b]">
                  {currentPallet.en} • {currentPallet.length || 1200} × {currentPallet.width || 800} × 144 mm
                </span>
              </div>
            </div>

            {/* Pallet Standard Selector & Details */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between border-b border-[#ebd8c1] pb-2">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#d4a373]" />
                  <h4 className="text-sm font-bold text-[#4a3018]">
                    {locale === "fa"
                      ? "مشخصات و ابعاد پالت استاندارد"
                      : locale === "ar"
                      ? "مواصفات ومعايير الطبلية الخشبية"
                      : "Standard Wooden Pallet Specifications"}
                  </h4>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#8c6239] hover:text-[#5c3e21]">
                  <input
                    type="checkbox"
                    checked={usePallets}
                    onChange={(e) => setUsePallets(e.target.checked)}
                    className="size-4 accent-[#8c6239] rounded"
                  />
                  {locale === "fa" ? "فعال‌سازی چیدمان پالت روی کف" : "Enable floor pallet loading"}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[rgba(0,0,0,0.65)] mb-1">
                    {locale === "fa"
                      ? "نوع استاندارد پالت:"
                      : locale === "ar"
                      ? "نوع الطبلية القياسية:"
                      : "Pallet Standard:"}
                  </label>
                  <select
                    value={palletType}
                    onChange={(e) => setPalletType && setPalletType(e.target.value)}
                    className="w-full h-9 px-3 text-xs sm:text-sm font-medium bg-white border border-[#d8be9b] rounded-md focus:outline-none focus:border-[#8c6239] focus:ring-1 focus:ring-[#8c6239] text-[#2c1d0f]"
                  >
                    {PALLET_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>
                        {pt.en} {pt.length > 0 ? `(${pt.length} × ${pt.width} mm)` : ""} - {locale === "fa" ? pt.fa : pt.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded border border-[#ebd8c1] text-center">
                    <div className="text-[10px] text-[rgba(0,0,0,0.45)]">
                      {locale === "fa" ? "طول" : "Length"}
                    </div>
                    <div className="text-xs font-bold text-[#4a3018] tabular-nums">
                      {formatNumber(currentPallet.length || 1200)} mm
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#ebd8c1] text-center">
                    <div className="text-[10px] text-[rgba(0,0,0,0.45)]">
                      {locale === "fa" ? "عرض" : "Width"}
                    </div>
                    <div className="text-xs font-bold text-[#4a3018] tabular-nums">
                      {formatNumber(currentPallet.width || 800)} mm
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#ebd8c1] text-center">
                    <div className="text-[10px] text-[rgba(0,0,0,0.45)]">
                      {locale === "fa" ? "ارتفاع" : "Height"}
                    </div>
                    <div className="text-xs font-bold text-[#4a3018] tabular-nums">
                      144 mm
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-[#705233] bg-[#f7efdc] p-2 rounded border border-[#e6d3ba] gap-2">
                <span>
                  {locale === "fa"
                    ? "⚖️ وزن خالص پالت: ۲۵ کیلوگرم | بارها مستقیماً روی رویه چوبی پالت چیده می‌شوند"
                    : "⚖️ Pallet Tare: 25 kg | Goods are loaded directly onto pallet surface"}
                </span>
                <span className="font-medium text-[#4a3018]">
                  {currentPallet.note && (locale === "fa" ? currentPallet.note : currentPallet.en)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Next Step */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-[#e8e8e8] bg-[#fafafa]">
        <button
          type="button"
          onClick={onNext}
          disabled={!hasProducts}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0088ff] hover:bg-[#40a9ff] active:bg-[#007ae6] text-white text-sm font-semibold rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.products.nextToContainers}
        </button>
      </div>
    </div>
  );
}
