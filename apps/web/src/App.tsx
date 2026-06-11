import { useEffect, useState } from 'react';
import { AppShell } from './AppShell';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Hospitalisation } from './pages/Hospitalisation';
import { Placeholder } from './pages/Placeholder';
import { Login } from './pages/Login';
import { useAuth } from './auth';
import { api } from './api';
import type { PageKey } from './nav';
import {
  IconPatients,
  IconAgenda,
  IconHospit,
  IconPharmacie,
  IconLabo,
  IconCaisse,
  IconPersonnel,
  IconSettings,
} from './icons';

const FALLBACK_RATE = 2800;

const PLACEHOLDERS: Record<
  Exclude<PageKey, 'dashboard'>,
  { title: string; icon: typeof IconPatients; desc: string }
> = {
  patients: { title: 'Patients', icon: IconPatients, desc: 'Dossiers, admissions et identité patient.' },
  agenda: { title: 'Rendez-vous', icon: IconAgenda, desc: 'Agenda des praticiens et file d’attente.' },
  hospit: { title: 'Hospitalisation', icon: IconHospit, desc: 'Salles, lits, admissions et transferts.' },
  pharmacie: { title: 'Pharmacie', icon: IconPharmacie, desc: 'Stock, dispensation et alertes.' },
  labo: { title: 'Laboratoire', icon: IconLabo, desc: 'Demandes d’analyses et résultats.' },
  caisse: { title: 'Caisse', icon: IconCaisse, desc: 'Facturation multi-devise et mobile money.' },
  personnel: { title: 'Personnel', icon: IconPersonnel, desc: 'Équipe, rôles et permanences.' },
  reglages: { title: 'Réglages', icon: IconSettings, desc: 'Établissement, devises et paramètres.' },
};

export function App() {
  const { user, loading, logout } = useAuth();
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
    return <div className="fullscreen-center">Chargement…</div>;
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
        <Dashboard cdfPerUsd={rate} />
      ) : page === 'patients' ? (
        <Patients />
      ) : page === 'hospit' ? (
        <Hospitalisation />
      ) : (
        <Placeholder {...PLACEHOLDERS[page]} />
      )}
    </AppShell>
  );
}
