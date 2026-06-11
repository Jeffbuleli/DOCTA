// Catalogue des services affiches sur l'accueil de Docta.
// Chaque service = une tuile illustree (icone SVG) + couleur dediee.
import type { ComponentType, SVGProps } from 'react';
import {
  IconUrgences,
  IconConsultation,
  IconHospit,
  IconMaternite,
  IconPharmacie,
  IconLabo,
  IconImagerie,
  IconBloc,
  IconCaisse,
  IconLogistique,
  IconPersonnel,
  IconPatients,
} from './icons';

export interface ServiceTile {
  key: string;
  label: string;
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const SERVICES: ServiceTile[] = [
  { key: 'urgences', label: 'Urgences', color: '#E11D48', icon: IconUrgences },
  { key: 'consultation', label: 'Consultations', color: '#0E7C7B', icon: IconConsultation },
  { key: 'hospit', label: 'Hospitalisation', color: '#2563EB', icon: IconHospit },
  { key: 'maternite', label: 'Maternité', color: '#DB2777', icon: IconMaternite },
  { key: 'bloc', label: 'Bloc opératoire', color: '#7C3AED', icon: IconBloc },
  { key: 'labo', label: 'Laboratoire', color: '#059669', icon: IconLabo },
  { key: 'imagerie', label: 'Imagerie', color: '#0891B2', icon: IconImagerie },
  { key: 'pharmacie', label: 'Pharmacie', color: '#16A34A', icon: IconPharmacie },
  { key: 'caisse', label: 'Caisse', color: '#CA8A04', icon: IconCaisse },
  { key: 'logistique', label: 'Logistique', color: '#EA580C', icon: IconLogistique },
  { key: 'personnel', label: 'Personnel', color: '#4F46E5', icon: IconPersonnel },
  { key: 'patients', label: 'Patients', color: '#0F766E', icon: IconPatients },
];
