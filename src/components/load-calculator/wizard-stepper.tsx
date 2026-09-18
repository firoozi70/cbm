"use client";

import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

export type StepId = "products" | "containers" | "result";

interface Step {
  id: StepId;
  index: number;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
}

interface Props {
  steps: Step[];
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;
  maxReachedStep: number;
}

export function WizardStepper({ steps, currentStep, onStepClick, maxReachedStep }: Props) {
  const { formatNumber, isRtl } = useTranslation();
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border-b border-[#e8e8e8]">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4">
        <div className="flex items-stretch justify-between relative">
          {/* Background line */}
          <div className="absolute top-1/2 right-0 left-0 h-px bg-[#e8e8e8] -translate-y-1/2 hidden sm:block" />

          {steps.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex || idx < maxReachedStep;
            const isClickable = idx <= maxReachedStep && !!onStepClick;

            return (
              <div key={step.id} className="flex-1 relative">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  className={cn(
                    "relative w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-4 px-2 sm:px-4 transition-all border-b-2 -mb-px",
                    isActive
                      ? "border-[#0088ff]"
                      : isCompleted
                      ? "border-transparent hover:border-[#e8e8e8]"
                      : "border-transparent",
                    isClickable && "cursor-pointer hover:bg-[#fafafa]"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 transition-all shrink-0 font-bold",
                      isActive
                        ? "bg-[#0088ff] border-[#0088ff] text-white"
                        : isCompleted
                        ? "bg-[#52c41a] border-[#52c41a] text-white"
                        : "bg-white border-[#d9d9d9] text-[rgba(0,0,0,0.45)]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4" />
                    ) : (
                      <span className="text-xs font-semibold">{formatNumber(step.index)}</span>
                    )}
                  </div>

                  <div className="flex flex-col items-center sm:items-start gap-0.5">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium transition-colors leading-tight text-center sm:text-start",
                        isActive
                          ? "text-[#0088ff] font-semibold"
                          : isCompleted
                          ? "text-[#52c41a]"
                          : "text-[rgba(0,0,0,0.65)]"
                      )}
                    >
                      {step.title}
                    </span>
                    {step.subtitle && (
                      <span className="hidden sm:block text-[10px] text-[rgba(0,0,0,0.35)]">
                        {step.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Step divider chevron */}
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "hidden sm:block absolute top-1/2 -translate-y-1/2 z-10 text-[rgba(0,0,0,0.25)]",
                        isRtl ? "left-0 -ml-2" : "right-0 -mr-2"
                      )}
                    >
                      {isRtl ? (
                        <ChevronLeft className="size-4 text-[#d9d9d9]" />
                      ) : (
                        <ChevronRight className="size-4 text-[#d9d9d9]" />
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
