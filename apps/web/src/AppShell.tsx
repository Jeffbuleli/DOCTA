import { useState, type ReactNode } from 'react';
import { NAV, BOTTOM_NAV, type PageKey } from './nav';
import { useTheme } from './theme';
import { useI18n } from './i18n';
import { Footer } from './components/Footer';
import {
  IconMenu,
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconPlus,
  IconLogout,
} from './icons';

function initials(name?: string) {
  if (!name) return 'DR';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const Brand = ({ className }: { className: string }) => (
  <div className={className}>
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="12" fill="currentColor" opacity="0.12" />
      <path
        d="M24 9 11 14v8c0 8 6 13 13 16 7-3 13-8 13-16v-8L24 9Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M24 18v10M19 23h10"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
    <span className="brand-name">Docta</span>
  </div>
);

function NavList({
  page,
  go,
  onExit,
}: {
  page: PageKey;
  go: (p: PageKey) => void;
  onExit: () => void;
}) {
  const { t } = useI18n();
  return (
    <nav className="nav">
      {NAV.map((group) => (
        <div key={group.key}>
          <div className="nav__group">{t(`nav.group.${group.key}`)}</div>
          {group.items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                className={`nav__item${page === it.key ? ' active' : ''}`}
                onClick={() => go(it.key)}
              >
                <Icon width={20} height={20} />
                {t(`nav.${it.key}`)}
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <button className="nav__item" onClick={onExit}>
          <IconLogout width={20} height={20} />
          {t('nav.exitHospital')}
        </button>
      </div>
    </nav>
  );
}

export function AppShell({
  page,
  setPage,
  cdfPerUsd,
  userName,
  onExit,
  hospitalName,
  children,
}: {
  page: PageKey;
  setPage: (p: PageKey) => void;
  cdfPerUsd: number;
  userName?: string;
  hospitalName?: string;
  onExit: () => void;
  children: ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const { t, lang, setLang } = useI18n();
  const [drawer, setDrawer] = useState(false);

  const go = (p: PageKey) => {
    setPage(p);
    setDrawer(false);
  };

  return (
    <div className="shell">
      {/* Sidebar desktop */}
      <aside className="sidebar">
        <Brand className="sidebar__brand" />
        <NavList page={page} go={go} onExit={onExit} />
      </aside>

      {/* Drawer mobile */}
      {drawer && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawer(false)} />
          <aside className="drawer">
            <Brand className="sidebar__brand" />
            <NavList page={page} go={go} onExit={onExit} />
          </aside>
        </>
      )}

      <div>
        {/* Topbar */}
        <header className="topbar">
          <button
            className="iconbtn hamburger"
            aria-label={t('topbar.menu')}
            onClick={() => setDrawer(true)}
          >
            <IconMenu width={20} height={20} />
          </button>

          <Brand className="topbar__brand" />
          {hospitalName && <span className="hospital-chip">{hospitalName}</span>}

          <div className="topbar__spacer" />

          <div className="fx-pill" title={t('topbar.rate')}>
            <span className="usd">1 USD</span>
            <span className="eq">=</span>
            <span className="cdf">{cdfPerUsd.toLocaleString('fr-FR')} CDF</span>
          </div>

          <button
            className="iconbtn langbtn"
            aria-label={t('topbar.lang')}
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          >
            {lang.toUpperCase()}
          </button>
          <button className="iconbtn" aria-label={t('topbar.search')}>
            <IconSearch width={19} height={19} />
          </button>
          <button
            className="iconbtn"
            aria-label={t('topbar.theme')}
            onClick={toggle}
          >
            {theme === 'dark' ? (
              <IconSun width={19} height={19} />
            ) : (
              <IconMoon width={19} height={19} />
            )}
          </button>
          <button className="iconbtn" aria-label={t('topbar.notifications')}>
            <IconBell width={19} height={19} />
            <span className="badge-dot" />
          </button>
          <div className="avatar" title={userName ?? 'Utilisateur'}>
            {initials(userName)}
          </div>
        </header>

        <main className="shell__main">
          {children}
          <Footer />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="bottomnav">
        {BOTTOM_NAV.slice(0, 2).map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              className={`bottomnav__item${page === it.key ? ' active' : ''}`}
              onClick={() => go(it.key)}
            >
              <Icon width={22} height={22} />
              {it.key === 'dashboard' ? t('bottom.home') : t(`nav.${it.key}`)}
            </button>
          );
        })}
        <button
          className="bottomnav__fab"
          aria-label={t('common.new')}
          onClick={() => go('patients')}
        >
          <IconPlus width={24} height={24} />
        </button>
        {BOTTOM_NAV.slice(2).map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              className={`bottomnav__item${page === it.key ? ' active' : ''}`}
              onClick={() => go(it.key)}
            >
              <Icon width={22} height={22} />
              {t(`nav.${it.key}`)}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
