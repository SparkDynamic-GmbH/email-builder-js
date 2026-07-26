import React from 'react';

import { TLanguage, ToggleButton, ToggleGroup, useLanguage } from '@sparkdynamic/email-builder/editor';

import { useSetLanguage } from '../../Root';

// Each language names itself, so the control reads the same whichever one is on.
const LANGUAGE_LABELS: Record<TLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
};

/**
 * Switching language is the host's job — the editor only takes the code it is
 * given. This app keeps the choice in `Root` and mirrors it into localStorage.
 */
export default function LanguageToggle() {
  const language = useLanguage();
  const setLanguage = useSetLanguage();

  return (
    <ToggleGroup value={language} onValueChange={(v) => setLanguage(v as TLanguage)}>
      <ToggleButton value="en" tooltip={LANGUAGE_LABELS.en}>
        <span className="px-1 text-body2">EN</span>
      </ToggleButton>
      <ToggleButton value="de" tooltip={LANGUAGE_LABELS.de}>
        <span className="px-1 text-body2">DE</span>
      </ToggleButton>
      <ToggleButton value="fr" tooltip={LANGUAGE_LABELS.fr}>
        <span className="px-1 text-body2">FR</span>
      </ToggleButton>
      <ToggleButton value="it" tooltip={LANGUAGE_LABELS.it}>
        <span className="px-1 text-body2">IT</span>
      </ToggleButton>
    </ToggleGroup>
  );
}
