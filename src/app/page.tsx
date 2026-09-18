"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { WizardStepper, type StepId } from "@/components/load-calculator/wizard-stepper";
import {
  ProductsStep,
  type ProductRow,
  type Group,
  getProductDisplayName,
  getGroupDisplayName,
  isDefaultGroupName,
  isDefaultItemName,
} from "@/components/load-calculator/products-step";
import { ContainersStep, getSelectedContainer } from "@/components/load-calculator/containers-step";
import { ResultStep } from "@/components/load-calculator/result-step";
import { CbmCalculator } from "@/components/load-calculator/cbm-calculator";
import { calculateMultiStuffing, type MultiProductInput } from "@/lib/load-calculation";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "@/i18n/context";
import { CONTAINERS } from "@/lib/containers";
import {
  Ship,
  ChevronDown,
  Menu,
  X,
  Info,
  Boxes,
  Container as ContainerIcon,
  HelpCircle,
  Award,
  Table as TableIcon,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ToolMode = "load" | "cbm";

interface HistoryState {
  toolMode: ToolMode;
  step: StepId;
}

export default function Home() {
  const { t, formatNumber, isRtl, locale } = useTranslation();
  const [toolMode, setToolMode] = useState<ToolMode>("load");
  const [currentStep, setCurrentStep] = useState<StepId>("products");
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [groups, setGroups] = useState<Group[]>([
    { id: "grp-1", name: "", isCustomName: false },
  ]);
  const [products, setProducts] = useState<ProductRow[]>([
    {
      id: "prod-1",
      groupId: "grp-1",
      type: "Boxes",
      name: "",
      isCustomName: false,
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
      name: "",
      isCustomName: false,
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
      name: "",
      isCustomName: false,
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
  const [navDir, setNavDir] = useState<"fwd" | "back">("fwd");
  const mainRef = useRef<HTMLElement>(null);

  // Dynamically ensure default group & product labels clear out stale locale names on locale changes
  useEffect(() => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (!g.isCustomName || isDefaultGroupName(g.name)) {
          return { ...g, name: "", isCustomName: false };
        }
        return g;
      })
    );

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (!p.isCustomName || isDefaultItemName(p.name)) {
          return { ...p, name: "", isCustomName: false };
        }
        return p;
      })
    );
  }, [locale]);

  // Dynamic steps based on current language
  const steps = useMemo(
    () => [
      {
        id: "products" as StepId,
        index: 1,
        title: t.steps.products,
        icon: null,
      },
      {
        id: "containers" as StepId,
        index: 2,
        title: t.steps.containers,
        icon: null,
      },
      {
        id: "result" as StepId,
        index: 3,
        title: t.steps.result,
        icon: null,
      },
    ],
    [t.steps]
  );

  // Reset scroll on step/mode transition
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [toolMode, currentStep]);

  // Support mobile back button history
  const skipPush = useRef(false);

  useEffect(() => {
    window.history.replaceState(
      { toolMode: "load", step: "products" } satisfies HistoryState,
      ""
    );

    const onPopState = (e: PopStateEvent) => {
      const s = e.state as HistoryState | null;
      skipPush.current = true;
      if (s) {
        setToolMode(s.toolMode);
        if (s.toolMode === "load") setCurrentStep(s.step);
      } else {
        setToolMode("load");
        setCurrentStep("products");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const s = window.history.state as HistoryState | null;
    if (s && s.toolMode === toolMode && (toolMode === "cbm" || s.step === currentStep)) {
      return;
    }
    window.history.pushState({ toolMode, step: currentStep } satisfies HistoryState, "");
  }, [toolMode, currentStep]);

  const goToStep = (step: StepId) => {
    const idx = steps.findIndex((s) => s.id === step);
    if (idx <= maxReachedStep) {
      setNavDir(idx < steps.findIndex((s) => s.id === currentStep) ? "back" : "fwd");
      setCurrentStep(step);
    }
  };

  const next = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1];
      setNavDir("fwd");
      setCurrentStep(nextStep.id);
      setMaxReachedStep(Math.max(maxReachedStep, idx + 1));
    }
  };

  const back = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      setNavDir("back");
      setCurrentStep(steps[idx - 1].id);
    }
  };

  const restart = () => {
    setCurrentStep("products");
    setMaxReachedStep(0);
  };

  // Stuffing calculation
  const stuffingResult = useMemo(() => {
    if (currentStep !== "result") return null;
    const multiProducts: MultiProductInput[] = products.map((p, i) => ({
      id: p.id,
      name: getProductDisplayName(p, i, t, locale, formatNumber),
      color: p.color,
      lengthMm: parseFloat(p.length) || 0,
      widthMm: parseFloat(p.width) || 0,
      heightMm: parseFloat(p.height) || 0,
      weightKg: parseFloat(p.weight) || 0,
      quantity: parseInt(p.quantity) || 0,
      stackable: p.stackable,
      maxStack: parseInt(p.maxStack) || 0,
    }));
    const cont = getSelectedContainer(selectedContainerId);
    return calculateMultiStuffing(multiProducts, cont);
  }, [currentStep, products, selectedContainerId, t, locale, formatNumber]);

  const container = getSelectedContainer(selectedContainerId);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden md:h-auto md:min-h-screen md:overflow-visible bg-[#f5f5f5]">
      {/* Header */}
      <header className="shrink-0 sticky top-0 z-30 bg-white border-b border-[#e8e8e8] safe-top">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-md bg-[#0088ff] flex items-center justify-center shadow-xs">
                <Ship className="size-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-[#15354e] tracking-tight">
                  {t.nav.brand}
                </span>
                <span className="text-[10px] text-[rgba(0,0,0,0.45)] uppercase tracking-wider">
                  {t.nav.subBrand}
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f7ff] text-[#0088ff] border border-[#91d5ff]/60 animate-pulse">
                {t.nav.freeBadge}
              </span>
              <button
                type="button"
                onClick={() => setToolMode("load")}
                className={cn(
                  "transition-colors font-medium cursor-pointer",
                  toolMode === "load" ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
                )}
              >
                {t.nav.containerLoad}
              </button>
              <button
                type="button"
                onClick={() => setToolMode("cbm")}
                className={cn(
                  "transition-colors font-medium cursor-pointer",
                  toolMode === "cbm" ? "text-[#0088ff]" : "text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
                )}
              >
                {t.nav.cbmCalculator}
              </button>
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                className="text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] transition-colors cursor-pointer"
              >
                {t.nav.guide}
              </button>
              <a
                href="https://zandesh.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[rgba(0,0,0,0.55)] hover:text-[#0088ff] border-s border-[#e8e8e8] ps-3 transition-colors"
              >
                {t.nav.parentSite}
              </a>
              <a
                href="mailto:info@zandesh.com"
                className="text-xs font-medium text-[rgba(0,0,0,0.55)] hover:text-[#0088ff] border-s border-[#e8e8e8] ps-3 transition-colors flex items-center gap-1.5"
                title="info@zandesh.com"
              >
                <Mail className="size-3.5 text-[#0088ff]" />
                <span>info@zandesh.com</span>
              </a>
              <LanguageSelector />
            </nav>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSelector compact />
              <button
                type="button"
                className="inline-flex items-center justify-center size-9 text-[rgba(0,0,0,0.65)] hover:text-[#0088ff] rounded-md active:bg-black/5 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <nav className="md:hidden flex flex-col gap-1 py-2 border-t border-[#f0f0f0] animate-in fade-in-50">
              <button
                type="button"
                onClick={() => {
                  setToolMode("load");
                  setMenuOpen(false);
                }}
                className="text-start text-sm text-[rgba(0,0,0,0.75)] py-2.5 px-2 rounded-md active:bg-black/5 transition-colors"
              >
                {t.nav.containerLoad}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToolMode("cbm");
                  setMenuOpen(false);
                }}
                className="text-start text-sm text-[rgba(0,0,0,0.75)] py-2.5 px-2 rounded-md active:bg-black/5 transition-colors"
              >
                {t.nav.cbmCalculator}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInfo(true);
                  setMenuOpen(false);
                }}
                className="text-start text-sm text-[rgba(0,0,0,0.75)] py-2.5 px-2 rounded-md active:bg-black/5 transition-colors"
              >
                {t.nav.guide}
              </button>
              <a
                href="https://zandesh.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-start text-sm text-[#0088ff] font-medium py-2.5 px-2 rounded-md active:bg-black/5 transition-colors border-t border-[#f0f0f0]"
              >
                {t.nav.parentSite} ↗
              </a>
              <a
                href="mailto:info@zandesh.com"
                className="text-start text-sm text-[#15354e] font-medium py-2.5 px-2 rounded-md active:bg-black/5 transition-colors border-t border-[#f0f0f0] flex items-center gap-2"
              >
                <Mail className="size-4 text-[#0088ff]" />
                <span>info@zandesh.com</span>
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Header Section */}
      <div className="shrink-0 bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-5">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-base sm:text-2xl font-bold text-[#15354e]">{t.hero.title}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]">
              {locale === "fa" ? "۱۰۰٪ رایگان" : "100% Free"}
            </span>
          </div>
          <p className="hidden sm:block text-xs sm:text-sm text-[rgba(0,0,0,0.65)] max-w-3xl leading-relaxed">
            {t.hero.description}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-[#0088ff] bg-[#e6f7ff] px-3 py-1.5 rounded-md border border-[#91d5ff]/50">
            <span>{t.hero.freeHighlight}</span>
          </div>

          {/* Tool Mode Tabs (Desktop) */}
          <div className="mt-3 sm:mt-4 hidden sm:inline-flex flex-wrap rounded-md border border-[#d9d9d9] overflow-hidden w-full sm:w-auto shadow-xs">
            <button
              type="button"
              onClick={() => setToolMode("load")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                toolMode === "load"
                  ? "bg-[#0088ff] text-white"
                  : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
              )}
            >
              <ContainerIcon className="size-4" />
              {t.hero.btnLoad}
            </button>
            <button
              type="button"
              onClick={() => setToolMode("cbm")}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-s border-[#d9d9d9]",
                toolMode === "cbm"
                  ? "bg-[#0088ff] text-white"
                  : "bg-white text-[rgba(0,0,0,0.65)] hover:text-[#0088ff]"
              )}
            >
              <Boxes className="size-4" />
              {t.hero.btnCbm}
            </button>
          </div>
        </div>
      </div>

      {/* Stepper (Only in Load Calculator Mode) */}
      {toolMode === "load" && (
        <div className="shrink-0 w-full max-w-[1200px] mx-auto px-2.5 sm:px-6 pt-2 sm:pt-4">
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
            maxReachedStep={maxReachedStep}
          />
        </div>
      )}

      {/* Main Tool Content Container */}
      <main
        ref={mainRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain w-full max-w-[1200px] mx-auto px-2.5 sm:px-6 py-3 sm:py-6"
      >
        {toolMode === "cbm" ? (
          <div key="cbm" className="animate-step-fwd">
            <CbmCalculator />
          </div>
        ) : (
          <>
            {currentStep === "products" && (
              <div
                key="products"
                className={navDir === "fwd" ? "animate-step-fwd" : "animate-step-back"}
              >
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
              <div
                key="containers"
                className={navDir === "fwd" ? "animate-step-fwd" : "animate-step-back"}
              >
                <ContainersStep
                  selectedId={selectedContainerId}
                  onSelect={setSelectedContainerId}
                  onNext={next}
                  onBack={back}
                />
              </div>
            )}

            {currentStep === "result" && stuffingResult && (
              <div
                key="result"
                className={navDir === "fwd" ? "animate-step-fwd" : "animate-step-back"}
              >
                <ResultStep
                  result={stuffingResult}
                  container={container}
                  products={products}
                  onBack={back}
                  onRestart={restart}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Rich SEO Content Section (Desktop & Search Engine Crawlers) */}
      <section className="hidden md:block bg-white border-t border-[#e8e8e8] mt-6">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-10">
          {/* FAQ Accordion / Grid */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="size-5 text-[#0088ff]" />
              <h2 className="text-xl font-bold text-[#15354e]">{t.faq.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-[#fafafa]">
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.faq.q1}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">{t.faq.a1}</p>
              </div>
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-[#fafafa]">
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.faq.q2}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">{t.faq.a2}</p>
              </div>
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-[#fafafa]">
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.faq.q3}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">{t.faq.a3}</p>
              </div>
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-[#fafafa]">
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.faq.q4}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">{t.faq.a4}</p>
              </div>
            </div>
          </div>

          {/* Standard Container Specifications Table for Google Answer Boxes */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TableIcon className="size-5 text-[#0088ff]" />
              <h2 className="text-lg font-bold text-[#15354e]">{t.tableSpecs.title}</h2>
            </div>
            <div className="overflow-x-auto rounded-md border border-[#e8e8e8]">
              <table className="w-full text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e8e8e8]">
                  <tr>
                    <th
                      className={cn(
                        "p-3 font-semibold text-[rgba(0,0,0,0.75)]",
                        isRtl ? "text-right" : "text-left"
                      )}
                    >
                      {t.tableSpecs.colType}
                    </th>
                    <th
                      className={cn(
                        "p-3 font-semibold text-[rgba(0,0,0,0.75)]",
                        isRtl ? "text-right" : "text-left"
                      )}
                    >
                      {t.tableSpecs.colInternal}
                    </th>
                    <th
                      className={cn(
                        "p-3 font-semibold text-[rgba(0,0,0,0.75)]",
                        isRtl ? "text-right" : "text-left"
                      )}
                    >
                      {t.tableSpecs.colVolume}
                    </th>
                    <th
                      className={cn(
                        "p-3 font-semibold text-[rgba(0,0,0,0.75)]",
                        isRtl ? "text-right" : "text-left"
                      )}
                    >
                      {t.tableSpecs.colPayload}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {CONTAINERS.map((c) => (
                    <tr key={c.id} className="hover:bg-[#fafafa]">
                      <td className="p-3 font-medium text-[#15354e]">
                        {t.containers.items[c.id]?.name || c.nameEn}
                      </td>
                      <td className="p-3 tabular-nums">
                        {formatNumber(c.internalLength)} × {formatNumber(c.internalWidth)} ×{" "}
                        {formatNumber(c.internalHeight)} cm
                      </td>
                      <td className="p-3 tabular-nums text-[#0088ff] font-medium">
                        {formatNumber(c.capacity, 1)} m³
                      </td>
                      <td className="p-3 tabular-nums font-medium">
                        {formatNumber(c.maxPayload)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Benefits Cards */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Award className="size-5 text-[#0088ff]" />
              <h2 className="text-xl font-bold text-[#15354e]">{t.benefits.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-white shadow-xs">
                <div className="size-9 rounded-full bg-[#e6f7ff] text-[#0088ff] flex items-center justify-center font-bold text-sm mb-3">
                  01
                </div>
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.benefits.b1Title}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">
                  {t.benefits.b1Desc}
                </p>
              </div>
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-white shadow-xs">
                <div className="size-9 rounded-full bg-[#e6f7ff] text-[#0088ff] flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.benefits.b2Title}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">
                  {t.benefits.b2Desc}
                </p>
              </div>
              <div className="border border-[#e8e8e8] rounded-md p-5 bg-white shadow-xs">
                <div className="size-9 rounded-full bg-[#e6f7ff] text-[#0088ff] flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h3 className="text-sm font-bold text-[#15354e] mb-2">{t.benefits.b3Title}</h3>
                <p className="text-xs text-[rgba(0,0,0,0.65)] leading-relaxed">
                  {t.benefits.b3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Desktop) */}
      <footer className="hidden md:block bg-[#15354e] text-white">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-6 text-center text-xs">
          <p className="mb-1.5 font-medium">{t.footer.desc}</p>
          <p className="text-white/60 text-[11px] max-w-2xl mx-auto leading-relaxed">
            {t.footer.disclaimer}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-white/60 text-[11px]">
            <span>© {new Date().getFullYear()} Zandesh Logistics Group.</span>
            <span>•</span>
            <a
              href="https://zandesh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#40a9ff] hover:underline"
            >
              zandesh.com
            </a>
            <span>•</span>
            <a
              href="mailto:info@zandesh.com"
              className="text-[#40a9ff] hover:underline inline-flex items-center gap-1"
            >
              <Mail className="size-3 inline" />
              info@zandesh.com
            </a>
            <span>•</span>
            <span>{t.footer.rights}</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigation"
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
            <ContainerIcon className="size-5" />
            <span className={cn("text-[10px]", toolMode === "load" && "font-semibold")}>
              {t.nav.containerLoad}
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
            <Boxes className="size-5" />
            <span className={cn("text-[10px]", toolMode === "cbm" && "font-semibold")}>
              {t.nav.cbmCalculator}
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

      {/* Guide / Info Modal */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.nav.guide}</DialogTitle>
            <DialogDescription className="text-start leading-relaxed text-xs sm:text-sm mt-2 space-y-2">
              <span className="block font-semibold text-[#15354e]">
                • {t.hero.btnLoad}:
              </span>
              <span className="block text-[rgba(0,0,0,0.7)]">{t.containers.subtitle}</span>
              <span className="block font-semibold text-[#15354e] pt-2">
                • {t.hero.btnCbm}:
              </span>
              <span className="block text-[rgba(0,0,0,0.7)]">{t.cbm.subtitle}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 pt-3 border-t border-[#e8e8e8] flex items-center justify-between text-xs text-[rgba(0,0,0,0.65)]">
            <span>{locale === "fa" ? "ارتباط و پشتیبانی:" : "Contact & Support:"}</span>
            <a
              href="mailto:info@zandesh.com"
              className="text-[#0088ff] hover:underline font-medium inline-flex items-center gap-1.5"
            >
              <Mail className="size-3.5 text-[#0088ff]" />
              info@zandesh.com
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Info Button */}
      <button
        type="button"
        onClick={() => setShowInfo(true)}
        className={cn(
          "fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-4 size-10 rounded-full bg-[#0088ff] text-white shadow-lg flex items-center justify-center hover:bg-[#40a9ff] active:bg-[#007ae6] transition-colors z-30",
          isRtl ? "left-3 sm:left-4" : "right-3 sm:right-4"
        )}
        title={t.nav.guide}
        aria-label={t.nav.guide}
      >
        <Info className="size-4" />
      </button>
    </div>
  );
}
