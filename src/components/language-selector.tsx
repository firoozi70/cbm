"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n/context";
import { LANGUAGES, type Locale } from "@/i18n/types";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ compact = false, className }: LanguageSelectorProps) {
  const { locale, setLocale, currentLanguage, isRtl } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-[#d9d9d9] bg-white hover:bg-[#fafafa] active:bg-[#f0f0f0] text-[rgba(0,0,0,0.75)] hover:text-[#0088ff] transition-all shadow-xs",
          isOpen && "border-[#0088ff] ring-1 ring-[#0088ff]/20"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language / تغییر زبان / 选择语言"
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        {!compact && (
          <span className="font-medium text-xs sm:text-sm">{currentLanguage.nativeName}</span>
        )}
        <ChevronDown
          className={cn(
            "size-3.5 text-[rgba(0,0,0,0.45)] transition-transform duration-200",
            isOpen && "rotate-180 text-[#0088ff]"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 border border-[#e8e8e8] animate-in fade-in-80 zoom-in-95",
            isRtl ? "left-0" : "right-0"
          )}
          role="listbox"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[rgba(0,0,0,0.45)] uppercase border-b border-[#f0f0f0]">
            Select Language
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs text-right transition-colors",
                    lang.dir === "rtl" ? "text-right" : "text-left",
                    isSelected
                      ? "bg-[#e6f7ff] text-[#0088ff] font-semibold"
                      : "text-[rgba(0,0,0,0.75)] hover:bg-[#fafafa] hover:text-[#0088ff]"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight">{lang.nativeName}</span>
                      <span className="text-[10px] text-[rgba(0,0,0,0.45)] font-normal">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="size-3.5 text-[#0088ff] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
