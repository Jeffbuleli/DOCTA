import { StaffSpace } from './App';
import { useAccount } from './account';
import { useActiveTenant } from './activeTenant';
import { useI18n } from './i18n';
import { usePath } from './router';
import { PatientAuth } from './pages/portal/PatientAuth';
import { Hub } from './pages/portal/Hub';
import { MyRecord } from './pages/portal/MyRecord';
import { VerifyEmail } from './pages/portal/VerifyEmail';
import { ResetPassword } from './pages/portal/ResetPassword';
import { HospitalDirectory } from './pages/portal/HospitalDirectory';
import { ProfilePublic } from './pages/portal/ProfilePublic';

/**
 * Aiguillage racine — identite unique.
 * Une personne = un compte ; elle bascule entre "patient" (Hub) et "personnel"
 * (StaffSpace d'un hopital actif).
 */
export function Root() {
  const path = usePath();
  const { account, loading } = useAccount();
  const { active } = useActiveTenant();
  const { t } = useI18n();

  // Routes publiques (accessibles connecte ou non)
  if (path === '/verifier-email') return <VerifyEmail />;
  if (path === '/reinitialiser') return <ResetPassword />;
  if (path.startsWith('/hopitaux')) return <HospitalDirectory />;
  if (path.startsWith('/profil/')) {
    return <ProfilePublic accountId={path.split('/')[2]} />;
  }

  if (loading) return <div className="fullscreen-center">{t('common.loading')}</div>;
  if (!account) return <PatientAuth />;

  // Connecte : contexte personnel (hopital actif) ou espace patient (Hub)
  if (active) return <StaffSpace />;
  if (path.startsWith('/patient/dossier')) return <MyRecord />;
  return <Hub />;
}
