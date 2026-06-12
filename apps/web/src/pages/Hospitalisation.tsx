import { useEffect, useMemo, useState } from 'react';
import {
  api,
  ApiError,
  type Admission,
  type AvailableBed,
  type WardOccupancy,
} from '../api';
import { AdmitModal } from '../components/AdmitModal';
import { IconPlus, IconHospit } from '../icons';
import { useI18n } from '../i18n';

type T = (k: string, v?: Record<string, string | number>) => string;

const WARD_COLORS = ['#006400', '#018000', '#976644', '#738f12', '#889682', '#683c1f'];

function days(t: T, from: string): string {
  const d = Math.floor((Date.now() - new Date(from).getTime()) / 86400000);
  return d <= 0 ? t('unit.today') : d === 1 ? t('unit.day') : t('unit.days', { n: d });
}

export function Hospitalisation() {
  const { t } = useI18n();
  const [wards, setWards] = useState<WardOccupancy[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdmit, setShowAdmit] = useState(false);
  const [transferFor, setTransferFor] = useState<Admission | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.hospital.wards(), api.hospital.admissions()])
      .then(([w, a]) => {
        setWards(w);
        setAdmissions(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const totals = useMemo(() => {
    const total = wards.reduce((s, w) => s + w.total, 0);
    const occ = wards.reduce((s, w) => s + w.occupied, 0);
    return { total, occ, pct: total ? Math.round((occ / total) * 100) : 0 };
  }, [wards]);

  const discharge = async (a: Admission) => {
    const name = `${a.patient.lastName} ${a.patient.firstName}`;
    if (!window.confirm(t('hospit.dischargeConfirm', { name }))) return;
    try {
      await api.hospital.discharge(a.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : t('hospit.dischargeError'));
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.hospit')}</h1>
          <div className="sub">
            {t('hospit.subtitle', { occ: totals.occ, total: totals.total, pct: totals.pct })}
          </div>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdmit(true)}>
          <IconPlus width={18} height={18} />
          <span className="hide-xs">{t('hospit.admit')}</span>
        </button>
      </div>

      {/* Occupation par service */}
      <div className="grid grid--kpi" style={{ marginBottom: 14 }}>
        {wards.map((w, i) => {
          const color = WARD_COLORS[i % WARD_COLORS.length];
          const pct = w.total ? (w.occupied / w.total) * 100 : 0;
          return (
            <div className="kpi" key={w.id}>
              <div className="kpi__label" style={{ marginTop: 0 }}>{w.name}</div>
              <div className="kpi__value" style={{ fontSize: 20 }}>
                {w.occupied}<span style={{ color: 'var(--muted)', fontWeight: 600 }}>/{w.total}</span>
              </div>
              <div className="bar" style={{ marginTop: 8 }}>
                <span style={{ width: `${pct}%`, background: color }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                {w.available > 1
                  ? t('hospit.frees', { n: w.available })
                  : t('hospit.free', { n: w.available })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Patients hospitalises */}
      <div className="card">
        <div className="card__head">
          <h3>{t('hospit.inpatients')}</h3>
          <span className="badge badge--info">{admissions.length}</span>
        </div>
        {loading ? (
          <div className="empty">{t('common.loading')}</div>
        ) : admissions.length === 0 ? (
          <div className="empty">
            <span className="ic"><IconHospit width={30} height={30} /></span>
            <h3 style={{ fontSize: 16 }}>{t('hospit.none')}</h3>
            <p style={{ margin: 0, maxWidth: 280 }}>{t('hospit.noneHint')}</p>
          </div>
        ) : (
          admissions.map((a) => (
            <div className="pt-row" key={a.id} style={{ cursor: 'default' }}>
              <span className={`pt-avatar pt-avatar--${a.patient.sex === 'F' ? 'f' : 'm'}`}>
                {(a.patient.firstName[0] ?? '') + (a.patient.lastName[0] ?? '')}
              </span>
              <span className="pt-main">
                <span className="pt-name">{a.patient.lastName} {a.patient.firstName}</span>
                <span className="pt-meta">
                  <span className="mrn">{a.patient.mrn}</span>
                  <span>· {a.ward.name}</span>
                  <span>· {t('admit.bed').toLowerCase()} {a.bed.label}</span>
                  <span>· {days(t, a.admittedAt)}</span>
                </span>
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn--ghost" style={{ height: 36, padding: '0 10px' }} onClick={() => setTransferFor(a)}>
                  {t('hospit.transfer')}
                </button>
                <button className="btn" style={{ height: 36, padding: '0 12px', color: 'var(--danger)', borderColor: 'var(--danger-soft)' }} onClick={() => discharge(a)}>
                  {t('hospit.discharge')}
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {showAdmit && (
        <AdmitModal
          onClose={() => setShowAdmit(false)}
          onAdmitted={() => {
            setShowAdmit(false);
            load();
          }}
        />
      )}

      {transferFor && (
        <TransferModal
          admission={transferFor}
          onClose={() => setTransferFor(null)}
          onDone={() => {
            setTransferFor(null);
            load();
          }}
        />
      )}
    </>
  );
}

/* ---- Transfert vers un autre lit ---- */
function TransferModal({
  admission,
  onClose,
  onDone,
}: {
  admission: Admission;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const [beds, setBeds] = useState<AvailableBed[]>([]);
  const [bedId, setBedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.hospital.beds().then(setBeds).catch(() => setBeds([]));
  }, []);

  const submit = async () => {
    if (!bedId) return;
    setBusy(true);
    setError('');
    try {
      await api.hospital.transfer(admission.id, bedId);
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('transfer.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{t('transfer.title')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}
          <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: 13 }}>
            {t('transfer.currently', {
              name: `${admission.patient.lastName} ${admission.patient.firstName}`,
              ward: admission.ward.name,
              bed: admission.bed.label,
            })}
          </p>
          <div className="field">
            <label>{t('transfer.newBed')}</label>
            <select className="select" value={bedId} onChange={(e) => setBedId(e.target.value)}>
              <option value="">{t('transfer.chooseFree')}</option>
              {beds.map((b) => (
                <option key={b.id} value={b.id}>{b.wardName} · {b.label} ({b.roomName})</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={submit} disabled={busy || !bedId} style={{ marginTop: 8 }}>
            {busy ? <span className="spinner" /> : t('transfer.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
