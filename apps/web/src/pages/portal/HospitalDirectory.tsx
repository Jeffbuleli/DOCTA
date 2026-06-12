import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { api, type HospitalListing } from '../../api';
import { Footer } from '../../components/Footer';
import { IconSearch, IconHospitalBuilding, IconLogout } from '../../icons';

export function HospitalDirectory() {
  const { t, lang, setLang } = useI18n();
  const [q, setQ] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [list, setList] = useState<HospitalListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.public
      .hospitals({ lat: coords?.lat, lng: coords?.lng, q: q || undefined })
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const tm = setTimeout(load, 300);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, coords]);

  const locate = () => {
    setGeoError('');
    if (!navigator.geolocation) return setGeoError(t('dir.geoError'));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoError(t('dir.geoError'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const recommendedSlug =
    coords && list.find((h) => h.bedsAvailable > 0)?.slug;

  return (
    <div className="app">
      <header className="topbar">
        <button className="iconbtn" aria-label={t('pauth.back')} onClick={() => window.history.back()} style={{ transform: 'rotate(180deg)' }}>
          <IconLogout width={19} height={19} />
        </button>
        <div className="brand" style={{ color: 'var(--primary)' }}>
          <span className="brand-name">Docta</span>
        </div>
        <button className="iconbtn langbtn" aria-label={t('topbar.lang')} onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
          {lang.toUpperCase()}
        </button>
      </header>

      <main className="home" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <h1>{t('dir.title')}</h1>
            <div className="sub">{t('dir.subtitle')}</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search">
            <IconSearch width={18} height={18} />
            <input className="input" placeholder={t('dir.searchPh')} value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="none" />
          </div>
          <button className="btn btn--primary" onClick={locate} disabled={locating} title={t('dir.useLocation')}>
            {locating ? <span className="spinner" /> : <>◎ <span className="hide-xs">{t('dir.useLocation')}</span></>}
          </button>
        </div>
        {geoError && <div className="auth__error" style={{ marginBottom: 12 }}>{geoError}</div>}

        <div className="card">
          {loading ? (
            <div className="empty">{t('common.loading')}</div>
          ) : list.length === 0 ? (
            <div className="empty">
              <span className="ic"><IconHospitalBuilding width={30} height={30} /></span>
              <p style={{ margin: 0 }}>{t('dir.none')}</p>
            </div>
          ) : (
            list.map((h) => (
              <div className="hosp" key={h.slug}>
                <div className="hosp__top">
                  <span className="ic-round" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    <IconHospitalBuilding width={20} height={20} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hosp__name">
                      {h.name}
                      {recommendedSlug === h.slug && (
                        <span className="badge badge--success" style={{ marginLeft: 8 }}>★ {t('dir.recommended')}</span>
                      )}
                    </div>
                    <div className="pt-meta">
                      {h.city}{h.address ? ` · ${h.address}` : ''}
                      {h.distanceKm != null && <span> · {t('dir.km', { n: h.distanceKm })}</span>}
                    </div>
                  </div>
                </div>

                <div className="hosp__chips">
                  {h.bedsAvailable > 0 ? (
                    <span className="badge badge--success">{t('dir.bedsAvailable', { n: h.bedsAvailable })}</span>
                  ) : (
                    <span className="badge badge--danger">{t('dir.full')}</span>
                  )}
                  {h.services.slice(0, 4).map((s) => (
                    <span className="chip" key={s}>{s}</span>
                  ))}
                </div>

                {h.phone && (
                  <a className="btn" href={`tel:${h.phone}`} style={{ height: 38, marginTop: 10 }}>
                    {t('dir.call')} · {h.phone}
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
