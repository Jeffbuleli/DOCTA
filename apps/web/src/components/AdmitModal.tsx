import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  api,
  ApiError,
  type AvailableBed,
  type Patient,
} from '../api';
import { IconSearch } from '../icons';

export function AdmitModal({
  patient: preselected,
  onClose,
  onAdmitted,
}: {
  patient?: Patient;
  onClose: () => void;
  onAdmitted: () => void;
}) {
  const [patient, setPatient] = useState<Patient | null>(preselected ?? null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Patient[]>([]);

  const [beds, setBeds] = useState<AvailableBed[]>([]);
  const [wardId, setWardId] = useState('');
  const [bedId, setBedId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Charge les lits libres.
  useEffect(() => {
    api.hospital.beds().then(setBeds).catch(() => setBeds([]));
  }, []);

  // Recherche patient (si non pre-selectionne).
  useEffect(() => {
    if (patient) return;
    const t = setTimeout(() => {
      if (search.trim().length < 1) {
        setResults([]);
        return;
      }
      api.patients.list(search).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [search, patient]);

  const wards = useMemo(() => {
    const map = new Map<string, string>();
    beds.forEach((b) => map.set(b.wardId, b.wardName));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [beds]);

  const wardBeds = useMemo(
    () => beds.filter((b) => b.wardId === wardId),
    [beds, wardId],
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!patient || !bedId) {
      setError('Choisissez un patient et un lit.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await api.hospital.admit(patient.id, bedId, reason || undefined);
      onAdmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Admission impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal__head">
          <h3>Admettre un patient</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}

          {/* Patient */}
          {patient ? (
            <div className="field" style={{ margin: '0 0 14px' }}>
              <label>Patient</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span className={`pt-avatar pt-avatar--${patient.sex === 'F' ? 'f' : 'm'}`}>
                  {(patient.firstName[0] ?? '') + (patient.lastName[0] ?? '')}
                </span>
                <div className="pt-main">
                  <div className="pt-name">{patient.lastName} {patient.firstName}</div>
                  <div className="pt-meta"><span className="mrn">{patient.mrn}</span></div>
                </div>
                {!preselected && (
                  <button type="button" className="btn btn--ghost" onClick={() => setPatient(null)}>
                    Changer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="field" style={{ margin: '0 0 14px' }}>
              <label>Patient *</label>
              <div className="search">
                <IconSearch width={18} height={18} />
                <input
                  className="input"
                  placeholder="Rechercher un patient…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoCapitalize="none"
                />
              </div>
              {results.length > 0 && (
                <div className="card" style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="pt-row"
                      onClick={() => {
                        setPatient(p);
                        setResults([]);
                        setSearch('');
                      }}
                    >
                      <span className={`pt-avatar pt-avatar--${p.sex === 'F' ? 'f' : 'm'}`}>
                        {(p.firstName[0] ?? '') + (p.lastName[0] ?? '')}
                      </span>
                      <span className="pt-main">
                        <span className="pt-name">{p.lastName} {p.firstName}</span>
                        <span className="pt-meta"><span className="mrn">{p.mrn}</span></span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Service + lit */}
          <div className="form-grid">
            <div className="field" style={{ margin: 0 }}>
              <label>Service</label>
              <select
                className="select"
                value={wardId}
                onChange={(e) => {
                  setWardId(e.target.value);
                  setBedId('');
                }}
              >
                <option value="">— Choisir —</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Lit</label>
              <select
                className="select"
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                disabled={!wardId}
              >
                <option value="">— Choisir —</option>
                {wardBeds.map((b) => (
                  <option key={b.id} value={b.id}>{b.label} ({b.roomName})</option>
                ))}
              </select>
            </div>
            <div className="field col-2" style={{ margin: 0 }}>
              <label>Motif d'admission</label>
              <input
                className="input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Observation, post-opératoire…"
              />
            </div>
          </div>

          {wards.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
              Aucun lit libre. Créez des services/lits ou libérez un lit.
            </p>
          )}

          <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 18 }}>
            {busy ? <span className="spinner" /> : 'Confirmer l’admission'}
          </button>
        </div>
      </form>
    </div>
  );
}
