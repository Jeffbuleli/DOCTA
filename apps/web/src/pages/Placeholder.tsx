import type { ComponentType, SVGProps } from 'react';
import { IconPlus } from '../icons';
import { useI18n } from '../i18n';

export function Placeholder({
  title,
  icon: Icon,
  desc,
}: {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  desc: string;
}) {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <div className="sub">{desc}</div>
        </div>
      </div>
      <div className="card">
        <div
          className="card__body"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: '48px 20px',
            textAlign: 'center',
          }}
        >
          <span
            className="quick__ic"
            style={{
              width: 72,
              height: 72,
              color: 'var(--primary)',
              background: 'var(--primary-soft)',
            }}
          >
            <Icon width={36} height={36} />
          </span>
          <h3 style={{ fontSize: 17 }}>{t('ph.building')}</h3>
          <p style={{ color: 'var(--muted)', maxWidth: 360, margin: 0 }}>
            {t('ph.body', { title })}
          </p>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            <IconPlus width={18} height={18} /> {t('ph.start')}
          </button>
        </div>
      </div>
    </>
  );
}
