import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n';
import { useAccount } from '../../account';
import {
  api,
  ApiError,
  type Doctor,
  type HospitalListing,
  type PatientAppointment,
} from '../../api';
import { navigate } from '../../router';
import { Footer } from '../../components/Footer';
import { Teleconsult } from '../../components/Teleconsult';
import { IconAgenda, IconLogout, IconPlus, IconHospitalBuilding, IconVideo } from '../../icons';

const BADGE: Record<string, string> = {
  REQUESTED: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'muted',
  COMPLETED: 'info',
};

export function MyAppointments() {
  const { t, lang, setLang } = useI18n();
  const { account } = useAccount();
  const [list, setList] = useState<PatientAppointment[] | null>(null);
  const [show, setShow] = useState(false);
  const [tele, setTele] = useState<PatientAppointment | null>(null);

  const load = () => api.me.appointments().then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const cancel = async (a: PatientAppointment) => {
    if (!window.confirm(t('rdv.cancelConfirm'))) return;
    await api.me.cancelAppointment(a.id);
    load();
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="iconbtn" aria-label={t('pauth.back')} onClick={() => navigate('/patient')} style={{ transform: 'rotate(180deg)' }}>
          <IconLogout width={19} height={19} />
        </button>
        <div className="brand" style={{ color: 'var(--primary)' }}><span className="brand-name">Docta</span></div>
        <button className="iconbtn langbtn" aria-label={t('topbar.lang')} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>{lang.toUpperCase()}</button>
      </header>

      <main className="home" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <h1>{t('rdv.title')}</h1>
            <div className="sub">{t('rdv.subtitle')}</div>
          </div>
          <button className="btn btn--primary" onClick={() => setShow(true)}>
            <IconPlus width={18} height={18} /> <span className="hide-xs">{t('rdv.book')}</span>
          </button>
        </div>

        {!list ? (
          <div className="card"><div className="empty">{t('common.loading')}</div></div>
        ) : list.length === 0 ? (
          <div className="card">
            <div className="empty">
              <span className="ic"><IconAgenda width={30} height={30} /></span>
              <h3 style={{ fontSize: 16 }}>{t('rdv.none')}</h3>
              <p style={{ margin: 0 }}>{t('rdv.noneHint')}</p>
            </div>
          </div>
        ) : (
          <div className="card">
            {list.map((a) => (
              <div className="pt-row" key={a.id} style={{ cursor: 'default' }}>
                <span className="ic-round" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                  <IconHospitalBuilding width={19} height={19} />
                </span>
                <span className="pt-main">
                  <span className="pt-name">
                    {a.tenant.name}
                    {a.online && <span className="badge badge--info" style={{ marginLeft: 8 }}>{t('rdv.onlineTag')}</span>}
                  </span>
                  <span className="pt-meta">
                    {fmt(a.scheduledAt)}{a.doctor ? ` · ${t('rdv.with', { name: a.doctor.fullName })}` : ''}{a.reason ? ` · ${a.reason}` : ''}
                  </span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`badge badge--${BADGE[a.status]}`}>{t(`appt.${a.status}`)}</span>
                  {a.online && (a.status === 'REQUESTED' || a.status === 'CONFIRMED') && (
                    <button className="btn btn--primary" style={{ height: 34, padding: '0 10px' }} onClick={() => setTele(a)}>
                      <IconVideo width={16} height={16} /> {t('rdv.join')}
                    </button>
                  )}
                  {(a.status === 'REQUESTED' || a.status === 'CONFIRMED') && (
                    <button className="btn" style={{ height: 34, padding: '0 10px', color: 'var(--danger)', borderColor: 'var(--danger-soft)' }} onClick={() => cancel(a)}>
                      {t('agenda.cancel')}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {show && <BookModal onClose={() => setShow(false)} onBooked={() => { setShow(false); load(); }} />}
      {tele && (
        <Teleconsult
          appointmentId={tele.id}
          displayName={account?.fullName ?? 'Patient'}
          onClose={() => setTele(null)}
        />
      )}
      <Footer />
    </div>
  );
}

function BookModal({ onClose, onBooked }: { onClose: () => void; onBooked: () => void }) {
  const { t } = useI18n();
  const [hospital, setHospital] = useState<HospitalListing | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<HospitalListing[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');
  const [online, setOnline] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hospital) return;
    const tm = setTimeout(() => {
      api.public.hospitals({ q: search || undefined }).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(tm);
  }, [search, hospital]);

  const pickHospital = (h: HospitalListing) => {
    setHospital(h);
    setResults([]);
    setDoctorId('');
    api.public.doctors(h.id).then(setDoctors).catch(() => setDoctors([]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hospital) return setError(t('rdv.pickHospital'));
    setBusy(true);
    setError('');
    try {
      await api.me.bookAppointment({
        tenantId: hospital.id,
        doctorAccountId: doctorId || undefined,
        reason: reason || undefined,
        scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
        online,
      });
      onBooked();
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
          <h3>{t('rdv.book')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}

          <div className="field">
            <label>{t('rdv.hospital')}</label>
            {hospital ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1 }}>{hospital.name}{hospital.city ? ` · ${hospital.city}` : ''}</span>
                <button type="button" className="btn btn--ghost" onClick={() => { setHospital(null); setDoctors([]); setDoctorId(''); }}>{t('common.change')}</button>
              </div>
            ) : (
              <input className="input" placeholder={t('rdv.searchHospital')} value={search} onChange={(e) => setSearch(e.target.value)} autoCapitalize="none" />
            )}
            {!hospital && results.length > 0 && (
              <div className="card" style={{ marginTop: 6, maxHeight: 160, overflowY: 'auto' }}>
                {results.map((h) => (
                  <button key={h.slug} type="button" className="pt-row" onClick={() => pickHospital(h)}>
                    <span className="pt-main">
                      <span className="pt-name">{h.name}</span>
                      <span className="pt-meta">{h.city}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hospital && doctors.length > 0 && (
            <div className="field">
              <label>{t('rdv.doctor')}</label>
              <select className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">{t('rdv.anyDoctor')}</option>
                {doctors.map((d) => (
                  <option key={d.accountId} value={d.accountId}>{d.fullName}{d.title ? ` — ${d.title}` : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid">
            <div className="field" style={{ margin: 0 }}>
              <label>{t('rdv.date')}</label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>{t('rdv.time')}</label>
              <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>{t('rdv.reason')}</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>{t('rdv.type')}</label>
              <select className="select" value={online ? 'online' : 'inperson'} onChange={(e) => setOnline(e.target.value === 'online')}>
                <option value="inperson">{t('rdv.inPerson')}</option>
                <option value="online">{t('rdv.online')}</option>
              </select>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 16 }}>
            {busy ? <span className="spinner" /> : t('rdv.confirm')}
          </button>
        </div>
      </form>
    </div>
  );
}
