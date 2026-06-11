import { useState } from 'react';
import { AppShell } from './AppShell';
import { Dashboard } from './pages/Dashboard';
import { Placeholder } from './pages/Placeholder';
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

// Taux du jour (sera relie a l'API /api/currency/rate lors du branchement auth).
const CDF_PER_USD = 2800;

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
  const [page, setPage] = useState<PageKey>('dashboard');

  return (
    <AppShell page={page} setPage={setPage} cdfPerUsd={CDF_PER_USD}>
      {page === 'dashboard' ? (
        <Dashboard cdfPerUsd={CDF_PER_USD} />
      ) : (
        <Placeholder {...PLACEHOLDERS[page]} />
      )}
    </AppShell>
  );
}
