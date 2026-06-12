import { useI18n } from '../../i18n';
import { navigate } from '../../router';
import { Footer } from '../../components/Footer';
import { IconPatients, IconConsultation } from '../../icons';

const Brand = () => (
  <div className="auth__brand" style={{ fontSize: 30, marginBottom: 4 }}>
    <span style={{ color: 'var(--primary)' }}>
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect width="48" height="48" rx="12" fill="currentColor" opacity="0.12" />
        <path d="M24 9 11 14v8c0 8 6 13 13 16 7-3 13-8 13-16v-8L24 9Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M24 18v10M19 23h10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </span>
    <span className="brand-name">Docta</span>
  </div>
);

export function Landing() {
  const { t, lang, setLang } = useI18n();
  return (
    <div className="auth">
      <button
        type="button"
        className="iconbtn langbtn"
        aria-label={t('topbar.lang')}
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        style={{ position: 'absolute', top: 16, right: 16 }}
      >
        {lang.toUpperCase()}
      </button>

      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        <Brand />
        <p className="auth__tag" style={{ fontSize: 14, marginBottom: 24 }}>
          {t('portal.subtitle')}
        </p>

        <button className="door door--primary" onClick={() => navigate('/patient')}>
          <span className="door__ic"><IconPatients width={26} height={26} /></span>
          <span className="door__txt">
            <span className="door__title">{t('portal.iamPatient')}</span>
            <span className="door__desc">{t('portal.iamPatientDesc')}</span>
          </span>
        </button>

        <button className="door" onClick={() => navigate('/personnel')}>
          <span className="door__ic"><IconConsultation width={26} height={26} /></span>
          <span className="door__txt">
            <span className="door__title">{t('portal.iamStaff')}</span>
            <span className="door__desc">{t('portal.iamStaffDesc')}</span>
          </span>
        </button>
      </div>
      <Footer />
    </div>
  );
}
