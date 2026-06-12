import { useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import { useAccount } from '../../account';
import { api, ApiError } from '../../api';
import { navigate } from '../../router';
import { Footer } from '../../components/Footer';

type Mode = 'login' | 'register' | 'forgot';

export function PatientAuth() {
  const { t, lang, setLang } = useI18n();
  const { login, register } = useAccount();
  const [mode, setMode] = useState<Mode>('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else if (mode === 'register') {
        await register({ fullName: fullName.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
      } else {
        await api.account.requestReset(email.trim());
        setNotice(t('forgot.sent'));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('login.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <button
        type="button"
        className="iconbtn langbtn"
        aria-label={t('topbar.lang')}
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        style={{ position: 'absolute', top: 16, right: 16 }}
      >
        {lang.toUpperCase()}
      </button>

      <form className="auth__card" onSubmit={submit}>
        <div className="auth__brand">
          <span className="brand-name" style={{ color: 'var(--primary)' }}>Docta</span>
        </div>
        <div className="auth__tag">
          {mode === 'login' ? t('pauth.login') : mode === 'register' ? t('pauth.register') : t('forgot.title')}
        </div>

        {error && <div className="auth__error">{error}</div>}
        {notice && (
          <div className="badge badge--success" style={{ width: '100%', justifyContent: 'center', padding: 10, marginBottom: 14 }}>
            {notice}
          </div>
        )}

        {mode === 'forgot' && (
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0 }}>{t('forgot.desc')}</p>
        )}

        {mode === 'register' && (
          <div className="field">
            <label>{t('pauth.fullName')}</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
        )}

        <div className="field">
          <label>{t('login.email')}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="none" autoCorrect="off" required />
        </div>

        {mode !== 'forgot' && (
          <div className="field">
            <label>{t('login.password')}</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
        )}

        {mode === 'register' && (
          <div className="field">
            <label>{t('pauth.phoneOpt')}</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxx" />
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : mode === 'login' ? t('pauth.login') : mode === 'register' ? t('pauth.signup') : t('forgot.submit')}
        </button>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {mode === 'login' && (
            <>
              <button type="button" className="linklike" onClick={() => { setMode('register'); setError(''); }}>{t('pauth.noAccount')}</button>
              <button type="button" className="linklike" onClick={() => { setMode('forgot'); setError(''); }}>{t('pauth.forgot')}</button>
            </>
          )}
          {mode !== 'login' && (
            <button type="button" className="linklike" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>{t('pauth.haveAccount')}</button>
          )}
          <button type="button" className="linklike" onClick={() => navigate('/hopitaux')}>{t('dir.title')}</button>
        </div>
      </form>
      <Footer />
    </div>
  );
}
