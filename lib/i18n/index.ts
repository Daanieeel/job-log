import { useLanguageStore } from '@/lib/stores/languageStore';
import * as Localization from 'expo-localization';
import { de, enUS } from 'date-fns/locale';
import * as React from 'react';
import { translations, type TranslationKey } from './translations';

export type AppLanguage = 'en' | 'de';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'de'];

/** 🇺🇸 for English (US English specifically), 🇩🇪 for German. */
export const LANGUAGE_FLAG: Record<AppLanguage, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
};

/** Device locale, narrowed to a supported app language (defaults to English). */
export function detectSystemLanguage(): AppLanguage {
  const code = Localization.getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code as AppLanguage) ? (code as AppLanguage) : 'en';
}

export function resolveAppLanguage(preference: 'system' | AppLanguage): AppLanguage {
  return preference === 'system' ? detectSystemLanguage() : preference;
}

export function dateFnsLocaleFor(lang: AppLanguage) {
  return lang === 'de' ? de : enUS;
}

export function translate(
  lang: AppLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const template = translations[lang]?.[key] ?? translations.en[key] ?? key;
  if (!params) return template;
  return Object.entries(params).reduce(
    (str, [paramKey, value]) => str.replace(`{{${paramKey}}}`, String(value)),
    template
  );
}

/** Subscribes to the app language preference and returns a translator bound to it. */
export function useTranslation() {
  const preference = useLanguageStore((s) => s.preference);
  const lang = resolveAppLanguage(preference);
  const dateLocale = dateFnsLocaleFor(lang);

  const t = React.useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );

  return { t, lang, dateLocale };
}

export type { TranslationKey };
