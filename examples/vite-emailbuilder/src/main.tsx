import '@sparkdynamic/email-builder/styles.css';
import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { EmailBuilderProvider, ToastProvider, TooltipProvider } from '@sparkdynamic/email-builder/editor';

import App from './App';
import getConfiguration from './getConfiguration';
import { saveDraft } from './persistence';
import { EDITOR_REGISTRY } from './registry';

// Where the document comes from is the host's business: this app reads it out of
// the URL hash, falling back to the stored draft; a real host would load it from
// its API — and must not render the provider until that resolves, since
// initialDocument is read once.
const initialDocument = getConfiguration(window.location.hash);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <ToastProvider>
        {/* Autosave is off, as it is by default; the toolbar's Save button drives it. */}
        <EmailBuilderProvider registry={EDITOR_REGISTRY} initialDocument={initialDocument} onSave={saveDraft}>
          <App />
        </EmailBuilderProvider>
      </ToastProvider>
    </TooltipProvider>
  </React.StrictMode>
);
