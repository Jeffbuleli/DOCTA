import { AccountProvider, useAccount } from './account';
import { useI18n } from './i18n';
import { PatientAuth } from './pages/portal/PatientAuth';
import { PatientHome } from './pages/portal/PatientHome';

function PortalInner() {
  const { account, loading } = useAccount();
  const { t } = useI18n();
  if (loading) return <div className="fullscreen-center">{t('common.loading')}</div>;
  return account ? <PatientHome /> : <PatientAuth />;
}

export function PatientPortal() {
  return (
    <AccountProvider>
      <PortalInner />
    </AccountProvider>
  );
}
