"use client";

import { CONTAINERS, type ContainerSpec, faNumber } from "@/lib/containers";
import { Truck, Container as ContainerIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// کامیون‌ها (مطابق SeaRates که گزینه کامیون هم دارد)
export interface TruckSpec {
  id: string;
  nameFa: string;
  nameEn: string;
  length: number;
  width: number;
  height: number;
  maxPayload: number;
  capacity: number;
}

export const TRUCKS: TruckSpec[] = [
  {
    id: "truck-3t",
    nameFa: "کامیون ۳ تنی",
    nameEn: "Truck 3T",
    length: 420,
    width: 195,
    height: 180,
    maxPayload: 3000,
    capacity: 14.7,
  },
  {
    id: "truck-5t",
    nameFa: "کامیون ۵ تنی",
    nameEn: "Truck 5T",
    length: 520,
    width: 220,
    height: 220,
    maxPayload: 5000,
    capacity: 25.1,
  },
  {
    id: "truck-10t",
    nameFa: "کامیون ۱۰ تنی",
    nameEn: "Truck 10T",
    length: 720,
    width: 240,
    height: 240,
    maxPayload: 10000,
    capacity: 41.4,
  },
  {
    id: "truck-semitrailer",
    nameFa: "نیم‌تریلر",
    nameEn: "Semitrailer",
    length: 1350,
    width: 245,
    height: 270,
    maxPayload: 24000,
    capacity: 89.3,
  },
];

export function ContainersStep({ selectedId, onSelect, onNext, onBack }: Props) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-sm">
      <div className="p-4 border-b border-[#e8e8e8] bg-[#fafafa]">
        <h3 className="text-sm font-semibold text-[#15354e]">
          انتخاب نوع کانتینر یا کامیون
        </h3>
        <p className="hidden sm:block text-xs text-[rgba(0,0,0,0.65)] mt-1">
          نوع وسیله نقلیه را برای چیدمان انتخاب کنید. ابعاد داخلی برای محاسبه استفاده می‌شود.
        </p>
      </div>

      {/* بخش کانتینرها */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ContainerIcon className="size-4 text-[#0088ff]" />
          <h4 className="text-xs font-semibold text-[#15354e] uppercase tracking-wide">
            کانتینرها
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
          {CONTAINERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "text-right rounded-md border-2 p-3 transition-all hover:shadow-md",
                selectedId === c.id
                  ? "border-[#0088ff] bg-[#e6f7ff]"
                  : "border-[#e8e8e8] bg-white hover:border-[#0088ff]"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#15354e] leading-tight">
                    {c.nameFa}
                  </div>
                  <div className="text-[10px] text-[rgba(0,0,0,0.45)] uppercase mt-0.5">
                    {c.nameEn}
                  </div>
                </div>
                <div
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    selectedId === c.id
                      ? "bg-[#0088ff] border-[#0088ff]"
                      : "border-[#d9d9d9]"
                  )}
                >
                  {selectedId === c.id && (
                    <Check className="size-3 text-white" />
                  )}
                </div>
              </div>
              <div className="text-[10px] text-[rgba(0,0,0,0.65)] space-y-0.5 mt-2 pt-2 border-t border-[#f0f0f0]">
                <div className="flex justify-between">
                  <span>ابعاد داخلی:</span>
                  <span className="tabular-nums">
                    {faNumber(c.internalLength, 0)}×{faNumber(c.internalWidth, 0)}×{faNumber(c.internalHeight, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>وزن مجاز:</span>
                  <span className="tabular-nums">{faNumber(c.maxPayload)} کگ</span>
                </div>
                <div className="flex justify-between">
                  <span>حجم:</span>
                  <span className="tabular-nums">{faNumber(c.capacity, 1)} م³</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* بخش کامیون‌ها */}
      <div className="p-4 border-t border-[#e8e8e8]">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="size-4 text-[#0088ff]" />
          <h4 className="text-xs font-semibold text-[#15354e] uppercase tracking-wide">
            کامیون‌ها
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger">
          {TRUCKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={cn(
                "text-right rounded-md border-2 p-3 transition-all hover:shadow-md",
                selectedId === t.id
                  ? "border-[#0088ff] bg-[#e6f7ff]"
                  : "border-[#e8e8e8] bg-white hover:border-[#0088ff]"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#15354e] leading-tight">
                    {t.nameFa}
                  </div>
                  <div className="text-[10px] text-[rgba(0,0,0,0.45)] uppercase mt-0.5">
                    {t.nameEn}
                  </div>
                </div>
                <div
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    selectedId === t.id
                      ? "bg-[#0088ff] border-[#0088ff]"
                      : "border-[#d9d9d9]"
                  )}
                >
                  {selectedId === t.id && (
                    <Check className="size-3 text-white" />
                  )}
                </div>
              </div>
              <div className="text-[10px] text-[rgba(0,0,0,0.65)] space-y-0.5 mt-2 pt-2 border-t border-[#f0f0f0]">
                <div className="flex justify-between">
                  <span>ابعاد:</span>
                  <span className="tabular-nums">
                    {faNumber(t.length)}×{faNumber(t.width)}×{faNumber(t.height)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>وزن مجاز:</span>
                  <span className="tabular-nums">{faNumber(t.maxPayload)} کگ</span>
                </div>
                <div className="flex justify-between">
                  <span>حجم:</span>
                  <span className="tabular-nums">{faNumber(t.capacity, 1)} م³</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* نوار پایین */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-[#e8e8e8] bg-[#fafafa]">
        <button
          type="button"
          onClick={onBack}
          className="sr-btn-default text-sm"
        >
          قبلی
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="sr-btn-primary text-sm"
        >
          محاسبه و مشاهده نتیجه
        </button>
      </div>
    </div>
  );
}

// گرفتن کانتینر انتخاب‌شده (یا ساخت یک کانتینر از روی کامیون)
export function getSelectedContainer(id: string): ContainerSpec {
  const fromContainers = CONTAINERS.find((c) => c.id === id);
  if (fromContainers) return fromContainers;
  const fromTrucks = TRUCKS.find((t) => t.id === id);
  if (fromTrucks) {
    return {
      id: fromTrucks.id,
      nameFa: fromTrucks.nameFa,
      nameEn: fromTrucks.nameEn,
      internalLength: fromTrucks.length,
      internalWidth: fromTrucks.width,
      internalHeight: fromTrucks.height,
      externalLength: fromTrucks.length,
      externalWidth: fromTrucks.width,
      externalHeight: fromTrucks.height,
      maxPayload: fromTrucks.maxPayload,
      tareWeight: 0,
      maxGrossWeight: fromTrucks.maxPayload,
      capacity: fromTrucks.capacity,
      type: "standard",
      description: "کامیون حمل بار",
    };
  }
  return CONTAINERS[0];
}
