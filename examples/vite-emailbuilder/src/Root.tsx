import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  EmailBuilderProvider,
  TBlockTemplate,
  TLanguage,
  ToastProvider,
  TooltipProvider,
  TStylePreset,
} from '@sparkdynamic/email-builder/editor';

import App from './App';
import getConfiguration from './getConfiguration';
import { appTranslations, getInitialLanguage, storeLanguage } from './i18n';
import { imageLibrary } from './imageLibrary';
import { saveDraft } from './persistence';
import { EDITOR_REGISTRY } from './registry';
import { loadStylePresets, removeStylePreset, saveStylePreset } from './stylePresets';
import { loadTemplates, removeTemplate, saveTemplate } from './templateLibrary';

// Where the document comes from is the host's business: this app reads it out of
// the URL hash, falling back to the stored draft; a real host would load it from
// its API — and must not render the provider until that resolves, since
// initialDocument is read once.
const initialDocument = getConfiguration(window.location.hash);

const SetLanguageContext = createContext<(language: TLanguage) => void>(() => {});

/** Lets the toolbar switch language; reading it is the package's `useLanguage`. */
export function useSetLanguage() {
  return useContext(SetLanguageContext);
}

/**
 * The language lives here, above the provider, because that is where a host
 * would keep it — next to its own locale state rather than inside the editor.
 */
export default function Root() {
  const [language, setLanguage] = useState<TLanguage>(getInitialLanguage);
  // The saved partials live here, above the provider, because they are the
  // host's data: the editor calls `save`, we persist and set state, and the
  // list it renders is this array.
  const [templates, setTemplates] = useState<TBlockTemplate[]>(loadTemplates);
  // Same deal for the named stylings: the editor calls `save`, we persist and
  // set state, and the Presets tab renders this array.
  const [presets, setPresets] = useState<TStylePreset[]>(loadStylePresets);

  const setAndStore = useMemo(
    () => (next: TLanguage) => {
      storeLanguage(next);
      setLanguage(next);
    },
    []
  );

  const templateLibrary = useMemo(
    () => ({
      templates,
      save: async (draft: Parameters<typeof saveTemplate>[0]) => setTemplates(await saveTemplate(draft)),
      remove: async (template: TBlockTemplate) => setTemplates(await removeTemplate(template)),
    }),
    [templates]
  );

  const stylePresets = useMemo(
    () => ({
      presets,
      save: async (draft: Parameters<typeof saveStylePreset>[0]) => setPresets(await saveStylePreset(draft)),
      remove: async (preset: TStylePreset) => setPresets(await removeStylePreset(preset)),
    }),
    [presets]
  );

  // Stable per language: a fresh object each render would rebuild the editor's
  // translate function on every render.
  const translations = useMemo(() => appTranslations(language), [language]);

  return (
    <TooltipProvider>
      <ToastProvider>
        {/* Autosave is off, as it is by default; the toolbar's Save button drives it. */}
        <EmailBuilderProvider
          registry={EDITOR_REGISTRY}
          initialDocument={initialDocument}
          onSave={saveDraft}
          language={language}
          translations={translations}
          imageLibrary={imageLibrary}
          templateLibrary={templateLibrary}
          stylePresets={stylePresets}
        >
          <SetLanguageContext.Provider value={setAndStore}>
            <App />
          </SetLanguageContext.Provider>
        </EmailBuilderProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}
