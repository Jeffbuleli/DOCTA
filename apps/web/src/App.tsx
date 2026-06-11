import { useState } from 'react';
import { SERVICES } from './services';

export function App() {
  const [active, setActive] = useState<string | null>(null);
  // Taux du jour (sera relie a l'API /api/currency/rate ensuite).
  const cdfPerUsd = 2800;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 6 8 12v9c0 9 7 15 16 19 9-4 16-10 16-19v-9L24 6Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M24 16v12M18 22h12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand-name">Docta</span>
        </div>

        <div className="currency" title="Taux du jour">
          <span className="cur cur-usd">1 USD</span>
          <span className="cur-eq">=</span>
          <span className="cur cur-cdf">{cdfPerUsd.toLocaleString('fr-FR')} CDF</span>
        </div>
      </header>

      <main className="home">
        <h1 className="home-title">Que voulez-vous faire&nbsp;?</h1>
        <p className="home-sub">Touchez un service</p>

        <div className="grid">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                className={`tile${isActive ? ' tile-active' : ''}`}
                style={{ ['--tile' as string]: s.color }}
                onClick={() => setActive(s.key)}
              >
                <span className="tile-icon">
                  <Icon />
                </span>
                <span className="tile-label">{s.label}</span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="statusbar">
        <span className="dot dot-on" /> Hors-ligne prêt · Synchronisation auto
      </footer>
    </div>
  );
}
