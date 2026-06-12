import { App } from './App';
import { AuthProvider } from './auth';
import { PatientPortal } from './PatientPortal';
import { Landing } from './pages/portal/Landing';
import { VerifyEmail } from './pages/portal/VerifyEmail';
import { ResetPassword } from './pages/portal/ResetPassword';
import { usePath } from './router';

/** Aiguillage racine entre face publique (patient) et face hopital (personnel). */
export function Root() {
  const path = usePath();

  if (path.startsWith('/personnel')) {
    return (
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  }
  if (path === '/verifier-email') return <VerifyEmail />;
  if (path === '/reinitialiser') return <ResetPassword />;
  if (path.startsWith('/patient')) return <PatientPortal />;
  return <Landing />;
}
