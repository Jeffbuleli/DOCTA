import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, type Patient, type RecordSummary, type Sex } from '../api';
import { IconSearch, IconPlus, IconPatients, IconShare, IconLink, IconHospitalBuilding } from '../icons';
import { AdmitModal } from '../components/AdmitModal';
import { useI18n } from '../i18n';

type T = (k: string, v?: Record<string, string | number>) => string;

function initials(p: Patient) {
  return (p.firstName[0] ?? '') + (p.lastName[0] ?? '');
}
function age(t: T, birth: string | null): string {
  if (!birth) return '—';
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  const y = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return t('unit.years', { n: y });
}
const sexLabel = (t: T, s: Sex | null) =>
  s === 'M' ? t('form.male') : s === 'F' ? t('form.female') : '—';

export function Patients() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const [detail, setDetail] = useState<Patient | null>(null);

  const load = (q: string) => {
    setLoading(true);
    api.patients
      .list(q)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const tm = setTimeout(() => load(search), 300);
    return () => clearTimeout(tm);
  }, [search]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.patients')}</h1>
          <div className="sub">{t('patients.subtitle')}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <IconSearch width={18} height={18} />
          <input
            className="input"
            placeholder={t('patients.searchPh')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoCapitalize="none"
          />
        </div>
        <button className="btn" onClick={() => setShowShared(true)} title={t('staff.sharedRecord')}>
          <IconShare width={18} height={18} />
          <span className="hide-xs">{t('staff.sharedRecord')}</span>
        </button>
        <button className="btn btn--primary" onClick={() => setShowForm(true)}>
          <IconPlus width={18} height={18} />
          <span className="hide-xs">{t('common.new')}</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">{t('common.loading')}</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <span className="ic">
              <IconPatients width={30} height={30} />
            </span>
            <h3 style={{ fontSize: 16 }}>{t('patients.none')}</h3>
            <p style={{ margin: 0, maxWidth: 280 }}>
              {search ? t('patients.noneSearch') : t('patients.noneHint')}
            </p>
          </div>
        ) : (
          list.map((p) => (
            <button key={p.id} className="pt-row" onClick={() => setDetail(p)}>
              <span className={`pt-avatar pt-avatar--${p.sex === 'F' ? 'f' : 'm'}`}>
                {initials(p).toUpperCase()}
              </span>
              <span className="pt-main">
                <span className="pt-name">
                  {p.lastName} {p.firstName}
                </span>
                <span className="pt-meta">
                  <span className="mrn">{p.mrn}</span>
                  <span>· {sexLabel(t, p.sex)}</span>
                  <span>· {age(t, p.birthDate)}</span>
                </span>
              </span>
              {p.phone && <span className="pt-meta">{p.phone}</span>}
            </button>
          ))
        )}
      </div>

      {showForm && (
        <PatientForm
          onClose={() => setShowForm(false)}
          onCreated={(p) => {
            setShowForm(false);
            setSearch('');
            load('');
            setDetail(p);
          }}
        />
      )}

      {detail && <PatientDetail patient={detail} onClose={() => setDetail(null)} />}
      {showShared && <SharedRecordModal onClose={() => setShowShared(false)} />}
    </>
  );
}

/* ---- Formulaire de creation ---- */
function PatientForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Patient) => void;
}) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState<'' | Sex>('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const p = await api.patients.create({
        firstName,
        lastName,
        sex: sex || undefined,
        birthDate: birthDate || undefined,
        phone: phone || undefined,
        address: address || undefined,
      });
      onCreated(p);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('patients.createError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal__head">
          <h3>{t('patients.new')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}
          <div className="form-grid">
            <div className="field" style={{ margin: 0 }}>
              <label>{t('form.lastName')} *</label>
              <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>{t('form.firstName')} *</label>
              <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>{t('form.sex')}</label>
              <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="">—</option>
                <option value="M">{t('form.male')}</option>
                <option value="F">{t('form.female')}</option>
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>{t('form.birthDate')}</label>
              <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>{t('form.phone')}</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxx" />
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>{t('form.address')}</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('form.addressPh')} />
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 18 }}>
            {busy ? <span className="spinner" /> : t('patients.save')}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---- Fiche patient ---- */
function PatientDetail({ patient: p, onClose }: { patient: Patient; onClose: () => void }) {
  const { t } = useI18n();
  const [admit, setAdmit] = useState(false);
  const [done, setDone] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);

  const generateLink = async () => {
    try {
      const r = await api.records.linkCode(p.id);
      setLinkCode(r.code);
    } catch {
      /* ignore */
    }
  };
  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="list__row">
      <span className="list__main">
        <span className="list__sub">{k}</span>
      </span>
      <span className="amount" style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{t('patients.record')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal__body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span className={`pt-avatar pt-avatar--${p.sex === 'F' ? 'f' : 'm'}`} style={{ width: 54, height: 54, fontSize: 18 }}>
              {(p.firstName[0] ?? '') + (p.lastName[0] ?? '')}
            </span>
            <div>
              <div className="pt-name" style={{ fontSize: 17 }}>{p.lastName} {p.firstName}</div>
              <div className="pt-meta"><span className="mrn">{p.mrn}</span></div>
            </div>
          </div>
          <div className="list">
            <Row k={t('form.sex')} v={sexLabel(t, p.sex)} />
            <Row k={t('detail.age')} v={age(t, p.birthDate)} />
            <Row k={t('form.phone')} v={p.phone || '—'} />
            <Row k={t('form.address')} v={p.address || '—'} />
          </div>
          {done ? (
            <div className="badge badge--success" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '12px' }}>
              {t('patients.admitted')}
            </div>
          ) : (
            <button
              className="btn btn--primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => setAdmit(true)}
            >
              {t('patients.admit')}
            </button>
          )}

          {linkCode ? (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>{t('staff.linkCodeShown')}</div>
              <div className="sharecode" style={{ fontSize: 30 }}>{linkCode}</div>
            </div>
          ) : (
            <button className="btn" style={{ width: '100%', marginTop: 10 }} onClick={generateLink}>
              <IconLink width={18} height={18} /> {t('staff.linkAccount')}
            </button>
          )}
        </div>
      </div>

      {admit && (
        <AdmitModal
          patient={p}
          onClose={() => setAdmit(false)}
          onAdmitted={() => {
            setAdmit(false);
            setDone(true);
          }}
        />
      )}
    </div>
  );
}

/* ---- Consulter un dossier partage (code du patient) ---- */
function SharedRecordModal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const [code, setCode] = useState('');
  const [data, setData] = useState<RecordSummary | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const admBadge: Record<string, string> = { ACTIVE: 'info', DISCHARGED: 'success', TRANSFERRED: 'warning' };
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB');

  const redeem = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setData(await api.records.redeem(code.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('rec.linkError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{t('staff.sharedRecord')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal__body">
          {!data ? (
            <form onSubmit={redeem}>
              {error && <div className="auth__error">{error}</div>}
              <div className="field">
                <label>{t('staff.enterShare')}</label>
                <input
                  className="input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 700 }}
                  value={code}
                  onChange={(ev) => setCode(ev.target.value.toUpperCase())}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  required
                />
              </div>
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? <span className="spinner" /> : t('staff.view')}
              </button>
            </form>
          ) : (
            <>
              <div style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: 12 }}>
                {t('staff.sharedFrom', { name: data.account?.fullName ?? '' })}
              </div>
              {data.records.map((r, i) => (
                <div key={i} className="card" style={{ marginBottom: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="ic-round" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      <IconHospitalBuilding width={18} height={18} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--heading)' }}>{r.hospital}</div>
                      <div className="pt-meta">{r.city ? `${r.city} · ` : ''}<span className="mrn">{r.mrn}</span></div>
                    </div>
                  </div>
                  {r.admissions.length === 0 ? (
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{t('rec.noAdmissions')}</div>
                  ) : (
                    <div className="list">
                      {r.admissions.map((a, j) => (
                        <div className="list__row" key={j}>
                          <span className="list__main">
                            <span className="list__title">{a.ward} · {a.bed}</span>
                            <span className="list__sub">{fmt(a.admittedAt)}{a.dischargedAt ? ` → ${fmt(a.dischargedAt)}` : ''}{a.reason ? ` · ${a.reason}` : ''}</span>
                          </span>
                          <span className={`badge badge--${admBadge[a.status] ?? 'muted'}`}>{t(`adm.${a.status}`)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
