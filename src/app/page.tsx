"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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

type ToolMode = "load" | "cbm";

interface HistoryState {
  toolMode: ToolMode;
  step: StepId;
}

// محتوای پایین صفحه - مطابق SeaRates
const BENEFITS = [
  {
    title: "سود-مقرون‌به‌صرفه بودن",
    desc: "ماشین‌حساب بار برای این طراحی شده که به شما نشان دهد چگونه بارهای کانتینری را محاسبه کنید تا بودجه حمل‌ونقل خود را در عمل بهینه‌سازی نمایید. در مصرف سوخت، عملیات بارگیری و تخلیه کانتینر، بسته‌بندی بار و کل زنجیره تأمین صرفه‌جویی کنید. اگر کسب‌وکار شما در تلاش است تا تجارت خود را توسعه دهد نه هزینه‌ها، اکنون یاد بگیرید چگونه بار را در کشتی یا کامیون محاسبه کنید.",
  },
  {
    title: "بهینه‌سازی فضا و چیدمان",
    desc: "فضا را به‌صورت اختصاصی محاسبه کنید. برای کانتینرهای استاندارد، یخچال‌دار، ۲۰ فوتی یا ۴۰ فوتی های‌کیوب، ماشین‌حساب ظرفیت بارگیری آماده ارائه راه‌حل‌های بهینه برای چیدمان با رمپ‌های بارگیری، قابلیت محاسبه پالت و... است. خود را به روش‌های استاندارد برای بارگیری کانتینر و کامیون محدود نکنید — گزینه‌های مناسب برای نیازهای اضافی بار شکننده و غیراستاندارد خود را دریافت کنید.",
  },
  {
    title: "بصری‌سازی پیشرفته",
    desc: "ماشین‌حساب آنلاین یک طرح ۳بعدی تعاملی با بصری‌سازی دقیق ارائه می‌دهد که مستقیماً متناسب با نیازهای شما تنظیم شده است. محاسبه‌گر چیدمان ۳بعدی اطمینان حاصل می‌کند که فرایند بارگیری و تخلیه کامیون یا کانتینر شما به‌خوبی پیش می‌رود. از روش‌های بارگیری ناکارآمد که هنگام تخلیه مشکل ایجاد می‌کنند پرهیز کنید. رویکرد فردی و کارآمد را با ویژگی‌های محاسبه‌گر بار ۳بعدی به‌کار ببرید.",
  },
];

export default function Home() {
  // حالت ابزار: چیدمان بار یا ماشین‌حساب CBM
  const [toolMode, setToolMode] = useState<ToolMode>("load");
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
  const mainRef = useRef<HTMLElement>(null);

  // ریست اسکرول داخلی هنگام تغییر ابزار/مرحله (اپ‌مانند)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [toolMode, currentStep]);

  /* ---------- پشتیبانی دکمه Back در WebView (دیوار/مایکت/مرورگر موبایل) ---------- */
  const skipPush = useRef(false);

  useEffect(() => {
    // وضعیت اولیه بدون افزودن به استک
    window.history.replaceState({ toolMode: "load", step: "products" } satisfies HistoryState, "");

    const onPopState = (e: PopStateEvent) => {
      const s = e.state as HistoryState | null;
      skipPush.current = true; // تغییر ناشی از Back است؛ دوباره push نکن
      if (s) {
        setToolMode(s.toolMode);
        if (s.toolMode === "load") setCurrentStep(s.step);
      } else {
        // بازگشت به ابتدای استک
        setToolMode("load");
        setCurrentStep("products");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // هر تغییر وضعیت ابزار/مرحله به history اضافه می‌شود تا دکمه Back طبیعی کار کند
  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const s = window.history.state as HistoryState | null;
    if (s && s.toolMode === toolMode && (toolMode === "cbm" || s.step === currentStep)) {
      return; // تغییری نیازی به ورودی جدید نیست
    }
    window.history.pushState({ toolMode, step: currentStep } satisfies HistoryState, "");
  }, [toolMode, currentStep]);

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
    <div className="flex flex-col h-[100dvh] overflow-hidden md:h-auto md:min-h-screen md:overflow-visible bg-[#f5f5f5]">
      {/* هدر - بهینه برای موبایل با safe-area */}
      <header className="shrink-0 sticky top-0 z-30 bg-white border-b border-[#e8e8e8] safe-top">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* لوگو */}
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-md bg-[#0088ff] flex items-center justify-center">
                <Ship className="size-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-[#15354e]">LoadCalc</span>
                <span className="text-[10px] text-[rgba(0,0,0,0.45)] uppercase tracking-wide">فارسی</span>
              </div>
            </div>

            {/* منوی دسکتاپ */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <button className="flex items-center gap-1 text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">
                ابزارها
                <ChevronDown className="size-3.5" />
              </button>
              <button className="text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors">راهنما</button>
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                className="text-[#0088ff] font-medium transition-colors"
              >
                درباره
              </button>
            </nav>

            {/* دکمه موبایل */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center size-10 text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] rounded-md active:bg-black/5 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* منوی موبایل */}
          {menuOpen && (
            <nav className="md:hidden flex flex-col gap-1 py-2 border-t border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => {
                  setShowInfo(true);
                  setMenuOpen(false);
                }}
                className="text-right text-sm text-[rgba(0,0,0,0.75)] py-3 px-2 rounded-md active:bg-black/5 transition-colors min-h-[44px]"
              >
                راهنمای استفاده
              </button>
              <button
                type="button"
                onClick={() => {
                  setToolMode("cbm");
                  setMenuOpen(false);
                  window.scrollTo({ top: 0 });
                }}
                className="text-right text-sm text-[rgba(0,0,0,0.75)] py-3 px-2 rounded-md active:bg-black/5 transition-colors min-h-[44px]"
              >
                ماشین‌حساب CBM
              </button>
              <button
                type="button"
                onClick={() => {
                  setToolMode("load");
                  setMenuOpen(false);
                  window.scrollTo({ top: 0 });
                }}
                className="text-right text-sm text-[rgba(0,0,0,0.75)] py-3 px-2 rounded-md active:bg-black/5 transition-colors min-h-[44px]"
              >
                چیدمان بار در کانتینر
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* عنوان صفحه - در موبایل کامپکت اپ‌مانند (بخش ثابت پوسته) */}
      <div className="shrink-0 bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-2.5 sm:py-8">
          <h1 className="text-base sm:text-3xl font-semibold text-[#15354e]">
            محاسبه بار و چیدمان
          </h1>
          <p className="hidden sm:block text-[13px] sm:text-sm text-[rgba(0,0,0,0.65)] mt-1.5 sm:mt-2 max-w-3xl leading-relaxed">
            ابزار هوشمند برای محاسبه بهینه چیدمان بار در کانتینر، کامیون و سایر وسایل نقلیه حمل.
            بار خود را وارد کنید، نوع وسیله نقلیه را انتخاب کنید و چیدمان ۳بعدی بهینه را مشاهده کنید.
          </p>

          {/* انتخاب ابزار: دسکتاپ (در موبایل نوار پایین جایگزین است) */}
          <div className="mt-4 sm:mt-5 hidden sm:inline-flex flex-wrap rounded-md border border-[#d9d9d9] overflow-hidden w-full sm:w-auto">
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

      {/* ویزارد استپر - ثابت زیر عنوان (فقط حالت چیدمان بار) */}
      {toolMode === "load" && (
        <div className="shrink-0 w-full max-w-[1200px] mx-auto px-2.5 sm:px-6 pt-3 sm:pt-6">
          <WizardStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
            maxReachedStep={maxReachedStep}
          />
        </div>
      )}

      {/* محتوای ابزار - در موبایل اسکرول داخلی (اپ‌مانند)، بدنه صفحه اسکرول عمودی ندارد */}
      <main
        ref={mainRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain w-full max-w-[1200px] mx-auto px-2.5 sm:px-6 py-3 sm:py-6"
      >
        {toolMode === "cbm" ? (
          <div className="animate-fade-in-up">
            <CbmCalculator />
          </div>
        ) : (
          <>
            {currentStep === "products" && (
              <div className="animate-fade-in-up">
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

      {/* بخش محتوای پایین (سئو) - فقط دسکتاپ؛ در موبایل حذف برای حس اپ واقعی */}
      <section className="hidden md:block bg-white border-t border-[#e8e8e8] mt-4">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-8 sm:py-12">
          {/* سوالات متداول - شبیه اصلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#15354e] mb-3">
                ماشین‌حساب بار کانتینر چیست؟
              </h2>
              <p className="text-sm text-[rgba(0,0,0,0.65)] leading-relaxed">
                ماشین‌حساب برنامه بارگیری کانتینر، به دلیل نیاز و ویژگی‌های اختصاصی، چیدمان بار شما را در چند مرحله بهینه‌سازی می‌کند.
                روش محاسباتی منحصربه‌فرد این ابزار یک سیستم بارگیری کانتینر را در اختیار شما قرار می‌دهد که با آن می‌توانید کل عملیات بارگیری و تخلیه را با هر نوع باری شامل کارتن، کیسه بزرگ، بشکه، فله و... پیش‌بینی کنید.
              </p>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#15354e] mb-3">
                چگونه بار کانتینر را محاسبه کنیم؟
              </h2>
              <p className="text-sm text-[rgba(0,0,0,0.65)] leading-relaxed">
                به دنبال محاسبه‌گر ابعاد بار برای نیازهای عمومی هستید؟ به‌راحتی در ۳ مرحله از طریق ماشین‌حساب بارگیری کانتینر ۲۰ یا ۴۰ فوتی عبور کنید.
                تعجب می‌کنید چگونه یک محاسبه بار برای حمل با الزامات سفارشی انجام دهید؟
                عملکرد گسترده ابزار محاسبه را برای تنظیم فضا و محاسبه چیدمان کانتینر کاوش کنید.
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
        </div>
      </section>

      {/* فوتر - فقط دسکتاپ؛ موبایل اپ‌مانند بدون فوتر */}
      <footer className="hidden md:block bg-[#15354e] text-white">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-6 text-center text-xs sm:text-sm">
          <p className="mb-1">
            ماشین‌حساب بار و CBM فارسی — محاسبه حجم، وزن حجمی و چیدمان سه‌بعدی کانتینر و کامیون.
          </p>
          <p className="text-white/60 text-[10px] sm:text-xs">
            تمامی محاسبات به صورت محلی در مرورگر شما انجام می‌شود. این ابزار جایگزین مشاوره تخصصی بارگیری نیست.
          </p>
        </div>
      </footer>

      {/* نوار ناوبری پایین - مخصوص موبایل، درون جریان پوسته (نه fixed) */}
      <nav
        aria-label="ناوبری اصلی"
        className="shrink-0 md:hidden bg-white border-t border-[#e8e8e8] safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      >
        <div className="grid grid-cols-2 h-16 max-w-[560px] mx-auto">
          <button
            type="button"
            onClick={() => setToolMode("load")}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 transition-colors active:bg-black/5",
              toolMode === "load" ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.45)]"
            )}
            aria-current={toolMode === "load" ? "page" : undefined}
          >
            <ContainerIcon className="size-[22px]" />
            <span className={cn("text-[10px]", toolMode === "load" && "font-semibold")}>
              چیدمان بار
            </span>
            <span
              className={cn(
                "absolute top-0 h-0.5 w-10 rounded-full transition-opacity",
                toolMode === "load" ? "bg-[#0088ff] opacity-100" : "opacity-0"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => setToolMode("cbm")}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 transition-colors active:bg-black/5",
              toolMode === "cbm" ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.45)]"
            )}
            aria-current={toolMode === "cbm" ? "page" : undefined}
          >
            <Boxes className="size-[22px]" />
            <span className={cn("text-[10px]", toolMode === "cbm" && "font-semibold")}>
              ماشین‌حساب CBM
            </span>
            <span
              className={cn(
                "absolute top-0 h-0.5 w-10 rounded-full transition-opacity",
                toolMode === "cbm" ? "bg-[#0088ff] opacity-100" : "opacity-0"
              )}
            />
          </button>
        </div>
      </nav>

      {/* مودال راهنما */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>راهنمای استفاده</DialogTitle>
            <DialogDescription className="text-right leading-relaxed">
              این ابزار به شما کمک می‌کند بهترین استفاده را از فضای کانتینر داشته باشید:
              <br />
              <br />
              • <b>چیدمان بار:</b> محصولات و ابعادشان را وارد کنید، کانتینر یا کامیون را انتخاب کنید و چیدمان
              سه‌بعدی بهینه را ببینید.
              <br />
              • <b>ماشین‌حساب CBM:</b> حجم هر بسته (پالت، کارتن، استوانه، رول، پاکت و...)، وزن حجمی و وزن قابل
              احتساب هر شیوه حمل (دریایی، هوایی، زمینی، ریلی) را محاسبه کنید.
              <br />• همه محاسبات روی گوشی شما و به‌صورت آفلاین انجام می‌شود.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* دکمه راهنما شناور - بالای نوار ناوبری در موبایل */}
      <button
        type="button"
        onClick={() => setShowInfo(true)}
        className="fixed left-3 sm:left-4 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-4 size-11 rounded-full bg-[#0088ff] text-white shadow-lg flex items-center justify-center hover:bg-[#40a9ff] active:bg-[#007ae6] transition-colors z-30"
        title="راهنما"
        aria-label="راهنمای استفاده"
      >
        <Info className="size-5" />
      </button>
    </div>
  );
}
