import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { api, type AppointmentStatus, type StaffAppointment } from '../api';
import { IconAgenda } from '../icons';

const BADGE: Record<string, string> = {
  REQUESTED: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'muted',
  COMPLETED: 'info',
};

export function Agenda() {
  const { t, lang } = useI18n();
  const [list, setList] = useState<StaffAppointment[] | null>(null);

  const load = () => api.appointments.list().then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const set = async (id: string, status: AppointmentStatus) => {
    await api.appointments.setStatus(id, status);
    load();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.agenda')}</h1>
          <div className="sub">{t('agenda.subtitle')}</div>
        </div>
      </div>

      <div className="card">
        {!list ? (
          <div className="empty">{t('common.loading')}</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <span className="ic"><IconAgenda width={30} height={30} /></span>
            <p style={{ margin: 0 }}>{t('agenda.none')}</p>
          </div>
        ) : (
          list.map((a) => (
            <div className="pt-row" key={a.id} style={{ cursor: 'default', flexWrap: 'wrap' }}>
              <span className="pt-avatar pt-avatar--m">
                {a.account.fullName.slice(0, 2).toUpperCase()}
              </span>
              <span className="pt-main">
                <span className="pt-name">{a.account.fullName}</span>
                <span className="pt-meta">
                  {fmt(a.scheduledAt)}{a.doctor ? ` · ${t('rdv.with', { name: a.doctor.fullName })}` : ''}{a.reason ? ` · ${a.reason}` : ''}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`badge badge--${BADGE[a.status]}`}>{t(`appt.${a.status}`)}</span>
                {a.status === 'REQUESTED' && (
                  <button className="btn btn--primary" style={{ height: 34, padding: '0 10px' }} onClick={() => set(a.id, 'CONFIRMED')}>{t('agenda.confirm')}</button>
                )}
                {a.status === 'CONFIRMED' && (
                  <button className="btn" style={{ height: 34, padding: '0 10px' }} onClick={() => set(a.id, 'COMPLETED')}>{t('agenda.complete')}</button>
                )}
                {(a.status === 'REQUESTED' || a.status === 'CONFIRMED') && (
                  <button className="btn" style={{ height: 34, padding: '0 10px', color: 'var(--danger)', borderColor: 'var(--danger-soft)' }} onClick={() => set(a.id, 'CANCELLED')}>{t('agenda.cancel')}</button>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
