import { cookies } from "next/headers";
import {
  createTranslator,
  LOCALE_COOKIE_NAME,
  Locale,
  normalizeLocale,
  Translator,
} from "./index";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getServerI18n(): Promise<{
  locale: Locale;
  t: Translator;
}> {
  const locale = await getServerLocale();
  return {
    locale,
    t: createTranslator(locale),
  };
}
