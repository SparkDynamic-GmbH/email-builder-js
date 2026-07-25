import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { ToastProvider } from './ui/Toast';
import { TooltipProvider } from './ui/Tooltip';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </TooltipProvider>
  </React.StrictMode>
);
