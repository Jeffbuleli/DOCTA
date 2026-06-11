import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth';
import { ApiError } from '../api';

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
      setError(
        err instanceof ApiError
          ? err.message
          : 'Connexion impossible. Vérifiez que l’API est démarrée.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={onSubmit}>
        <div className="auth__brand">
          <span style={{ color: 'var(--primary)' }}>
            <BrandMark />
          </span>
          <span className="brand-name">Docta</span>
        </div>
        <div className="auth__tag">Système d'Information Hospitalier</div>

        {error && <div className="auth__error">{error}</div>}

        <div className="field">
          <label htmlFor="tenant">Établissement</label>
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
          <label htmlFor="email">Adresse e-mail</label>
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
          <label htmlFor="password">Mot de passe</label>
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
          {busy ? <span className="spinner" /> : 'Se connecter'}
        </button>

        <div className="auth__hint">
          Démo : clinique-demo · admin@docta.cd · docta1234
        </div>
      </form>
    </div>
  );
}
