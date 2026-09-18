"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { PRODUCT_TYPES } from "@/lib/containers";
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

interface Props {
  groups: Group[];
  products: ProductRow[];
  setGroups: (g: Group[]) => void;
  setProducts: (p: ProductRow[]) => void;
  usePallets: boolean;
  setUsePallets: (v: boolean) => void;
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

export function ProductsStep({
  groups,
  products,
  setGroups,
  setProducts,
  usePallets,
  setUsePallets,
  onNext,
}: Props) {
  const { t, formatNumber, isRtl, locale } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addGroup = () => {
    const numG = locale === "fa" ? formatNumber(groups.length + 1) : String(groups.length + 1);
    const numP = locale === "fa" ? formatNumber(products.length + 1) : String(products.length + 1);
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      name: `${t.products.group} ${numG}`,
      isCustomName: false,
    };
    setGroups([...groups, newGroup]);
    setProducts([
      ...products,
      {
        id: `prod-${Date.now()}`,
        groupId: newGroup.id,
        type: "Boxes",
        name: `${t.products.item} ${numP}`,
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
    const num = locale === "fa" ? formatNumber(products.length + 1) : String(products.length + 1);
    const newProd: ProductRow = {
      id: `prod-${Date.now()}`,
      groupId,
      type: "Boxes",
      name: `${t.products.item} ${num}`,
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

  const updateProduct = (id: string, field: keyof ProductRow, value: string | boolean) => {
    setProducts(
      products.map((p) => {
        if (p.id !== id) return p;
        if (field === "name") {
          const strVal = String(value);
          return {
            ...p,
            name: strVal,
            isCustomName: strVal.trim().length > 0,
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
      { ...prod, id: `prod-${Date.now()}`, name: `${prod.name} (Copy)`, isCustomName: true },
    ]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
    setProducts(products.filter((p) => p.groupId !== groupId));
  };

  const renameGroup = (groupId: string, name: string) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, name, isCustomName: name.trim().length > 0 }
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
          (g: { id?: string; name?: string }, i: number) => {
            const id = `grp-${stamp}-${i}`;
            idMap.set(String(g.id), id);
            return { id, name: String(g.name ?? `${t.products.group} ${i + 1}`) };
          }
        );
        const importedProducts: ProductRow[] = data.products.map(
          (p: Record<string, unknown>, i: number) => {
            const type = validTypes.includes(String(p.type)) ? String(p.type) : "Boxes";
            const num = (v: unknown, def = "0") => {
              const n = parseFloat(String(v));
              return Number.isFinite(n) && n >= 0 ? String(n) : def;
            };
            return {
              id: `prod-${stamp}-${i}`,
              groupId: idMap.get(String(p.groupId)) ?? importedGroups[0].id,
              type,
              name: String(p.name ?? `${t.products.item} ${i + 1}`).slice(0, 60),
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
      {groups.map((group) => {
        const groupProducts = products.filter((p) => p.groupId === group.id);
        return (
          <div key={group.id} className="border-b border-[#e8e8e8] last:border-0">
            {/* Group Header */}
            <div className="flex items-center justify-between gap-2 p-3 bg-[#f8fafc] border-b border-[#e8e8e8]">
              <div className="flex items-center gap-2 flex-1">
                <Lock className="size-4 text-[#0088ff]" />
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => renameGroup(group.id, e.target.value)}
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
              {groupProducts.map((p) => (
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
                    value={p.name}
                    onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                    placeholder={t.products.name}
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
              ))}
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
