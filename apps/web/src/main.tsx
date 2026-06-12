import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './Root';
import { ThemeProvider } from './theme';
import { I18nProvider } from './i18n';
import { AccountProvider } from './account';
import { ActiveTenantProvider } from './activeTenant';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AccountProvider>
          <ActiveTenantProvider>
            <Root />
          </ActiveTenantProvider>
        </AccountProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
