import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './Root';
import { ThemeProvider } from './theme';
import { I18nProvider } from './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <Root />
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
