import {
  IconPatients,
  IconAgenda,
  IconBed,
  IconFinance,
  IconUrgences,
  IconConsultation,
  IconMaternite,
  IconPharmacie,
  IconLabo,
  IconImagerie,
  IconCaisse,
  IconBloc,
} from '../icons';
import type { ComponentType, SVGProps } from 'react';

type Ico = ComponentType<SVGProps<SVGSVGElement>>;

/* -- KPI -- */
function Kpi({
  icon: Icon,
  color,
  label,
  value,
  delta,
  up,
}: {
  icon: Ico;
  color: string;
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="kpi">
      <div className="kpi__top">
        <div
          className="kpi__icon"
          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          <Icon width={24} height={24} />
        </div>
        <span className={`kpi__delta ${up ? 'up' : 'down'}`}>
          {up ? '▲' : '▼'} {delta}
        </span>
      </div>
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
    </div>
  );
}

/* -- Donut (repartition des paiements) -- */
function Donut({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <g transform="rotate(-90 70 70)">
          {data.map((d) => {
            const len = (d.value / total) * C;
            const el = (
              <circle
                key={d.label}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth="20"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <text
          x="70"
          y="66"
          textAnchor="middle"
          fontSize="13"
          fill="var(--muted)"
        >
          Total
        </text>
        <text
          x="70"
          y="86"
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fill="var(--heading)"
        >
          {total}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {data.map((d) => (
          <div
            key={d.label}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: d.color,
              }}
            />
            <span style={{ flex: 1, fontSize: 13 }}>{d.label}</span>
            <strong style={{ color: 'var(--heading)', fontSize: 13 }}>
              {Math.round((d.value / total) * 100)}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

const APPTS = [
  { name: 'Joseph Kabongo', svc: 'Consultation · Dr. Mukendi', time: '09:30', st: 'success', stl: 'Confirmé' },
  { name: 'Marie Ilunga', svc: 'Maternité · CPN', time: '10:15', st: 'info', stl: 'En cours' },
  { name: 'David Tshibangu', svc: 'Laboratoire · Bilan', time: '11:00', st: 'warning', stl: 'En attente' },
  { name: 'Grace Mwamba', svc: 'Pédiatrie · Vaccin', time: '11:45', st: 'success', stl: 'Confirmé' },
];

const TX = [
  { who: 'Joseph Kabongo', via: 'M-Pesa', amount: '15 000 CDF', color: '#1e8e3e' },
  { who: 'Pharmacie · Vente', via: 'Espèces USD', amount: '12,00 USD', color: '#006400' },
  { who: 'Marie Ilunga', via: 'Orange Money', amount: '8 400 CDF', color: '#976644' },
  { who: 'Laboratoire · Bilan', via: 'Airtel Money', amount: '22 000 CDF', color: '#6f0002' },
];

const BEDS = [
  { svc: 'Médecine interne', used: 18, total: 24, color: '#006400' },
  { svc: 'Chirurgie', used: 11, total: 16, color: '#018000' },
  { svc: 'Maternité', used: 9, total: 12, color: '#976644' },
  { svc: 'Pédiatrie', used: 14, total: 20, color: '#738f12' },
];

const QUICK: { label: string; icon: Ico; color: string }[] = [
  { label: 'Urgences', icon: IconUrgences, color: '#6f0002' },
  { label: 'Consultation', icon: IconConsultation, color: '#018000' },
  { label: 'Maternité', icon: IconMaternite, color: '#bc8d65' },
  { label: 'Bloc', icon: IconBloc, color: '#683c1f' },
  { label: 'Pharmacie', icon: IconPharmacie, color: '#006400' },
  { label: 'Laboratoire', icon: IconLabo, color: '#738f12' },
  { label: 'Imagerie', icon: IconImagerie, color: '#889682' },
  { label: 'Caisse', icon: IconCaisse, color: '#9a7b0a' },
];

export function Dashboard({ cdfPerUsd }: { cdfPerUsd: number }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Bonjour, Dr. Administrateur</h1>
          <div className="sub">Clinique Démo · Kinshasa — voici l'activité du jour.</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid--kpi" style={{ marginBottom: 14 }}>
        <Kpi icon={IconPatients} color="#018000" label="Patients du jour" value="86" delta="12%" up />
        <Kpi icon={IconAgenda} color="#976644" label="Rendez-vous" value="34" delta="5%" up />
        <Kpi icon={IconBed} color="#738f12" label="Lits occupés" value="52 / 72" delta="3%" up />
        <Kpi icon={IconFinance} color="#9a7b0a" label="Recettes du jour" value="1 240 $" delta="2%" up={false} />
      </div>

      {/* Recettes + Rendez-vous */}
      <div className="grid grid--2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card__head">
            <h3>Rendez-vous du jour</h3>
            <span className="badge badge--info">{APPTS.length} aujourd'hui</span>
          </div>
          <div className="card__body">
            <div className="list">
              {APPTS.map((a) => (
                <div className="list__row" key={a.name}>
                  <div
                    className="ic-round"
                    style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
                  >
                    <IconConsultation width={20} height={20} />
                  </div>
                  <div className="list__main">
                    <div className="list__title">{a.name}</div>
                    <div className="list__sub">{a.svc}</div>
                  </div>
                  <div className="list__right">
                    <div className="amount">{a.time}</div>
                    <span className={`badge badge--${a.st}`}>{a.stl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>Paiements par moyen</h3>
            <span className="badge badge--muted">1 USD = {cdfPerUsd.toLocaleString('fr-FR')} CDF</span>
          </div>
          <div className="card__body">
            <Donut
              data={[
                { label: 'Espèces (CDF/USD)', value: 42, color: '#006400' },
                { label: 'M-Pesa', value: 28, color: '#32cd32' },
                { label: 'Orange Money', value: 18, color: '#976644' },
                { label: 'Airtel Money', value: 12, color: '#6f0002' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Lits + Transactions */}
      <div className="grid grid--2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card__head">
            <h3>Occupation des lits</h3>
            <span className="badge badge--warning">72% global</span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BEDS.map((b) => (
              <div key={b.svc}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: 'var(--heading)', fontWeight: 600 }}>{b.svc}</span>
                  <span style={{ color: 'var(--muted)' }}>
                    {b.used}/{b.total}
                  </span>
                </div>
                <div className="bar">
                  <span
                    style={{
                      width: `${(b.used / b.total) * 100}%`,
                      background: b.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>Transactions récentes</h3>
          </div>
          <div className="card__body">
            <div className="list">
              {TX.map((t) => (
                <div className="list__row" key={t.who + t.amount}>
                  <div
                    className="ic-round"
                    style={{ background: `color-mix(in srgb, ${t.color} 14%, transparent)`, color: t.color }}
                  >
                    <IconCaisse width={19} height={19} />
                  </div>
                  <div className="list__main">
                    <div className="list__title">{t.who}</div>
                    <div className="list__sub">{t.via}</div>
                  </div>
                  <div className="list__right">
                    <div className="amount">{t.amount}</div>
                    <span className="badge badge--success">Payé</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <div className="card__head">
          <h3>Accès rapide</h3>
        </div>
        <div className="card__body">
          <div className="quick">
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <button className="quick__tile" key={q.label}>
                  <span
                    className="quick__ic"
                    style={{ color: q.color, background: `color-mix(in srgb, ${q.color} 13%, transparent)` }}
                  >
                    <Icon width={24} height={24} />
                  </span>
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="helper">
        <span className="dot-on" /> Hors-ligne prêt · Synchronisation automatique
      </div>
    </>
  );
}
