"use client";

import { useState, useMemo } from "react";
import { CargoForm, cartonFormToInput, type CartonForm } from "@/components/load-calculator/cargo-form";
import { ContainerSelector, getSelectedContainer } from "@/components/load-calculator/container-selector";
import { ResultsPanel } from "@/components/load-calculator/results-panel";
import { calculateLoad } from "@/lib/load-calculation";
import { type LengthUnit, type WeightUnit } from "@/lib/containers";
import { Ship, RotateCcw, Info, Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [carts, setCarts] = useState<CartonForm[]>([
    {
      id: "cart-default",
      name: "کارتن پیش‌فرض",
      length: "40",
      width: "30",
      height: "25",
      weight: "15",
      quantity: "200",
      stackable: true,
      maxStack: "0",
    },
  ]);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [selectedContainerId, setSelectedContainerId] = useState("40ft-std");
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const calculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setHasResult(true);
      setIsCalculating(false);
    }, 300);
  };

  const reset = () => {
    setCarts([
      {
        id: "cart-default",
        name: "کارتن پیش‌فرض",
        length: "40",
        width: "30",
        height: "25",
        weight: "15",
        quantity: "200",
        stackable: true,
        maxStack: "0",
      },
    ]);
    setHasResult(false);
  };

  // محاسبه نتیجه - با useMemo برای جلوگیری از محاسبه مجدد
  const calculationResult = useMemo(() => {
    if (!hasResult || carts.length === 0) return null;
    const carton = carts[0]; // فعلاً فقط اولین کارتن
    const input = cartonFormToInput(carton, lengthUnit, weightUnit);
    if (!input) return null;
    const container = getSelectedContainer(selectedContainerId);
    return {
      carton,
      result: calculateLoad(input, container),
      container,
    };
  }, [hasResult, carts, selectedContainerId, lengthUnit, weightUnit]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      {/* هدر */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="size-9 sm:size-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Ship className="size-5 sm:size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold leading-tight">
                ماشین‌حساب بار
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                محاسبه چیدمان بار در کانتینر - نسخه فارسی
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2"
              onClick={() => setShowInfo(true)}
              title="راهنما"
            >
              <Info className="size-4" />
              <span className="hidden sm:inline mr-1">راهنما</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2"
              onClick={reset}
              title="شروع مجدد"
            >
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline mr-1">شروع مجدد</span>
            </Button>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        {/* توضیح مختصر */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gradient-to-l from-primary/10 to-transparent border-r-4 border-primary text-sm">
          <p className="text-foreground/90 leading-relaxed">
            با این ابزار می‌توانید تعداد کارتن‌هایی که در یک کانتینر جا می‌شوند، درصد استفاده از حجم و وزن مجاز، و بهترین چیدمان را محاسبه کنید. ابعاد کارتن را وارد کنید، نوع کانتینر را انتخاب کنید و روی «محاسبه بار» بزنید.
          </p>
        </div>

        {/* چیدمان دوطرفه: فرم سمت راست، نتایج سمت چپ (در حالت دسکتاپ) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* بخش ورودی */}
          <div className="space-y-4 sm:space-y-6">
            <ContainerSelector
              selectedId={selectedContainerId}
              onSelect={setSelectedContainerId}
            />
            <CargoForm
              carts={carts}
              setCarts={setCarts}
              lengthUnit={lengthUnit}
              setLengthUnit={setLengthUnit}
              weightUnit={weightUnit}
              setWeightUnit={setWeightUnit}
              onCalculate={calculate}
              isCalculating={isCalculating}
            />
          </div>

          {/* بخش نتایج */}
          <div className="space-y-4 sm:space-y-6">
            {calculationResult ? (
              <ResultsPanel
                carton={calculationResult.carton}
                result={calculationResult.result}
                container={calculationResult.container}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Ship className="size-14 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">
                    برای مشاهده نتیجه، ابعاد کارتن را وارد کرده و دکمه «محاسبه بار» را بزنید.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* فوتر */}
      <footer className="mt-auto border-t bg-background/85 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            این ابزار بر اساس ابزار معروف{" "}
            <a
              href="https://www.searates.com/load-calculator/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              SeaRates Load Calculator
            </a>{" "}
            برای زبان فارسی و راست‌چین شبیه‌سازی شده است.
          </p>
          <p className="mt-1 text-[10px] sm:text-xs">
            تمامی محاسبات به صورت محلی در مرورگر شما انجام می‌شود. این ابزار جایگزین مشاوره تخصصی بارگیری نیست.
          </p>
        </div>
      </footer>

      {/* مودال راهنما */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ship className="size-5 text-primary" />
              راهنمای استفاده
            </DialogTitle>
            <DialogDescription className="text-right">
              این ابزار به شما کمک می‌کند بهترین استفاده را از فضای کانتینر داشته باشید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed">
            <div>
              <h3 className="font-bold mb-1">۱. ابعاد کارتن را وارد کنید</h3>
              <p className="text-muted-foreground">
                طول، عرض و ارتفاع هر کارتن به همراه وزن و تعداد کل را وارد کنید. واحدهای اندازه‌گیری قابل تغییر هستند.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-1">۲. نوع کانتینر را انتخاب کنید</h3>
              <p className="text-muted-foreground">
                بین کانتینرهای ۲۰، ۴۰ و ۴۵ فوتی استاندارد و های‌کیوب انتخاب کنید. ابعاد داخلی و وزن مجاز هر کانتینر متفاوت است.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-1">۳. روی «محاسبه بار» بزنید</h3>
              <p className="text-muted-foreground">
                ابزار تمام ۶ حالت چرخش ممکن کارتن را امتحان می‌کند و بهترین چیدمان را پیدا می‌کند.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-1">۴. نتایج را بررسی کنید</h3>
              <p className="text-muted-foreground">
                تعداد کارتن‌هایی که جا می‌شوند، درصد استفاده از حجم و وزن، و یک نمای ایزومتریک از چیدمان را ببینید.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-900">
              <p className="text-amber-800 dark:text-amber-200 text-xs">
                توجه: این محاسبات تقریبی هستند. برای بارگیری واقعی، فاکتورهایی مثل فاصله ایمن بین کارتن‌ها، توزیع وزن، و قانون‌های حمل و نقل کشور مبدا/مقصد را در نظر بگیرید.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
