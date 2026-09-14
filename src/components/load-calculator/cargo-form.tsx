"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Copy, Package, Boxes } from "lucide-react";
import { LENGTH_UNITS, WEIGHT_UNITS, type LengthUnit, type WeightUnit, faNumber } from "@/lib/containers";
import { CartonInput } from "@/lib/load-calculation";

export interface CartonForm {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  quantity: string;
  stackable: boolean;
  maxStack: string;
}

interface Props {
  carts: CartonForm[];
  setCarts: (carts: CartonForm[]) => void;
  lengthUnit: LengthUnit;
  setLengthUnit: (u: LengthUnit) => void;
  weightUnit: WeightUnit;
  setWeightUnit: (u: WeightUnit) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

export function CargoForm({
  carts,
  setCarts,
  lengthUnit,
  setLengthUnit,
  weightUnit,
  setWeightUnit,
  onCalculate,
  isCalculating,
}: Props) {
  const addCarton = () => {
    const newCart: CartonForm = {
      id: `cart-${Date.now()}`,
      name: `کارتن ${carts.length + 1}`,
      length: "",
      width: "",
      height: "",
      weight: "",
      quantity: "1",
      stackable: true,
      maxStack: "0",
    };
    setCarts([...carts, newCart]);
  };

  const removeCarton = (id: string) => {
    setCarts(carts.filter((c) => c.id !== id));
  };

  const duplicateCarton = (id: string) => {
    const cart = carts.find((c) => c.id === id);
    if (!cart) return;
    setCarts([
      ...carts,
      { ...cart, id: `cart-${Date.now()}`, name: `${cart.name} (کپی)` },
    ]);
  };

  const updateCarton = (id: string, field: keyof CartonForm, value: string | boolean) => {
    setCarts(
      carts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Package className="size-5" />
          مشخصات کارتن‌ها
        </CardTitle>
        <CardDescription>
          ابعاد و مشخصات کارتن‌های خود را وارد کنید. واحدها را می‌توانید در بالای فرم انتخاب کنید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* انتخاب واحد */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">واحد طول</Label>
            <Select value={lengthUnit} onValueChange={(v) => setLengthUnit(v as LengthUnit)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENGTH_UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">واحد وزن</Label>
            <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as WeightUnit)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* لیست کارتن‌ها */}
        <div className="space-y-3">
          {carts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
              <Boxes className="size-10 mx-auto mb-2 opacity-50" />
              هنوز کارتن اضافه نشده است. روی «افزودن کارتن» بزنید.
            </div>
          )}
          {carts.map((cart, idx) => (
            <div
              key={cart.id}
              className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card/50 animate-fade-in-up"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {faNumber(idx + 1)}
                  </span>
                  <Input
                    value={cart.name}
                    onChange={(e) => updateCarton(cart.id, "name", e.target.value)}
                    placeholder="نام کارتن"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => duplicateCarton(cart.id)}
                    title="کپی"
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:text-destructive"
                    onClick={() => removeCarton(cart.id)}
                    title="حذف"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">طول</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={cart.length}
                    onChange={(e) => updateCarton(cart.id, "length", e.target.value)}
                    placeholder="مثلاً ۴۰"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">عرض</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={cart.width}
                    onChange={(e) => updateCarton(cart.id, "width", e.target.value)}
                    placeholder="مثلاً ۳۰"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">ارتفاع</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={cart.height}
                    onChange={(e) => updateCarton(cart.id, "height", e.target.value)}
                    placeholder="مثلاً ۲۵"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">وزن هر کارتن</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={cart.weight}
                    onChange={(e) => updateCarton(cart.id, "weight", e.target.value)}
                    placeholder="مثلاً ۱۵"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">تعداد</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={cart.quantity}
                    onChange={(e) => updateCarton(cart.id, "quantity", e.target.value)}
                    placeholder="مثلاً ۱۰۰"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">حداکثر لایه</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={cart.maxStack}
                    onChange={(e) => updateCarton(cart.id, "maxStack", e.target.value)}
                    placeholder="۰ = نامحدود"
                    className="h-9"
                  />
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1 self-end pb-1">
                  <Switch
                    id={`stack-${cart.id}`}
                    checked={cart.stackable}
                    onCheckedChange={(v) => updateCarton(cart.id, "stackable", v)}
                  />
                  <Label htmlFor={`stack-${cart.id}`} className="text-xs cursor-pointer">
                    قابل انبارش
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={addCarton}
            className="flex-1"
          >
            <Plus className="size-4" />
            افزودن کارتن
          </Button>
          <Button
            type="button"
            onClick={onCalculate}
            disabled={isCalculating || carts.length === 0}
            className="flex-1 h-11 text-base"
          >
            <Boxes className="size-5" />
            {isCalculating ? "در حال محاسبه..." : "محاسبه بار"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// تبدیل فرم به نوع قابل محاسبه (با در نظر گرفتن واحد)
export function cartonFormToInput(
  cart: CartonForm,
  lengthUnit: LengthUnit,
  weightUnit: WeightUnit
): CartonInput | null {
  const lenL = LENGTH_UNITS.find((u) => u.value === lengthUnit);
  const wL = WEIGHT_UNITS.find((u) => u.value === weightUnit);
  if (!lenL || !wL) return null;
  return {
    length: (parseFloat(cart.length) || 0) * lenL.toCm,
    width: (parseFloat(cart.width) || 0) * lenL.toCm,
    height: (parseFloat(cart.height) || 0) * lenL.toCm,
    weight: (parseFloat(cart.weight) || 0) * wL.toKg,
    quantity: parseInt(cart.quantity) || 1,
    stackable: cart.stackable,
    maxStack: parseInt(cart.maxStack) || 0,
  };
}
