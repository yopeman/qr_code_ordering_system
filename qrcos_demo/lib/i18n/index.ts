import { DEFAULT_LOCALE, Locale, normalizeLocale } from "./config";
import en, { TranslationKey } from "./locales/en";
import am from "./locales/am";
import om from "./locales/om";
import ti from "./locales/ti";

export * from "./config";
export type { TranslationKey };

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  am,
  om,
  ti,
};

export type Translator = (
  key: TranslationKey,
  vars?: Record<string, string | number>
) => string;

export function getDictionary(locale: Locale): Record<TranslationKey, string> {
  return DICTIONARIES[normalizeLocale(locale)] || DICTIONARIES[DEFAULT_LOCALE];
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const dict = getDictionary(locale);
  let text = dict[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return text;
}

export function createTranslator(locale: Locale): Translator {
  return (key, vars) => translate(locale, key, vars);
}
