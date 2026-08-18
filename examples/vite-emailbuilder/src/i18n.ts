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
    'app.share': 'Share current template',
    'app.share.toast': 'The URL was updated. Copy it to share your current template.',
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
    'app.share': 'Aktuelle Vorlage teilen',
    'app.share.toast': 'Die URL wurde aktualisiert. Kopiere sie, um deine Vorlage zu teilen.',
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
  fr: {
    'app.language': 'Langue',
    'app.tab.edit': 'Modifier',
    'app.tab.preview': 'Aperçu',
    'app.tab.html': 'Sortie HTML',
    'app.tab.json': 'Sortie JSON',
    'app.view.desktop': 'Vue bureau',
    'app.view.mobile': 'Vue mobile',
    'app.share': 'Partager le modèle actuel',
    'app.share.toast': 'L’URL a été mise à jour. Copiez-la pour partager votre modèle.',
    'app.samples.toggle': 'Afficher/masquer le panneau d’exemples',
    'app.samples.title': 'Exemples',
    'app.samples.empty': 'Vide',
    'app.samples.welcome': 'E-mail de bienvenue',
    'app.samples.oneTimePassword': 'Code à usage unique (OTP)',
    'app.samples.resetPassword': 'Réinitialisation du mot de passe',
    'app.samples.orderEcommerce': 'Reçu e-commerce',
    'app.samples.subscriptionReceipt': 'Reçu d’abonnement',
    'app.samples.reservationReminder': 'Rappel de réservation',
    'app.samples.postMetricsReport': 'Statistiques de publication',
    'app.samples.respondToMessage': 'Réponse à une demande',
  },
  it: {
    'app.language': 'Lingua',
    'app.tab.edit': 'Modifica',
    'app.tab.preview': 'Anteprima',
    'app.tab.html': 'Output HTML',
    'app.tab.json': 'Output JSON',
    'app.view.desktop': 'Vista desktop',
    'app.view.mobile': 'Vista mobile',
    'app.share': 'Condividi il modello attuale',
    'app.share.toast': 'L’URL è stato aggiornato. Copialo per condividere il tuo modello.',
    'app.samples.toggle': 'Mostra/nascondi il pannello degli esempi',
    'app.samples.title': 'Esempi',
    'app.samples.empty': 'Vuoto',
    'app.samples.welcome': 'E-mail di benvenuto',
    'app.samples.oneTimePassword': 'Codice monouso (OTP)',
    'app.samples.resetPassword': 'Reimposta la password',
    'app.samples.orderEcommerce': 'Ricevuta e-commerce',
    'app.samples.subscriptionReceipt': 'Ricevuta di abbonamento',
    'app.samples.reservationReminder': 'Promemoria di prenotazione',
    'app.samples.postMetricsReport': 'Statistiche del post',
    'app.samples.respondToMessage': 'Risposta a una richiesta',
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
