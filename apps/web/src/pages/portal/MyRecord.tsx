import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import { api, ApiError, type RecordEntry, type RecordSummary } from '../../api';
import { navigate } from '../../router';
import { Footer } from '../../components/Footer';
import {
  IconMedicalRecord,
  IconHospitalBuilding,
  IconShare,
  IconLink,
  IconLogout,
} from '../../icons';

function fmtDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB');
}

export function MyRecord() {
  const { t, lang, setLang } = useI18n();
  const [data, setData] = useState<RecordSummary | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const load = () => api.records.list().then(setData).catch(() => setData({ account: null, records: [] }));
  useEffect(() => { load(); }, []);

  return (
    <div className="app">
      <header className="topbar">
        <button className="iconbtn" aria-label={t('pauth.back')} onClick={() => navigate('/patient')} style={{ transform: 'rotate(180deg)' }}>
          <IconLogout width={19} height={19} />
        </button>
        <div className="brand" style={{ color: 'var(--primary)' }}>
          <span className="brand-name">Docta</span>
        </div>
        <button className="iconbtn langbtn" aria-label={t('topbar.lang')} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
          {lang.toUpperCase()}
        </button>
      </header>

      <main className="home" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <h1>{t('rec.title')}</h1>
            <div className="sub">{t('rec.subtitle')}</div>
          </div>
        </div>

        <div className="toolbar">
          <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => setShowShare(true)}>
            <IconShare width={18} height={18} /> {t('rec.share')}
          </button>
          <button className="btn" onClick={() => setShowAdd(true)}>
            <IconLink width={18} height={18} /> <span className="hide-xs">{t('rec.add')}</span>
          </button>
        </div>

        {!data ? (
          <div className="card"><div className="empty">{t('common.loading')}</div></div>
        ) : data.records.length === 0 ? (
          <div className="card">
            <div className="empty">
              <span className="ic"><IconMedicalRecord width={30} height={30} /></span>
              <h3 style={{ fontSize: 16 }}>{t('rec.none')}</h3>
              <p style={{ margin: 0, maxWidth: 300 }}>{t('rec.noneHint')}</p>
            </div>
          </div>
        ) : (
          data.records.map((r, i) => <RecordCard key={i} r={r} fmt={(d) => fmtDate(d, lang)} />)
        )}
      </main>

      {showAdd && <AddRecordModal onClose={() => setShowAdd(false)} onLinked={() => { setShowAdd(false); load(); }} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      <Footer />
    </div>
  );
}

function RecordCard({ r, fmt }: { r: RecordEntry; fmt: (d: string) => string }) {
  const { t } = useI18n();
  const badge: Record<string, string> = { ACTIVE: 'info', DISCHARGED: 'success', TRANSFERRED: 'warning' };
  return (
    <div className="card" style={{ marginBottom: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="ic-round" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <IconHospitalBuilding width={20} height={20} />
        </span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--heading)' }}>{r.hospital}</div>
          <div className="pt-meta">
            {r.city ? `${r.city} · ` : ''}<span className="mrn">{r.mrn}</span>
          </div>
        </div>
      </div>

      <div className="nav__group" style={{ margin: '6px 0 4px' }}>{t('rec.admissions')}</div>
      {r.admissions.length === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>{t('rec.noAdmissions')}</div>
      ) : (
        <div className="list">
          {r.admissions.map((a, j) => (
            <div className="list__row" key={j}>
              <span className="list__main">
                <span className="list__title">{a.ward} · {a.bed}</span>
                <span className="list__sub">
                  {fmt(a.admittedAt)}{a.dischargedAt ? ` → ${fmt(a.dischargedAt)}` : ''}{a.reason ? ` · ${a.reason}` : ''}
                </span>
              </span>
              <span className={`badge badge--${badge[a.status] ?? 'muted'}`}>{t(`adm.${a.status}`)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddRecordModal({ onClose, onLinked }: { onClose: () => void; onLinked: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.records.link(code.trim());
      onLinked();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('rec.linkError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal__head">
          <h3>{t('rec.add')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body">
          <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: 13 }}>{t('rec.addDesc')}</p>
          {error && <div className="auth__error">{error}</div>}
          <div className="field">
            <input
              className="input"
              style={{ textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 700 }}
              placeholder={t('rec.linkCodePh')}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect="off"
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : t('rec.linkBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}

function ShareModal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const [code, setCode] = useState<string | null>(null);
  const [expires, setExpires] = useState<string | null>(null);

  useEffect(() => {
    api.records.share().then((s) => { setCode(s.code); setExpires(s.expiresAt); }).catch(() => {});
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{t('rec.share')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body" style={{ textAlign: 'center' }}>
          <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: 13 }}>{t('rec.shareDesc')}</p>
          {code ? (
            <>
              <div className="sharecode">{code}</div>
              {expires && (
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                  {new Date(expires).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </>
          ) : (
            <div className="empty">{t('common.loading')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
