import { LANGUAGES, TLanguage, TTranslationOverrides } from '@sparkdynamic/email-builder/editor';

/**
 * The host app's own strings. They ride on the editor's `translations` prop, so
 * the toolbar and the editor read one translate function — a real host would do
 * the same, or plug its existing i18n stack in here instead.
 */
const APP_TRANSLATIONS: Record<TLanguage, TTranslationOverrides> = {
  en: {
    'app.language': 'Language',
    'app.tab.edit': 'Edit',
    'app.tab.preview': 'Preview',
    'app.tab.html': 'HTML output',
    'app.tab.json': 'JSON output',
    'app.view.desktop': 'Desktop view',
    'app.view.mobile': 'Mobile view',
    'app.download': 'Download JSON file',
    'app.share': 'Share current template',
    'app.share.toast': 'The URL was updated. Copy it to share your current template.',
    'app.import': 'Import JSON',
    'app.import.body': 'Copy and paste an EmailBuilder.js JSON ({example}).',
    'app.import.example': 'example',
    'app.import.helper': 'This will override your current template.',
    'app.import.cancel': 'Cancel',
    'app.import.confirm': 'Import',
    'app.import.invalidJson': 'Invalid json',
    'app.import.invalidSchema': 'Invalid JSON schema',
    'app.import.missingRoot': 'Missing "root" node',
    'app.samples.toggle': 'Toggle samples panel',
    'app.samples.title': 'Samples',
    'app.samples.empty': 'Empty',
    'app.samples.welcome': 'Welcome email',
    'app.samples.oneTimePassword': 'One-time passcode (OTP)',
    'app.samples.resetPassword': 'Reset password',
    'app.samples.orderEcommerce': 'E-commerce receipt',
    'app.samples.subscriptionReceipt': 'Subscription receipt',
    'app.samples.reservationReminder': 'Reservation reminder',
    'app.samples.postMetricsReport': 'Post metrics',
    'app.samples.respondToMessage': 'Respond to inquiry',
  },
  de: {
    'app.language': 'Sprache',
    'app.tab.edit': 'Bearbeiten',
    'app.tab.preview': 'Vorschau',
    'app.tab.html': 'HTML-Ausgabe',
    'app.tab.json': 'JSON-Ausgabe',
    'app.view.desktop': 'Desktop-Ansicht',
    'app.view.mobile': 'Mobil-Ansicht',
    'app.download': 'JSON-Datei herunterladen',
    'app.share': 'Aktuelle Vorlage teilen',
    'app.share.toast': 'Die URL wurde aktualisiert. Kopiere sie, um deine Vorlage zu teilen.',
    'app.import': 'JSON importieren',
    'app.import.body': 'Füge ein EmailBuilder.js-JSON ein ({example}).',
    'app.import.example': 'Beispiel',
    'app.import.helper': 'Damit wird die aktuelle Vorlage überschrieben.',
    'app.import.cancel': 'Abbrechen',
    'app.import.confirm': 'Importieren',
    'app.import.invalidJson': 'Ungültiges JSON',
    'app.import.invalidSchema': 'Ungültiges JSON-Schema',
    'app.import.missingRoot': 'Der Knoten "root" fehlt',
    'app.samples.toggle': 'Beispiel-Panel umschalten',
    'app.samples.title': 'Beispiele',
    'app.samples.empty': 'Leer',
    'app.samples.welcome': 'Willkommens-E-Mail',
    'app.samples.oneTimePassword': 'Einmalpasscode (OTP)',
    'app.samples.resetPassword': 'Passwort zurücksetzen',
    'app.samples.orderEcommerce': 'E-Commerce-Beleg',
    'app.samples.subscriptionReceipt': 'Abo-Beleg',
    'app.samples.reservationReminder': 'Reservierungserinnerung',
    'app.samples.postMetricsReport': 'Beitragskennzahlen',
    'app.samples.respondToMessage': 'Antwort auf Anfrage',
  },
};

export function appTranslations(language: TLanguage) {
  return APP_TRANSLATIONS[language];
}

const STORAGE_KEY = 'emailBuilderLanguage';

function isLanguage(value: string | null): value is TLanguage {
  return value !== null && (LANGUAGES as readonly string[]).includes(value);
}

/** `?lang=de` wins, then the last choice, then the browser's, then English. */
export function getInitialLanguage(): TLanguage {
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (isLanguage(fromQuery)) {
    return fromQuery;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLanguage(stored)) {
    return stored;
  }
  const fromBrowser = navigator.language.split('-')[0];
  return isLanguage(fromBrowser) ? fromBrowser : 'en';
}

export function storeLanguage(language: TLanguage) {
  window.localStorage.setItem(STORAGE_KEY, language);
}
