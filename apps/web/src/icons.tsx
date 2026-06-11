// Icones SVG maison pour Docta — style "ligne claire", coherent, sans emoji.
// Chaque icone herite de la couleur via `currentColor` et s'adapte a la taille.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  width: 40,
  height: 40,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...props,
});

// Urgences — croix dans un bouclier / pouls
export const IconUrgences = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M24 6 8 12v9c0 9 7 15 16 19 9-4 16-10 16-19v-9L24 6Z" />
    <path d="M24 17v12M18 23h12" />
  </svg>
);

// Consultations — stethoscope
export const IconConsultation = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 8v8a8 8 0 0 0 16 0V8" />
    <path d="M11 8h6M27 8h6" />
    <path d="M22 30v4a8 8 0 0 0 16 0v-3" />
    <circle cx="38" cy="26" r="4" />
  </svg>
);

// Hospitalisation — lit
export const IconHospit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 16v22M6 30h36v8M42 30v8" />
    <path d="M6 24h20a8 8 0 0 1 8 6" />
    <circle cx="15" cy="22" r="3" />
  </svg>
);

// Maternite — mere/enfant (cercles + arc)
export const IconMaternite = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="20" cy="12" r="5" />
    <path d="M12 40c0-9 4-14 8-14s8 5 8 14" />
    <circle cx="34" cy="22" r="3.5" />
    <path d="M30 40c0-5 2-8 4-8s4 3 4 8" />
  </svg>
);

// Pharmacie — mortier / gelule
export const IconPharmacie = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="10" y="20" width="20" height="14" rx="7" transform="rotate(45 20 27)" />
    <path d="M16 23l8 8" />
    <path d="M30 10h10v8a5 5 0 0 1-10 0v-8Z" />
  </svg>
);

// Laboratoire — eprouvette
export const IconLabo = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6v14L10 38a4 4 0 0 0 4 6h20a4 4 0 0 0 4-6L28 20V6" />
    <path d="M16 6h16" />
    <path d="M15 30h18" />
  </svg>
);

// Imagerie — radio (os + cadre)
export const IconImagerie = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="8" y="8" width="32" height="32" rx="4" />
    <path d="M20 16c0 3-3 3-3 6s3 3 3 6M28 16c0 3 3 3 3 6s-3 3-3 6" />
    <path d="M20 22h8M20 28h8" />
  </svg>
);

// Bloc operatoire — bistouri / scalpel
export const IconBloc = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 40 30 18a6 6 0 0 1 9 0l1 1L18 40H8Z" />
    <path d="M30 18l8 8" />
    <path d="M12 40v-6" />
  </svg>
);

// Caisse — billet / piece
export const IconCaisse = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="14" width="36" height="20" rx="3" />
    <circle cx="24" cy="24" r="5" />
    <path d="M12 18v12M36 18v12" />
  </svg>
);

// Logistique — carton / stock
export const IconLogistique = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M24 6 6 15v18l18 9 18-9V15L24 6Z" />
    <path d="M6 15l18 9 18-9M24 24v18" />
  </svg>
);

// Personnel / permanences — badge personne
export const IconPersonnel = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="24" cy="16" r="7" />
    <path d="M10 40c0-8 6-12 14-12s14 4 14 12" />
  </svg>
);

// Patients — carnet / dossier
export const IconPatients = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="10" y="6" width="28" height="36" rx="3" />
    <path d="M18 6v4h12V6" />
    <path d="M24 18v8M20 22h8" />
  </svg>
);

/* ---- Icones d'interface (navigation, actions) ---- */

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="14" height="14" rx="3" />
    <rect x="28" y="6" width="14" height="9" rx="3" />
    <rect x="28" y="21" width="14" height="21" rx="3" />
    <rect x="6" y="26" width="14" height="16" rx="3" />
  </svg>
);

export const IconAgenda = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="7" y="9" width="34" height="32" rx="4" />
    <path d="M7 18h34M16 5v8M32 5v8" />
    <path d="M15 26h6M27 26h6M15 33h6" />
  </svg>
);

export const IconFinance = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="12" width="32" height="22" rx="4" />
    <path d="M38 19h4v8h-4" />
    <circle cx="20" cy="23" r="4" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="24" cy="24" r="6" />
    <path d="M24 4v6M24 38v6M4 24h6M38 24h6M9 9l4 4M35 35l4 4M39 9l-4 4M13 35l-4 4" />
  </svg>
);

export const IconBed = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 14v22M6 30h36v8M42 28v8" />
    <path d="M6 24h20a8 8 0 0 1 8 6" />
    <circle cx="15" cy="22" r="3" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 14h32M8 24h32M8 34h32" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="21" cy="21" r="13" />
    <path d="M40 40l-8-8" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20a12 12 0 0 1 24 0c0 10 4 12 4 12H8s4-2 4-12Z" />
    <path d="M20 38a4 4 0 0 0 8 0" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="24" cy="24" r="8" />
    <path d="M24 4v6M24 38v6M4 24h6M38 24h6M9 9l4 4M35 35l4 4M39 9l-4 4M13 35l-4 4" />
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M38 27a15 15 0 1 1-17-19 12 12 0 0 0 17 19Z" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M24 12v24M12 24h24" />
  </svg>
);

export const IconChevron = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 12l12 12-12 12" />
  </svg>
);
