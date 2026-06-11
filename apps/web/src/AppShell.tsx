import { useState, type ReactNode } from 'react';
import { NAV, BOTTOM_NAV, type PageKey } from './nav';
import { useTheme } from './theme';
import {
  IconMenu,
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconPlus,
} from './icons';

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
}: {
  page: PageKey;
  go: (p: PageKey) => void;
}) {
  return (
    <nav className="nav">
      {NAV.map((group) => (
        <div key={group.title}>
          <div className="nav__group">{group.title}</div>
          {group.items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                className={`nav__item${page === it.key ? ' active' : ''}`}
                onClick={() => go(it.key)}
              >
                <Icon width={20} height={20} />
                {it.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppShell({
  page,
  setPage,
  cdfPerUsd,
  children,
}: {
  page: PageKey;
  setPage: (p: PageKey) => void;
  cdfPerUsd: number;
  children: ReactNode;
}) {
  const { theme, toggle } = useTheme();
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
        <NavList page={page} go={go} />
      </aside>

      {/* Drawer mobile */}
      {drawer && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawer(false)} />
          <aside className="drawer">
            <Brand className="sidebar__brand" />
            <NavList page={page} go={go} />
          </aside>
        </>
      )}

      <div>
        {/* Topbar */}
        <header className="topbar">
          <button
            className="iconbtn hamburger"
            aria-label="Menu"
            onClick={() => setDrawer(true)}
          >
            <IconMenu width={20} height={20} />
          </button>

          <Brand className="topbar__brand" />

          <div className="topbar__spacer" />

          <div className="fx-pill" title="Taux du jour">
            <span className="usd">1 USD</span>
            <span className="eq">=</span>
            <span className="cdf">{cdfPerUsd.toLocaleString('fr-FR')} CDF</span>
          </div>

          <button className="iconbtn" aria-label="Rechercher">
            <IconSearch width={19} height={19} />
          </button>
          <button
            className="iconbtn"
            aria-label="Changer de theme"
            onClick={toggle}
          >
            {theme === 'dark' ? (
              <IconSun width={19} height={19} />
            ) : (
              <IconMoon width={19} height={19} />
            )}
          </button>
          <button className="iconbtn" aria-label="Notifications">
            <IconBell width={19} height={19} />
            <span className="badge-dot" />
          </button>
          <div className="avatar" title="Administrateur Demo">
            AD
          </div>
        </header>

        <main className="shell__main">{children}</main>
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
              {it.label}
            </button>
          );
        })}
        <button
          className="bottomnav__fab"
          aria-label="Nouvelle action"
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
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
