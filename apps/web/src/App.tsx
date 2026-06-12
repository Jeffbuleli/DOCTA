import { useEffect, useState } from 'react';
import { AppShell } from './AppShell';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Hospitalisation } from './pages/Hospitalisation';
import { Caisse } from './pages/Caisse';
import { Placeholder } from './pages/Placeholder';
import { Login } from './pages/Login';
import { useAuth } from './auth';
import { useI18n } from './i18n';
import { api } from './api';
import type { PageKey } from './nav';
import {
  IconPatients,
  IconAgenda,
  IconPharmacie,
  IconLabo,
  IconPersonnel,
  IconSettings,
} from './icons';

const FALLBACK_RATE = 2800;

const PH_ICONS: Record<
  Exclude<PageKey, 'dashboard' | 'patients' | 'hospit' | 'caisse'>,
  typeof IconPatients
> = {
  agenda: IconAgenda,
  pharmacie: IconPharmacie,
  labo: IconLabo,
  personnel: IconPersonnel,
  reglages: IconSettings,
};

export function App() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [page, setPage] = useState<PageKey>('dashboard');
  const [rate, setRate] = useState(FALLBACK_RATE);

  // Taux du jour live, une fois connecte.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .currencyRate()
      .then((r) => {
        if (!cancelled) setRate(Number(r.cdfPerUsd) || FALLBACK_RATE);
      })
      .catch(() => {
        /* garde le fallback si pas de taux defini */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return <div className="fullscreen-center">{t('common.loading')}</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppShell
      page={page}
      setPage={setPage}
      cdfPerUsd={rate}
      userName={user.fullName ?? user.email}
      onLogout={logout}
    >
      {page === 'dashboard' ? (
        <Dashboard cdfPerUsd={rate} userName={user.fullName ?? user.email} />
      ) : page === 'patients' ? (
        <Patients />
      ) : page === 'hospit' ? (
        <Hospitalisation />
      ) : page === 'caisse' ? (
        <Caisse />
      ) : (
        <Placeholder
          title={t(`page.${page}`)}
          desc={t(`desc.${page}`)}
          icon={PH_ICONS[page as keyof typeof PH_ICONS]}
        />
      )}
    </AppShell>
  );
}
