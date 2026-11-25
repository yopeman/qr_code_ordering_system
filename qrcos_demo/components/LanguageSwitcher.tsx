"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LOCALE_OPTIONS } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    LOCALE_OPTIONS.find((opt) => opt.code === locale) || LOCALE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.selectLanguage")}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 transition touch-manipulation"
      >
        <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
        <span className="hidden sm:inline">{activeOption.nativeName}</span>
        <span className="sm:hidden">{activeOption.shortLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("common.selectLanguage")}
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50"
        >
          {LOCALE_OPTIONS.map((opt) => {
            const isSelected = opt.code === locale;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition ${
                  isSelected
                    ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div>
                  <div className="leading-tight">{opt.nativeName}</div>
                  {opt.nativeName !== opt.name && (
                    <div className="text-[10px] text-slate-400 font-normal">
                      {opt.name}
                    </div>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
