"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createTranslator,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  Locale,
  normalizeLocale,
  Translator,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Translator;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: createTranslator(DEFAULT_LOCALE),
});

export function I18nProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(normalizeLocale(initialLocale));

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_COOKIE_NAME);
      if (saved) {
        const normalized = normalizeLocale(saved);
        if (normalized !== locale) {
          setLocaleState(normalized);
          document.cookie = `${LOCALE_COOKIE_NAME}=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
          router.refresh();
        }
      }
    } catch {
      // ignore storage access errors
    }
    // Only run once on mount to reconcile localStorage with server cookie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      const normalized = normalizeLocale(next);
      setLocaleState(normalized);
      document.documentElement.lang = normalized;
      document.cookie = `${LOCALE_COOKIE_NAME}=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem(LOCALE_COOKIE_NAME, normalized);
      } catch {
        // ignore storage access errors
      }
      router.refresh();
    },
    [router]
  );

  const t = useMemo(() => createTranslator(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
