import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import { useAccount } from '../../account';
import { useActiveTenant } from '../../activeTenant';
import { api, ApiError, type Membership } from '../../api';
import { navigate } from '../../router';
import { Footer } from '../../components/Footer';
import {
  IconHospitalBuilding,
  IconMedicalRecord,
  IconAgenda,
  IconVideo,
  IconLogout,
  IconChevron,
} from '../../icons';

const TILES = [
  { key: 'findHospital', icon: IconHospitalBuilding, color: '#018000', route: '/hopitaux' },
  { key: 'myRecord', icon: IconMedicalRecord, color: '#738f12', route: '/patient/dossier' },
  { key: 'appointments', icon: IconAgenda, color: '#976644' },
  { key: 'teleconsult', icon: IconVideo, color: '#0891b2' },
] as const;

export function Hub() {
  const { t, lang, setLang } = useI18n();
  const { account, logout, refresh } = useAccount();
  const { enter } = useActiveTenant();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [resent, setResent] = useState(false);

  const load = () => api.me.memberships().then(setMemberships).catch(() => setMemberships([]));
  useEffect(() => { load(); }, []);

  if (!account) return null;
  const active = memberships.filter((m) => m.status === 'ACTIVE');
  const pending = memberships.filter((m) => m.status === 'PENDING');
  const firstName = account.fullName.split(' ')[0];

  const enterHospital = (m: Membership) =>
    enter({ tenantId: m.tenantId, name: m.tenant.name, role: m.role });

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" style={{ color: 'var(--primary)' }}>
          <span className="brand-name">Docta</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="iconbtn langbtn" aria-label={t('topbar.lang')} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
            {lang.toUpperCase()}
          </button>
          <button className="iconbtn" aria-label={t('phome.logout')} onClick={logout}>
            <IconLogout width={19} height={19} />
          </button>
        </div>
      </header>

      <main className="home" style={{ maxWidth: 820 }}>
        <div className="page-head">
          <div>
            <h1>{t('phome.greeting', { name: firstName })}</h1>
            <button className="linklike" onClick={() => navigate(`/profil/${account.id}`)}>
              {t('hub.profile')} →
            </button>
          </div>
        </div>

        {!account.emailVerified && (
          <div className="card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--warning)' }}>
            <div style={{ fontWeight: 600, color: 'var(--heading)', marginBottom: 6 }}>{t('phome.verifyBanner')}</div>
            {resent ? (
              <div style={{ color: 'var(--success)', fontSize: 13 }}>{t('phome.resent')}</div>
            ) : (
              <button className="btn btn--primary" style={{ height: 36 }} onClick={async () => {
                const r = await api.account.resendVerification();
                if (r.alreadyVerified) return refresh();
                setResent(true);
              }}>{t('phome.resend')}</button>
            )}
          </div>
        )}

        {/* Invitations en attente */}
        {pending.length > 0 && (
          <>
            <div className="nav__group" style={{ margin: '4px 0 8px' }}>{t('hub.invitations')}</div>
            {pending.map((m) => (
              <div className="card" key={m.id} style={{ padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="ic-round" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)' }}>
                  <IconHospitalBuilding width={20} height={20} />
                </span>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: 'var(--heading)' }}>{m.tenant.name}</div>
                  <div className="pt-meta">{t(`role.${m.role}`)}{m.title ? ` · ${m.title}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn--primary" style={{ height: 38 }} onClick={async () => { await api.me.accept(m.id); load(); }}>{t('hub.accept')}</button>
                  <button className="btn" style={{ height: 38 }} onClick={async () => { await api.me.decline(m.id); load(); }}>{t('hub.decline')}</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Mes hopitaux */}
        <div className="nav__group" style={{ margin: '14px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t('hub.myHospitals')}</span>
          <button className="linklike" onClick={() => setShowCreate(true)}>+ {t('hub.createHospital')}</button>
        </div>
        {active.length === 0 ? (
          <div className="card"><div className="empty" style={{ padding: 24 }}>{t('hub.noHospitals')}</div></div>
        ) : (
          active.map((m) => (
            <button className="door" key={m.id} onClick={() => enterHospital(m)} style={{ marginBottom: 10 }}>
              <span className="door__ic"><IconHospitalBuilding width={24} height={24} /></span>
              <span className="door__txt" style={{ flex: 1 }}>
                <span className="door__title">{m.tenant.name}</span>
                <span className="door__desc">{t(`role.${m.role}`)}{m.title ? ` · ${m.title}` : ''}</span>
              </span>
              <IconChevron width={18} height={18} />
            </button>
          ))
        )}

        {/* Espace patient */}
        <div className="nav__group" style={{ margin: '20px 0 8px' }}>{t('hub.patientSpace')}</div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const route = 'route' in tile ? tile.route : undefined;
            return (
              <button key={tile.key} className="tile" style={{ ['--tile' as string]: tile.color }} onClick={() => route && navigate(route)} disabled={!route}>
                <span className="tile-icon"><Icon width={28} height={28} /></span>
                <span className="tile-label">{t(`phome.${tile.key}`)}</span>
                {!route && <span className="badge badge--muted" style={{ fontSize: 11 }}>{t('phome.soon')}</span>}
              </button>
            );
          })}
        </div>
      </main>

      {showCreate && (
        <CreateHospitalModal
          onClose={() => setShowCreate(false)}
          onCreated={(tenantId, name) => { setShowCreate(false); load(); enter({ tenantId, name, role: 'ADMIN' }); }}
        />
      )}
      <Footer />
    </div>
  );
}

function CreateHospitalModal({ onClose, onCreated }: { onClose: () => void; onCreated: (tenantId: string, name: string) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const h = await api.me.createHospital({ name: name.trim(), city: city.trim() || undefined });
      onCreated(h.id, h.name);
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
          <h3>{t('hub.createHospital')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body">
          <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: 13 }}>{t('hub.createDesc')}</p>
          {error && <div className="auth__error">{error}</div>}
          <div className="field">
            <label>{t('hub.hospitalName')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>{t('hub.city')}</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kinshasa" />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : t('hub.create')}
          </button>
        </div>
      </form>
    </div>
  );
}
