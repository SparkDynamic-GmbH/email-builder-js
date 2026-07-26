import type en from './en';

/** ISO 639-1 codes the editor ships translations for. */
export const LANGUAGES = ['en', 'de', 'fr', 'it'] as const;

export type TLanguage = (typeof LANGUAGES)[number];

/** Every string the editor renders, keyed. English is the source of truth. */
export type TTranslationKey = keyof typeof en;

export type TTranslations = Record<TTranslationKey, string>;

/**
 * A key to look up. Built-in keys autocomplete; any other string is allowed so
 * a host can key strings of its own — a block it registered, say — through the
 * same `translations` prop.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type TKey = TTranslationKey | (string & {});

/**
 * Strings a host supplies: built-in keys it wants worded differently, plus any
 * of its own.
 */
export type TTranslationOverrides = Partial<TTranslations> & Record<string, string>;

/**
 * Looks a string up in the active language. `params` fill `{name}` placeholders:
 * `t('field.column', { number: 2 })`. An unknown key comes back unchanged.
 */
export type TTranslate = (key: TKey, params?: Record<string, string | number>) => string;
