import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { I18nProvider } from './lib/i18n.jsx';
import { ToastProvider } from './components/Toasts.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </I18nProvider>
  </React.StrictMode>,
);
