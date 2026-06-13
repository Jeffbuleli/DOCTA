import { useI18n } from '../i18n';

// Instance Jitsi (auto-hebergee). Surcharge : VITE_JITSI_BASE_URL
const JITSI_BASE =
  (import.meta.env.VITE_JITSI_BASE_URL as string | undefined) || 'https://meet.jit.si';

/** Salle de téléconsultation Jitsi embarquée, liée à un rendez-vous. */
export function Teleconsult({
  appointmentId,
  displayName,
  onClose,
}: {
  appointmentId: string;
  displayName: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const room = `docta-${appointmentId}`;
  const hash = `#userInfo.displayName=${encodeURIComponent(`"${displayName}"`)}&config.prejoinPageEnabled=false`;
  const url = `${JITSI_BASE.replace(/\/$/, '')}/${room}${hash}`;

  return (
    <div className="teleconsult">
      <div className="teleconsult__bar">
        <span className="teleconsult__title">{t('tele.title')}</span>
        <button className="btn" onClick={onClose}>{t('tele.leave')}</button>
      </div>
      <iframe
        title="Docta — téléconsultation"
        src={url}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="teleconsult__frame"
      />
    </div>
  );
}
