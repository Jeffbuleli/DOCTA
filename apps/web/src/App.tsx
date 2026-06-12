import { useEffect, useState } from 'react';
import { AppShell } from './AppShell';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Hospitalisation } from './pages/Hospitalisation';
import { Caisse } from './pages/Caisse';
import { Personnel } from './pages/Personnel';
import { Placeholder } from './pages/Placeholder';
import { useAccount } from './account';
import { useActiveTenant } from './activeTenant';
import { useI18n } from './i18n';
import { api } from './api';
import type { PageKey } from './nav';
import {
  IconPatients,
  IconAgenda,
  IconPharmacie,
  IconLabo,
  IconSettings,
} from './icons';

const FALLBACK_RATE = 2800;

const PH_ICONS: Record<
  Exclude<PageKey, 'dashboard' | 'patients' | 'hospit' | 'caisse' | 'personnel'>,
  typeof IconPatients
> = {
  agenda: IconAgenda,
  pharmacie: IconPharmacie,
  labo: IconLabo,
  reglages: IconSettings,
};

/** SIH d'un hopital — rendu uniquement quand un hopital actif est selectionne. */
export function StaffSpace() {
  const { account } = useAccount();
  const { active, exit } = useActiveTenant();
  const { t } = useI18n();
  const [page, setPage] = useState<PageKey>('dashboard');
  const [rate, setRate] = useState(FALLBACK_RATE);

  useEffect(() => {
    api
      .currencyRate()
      .then((r) => setRate(Number(r.cdfPerUsd) || FALLBACK_RATE))
      .catch(() => {});
  }, [active?.tenantId]);

  if (!active) return null;

  return (
    <AppShell
      page={page}
      setPage={setPage}
      cdfPerUsd={rate}
      userName={account?.fullName ?? account?.email}
      hospitalName={active.name}
      onExit={exit}
    >
      {page === 'dashboard' ? (
        <Dashboard cdfPerUsd={rate} userName={account?.fullName ?? account?.email} />
      ) : page === 'patients' ? (
        <Patients />
      ) : page === 'hospit' ? (
        <Hospitalisation />
      ) : page === 'caisse' ? (
        <Caisse />
      ) : page === 'personnel' ? (
        <Personnel />
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
