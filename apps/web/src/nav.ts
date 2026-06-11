// Navigation de Docta — partagee entre la sidebar (desktop) et la bottom nav (mobile).
import type { ComponentType, SVGProps } from 'react';
import {
  IconDashboard,
  IconPatients,
  IconAgenda,
  IconHospit,
  IconPharmacie,
  IconLabo,
  IconCaisse,
  IconPersonnel,
  IconSettings,
} from './icons';

export type PageKey =
  | 'dashboard'
  | 'patients'
  | 'agenda'
  | 'hospit'
  | 'pharmacie'
  | 'labo'
  | 'caisse'
  | 'personnel'
  | 'reglages';

export interface NavItem {
  key: PageKey;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { key: 'dashboard', label: 'Tableau de bord', icon: IconDashboard },
      { key: 'patients', label: 'Patients', icon: IconPatients },
      { key: 'agenda', label: 'Rendez-vous', icon: IconAgenda },
    ],
  },
  {
    title: 'Clinique',
    items: [
      { key: 'hospit', label: 'Hospitalisation', icon: IconHospit },
      { key: 'pharmacie', label: 'Pharmacie', icon: IconPharmacie },
      { key: 'labo', label: 'Laboratoire', icon: IconLabo },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { key: 'caisse', label: 'Caisse', icon: IconCaisse },
      { key: 'personnel', label: 'Personnel', icon: IconPersonnel },
      { key: 'reglages', label: 'Réglages', icon: IconSettings },
    ],
  },
];

// Raccourcis de la barre du bas (mobile) — l'item central est le bouton "+".
export const BOTTOM_NAV: NavItem[] = [
  { key: 'dashboard', label: 'Accueil', icon: IconDashboard },
  { key: 'patients', label: 'Patients', icon: IconPatients },
  { key: 'agenda', label: 'Agenda', icon: IconAgenda },
  { key: 'caisse', label: 'Caisse', icon: IconCaisse },
];
