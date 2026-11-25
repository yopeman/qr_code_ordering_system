export type Locale = "en" | "am" | "om" | "ti";

export const SUPPORTED_LOCALES: Locale[] = ["en", "am", "om", "ti"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "qrcos_locale";

export interface LocaleOption {
  code: Locale;
  name: string;
  nativeName: string;
  shortLabel: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", name: "English", nativeName: "English", shortLabel: "EN" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", shortLabel: "አማ" },
  { code: "om", name: "Afaan Oromo", nativeName: "Afaan Oromoo", shortLabel: "OM" },
  { code: "ti", name: "Tigrigna", nativeName: "ትግርኛ", shortLabel: "ትግ" },
];

export function normalizeLocale(value?: string | null): Locale {
  if (value && SUPPORTED_LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}
