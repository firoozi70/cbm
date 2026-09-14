"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CONTAINERS, type ContainerSpec, faNumber } from "@/lib/containers";
import { Container, Ruler, Weight, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ContainerSelector({ selectedId, onSelect }: Props) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Container className="size-5" />
          انتخاب کانتینر
        </CardTitle>
        <CardDescription>
          نوع کانتینر را انتخاب کنید. ابعاد داخلی برای محاسبه استفاده می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTAINERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "text-right rounded-lg border-2 p-3 transition-all hover:shadow-md",
                selectedId === c.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border-2 transition-all",
                      selectedId === c.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedId === c.id && (
                      <svg viewBox="0 0 12 12" className="size-3 text-primary-foreground" fill="none">
                        <path d="M2 6.5L5 9.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="font-bold text-sm">{c.nameFa}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    c.type === "high-cube"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-sky-100 text-sky-800"
                  )}
                >
                  {c.type === "high-cube" ? "های‌کیوب" : "استاندارد"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{c.description}</p>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Ruler className="size-3 shrink-0" />
                  <span>
                    {faNumber(c.internalLength, 0)}×
                    {faNumber(c.internalWidth, 0)}×
                    {faNumber(c.internalHeight, 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Weight className="size-3 shrink-0" />
                  <span>{faNumber(c.maxPayload)} کگ</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Box className="size-3 shrink-0" />
                  <span>{faNumber(c.capacity, 1)} م³</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function getSelectedContainer(id: string): ContainerSpec {
  return CONTAINERS.find((c) => c.id === id) || CONTAINERS[0];
}
