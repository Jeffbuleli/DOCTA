import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth';
import { ApiError } from '../api';
import { useI18n } from '../i18n';
import { Footer } from '../components/Footer';

const BrandMark = () => (
  <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden>
    <rect width="48" height="48" rx="12" fill="currentColor" opacity="0.12" />
    <path
      d="M24 9 11 14v8c0 8 6 13 13 16 7-3 13-8 13-16v-8L24 9Z"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path
      d="M24 18v10M19 23h10"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </svg>
);

export function Login() {
  const { login } = useAuth();
  const { t, lang, setLang } = useI18n();
  // Pre-rempli avec le compte de demonstration (seed).
  const [tenantSlug, setTenantSlug] = useState('clinique-demo');
  const [email, setEmail] = useState('admin@docta.cd');
  const [password, setPassword] = useState('docta1234');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(tenantSlug.trim(), email.trim(), password);
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
      <form className="auth__card" onSubmit={onSubmit}>
        <div className="auth__brand">
          <span style={{ color: 'var(--primary)' }}>
            <BrandMark />
          </span>
          <span className="brand-name">Docta</span>
        </div>
        <div className="auth__tag">{t('app.tagline')}</div>

        {error && <div className="auth__error">{error}</div>}

        <div className="field">
          <label htmlFor="tenant">{t('login.establishment')}</label>
          <input
            id="tenant"
            className="input"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            placeholder="clinique-demo"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">{t('login.email')}</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@etablissement.cd"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">{t('login.password')}</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? <span className="spinner" /> : t('login.signin')}
        </button>

        <div className="auth__hint">{t('login.demo')}</div>
      </form>
      <Footer />
    </div>
  );
}
