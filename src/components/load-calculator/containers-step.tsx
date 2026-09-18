"use client";

import { CONTAINERS, type ContainerSpec } from "@/lib/containers";
import { useTranslation } from "@/i18n/context";
import { Truck, Container as ContainerIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

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
  const { t, formatNumber, isRtl } = useTranslation();

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-sm shadow-xs">
      <div className="p-4 border-b border-[#e8e8e8] bg-[#fafafa]">
        <h3 className="text-sm font-semibold text-[#15354e]">{t.containers.title}</h3>
        <p className="hidden sm:block text-xs text-[rgba(0,0,0,0.65)] mt-1">
          {t.containers.subtitle}
        </p>
      </div>

      {/* Ocean Containers */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ContainerIcon className="size-4 text-[#0088ff]" />
          <h4 className="text-xs font-semibold text-[#15354e] uppercase tracking-wide">
            {t.containers.tabContainers}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {CONTAINERS.map((c) => {
            const localized = t.containers.items[c.id];
            const isSelected = selectedId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  "rounded-md border-2 p-3 transition-all text-start hover:shadow-md cursor-pointer",
                  isSelected
                    ? "border-[#0088ff] bg-[#e6f7ff]/70"
                    : "border-[#e8e8e8] bg-white hover:border-[#0088ff]"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#15354e] leading-tight truncate">
                      {localized?.name || c.nameEn}
                    </div>
                    <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">{c.nameEn}</div>
                  </div>
                  <div
                    className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      isSelected ? "bg-[#0088ff] border-[#0088ff]" : "border-[#d9d9d9]"
                    )}
                  >
                    {isSelected && <Check className="size-3 text-white" />}
                  </div>
                </div>

                <div className="text-[10px] text-[rgba(0,0,0,0.65)] space-y-1 mt-2 pt-2 border-t border-[#f0f0f0]">
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]">{t.containers.internalDims}:</span>
                    <span className="tabular-nums font-medium">
                      {formatNumber(c.internalLength)}×{formatNumber(c.internalWidth)}×
                      {formatNumber(c.internalHeight)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]">{t.containers.maxPayload}:</span>
                    <span className="tabular-nums font-medium">
                      {formatNumber(c.maxPayload)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]">{t.containers.volumeCapacity}:</span>
                    <span className="tabular-nums font-medium text-[#0088ff]">
                      {formatNumber(c.capacity, 1)} m³
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trucks & Trailers */}
      <div className="p-4 border-t border-[#e8e8e8]">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="size-4 text-[#0088ff]" />
          <h4 className="text-xs font-semibold text-[#15354e] uppercase tracking-wide">
            {t.containers.tabTrucks}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRUCKS.map((trk) => {
            const localized = t.containers.items[trk.id];
            const isSelected = selectedId === trk.id;
            return (
              <button
                key={trk.id}
                type="button"
                onClick={() => onSelect(trk.id)}
                className={cn(
                  "rounded-md border-2 p-3 transition-all text-start hover:shadow-md cursor-pointer",
                  isSelected
                    ? "border-[#0088ff] bg-[#e6f7ff]/70"
                    : "border-[#e8e8e8] bg-white hover:border-[#0088ff]"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#15354e] leading-tight truncate">
                      {localized?.name || trk.nameEn}
                    </div>
                    <div className="text-[10px] text-[rgba(0,0,0,0.45)] mt-0.5">{trk.nameEn}</div>
                  </div>
                  <div
                    className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "bg-[#0088ff] border-[#0088ff]" : "border-[#d9d9d9]"
                    )}
                  >
                    {isSelected && <Check className="size-3 text-white" />}
                  </div>
                </div>

                <div className="text-[10px] text-[rgba(0,0,0,0.65)] space-y-1 mt-2 pt-2 border-t border-[#f0f0f0]">
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]">{t.containers.internalDims}:</span>
                    <span className="tabular-nums font-medium">
                      {formatNumber(trk.length)}×{formatNumber(trk.width)}×{formatNumber(trk.height)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]">{t.containers.maxPayload}:</span>
                    <span className="tabular-nums font-medium">
                      {formatNumber(trk.maxPayload)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(0,0,0,0.45)]">{t.containers.volumeCapacity}:</span>
                    <span className="tabular-nums font-medium text-[#0088ff]">
                      {formatNumber(trk.capacity, 1)} m³
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-3 p-4 border-t border-[#e8e8e8] bg-[#fafafa]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center px-5 py-2 border border-[#d9d9d9] hover:bg-white text-xs sm:text-sm font-medium rounded-md transition-colors"
        >
          {t.containers.backToProducts}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedId}
          className="inline-flex items-center justify-center px-6 py-2 bg-[#0088ff] hover:bg-[#40a9ff] active:bg-[#007ae6] text-white text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-sm disabled:opacity-50"
        >
          {t.containers.nextToResult}
        </button>
      </div>
    </div>
  );
}

export function getSelectedContainer(id: string): ContainerSpec {
  const fromContainers = CONTAINERS.find((c) => c.id === id);
  if (fromContainers) return fromContainers;
  const fromTrucks = TRUCKS.find((trk) => trk.id === id);
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
      description: "Truck Freight",
    };
  }
  return CONTAINERS[0];
}
