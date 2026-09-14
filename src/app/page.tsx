"use client";

import { useState, useMemo } from "react";
import { WizardStepper, type StepId } from "@/components/load-calculator/wizard-stepper";
import { ProductsStep, type ProductRow, type Group } from "@/components/load-calculator/products-step";
import { ContainersStep, getSelectedContainer } from "@/components/load-calculator/containers-step";
import { ResultStep } from "@/components/load-calculator/result-step";
import { CbmCalculator } from "@/components/load-calculator/cbm-calculator";
import { calculateMultiStuffing, type MultiProductInput } from "@/lib/load-calculation";
import { Ship, ChevronDown, Menu, X, Info, Boxes, Container as ContainerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    id: "products" as StepId,
    index: 1,
    title: "محصولات",
    titleEn: "Products",
    icon: null,
  },
  {
    id: "containers" as StepId,
    index: 2,
    title: "کانتینرها و کامیون‌ها",
    titleEn: "Containers & Trucks",
    icon: null,
  },
  {
    id: "result" as StepId,
    index: 3,
    title: "نتیجه چیدمان",
    titleEn: "Stuffing Result",
    icon: null,
  },
];

// محتوای پایین صفحه - مطابق SeaRates
const BENEFITS = [
  {
    title: "سود-مقرون‌به‌صرفه بودن",
    desc: "ماشین‌حساب بار SeaRates برای این طراحی شده که به شما نشان دهد چگونه بارهای کانتینری را محاسبه کنید تا بودجه حمل‌ونقل خود را در عمل بهینه‌سازی نمایید. در مصرف سوخت، عملیات بارگیری و تخلیه کانتینر، بسته‌بندی بار و کل زنجیره تأمین صرفه‌جویی کنید. اگر کسب‌وکار شما در تلاش است تا تجارت خود را توسعه دهد نه هزینه‌ها، اکنون یاد بگیرید چگونه بار را در کشتی یا کامیون محاسبه کنید.",
  },
  {
    title: "بهینه‌سازی فضا و چیدمان",
    desc: "فضا را به‌صورت اختصاصی محاسبه کنید. برای کانتینرهای استاندارد، یخچال‌دار، ۲۰ فوتی یا ۴۰ فوتی های‌کیوب، ماشین‌حساب ظرفیت بارگیری آماده ارائه راه‌حل‌های بهینه برای چیدمان با رمپ‌های بارگیری، قابلیت محاسبه پالت و... است. خود را به روش‌های استاندارد برای بارگیری کانتینر و کامیون محدود نکنید — گزینه‌های مناسب برای نیازهای اضافی بار شکننده و غیراستاندارد خود را دریافت کنید.",
  },
  {
    title: "بصری‌سازی پیشرفته",
    desc: "ماشین‌حساب آنلاین SeaRates یک طرح ۳بعدی تعاملی با بصری‌سازی دقیق ارائه می‌دهد که مستقیماً متناسب با نیازهای شما تنظیم شده است. محاسبه‌گر چیدمان ۳بعدی اطمینان حاصل می‌کند که فرایند بارگیری و تخلیه کامیون یا کانتینر شما به‌خوبی پیش می‌رود. از روش‌های بارگیری ناکارآمد که هنگام تخلیه مشکل ایجاد می‌کنند پرهیز کنید. رویکرد فردی و کارآمد را با ویژگی‌های محاسبه‌گر بار ۳بعدی به‌کار ببرید.",
  },
];

export default function Home() {
  // حالت ابزار: چیدمان بار یا ماشین‌حساب CBM
  const [toolMode, setToolMode] = useState<"load" | "cbm">("load");
  const [currentStep, setCurrentStep] = useState<StepId>("products");
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [groups, setGroups] = useState<Group[]>([
    { id: "grp-1", name: "گروه ۱" },
  ]);
  const [products, setProducts] = useState<ProductRow[]>([
    {
      id: "prod-1",
      groupId: "grp-1",
      type: "Boxes",
      name: "کارتن ۱",
      length: "500",
      width: "400",
      height: "300",
      weight: "10",
      quantity: "80",
      color: "#0088ff",
      stackable: true,
      maxStack: "0",
    },
    {
      id: "prod-2",
      groupId: "grp-1",
      type: "Sacks",
      name: "کیسه",
      length: "1000",
      width: "450",
      height: "300",
      weight: "45",
      quantity: "100",
      color: "#52c41a",
      stackable: true,
      maxStack: "0",
    },
    {
      id: "prod-3",
      groupId: "grp-1",
      type: "Big bags",
      name: "کیسه بزرگ",
      length: "1000",
      width: "1000",
      height: "1000",
      weight: "900",
      quantity: "10",
      color: "#faad14",
      stackable: true,
      maxStack: "0",
    },
  ]);
  const [usePallets, setUsePallets] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState("40ft-std");
  const [showInfo, setShowInfo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goToStep = (step: StepId) => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx <= maxReachedStep) {
      setCurrentStep(step);
    }
  };

  const next = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) {
      const nextStep = STEPS[idx + 1];
      setCurrentStep(nextStep.id);
      setMaxReachedStep(Math.max(maxReachedStep, idx + 1));
    }
  };

  const back = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
    }
  };

  const restart = () => {
    setCurrentStep("products");
    setMaxReachedStep(0);
  };

  // محاسبه نتیجه - با useMemo
  const stuffingResult = useMemo(() => {
    if (currentStep !== "result") return null;
    const multiProducts: MultiProductInput[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      lengthMm: parseFloat(p.length) || 0,
      widthMm: parseFloat(p.width) || 0,
      heightMm: parseFloat(p.height) || 0,
      weightKg: parseFloat(p.weight) || 0,
      quantity: parseInt(p.quantity) || 0,
      stackable: p.stackable,
      maxStack: parseInt(p.maxStack) || 0,
    }));
    const container = getSelectedContainer(selectedContainerId);
    return calculateMultiStuffing(multiProducts, container);
  }, [currentStep, products, selectedContainerId]);

  const container = getSelectedContainer(selectedContainerId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* هدر - الهام گرفته از SeaRates */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* لوگو */}
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-md bg-[#0088ff] flex items-center justify-center">
                <Ship className="size-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-[#15354e]">SeaRates</span>
                <span className="text-[10px] text-[rgba(0,0,0,0.45)] uppercase tracking-wide">فارسی</span>
              </div>
            </div>

            {/* منوی دسکتاپ */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <button className="flex items-center gap-1 text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">
                ابزارها
                <ChevronDown className="size-3.5" />
              </button>
              <button className="text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">خدمات</button>
              <button className="text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">مرجع</button>
              <button className="text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">شرکت</button>
              <button className="text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">یکپارچه‌سازی</button>
              <button className="text-[#0088ff] hover:text-[#40a9ff] font-medium transition-colors">ورود</button>
            </nav>

            {/* دکمه موبایل */}
            <button
              type="button"
              className="md:hidden text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* منوی موبایل */}
          {menuOpen && (
            <nav className="md:hidden flex flex-col gap-2 py-3 border-t border-[#f0f0f0]">
              <button className="text-right text-sm text-[rgba(0,0,0,0.65)] py-1">ابزارها</button>
              <button className="text-right text-sm text-[rgba(0,0,0,0.65)] py-1">خدمات</button>
              <button className="text-right text-sm text-[rgba(0,0,0,0.65)] py-1">مرجع</button>
              <button className="text-right text-sm text-[rgba(0,0,0,0.65)] py-1">شرکت</button>
              <button className="text-right text-sm text-[#0088ff] font-medium py-1">ورود</button>
            </nav>
          )}
        </div>
      </header>

      {/* عنوان صفحه */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#15354e]">
            محاسبه بار و چیدمان
          </h1>
          <p className="text-sm text-[rgba(0,0,0,0.65)] mt-2 max-w-3xl leading-relaxed">
            ابزار هوشمند برای محاسبه بهینه چیدمان بار در کانتینر، کامیون و سایر وسایل نقلیه حمل.
            بار خود را وارد کنید، نوع وسیله نقلیه را انتخاب کنید و چیدمان ۳بعدی بهینه را مشاهده کنید.
          </p>

          {/* انتخاب ابزار: چیدمان بار / ماشین‌حساب CBM */}
          <div className="mt-5 inline-flex flex-wrap rounded-md border border-[#d9d9d9] overflow-hidden w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setToolMode("load")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm transition-colors",
                toolMode === "load"
                  ? "bg-[#0088ff] text-white font-medium"
                  : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
              )}
            >
              <ContainerIcon className="size-4" />
              چیدمان بار در کانتینر
            </button>
            <button
              type="button"
              onClick={() => setToolMode("cbm")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm transition-colors border-r border-[#d9d9d9]",
                toolMode === "cbm"
                  ? "bg-[#0088ff] text-white font-medium"
                  : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
              )}
            >
              <Boxes className="size-4" />
              ماشین‌حساب CBM
            </button>
          </div>
        </div>
      </div>

      {/* محتوای ابزار */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        {toolMode === "cbm" ? (
          <div className="animate-fade-in-up">
            <CbmCalculator />
          </div>
        ) : (
          <>
            <WizardStepper
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={goToStep}
              maxReachedStep={maxReachedStep}
            />

            {currentStep === "products" && (
              <div className="animate-fade-in-up mt-4">
                <ProductsStep
                  groups={groups}
                  products={products}
                  setGroups={setGroups}
                  setProducts={setProducts}
                  usePallets={usePallets}
                  setUsePallets={setUsePallets}
                  onNext={next}
                />
              </div>
            )}

            {currentStep === "containers" && (
              <div className="animate-fade-in-up">
                <ContainersStep
                  selectedId={selectedContainerId}
                  onSelect={setSelectedContainerId}
                  onNext={next}
                  onBack={back}
                />
              </div>
            )}

            {currentStep === "result" && stuffingResult && (
              <div className="animate-fade-in-up">
                <ResultStep
                  result={stuffingResult}
                  container={container}
                  onBack={back}
                  onRestart={restart}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* بخش محتوای پایین - شبیه SeaRates */}
      <section className="bg-white border-t border-[#e8e8e8] mt-4">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-8 sm:py-12">
          {/* سوالات متداول - شبیه اصلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#15354e] mb-3">
                ماشین‌حساب بار کانتینر SeaRates چیست؟
              </h2>
              <p className="text-sm text-[rgba(0,0,0,0.65)] leading-relaxed">
                ماشین‌حساب برنامه بارگیری کانتینر، به دلیل نیاز و ویژگی‌های اختصاصی، چیدمان بار شما را در چند مرحله بهینه‌سازی می‌کند.
                فرمول و روش‌شناسی منحصربه‌فرد SeaRates یک سیستم بارگیری کانتینر را در اختیار شما قرار می‌دهد که با آن می‌توانید کل عملیات بارگیری و تخلیه را با هر نوع باری شامل کارتن، کیسه بزرگ، بشکه، فله و... پیش‌بینی کنید.
              </p>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#15354e] mb-3">
                چگونه بار کانتینر را محاسبه کنیم؟
              </h2>
              <p className="text-sm text-[rgba(0,0,0,0.65)] leading-relaxed">
                به دنبال محاسبه‌گر ابعاد بار برای نیازهای عمومی هستید؟ به‌راحتی در ۳ مرحله از طریق ماشین‌حساب بارگیری کانتینر ۲۰ یا ۴۰ فوتی عبور کنید.
                تعجب می‌کنید چگونه یک محاسبه بار برای حمل با الزامات سفارشی انجام دهید؟
                عملکرد گسترده ابزار محاسبه SeaRates را برای تنظیم فضا و محاسبه چیدمان کانتینر کاوش کنید.
              </p>
            </div>
          </div>

          {/* مزایا - ۳ کارت */}
          <h2 className="text-lg sm:text-xl font-semibold text-[#15354e] mb-5 text-center">
            مزایای ماشین‌حساب چیدمان ۳بعدی کانتینر برای کسب‌وکار شما
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="border border-[#e8e8e8] rounded-md p-5 hover:shadow-md transition-shadow"
              >
                <div className="size-10 rounded-full bg-[#e6f7ff] flex items-center justify-center mb-3">
                  <span className="text-[#0088ff] font-bold text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#15354e] mb-2">
                  {b.title}
                </h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

          {/* بخش نهایی */}
          <div className="rounded-md bg-gradient-to-l from-[#e6f7ff] to-[#fafafa] p-6 text-center">
            <h2 className="text-lg font-semibold text-[#15354e] mb-2">
              ماشین‌حساب بار کانتینر اختصاصی خود را داشته باشید
            </h2>
            <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed max-w-2xl mx-auto mb-4">
              نحوه محاسبه فضای بار خود را مستقیماً روی وب‌سایت شرکتتان نشان دهید!
              به مشتریان وفادار و مخاطبان گسترده، نرم‌افزار بارگیری کانتینر برای طیف گسترده‌ای از کانتینرها، کامیون‌ها، بسته‌ها و ویژگی‌های بار ارائه دهید.
            </p>
            <button className="sr-btn-primary text-sm">
              درخواست قیمت IT
            </button>
          </div>
        </div>
      </section>

      {/* فوتر */}
      <footer className="bg-[#15354e] text-white">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-6 text-center text-xs sm:text-sm">
          <p className="mb-1">
            این ابزار بر اساس{" "}
            <a
              href="https://www.searates.com/load-calculator/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#40a9ff] hover:underline"
            >
              SeaRates Load Calculator
            </a>{" "}
            برای زبان فارسی و راست‌چین شبیه‌سازی شده است.
          </p>
          <p className="text-white/60 text-[10px] sm:text-xs">
            تمامی محاسبات به صورت محلی در مرورگر شما انجام می‌شود. این ابزار جایگزین مشاوره تخصصی بارگیری نیست.
          </p>
        </div>
      </footer>

      {/* مودال راهنما */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>راهنمای استفاده</DialogTitle>
            <DialogDescription>
              این ابزار به شما کمک می‌کند بهترین استفاده را از فضای کانتینر داشته باشید.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* دکمه راهنما شناور */}
      <button
        type="button"
        onClick={() => setShowInfo(true)}
        className="fixed bottom-4 left-4 size-11 rounded-full bg-[#0088ff] text-white shadow-lg flex items-center justify-center hover:bg-[#40a9ff] transition-colors z-20"
        title="راهنما"
      >
        <Info className="size-5" />
      </button>
    </div>
  );
}
