import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, type Patient, type Sex } from '../api';
import { IconSearch, IconPlus, IconPatients } from '../icons';
import { AdmitModal } from '../components/AdmitModal';

function initials(p: Patient) {
  return (p.firstName[0] ?? '') + (p.lastName[0] ?? '');
}
function age(birth: string | null): string {
  if (!birth) return '—';
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  const y = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return `${y} ans`;
}
const sexLabel = (s: Sex | null) => (s === 'M' ? 'Homme' : s === 'F' ? 'Femme' : '—');

export function Patients() {
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Patient | null>(null);

  const load = (q: string) => {
    setLoading(true);
    api.patients
      .list(q)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  // Recherche en direct (debounce 300ms).
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <div className="sub">Dossiers, recherche et admission.</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <IconSearch width={18} height={18} />
          <input
            className="input"
            placeholder="Rechercher (nom, MRN, téléphone)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoCapitalize="none"
          />
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(true)}>
          <IconPlus width={18} height={18} />
          <span className="hide-xs">Nouveau</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <span className="ic">
              <IconPatients width={30} height={30} />
            </span>
            <h3 style={{ fontSize: 16 }}>Aucun patient</h3>
            <p style={{ margin: 0, maxWidth: 280 }}>
              {search
                ? 'Aucun résultat pour cette recherche.'
                : 'Enregistrez votre premier patient avec le bouton « Nouveau ».'}
            </p>
          </div>
        ) : (
          list.map((p) => (
            <button
              key={p.id}
              className="pt-row"
              onClick={() => setDetail(p)}
            >
              <span className={`pt-avatar pt-avatar--${p.sex === 'F' ? 'f' : 'm'}`}>
                {initials(p).toUpperCase()}
              </span>
              <span className="pt-main">
                <span className="pt-name">
                  {p.lastName} {p.firstName}
                </span>
                <span className="pt-meta">
                  <span className="mrn">{p.mrn}</span>
                  <span>· {sexLabel(p.sex)}</span>
                  <span>· {age(p.birthDate)}</span>
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
      setError(err instanceof ApiError ? err.message : 'Création impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal__head">
          <h3>Nouveau patient</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}
          <div className="form-grid">
            <div className="field" style={{ margin: 0 }}>
              <label>Nom *</label>
              <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Prénom *</label>
              <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Sexe</label>
              <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="">—</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Date de naissance</label>
              <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>Téléphone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxx" />
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>Adresse</label>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, commune…" />
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 18 }}>
            {busy ? <span className="spinner" /> : 'Enregistrer le patient'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---- Fiche patient ---- */
function PatientDetail({ patient: p, onClose }: { patient: Patient; onClose: () => void }) {
  const [admit, setAdmit] = useState(false);
  const [done, setDone] = useState(false);
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
          <h3>Fiche patient</h3>
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
            <Row k="Sexe" v={sexLabel(p.sex)} />
            <Row k="Âge" v={age(p.birthDate)} />
            <Row k="Téléphone" v={p.phone || '—'} />
            <Row k="Adresse" v={p.address || '—'} />
          </div>
          {done ? (
            <div className="badge badge--success" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '12px' }}>
              Patient admis en hospitalisation
            </div>
          ) : (
            <button
              className="btn btn--primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => setAdmit(true)}
            >
              Admettre en hospitalisation
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
