import React, { createContext, useContext, useMemo } from 'react';

import de from './de';
import en from './en';
import { TKey, TLanguage, TTranslate, TTranslationOverrides, TTranslations } from './types';

export { LANGUAGES } from './types';
export type { TKey, TLanguage, TTranslate, TTranslationKey, TTranslationOverrides, TTranslations } from './types';

export const CATALOGS: Record<TLanguage, TTranslations> = { en, de };

export const DEFAULT_LANGUAGE: TLanguage = 'en';

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/**
 * Builds a translate function for one language. English backs every lookup, so
 * a missing or overridden-away string falls back rather than rendering its key.
 */
export function createTranslate(language: TLanguage, overrides?: TTranslationOverrides): TTranslate {
  const catalog: Record<string, string> = CATALOGS[language] ?? en;
  const fallback: Record<string, string> = en;
  return (key: TKey, params?: Record<string, string | number>) =>
    interpolate(overrides?.[key] ?? catalog[key] ?? fallback[key] ?? key, params);
}

const I18nContext = createContext<TTranslate>(createTranslate(DEFAULT_LANGUAGE));
const LanguageContext = createContext<TLanguage>(DEFAULT_LANGUAGE);

type Props = {
  language: TLanguage;
  translations?: TTranslationOverrides;
  children: React.ReactNode;
};

/**
 * Publishes the active language to everything below. `EmailBuilderProvider`
 * renders it, so a host normally sets `language` there rather than using this
 * directly — it is exported for chrome that lives outside the provider.
 */
export function I18nProvider({ language, translations, children }: Props) {
  const translate = useMemo(() => createTranslate(language, translations), [language, translations]);
  return (
    <LanguageContext.Provider value={language}>
      <I18nContext.Provider value={translate}>{children}</I18nContext.Provider>
    </LanguageContext.Provider>
  );
}

/**
 * The translate function for the active language. Outside a provider it
 * resolves against English, so a component can be rendered standalone.
 */
export function useTranslate(): TTranslate {
  return useContext(I18nContext);
}

/** The active language code — for a host that mirrors it into its own strings. */
export function useLanguage(): TLanguage {
  return useContext(LanguageContext);
}
