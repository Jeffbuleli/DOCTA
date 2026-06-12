import { AccountProvider, useAccount } from './account';
import { useI18n } from './i18n';
import { usePath } from './router';
import { PatientAuth } from './pages/portal/PatientAuth';
import { PatientHome } from './pages/portal/PatientHome';
import { MyRecord } from './pages/portal/MyRecord';

function PortalInner() {
  const { account, loading } = useAccount();
  const { t } = useI18n();
  const path = usePath();
  if (loading) return <div className="fullscreen-center">{t('common.loading')}</div>;
  if (!account) return <PatientAuth />;
  if (path.startsWith('/patient/dossier')) return <MyRecord />;
  return <PatientHome />;
}

export function PatientPortal() {
  return (
    <AccountProvider>
      <PortalInner />
    </AccountProvider>
  );
}
