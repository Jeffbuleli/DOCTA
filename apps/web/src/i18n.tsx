import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'fr' | 'en';

type Dict = Record<string, string>;

const FR: Dict = {
  'app.tagline': "Système d'Information Hospitalier",

  'common.search': 'Rechercher',
  'common.new': 'Nouveau',
  'common.loading': 'Chargement…',
  'common.change': 'Changer',
  'common.choose': '— Choisir —',

  'login.establishment': 'Établissement',
  'login.email': 'Adresse e-mail',
  'login.password': 'Mot de passe',
  'login.signin': 'Se connecter',
  'login.error': "Connexion impossible. Vérifiez que l'API est démarrée.",
  'login.demo': 'Démo : clinique-demo · admin@docta.cd · docta1234',

  'topbar.search': 'Rechercher',
  'topbar.theme': 'Changer de thème',
  'topbar.lang': 'Changer de langue',
  'topbar.notifications': 'Notifications',
  'topbar.menu': 'Menu',
  'topbar.rate': 'Taux du jour',

  'nav.group.main': 'Principal',
  'nav.group.clinical': 'Clinique',
  'nav.group.management': 'Gestion',
  'nav.dashboard': 'Tableau de bord',
  'nav.patients': 'Patients',
  'nav.agenda': 'Rendez-vous',
  'nav.hospit': 'Hospitalisation',
  'nav.pharmacie': 'Pharmacie',
  'nav.labo': 'Laboratoire',
  'nav.caisse': 'Caisse',
  'nav.personnel': 'Personnel',
  'nav.reglages': 'Réglages',
  'nav.logout': 'Déconnexion',
  'bottom.home': 'Accueil',

  'svc.urgences': 'Urgences',
  'svc.consultation': 'Consultation',
  'svc.maternite': 'Maternité',
  'svc.bloc': 'Bloc opératoire',
  'svc.pharmacie': 'Pharmacie',
  'svc.labo': 'Laboratoire',
  'svc.imagerie': 'Imagerie',
  'svc.caisse': 'Caisse',

  'dash.greeting': 'Bonjour, {name}',
  'dash.subtitle': "Clinique Démo · Kinshasa — voici l'activité du jour.",
  'dash.kpi.patients': 'Patients du jour',
  'dash.kpi.appointments': 'Rendez-vous',
  'dash.kpi.beds': 'Lits occupés',
  'dash.kpi.revenue': 'Recettes du jour',
  'dash.appts': 'Rendez-vous du jour',
  'dash.apptsCount': "{n} aujourd'hui",
  'dash.payments': 'Paiements par moyen',
  'dash.occupancy': 'Occupation des lits',
  'dash.occupancyGlobal': '{n}% global',
  'dash.tx': 'Transactions récentes',
  'dash.quick': 'Accès rapide',
  'dash.paid': 'Payé',
  'dash.total': 'Total',
  'dash.cash': 'Espèces (CDF/USD)',
  'dash.offline': 'Hors-ligne prêt · Synchronisation automatique',
  'status.confirmed': 'Confirmé',
  'status.inprogress': 'En cours',
  'status.waiting': 'En attente',

  'patients.subtitle': 'Dossiers, recherche et admission.',
  'patients.searchPh': 'Rechercher (nom, MRN, téléphone)…',
  'patients.none': 'Aucun patient',
  'patients.noneSearch': 'Aucun résultat pour cette recherche.',
  'patients.noneHint':
    'Enregistrez votre premier patient avec le bouton « Nouveau ».',
  'patients.new': 'Nouveau patient',
  'patients.save': 'Enregistrer le patient',
  'patients.createError': 'Création impossible.',
  'patients.record': 'Fiche patient',
  'patients.admit': 'Admettre en hospitalisation',
  'patients.admitted': 'Patient admis en hospitalisation',

  'form.lastName': 'Nom',
  'form.firstName': 'Prénom',
  'form.sex': 'Sexe',
  'form.male': 'Homme',
  'form.female': 'Femme',
  'form.birthDate': 'Date de naissance',
  'form.phone': 'Téléphone',
  'form.address': 'Adresse',
  'form.addressPh': 'Quartier, commune…',
  'detail.age': 'Âge',
  'unit.years': '{n} ans',

  'hospit.subtitle': "{occ}/{total} lits occupés · {pct}% d'occupation",
  'hospit.admit': 'Admettre',
  'hospit.inpatients': 'Patients hospitalisés',
  'hospit.none': 'Aucun patient hospitalisé',
  'hospit.noneHint': 'Utilisez « Admettre » pour placer un patient sur un lit.',
  'hospit.transfer': 'Transférer',
  'hospit.discharge': 'Sortie',
  'hospit.dischargeConfirm': 'Confirmer la sortie de {name} ?',
  'hospit.dischargeError': 'Sortie impossible.',
  'hospit.free': '{n} libre',
  'hospit.frees': '{n} libres',
  'unit.today': "Aujourd'hui",
  'unit.day': '1 jour',
  'unit.days': '{n} jours',

  'admit.title': 'Admettre un patient',
  'admit.patient': 'Patient',
  'admit.searchPatient': 'Rechercher un patient…',
  'admit.service': 'Service',
  'admit.bed': 'Lit',
  'admit.reason': "Motif d'admission",
  'admit.reasonPh': 'Observation, post-opératoire…',
  'admit.confirm': "Confirmer l'admission",
  'admit.error': 'Admission impossible.',
  'admit.pick': 'Choisissez un patient et un lit.',
  'admit.noBeds':
    'Aucun lit libre. Créez des services/lits ou libérez un lit.',
  'transfer.title': 'Transférer le patient',
  'transfer.currently': '{name} — actuellement {ward}, lit {bed}.',
  'transfer.newBed': 'Nouveau lit',
  'transfer.chooseFree': '— Choisir un lit libre —',
  'transfer.confirm': 'Confirmer le transfert',
  'transfer.error': 'Transfert impossible.',

  'ph.title': 'Patients',
  'ph.building': 'Module en construction',
  'ph.body':
    "L'écran « {title} » sera bâti sur ce même design. Le socle (API, authentification, multi-devise) est déjà en place côté serveur.",
  'ph.start': 'Commencer ce module',
  'page.patients': 'Patients',
  'page.agenda': 'Rendez-vous',
  'page.hospit': 'Hospitalisation',
  'page.pharmacie': 'Pharmacie',
  'page.labo': 'Laboratoire',
  'page.caisse': 'Caisse',
  'page.personnel': 'Personnel',
  'page.reglages': 'Réglages',
  'desc.agenda': "Agenda des praticiens et file d'attente.",
  'desc.pharmacie': 'Stock, dispensation et alertes.',
  'desc.labo': "Demandes d'analyses et résultats.",
  'desc.caisse': 'Facturation multi-devise et mobile money.',
  'desc.personnel': 'Équipe, rôles et permanences.',
  'desc.reglages': 'Établissement, devises et paramètres.',
};

const EN: Dict = {
  'app.tagline': 'Hospital Information System',

  'common.search': 'Search',
  'common.new': 'New',
  'common.loading': 'Loading…',
  'common.change': 'Change',
  'common.choose': '— Select —',

  'login.establishment': 'Facility',
  'login.email': 'Email address',
  'login.password': 'Password',
  'login.signin': 'Sign in',
  'login.error': 'Could not sign in. Make sure the API is running.',
  'login.demo': 'Demo: clinique-demo · admin@docta.cd · docta1234',

  'topbar.search': 'Search',
  'topbar.theme': 'Toggle theme',
  'topbar.lang': 'Change language',
  'topbar.notifications': 'Notifications',
  'topbar.menu': 'Menu',
  'topbar.rate': "Today's rate",

  'nav.group.main': 'Main',
  'nav.group.clinical': 'Clinical',
  'nav.group.management': 'Management',
  'nav.dashboard': 'Dashboard',
  'nav.patients': 'Patients',
  'nav.agenda': 'Appointments',
  'nav.hospit': 'Inpatient',
  'nav.pharmacie': 'Pharmacy',
  'nav.labo': 'Laboratory',
  'nav.caisse': 'Cashier',
  'nav.personnel': 'Staff',
  'nav.reglages': 'Settings',
  'nav.logout': 'Sign out',
  'bottom.home': 'Home',

  'svc.urgences': 'Emergency',
  'svc.consultation': 'Consultation',
  'svc.maternite': 'Maternity',
  'svc.bloc': 'Operating room',
  'svc.pharmacie': 'Pharmacy',
  'svc.labo': 'Laboratory',
  'svc.imagerie': 'Imaging',
  'svc.caisse': 'Cashier',

  'dash.greeting': 'Hello, {name}',
  'dash.subtitle': "Demo Clinic · Kinshasa — today's activity.",
  'dash.kpi.patients': 'Patients today',
  'dash.kpi.appointments': 'Appointments',
  'dash.kpi.beds': 'Beds occupied',
  'dash.kpi.revenue': "Today's revenue",
  'dash.appts': "Today's appointments",
  'dash.apptsCount': '{n} today',
  'dash.payments': 'Payments by method',
  'dash.occupancy': 'Bed occupancy',
  'dash.occupancyGlobal': '{n}% overall',
  'dash.tx': 'Recent transactions',
  'dash.quick': 'Quick access',
  'dash.paid': 'Paid',
  'dash.total': 'Total',
  'dash.cash': 'Cash (CDF/USD)',
  'dash.offline': 'Offline ready · Automatic sync',
  'status.confirmed': 'Confirmed',
  'status.inprogress': 'In progress',
  'status.waiting': 'Waiting',

  'patients.subtitle': 'Records, search and admission.',
  'patients.searchPh': 'Search (name, MRN, phone)…',
  'patients.none': 'No patient',
  'patients.noneSearch': 'No result for this search.',
  'patients.noneHint': 'Register your first patient with the “New” button.',
  'patients.new': 'New patient',
  'patients.save': 'Save patient',
  'patients.createError': 'Could not create.',
  'patients.record': 'Patient record',
  'patients.admit': 'Admit to inpatient',
  'patients.admitted': 'Patient admitted',

  'form.lastName': 'Last name',
  'form.firstName': 'First name',
  'form.sex': 'Sex',
  'form.male': 'Male',
  'form.female': 'Female',
  'form.birthDate': 'Date of birth',
  'form.phone': 'Phone',
  'form.address': 'Address',
  'form.addressPh': 'Neighborhood, commune…',
  'detail.age': 'Age',
  'unit.years': '{n} yrs',

  'hospit.subtitle': '{occ}/{total} beds occupied · {pct}% occupancy',
  'hospit.admit': 'Admit',
  'hospit.inpatients': 'Inpatients',
  'hospit.none': 'No inpatient',
  'hospit.noneHint': 'Use “Admit” to place a patient in a bed.',
  'hospit.transfer': 'Transfer',
  'hospit.discharge': 'Discharge',
  'hospit.dischargeConfirm': 'Confirm discharge of {name}?',
  'hospit.dischargeError': 'Could not discharge.',
  'hospit.free': '{n} free',
  'hospit.frees': '{n} free',
  'unit.today': 'Today',
  'unit.day': '1 day',
  'unit.days': '{n} days',

  'admit.title': 'Admit a patient',
  'admit.patient': 'Patient',
  'admit.searchPatient': 'Search a patient…',
  'admit.service': 'Ward',
  'admit.bed': 'Bed',
  'admit.reason': 'Admission reason',
  'admit.reasonPh': 'Observation, post-op…',
  'admit.confirm': 'Confirm admission',
  'admit.error': 'Could not admit.',
  'admit.pick': 'Choose a patient and a bed.',
  'admit.noBeds': 'No free bed. Create wards/beds or free a bed.',
  'transfer.title': 'Transfer patient',
  'transfer.currently': '{name} — currently {ward}, bed {bed}.',
  'transfer.newBed': 'New bed',
  'transfer.chooseFree': '— Select a free bed —',
  'transfer.confirm': 'Confirm transfer',
  'transfer.error': 'Could not transfer.',

  'ph.title': 'Patients',
  'ph.building': 'Module under construction',
  'ph.body':
    'The “{title}” screen will be built on this same design. The foundation (API, authentication, multi-currency) is already in place on the server.',
  'ph.start': 'Start this module',
  'page.patients': 'Patients',
  'page.agenda': 'Appointments',
  'page.hospit': 'Inpatient',
  'page.pharmacie': 'Pharmacy',
  'page.labo': 'Laboratory',
  'page.caisse': 'Cashier',
  'page.personnel': 'Staff',
  'page.reglages': 'Settings',
  'desc.agenda': 'Practitioner schedules and queue.',
  'desc.pharmacie': 'Stock, dispensing and alerts.',
  'desc.labo': 'Lab requests and results.',
  'desc.caisse': 'Multi-currency billing and mobile money.',
  'desc.personnel': 'Team, roles and shifts.',
  'desc.reglages': 'Facility, currencies and settings.',
};

const DICTS: Record<Lang, Dict> = { fr: FR, en: EN };

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem('docta-lang') as Lang) || 'fr',
  );

  useEffect(() => {
    localStorage.setItem('docta-lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = DICTS[lang][key] ?? DICTS.fr[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
