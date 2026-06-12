import { useState } from 'react';
import { useI18n } from '../../i18n';
import { useAccount } from '../../account';
import { api } from '../../api';
import { navigate } from '../../router';
import { Footer } from '../../components/Footer';
import {
  IconHospit,
  IconAgenda,
  IconPatients,
  IconConsultation,
  IconLogout,
} from '../../icons';

const TILES = [
  { key: 'findHospital', icon: IconHospit, color: '#018000' },
  { key: 'appointments', icon: IconAgenda, color: '#976644' },
  { key: 'myRecord', icon: IconPatients, color: '#738f12' },
  { key: 'teleconsult', icon: IconConsultation, color: '#0891b2' },
] as const;

export function PatientHome() {
  const { t, lang, setLang } = useI18n();
  const { account, logout, refresh } = useAccount();
  const [resent, setResent] = useState('');
  const [devLink, setDevLink] = useState<string | null>(null);

  if (!account) return null;
  const firstName = account.fullName.split(' ')[0];

  const resend = async () => {
    const r = await api.account.resendVerification();
    if (r.alreadyVerified) return refresh();
    setResent(t('phome.resent'));
    setDevLink((r as { devLink?: string }).devLink ?? null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" style={{ color: 'var(--primary)' }}>
          <span className="brand-name">Docta</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="iconbtn langbtn" aria-label={t('topbar.lang')} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
            {lang.toUpperCase()}
          </button>
          <button className="iconbtn" aria-label={t('phome.logout')} onClick={logout}>
            <IconLogout width={19} height={19} />
          </button>
        </div>
      </header>

      <main className="home" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <h1>{t('phome.greeting', { name: firstName })}</h1>
          </div>
        </div>

        {!account.emailVerified ? (
          <div className="card" style={{ padding: 16, marginBottom: 16, borderColor: 'var(--warning)' }}>
            <div style={{ fontWeight: 600, color: 'var(--heading)', marginBottom: 6 }}>
              {t('phome.verifyBanner')}
            </div>
            {resent && <div style={{ color: 'var(--success)', fontSize: 13, marginBottom: 6 }}>{resent}</div>}
            {devLink ? (
              <a className="linklike" href={devLink} style={{ fontSize: 12, wordBreak: 'break-all' }}>
                {t('pauth.devNote')} {devLink}
              </a>
            ) : (
              <button className="btn btn--primary" style={{ height: 38 }} onClick={resend}>
                {t('phome.resend')}
              </button>
            )}
          </div>
        ) : (
          <div className="badge badge--success" style={{ marginBottom: 16, padding: '8px 12px' }}>
            ✓ {t('phome.verified')}
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const active = tile.key === 'findHospital';
            return (
              <button
                key={tile.key}
                className="tile"
                style={{ ['--tile' as string]: tile.color }}
                onClick={() => active && navigate('/hopitaux')}
                disabled={!active}
              >
                <span className="tile-icon"><Icon width={28} height={28} /></span>
                <span className="tile-label">{t(`phome.${tile.key}`)}</span>
                {!active && <span className="badge badge--muted" style={{ fontSize: 11 }}>{t('phome.soon')}</span>}
              </button>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
