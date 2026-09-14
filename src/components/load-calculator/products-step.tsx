"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { faNumber, PRODUCT_TYPES } from "@/lib/containers";
import { Plus, Copy, Trash2, ChevronDown, Link2, Download, Upload, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface ProductRow {
  id: string;
  groupId: string;
  type: string; // Boxes, Sacks, Big bags, etc
  name: string;
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
  "#0088ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1",
  "#13c2c2", "#eb2f96", "#fa8c16", "#a0d911", "#2f54eb",
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
  const [openType, setOpenType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addGroup = () => {
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      name: `گروه ${faNumber(groups.length + 1)}`,
    };
    setGroups([...groups, newGroup]);
    setProducts([
      ...products,
      {
        id: `prod-${Date.now()}`,
        groupId: newGroup.id,
        type: "Boxes",
        name: `کارتن ${faNumber(products.length + 1)}`,
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
      name: `محصول ${faNumber(products.length + 1)}`,
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
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const duplicateProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setProducts([
      ...products,
      { ...prod, id: `prod-${Date.now()}`, name: `${prod.name} (کپی)` },
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
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, name } : g)));
  };

  const hasProducts = products.length > 0;

  /* ---------- خروجی و ورود JSON ---------- */
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
      a.download = `load-products-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "خروجی گرفته شد", description: "فایل محصولات با موفقیت ذخیره شد." });
    } catch {
      toast({ title: "خطا در گرفتن خروجی", variant: "destructive" });
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
        if (!Array.isArray(data.groups) || !Array.isArray(data.products) || data.products.length === 0) {
          throw new Error("bad format");
        }
        const validTypes = PRODUCT_TYPES.map((t) => t.en);
        const stamp = Date.now();
        const idMap = new Map<string, string>();
        const importedGroups: Group[] = data.groups.map((g: { id?: string; name?: string }, i: number) => {
          const id = `grp-${stamp}-${i}`;
          idMap.set(String(g.id), id);
          return { id, name: String(g.name ?? `گروه ${i + 1}`) };
        });
        const importedProducts: ProductRow[] = data.products.map((p: Record<string, unknown>, i: number) => {
          const type = validTypes.includes(String(p.type)) ? String(p.type) : "Boxes";
          const num = (v: unknown, def = "0") => {
            const n = parseFloat(String(v));
            return Number.isFinite(n) && n >= 0 ? String(n) : def;
          };
          return {
            id: `prod-${stamp}-${i}`,
            groupId: idMap.get(String(p.groupId)) ?? importedGroups[0].id,
            type,
            name: String(p.name ?? `محصول ${i + 1}`).slice(0, 60),
            length: num(p.length, "500"),
            width: num(p.width, "400"),
            height: num(p.height, "300"),
            weight: num(p.weight, "10"),
            quantity: num(p.quantity, "1"),
            color: /^#[0-9a-fA-F]{6}$/.test(String(p.color)) ? String(p.color) : "#0088ff",
            stackable: Boolean(p.stackable),
            maxStack: num(p.maxStack, "0"),
          };
        });
        setGroups(importedGroups);
        setProducts(importedProducts);
        toast({
          title: "محصولات وارد شد",
          description: `${faNumber(importedProducts.length)} محصول از فایل خوانده شد.`,
        });
      } catch {
        toast({
          title: "فایل نامعتبر است",
          description: "فقط فایل خروجی همین ابزار (JSON) پذیرفته می‌شود.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-sm">
      {/* تولبار بالای جدول */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <button
          type="button"
          onClick={addGroup}
          className="inline-flex items-center gap-1.5 text-sm text-[#0088ff] hover:text-[#40a9ff] px-2 py-1 rounded transition-colors"
        >
          <Plus className="size-4" />
          افزودن گروه
        </button>
        <span className="text-[#d9d9d9]">|</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-sm text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2 py-1 rounded transition-colors min-h-[44px]"
        >
          <Upload className="size-4" />
          ورود (Import)
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
          className="inline-flex items-center gap-1.5 text-sm text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] px-2 py-1 rounded transition-colors min-h-[44px]"
        >
          <Download className="size-4" />
          خروجی (Export)
        </button>
      </div>

      {/* گروه‌ها */}
      {groups.map((group) => {
        const groupProducts = products.filter((p) => p.groupId === group.id);
        return (
          <div key={group.id} className="border-b border-[#e8e8e8] last:border-0">
            {/* هدر گروه */}
            <div className="flex items-center justify-between gap-2 p-3 bg-[#fafafa] border-b border-[#e8e8e8]">
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
                  title="حذف گروه"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {/* هدر ستون‌ها */}
            <div className="hidden lg:grid grid-cols-[110px_1fr_90px_90px_90px_90px_80px_50px_50px_40px] gap-2 p-2 bg-white text-xs font-medium text-[rgba(0,0,0,0.65)] border-b border-[#f0f0f0]">
              <div>نوع</div>
              <div>نام محصول</div>
              <div>طول (mm)</div>
              <div>عرض (mm)</div>
              <div>ارتفاع (mm)</div>
              <div>وزن (kg)</div>
              <div>تعداد</div>
              <div>رنگ</div>
              <div>چیدن</div>
              <div></div>
            </div>

            {/* ردیف‌های محصول */}
            <div className="divide-y divide-[#f0f0f0]">
              {groupProducts.length === 0 && (
                <div className="p-6 text-center text-sm text-[rgba(0,0,0,0.45)]">
                  محصولی در این گروه نیست. روی «افزودن محصول» بزنید.
                </div>
              )}
              {groupProducts.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-2 lg:grid-cols-[110px_1fr_90px_90px_90px_90px_80px_50px_50px_40px] gap-2 p-2 items-center bg-white hover:bg-[#fafafa] transition-colors"
                >
                  {/* Type */}
                  <div className="relative col-span-2 lg:col-span-1">
                    <select
                      value={p.type}
                      onChange={(e) => updateProduct(p.id, "type", e.target.value)}
                      className="w-full h-8 px-2 pr-7 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none bg-white appearance-none"
                    >
                      {PRODUCT_TYPES.map((t) => (
                        <option key={t.en} value={t.en}>
                          {t.fa} ({t.en})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-[rgba(0,0,0,0.45)] pointer-events-none" />
                  </div>

                  {/* Name */}
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                    placeholder="نام محصول"
                    className="col-span-2 lg:col-span-1 h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none"
                  />

                  {/* Length */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">طول (mm)</span>
                    <input
                      type="number"
                      value={p.length}
                      onChange={(e) => updateProduct(p.id, "length", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Width */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">عرض (mm)</span>
                    <input
                      type="number"
                      value={p.width}
                      onChange={(e) => updateProduct(p.id, "width", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">ارتفاع (mm)</span>
                    <input
                      type="number"
                      value={p.height}
                      onChange={(e) => updateProduct(p.id, "height", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">وزن (kg)</span>
                    <input
                      type="number"
                      value={p.weight}
                      onChange={(e) => updateProduct(p.id, "weight", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">تعداد</span>
                    <input
                      type="number"
                      value={p.quantity}
                      onChange={(e) => updateProduct(p.id, "quantity", e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-[#d9d9d9] rounded-sm hover:border-[#0088ff] focus:border-[#0088ff] focus:outline-none tabular-nums"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <span className="block lg:hidden text-[9px] text-[rgba(0,0,0,0.45)] mb-0.5">رنگ</span>
                    <input
                      type="color"
                      value={p.color}
                      onChange={(e) => updateProduct(p.id, "color", e.target.value)}
                      className="size-8 border border-[#d9d9d9] rounded-sm cursor-pointer p-0.5 bg-white"
                    />
                  </div>

                  {/* Stack toggle */}
                  <button
                    type="button"
                    onClick={() => updateProduct(p.id, "stackable", !p.stackable)}
                    className={cn(
                      "touch-target inline-flex items-center justify-center rounded-sm border transition-colors",
                      p.stackable
                        ? "bg-[#52c41a]/10 border-[#52c41a] text-[#52c41a]"
                        : "bg-white border-[#d9d9d9] text-[rgba(0,0,0,0.45)]"
                    )}
                    title={p.stackable ? "قابل چیدن روی هم" : "غیرقابل چیدن"}
                    aria-label={p.stackable ? "قابل چیدن روی هم" : "غیرقابل چیدن"}
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="9" width="12" height="4" rx="0.5" />
                      <rect x="3" y="4" width="10" height="3" rx="0.5" />
                    </svg>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => duplicateProduct(p.id)}
                      className="touch-target inline-flex items-center justify-center text-[rgba(0,0,0,0.45)] hover:text-[#0088ff] p-1 rounded transition-colors"
                      title="کپی"
                      aria-label="کپی محصول"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="touch-target inline-flex items-center justify-center text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] p-1 rounded transition-colors"
                      title="حذف"
                      aria-label="حذف محصول"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* افزودن محصول */}
            <div className="p-2 bg-[#fafafa] border-t border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => addProduct(group.id)}
                className="inline-flex items-center gap-1.5 text-xs text-[#0088ff] hover:text-[#40a9ff] px-3 py-2.5 rounded transition-colors active:bg-[#e6f7ff] min-h-[44px]"
              >
                <Plus className="size-3.5" />
                افزودن محصول
              </button>
            </div>
          </div>
        );
      })}

      {/* پالتر + بعدی */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-[#e8e8e8] bg-[#fafafa]">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[rgba(0,0,0,0.65)]">
          <input
            type="checkbox"
            checked={usePallets}
            onChange={(e) => setUsePallets(e.target.checked)}
            className="size-4 accent-[#0088ff]"
          />
          استفاده از پالت
        </label>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasProducts}
          className="sr-btn-primary text-sm"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
