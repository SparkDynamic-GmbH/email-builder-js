import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { EDITOR_REGISTRY } from './documents/editor/core';
import { EmailBuilderProvider } from './documents/editor/EditorContext';
import getConfiguration from './getConfiguration';
import { ToastProvider } from './ui/Toast';
import { TooltipProvider } from './ui/Tooltip';

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
