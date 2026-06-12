import { useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import { api, ApiError } from '../../api';
import { navigate, queryParam } from '../../router';
import { Footer } from '../../components/Footer';

export function ResetPassword() {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const token = queryParam('token');
    if (!token) return setError(t('reset.fail'));
    setBusy(true);
    setError('');
    try {
      await api.account.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('reset.fail'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={submit}>
        <div className="auth__brand">
          <span className="brand-name" style={{ color: 'var(--primary)' }}>Docta</span>
        </div>
        <div className="auth__tag">{t('reset.title')}</div>

        {done ? (
          <>
            <div className="badge badge--success" style={{ width: '100%', justifyContent: 'center', padding: 12, marginBottom: 14 }}>
              {t('reset.success')}
            </div>
            <button type="button" className="btn-primary" onClick={() => navigate('/patient')}>{t('pauth.login')}</button>
          </>
        ) : (
          <>
            {error && <div className="auth__error">{error}</div>}
            <div className="field">
              <label>{t('reset.newPassword')}</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? <span className="spinner" /> : t('reset.submit')}
            </button>
          </>
        )}
      </form>
      <Footer />
    </div>
  );
}
