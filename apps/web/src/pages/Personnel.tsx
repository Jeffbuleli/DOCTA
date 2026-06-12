import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { useActiveTenant } from '../activeTenant';
import { api, ApiError, type MemberRow } from '../api';
import { IconPlus, IconPersonnel } from '../icons';

const ROLES = ['DOCTOR', 'NURSE', 'RECEPTION', 'CASHIER', 'PHARMACIST', 'LAB', 'IMAGING', 'LOGISTICS', 'HR', 'ADMIN'];

export function Personnel() {
  const { t } = useI18n();
  const { active } = useActiveTenant();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const tenantId = active?.tenantId;
  const load = () => {
    if (!tenantId) return;
    setLoading(true);
    api.me.members(tenantId).then(setMembers).catch(() => setMembers([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [tenantId]);

  const statusBadge: Record<string, string> = { ACTIVE: 'success', PENDING: 'warning', ENDED: 'muted' };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('staff.personnel')}</h1>
          <div className="sub">{active?.name}</div>
        </div>
        <button className="btn btn--primary" onClick={() => setShowInvite(true)}>
          <IconPlus width={18} height={18} /> <span className="hide-xs">{t('staff.invite')}</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">{t('common.loading')}</div>
        ) : members.length === 0 ? (
          <div className="empty">
            <span className="ic"><IconPersonnel width={30} height={30} /></span>
            <p style={{ margin: 0 }}>{t('staff.noMembers')}</p>
          </div>
        ) : (
          members.map((m) => (
            <div className="pt-row" key={m.id} style={{ cursor: 'default' }}>
              <span className="pt-avatar pt-avatar--m">
                {(m.account?.fullName ?? m.invitedEmail ?? '?').slice(0, 2).toUpperCase()}
              </span>
              <span className="pt-main">
                <span className="pt-name">{m.account?.fullName ?? m.invitedEmail}</span>
                <span className="pt-meta">
                  {t(`role.${m.role}`)}{m.title ? ` · ${m.title}` : ''}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge--${statusBadge[m.status] ?? 'muted'}`}>{m.status}</span>
                {m.status !== 'ENDED' && (
                  <button className="btn" style={{ height: 34, padding: '0 10px', color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
                    onClick={async () => { await api.me.end(m.id); load(); }}>
                    {t('staff.endContract')}
                  </button>
                )}
              </span>
            </div>
          ))
        )}
      </div>

      {showInvite && tenantId && (
        <InviteModal tenantId={tenantId} onClose={() => setShowInvite(false)} onInvited={() => { setShowInvite(false); load(); }} />
      )}
    </>
  );
}

function InviteModal({ tenantId, onClose, onInvited }: { tenantId: string; onClose: () => void; onInvited: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.me.invite(tenantId, { email: email.trim(), role, title: title.trim() || undefined });
      onInvited();
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
          <h3>{t('staff.invite')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}
          <div className="field">
            <label>{t('staff.inviteEmail')}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="none" required />
          </div>
          <div className="field">
            <label>{t('staff.role')}</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('staff.titleField')}</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : t('staff.sendInvite')}
          </button>
        </div>
      </form>
    </div>
  );
}
