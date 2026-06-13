import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import { useAccount } from '../../account';
import { api, ApiError, type PublicProfile } from '../../api';
import { Footer } from '../../components/Footer';
import { IconHospitalBuilding, IconLogout } from '../../icons';

function year(iso: string | null): string {
  return iso ? String(new Date(iso).getFullYear()) : '';
}

export function ProfilePublic({ accountId }: { accountId: string }) {
  const { t, lang, setLang } = useI18n();
  const { account } = useAccount();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [edit, setEdit] = useState(false);

  const load = () =>
    api.me
      .profile(accountId)
      .then(setData)
      .catch(() => setNotFound(true));
  useEffect(() => { load(); }, [accountId]);

  const isMine = account?.id === accountId;
  const statusBadge: Record<string, string> = { ACTIVE: 'success', ENDED: 'muted' };

  return (
    <div className="app">
      <header className="topbar">
        <button className="iconbtn" aria-label={t('pauth.back')} onClick={() => window.history.back()} style={{ transform: 'rotate(180deg)' }}>
          <IconLogout width={19} height={19} />
        </button>
        <div className="brand" style={{ color: 'var(--primary)' }}>
          <span className="brand-name">Docta</span>
        </div>
        <button className="iconbtn langbtn" aria-label={t('topbar.lang')} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
          {lang.toUpperCase()}
        </button>
      </header>

      <main className="home" style={{ maxWidth: 720 }}>
        {notFound ? (
          <div className="card"><div className="empty">{t('common.loading')}</div></div>
        ) : !data ? (
          <div className="card"><div className="empty">{t('common.loading')}</div></div>
        ) : (
          <>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className="pt-avatar pt-avatar--m" style={{ width: 64, height: 64, fontSize: 22 }}>
                  {data.account.fullName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: 22 }}>{data.account.fullName}</h1>
                  {data.account.headline && <div className="sub">{data.account.headline}</div>}
                </div>
              </div>
              {data.account.bio && (
                <p style={{ marginTop: 14, marginBottom: 0, color: 'var(--ink)', lineHeight: 1.5 }}>{data.account.bio}</p>
              )}
              {isMine && (
                <button className="btn" style={{ marginTop: 14 }} onClick={() => setEdit(true)}>
                  {t('profile.edit')}
                </button>
              )}
            </div>

            <div className="nav__group" style={{ margin: '6px 0 8px' }}>{t('profile.experience')}</div>
            {data.experience.length === 0 ? (
              <div className="card"><div className="empty" style={{ padding: 22 }}>{t('profile.noExperience')}</div></div>
            ) : (
              <div className="card">
                {data.experience.map((e, i) => (
                  <div className="pt-row" key={i} style={{ cursor: 'default' }}>
                    <span className="ic-round" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      <IconHospitalBuilding width={20} height={20} />
                    </span>
                    <span className="pt-main">
                      <span className="pt-name">{e.title || t(`role.${e.role}`)}</span>
                      <span className="pt-meta">
                        {e.hospital}{e.city ? ` · ${e.city}` : ''} · {year(e.startDate)} → {e.endDate ? year(e.endDate) : t('profile.present')}
                      </span>
                    </span>
                    <span className={`badge badge--${statusBadge[e.status] ?? 'muted'}`}>{t(`adm.${e.status === 'ACTIVE' ? 'ACTIVE' : 'DISCHARGED'}`)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {edit && data && (
        <EditProfileModal
          initial={{ headline: data.account.headline ?? '', bio: data.account.bio ?? '' }}
          onClose={() => setEdit(false)}
          onSaved={() => { setEdit(false); load(); }}
        />
      )}
      <Footer />
    </div>
  );
}

function EditProfileModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: { headline: string; bio: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [headline, setHeadline] = useState(initial.headline);
  const [bio, setBio] = useState(initial.bio);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.me.updateProfile({ headline: headline.trim(), bio: bio.trim() });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '—');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal__head">
          <h3>{t('profile.edit')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}
          <div className="field">
            <label>{t('profile.headline')}</label>
            <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('profile.bio')}</label>
            <textarea
              className="input"
              style={{ height: 110, padding: 12, resize: 'vertical' }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : t('profile.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
