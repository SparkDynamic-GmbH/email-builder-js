import '@sparkdynamic/email-builder/styles.css';
import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { EmailBuilderProvider, ToastProvider, TooltipProvider } from '@sparkdynamic/email-builder/editor';

import App from './App';
import getConfiguration from './getConfiguration';
import { EDITOR_REGISTRY } from './registry';

// Where the document comes from is the host's business: this app reads it out of
// the URL hash, a real host would load it from its API.
const initialDocument = getConfiguration(window.location.hash);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <ToastProvider>
        <EmailBuilderProvider registry={EDITOR_REGISTRY} initialDocument={initialDocument}>
          <App />
        </EmailBuilderProvider>
      </ToastProvider>
    </TooltipProvider>
  </React.StrictMode>
);
