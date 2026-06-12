import {
  IconPatients,
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
import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { useI18n } from '../i18n';
import { api, type DashboardStats, type WardOccupancy } from '../api';
import { money } from './Caisse';

type Ico = ComponentType<SVGProps<SVGSVGElement>>;

/* -- KPI -- */
function Kpi({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: Ico;
  color: string;
  label: string;
  value: string;
  sub?: string;
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
        {sub && <span className="kpi__delta up">{sub}</span>}
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
  const { t } = useI18n();
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
          {t('dash.total')}
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
  { name: 'Joseph Kabongo', svc: 'Consultation · Dr. Mukendi', time: '09:30', st: 'success', stKey: 'confirmed' },
  { name: 'Marie Ilunga', svc: 'Maternité · CPN', time: '10:15', st: 'info', stKey: 'inprogress' },
  { name: 'David Tshibangu', svc: 'Laboratoire · Bilan', time: '11:00', st: 'warning', stKey: 'waiting' },
  { name: 'Grace Mwamba', svc: 'Pédiatrie · Vaccin', time: '11:45', st: 'success', stKey: 'confirmed' },
];

const TX = [
  { who: 'Joseph Kabongo', via: 'M-Pesa', amount: '15 000 CDF', color: '#1e8e3e' },
  { who: 'Pharmacie · Vente', via: 'Espèces USD', amount: '12,00 USD', color: '#006400' },
  { who: 'Marie Ilunga', via: 'Orange Money', amount: '8 400 CDF', color: '#976644' },
  { who: 'Laboratoire · Bilan', via: 'Airtel Money', amount: '22 000 CDF', color: '#6f0002' },
];

const BED_COLORS = ['#006400', '#018000', '#976644', '#738f12', '#889682', '#683c1f'];

const QUICK: { key: string; icon: Ico; color: string }[] = [
  { key: 'urgences', icon: IconUrgences, color: '#6f0002' },
  { key: 'consultation', icon: IconConsultation, color: '#018000' },
  { key: 'maternite', icon: IconMaternite, color: '#bc8d65' },
  { key: 'bloc', icon: IconBloc, color: '#683c1f' },
  { key: 'pharmacie', icon: IconPharmacie, color: '#006400' },
  { key: 'labo', icon: IconLabo, color: '#738f12' },
  { key: 'imagerie', icon: IconImagerie, color: '#889682' },
  { key: 'caisse', icon: IconCaisse, color: '#9a7b0a' },
];

export function Dashboard({
  cdfPerUsd,
  userName,
}: {
  cdfPerUsd: number;
  userName?: string;
}) {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wards, setWards] = useState<WardOccupancy[]>([]);

  useEffect(() => {
    api.stats.dashboard().then(setStats).catch(() => {});
    api.hospital.wards().then(setWards).catch(() => {});
  }, []);

  const revenueValue = stats
    ? [
        stats.revenueTodayUsd ? money(stats.revenueTodayUsd, 'USD') : null,
        stats.revenueTodayCdf ? money(stats.revenueTodayCdf, 'CDF') : null,
      ]
        .filter(Boolean)
        .join(' + ') || money(0, 'CDF')
    : '—';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('dash.greeting', { name: userName ?? 'Dr.' })}</h1>
          <div className="sub">{t('dash.subtitle')}</div>
        </div>
      </div>

      {/* KPIs (donnees reelles) */}
      <div className="grid grid--kpi" style={{ marginBottom: 14 }}>
        <Kpi
          icon={IconPatients}
          color="#018000"
          label={t('dash.kpi.patients')}
          value={stats ? String(stats.patientsToday) : '—'}
          sub={stats ? `${stats.patientsTotal}` : undefined}
        />
        <Kpi
          icon={IconBed}
          color="#976644"
          label={t('dash.kpi.inpatients')}
          value={stats ? String(stats.inpatients) : '—'}
        />
        <Kpi
          icon={IconBed}
          color="#738f12"
          label={t('dash.kpi.beds')}
          value={stats ? `${stats.bedsOccupied} / ${stats.bedsTotal}` : '—'}
        />
        <Kpi
          icon={IconFinance}
          color="#9a7b0a"
          label={t('dash.kpi.revenue')}
          value={revenueValue}
        />
      </div>

      {/* Recettes + Rendez-vous */}
      <div className="grid grid--2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card__head">
            <h3>{t('dash.appts')}</h3>
            <span className="badge badge--info">{t('dash.apptsCount', { n: APPTS.length })}</span>
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
                    <span className={`badge badge--${a.st}`}>{t(`status.${a.stKey}`)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>{t('dash.payments')}</h3>
            <span className="badge badge--muted">1 USD = {cdfPerUsd.toLocaleString('fr-FR')} CDF</span>
          </div>
          <div className="card__body">
            <Donut
              data={[
                { label: t('dash.cash'), value: 42, color: '#006400' },
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
            <h3>{t('dash.occupancy')}</h3>
            <span className="badge badge--warning">
              {t('dash.occupancyGlobal', {
                n: stats && stats.bedsTotal ? Math.round((stats.bedsOccupied / stats.bedsTotal) * 100) : 0,
              })}
            </span>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {wards.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>{t('common.loading')}</div>
            ) : (
              wards.map((w, i) => (
                <div key={w.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--heading)', fontWeight: 600 }}>{w.name}</span>
                    <span style={{ color: 'var(--muted)' }}>
                      {w.occupied}/{w.total}
                    </span>
                  </div>
                  <div className="bar">
                    <span
                      style={{
                        width: `${w.total ? (w.occupied / w.total) * 100 : 0}%`,
                        background: BED_COLORS[i % BED_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>{t('dash.tx')}</h3>
          </div>
          <div className="card__body">
            <div className="list">
              {TX.map((tx) => (
                <div className="list__row" key={tx.who + tx.amount}>
                  <div
                    className="ic-round"
                    style={{ background: `color-mix(in srgb, ${tx.color} 14%, transparent)`, color: tx.color }}
                  >
                    <IconCaisse width={19} height={19} />
                  </div>
                  <div className="list__main">
                    <div className="list__title">{tx.who}</div>
                    <div className="list__sub">{tx.via}</div>
                  </div>
                  <div className="list__right">
                    <div className="amount">{tx.amount}</div>
                    <span className="badge badge--success">{t('dash.paid')}</span>
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
          <h3>{t('dash.quick')}</h3>
        </div>
        <div className="card__body">
          <div className="quick">
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <button className="quick__tile" key={q.key}>
                  <span
                    className="quick__ic"
                    style={{ color: q.color, background: `color-mix(in srgb, ${q.color} 13%, transparent)` }}
                  >
                    <Icon width={24} height={24} />
                  </span>
                  {t(`svc.${q.key}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="helper">
        <span className="dot-on" /> {t('dash.offline')}
      </div>
    </>
  );
}
