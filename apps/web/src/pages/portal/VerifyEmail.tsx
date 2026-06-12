import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { api } from '../../api';
import { navigate, queryParam } from '../../router';
import { Footer } from '../../components/Footer';

export function VerifyEmail() {
  const { t } = useI18n();
  const [state, setState] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    const token = queryParam('token');
    if (!token) return setState('fail');
    api.account
      .verifyEmail(token)
      .then(() => setState('ok'))
      .catch(() => setState('fail'));
  }, []);

  return (
    <div className="auth">
      <div className="auth__card" style={{ textAlign: 'center' }}>
        <div className="auth__brand" style={{ justifyContent: 'center' }}>
          <span className="brand-name" style={{ color: 'var(--primary)' }}>Docta</span>
        </div>
        {state === 'checking' && <p style={{ color: 'var(--muted)' }}>{t('verify.checking')}</p>}
        {state === 'ok' && (
          <>
            <div className="empty" style={{ padding: 16 }}>
              <span className="ic" style={{ color: 'var(--success)', background: 'var(--success-soft)' }}>✓</span>
              <h3 style={{ fontSize: 17 }}>{t('verify.success')}</h3>
              <p style={{ margin: 0 }}>{t('verify.successDesc')}</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/patient')}>{t('verify.continue')}</button>
          </>
        )}
        {state === 'fail' && (
          <>
            <div className="auth__error">{t('verify.fail')}</div>
            <button className="btn-primary" onClick={() => navigate('/patient')}>{t('verify.continue')}</button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
