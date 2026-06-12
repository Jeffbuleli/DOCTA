import { useEffect, useState, type FormEvent } from 'react';
import {
  api,
  ApiError,
  type Currency,
  type Invoice,
  type InvoiceStatus,
  type PayMethod,
  type Patient,
  type NewInvoiceItem,
} from '../api';
import { IconSearch, IconPlus, IconCaisse } from '../icons';
import { useI18n } from '../i18n';

const METHODS: PayMethod[] = [
  'CASH', 'MPESA', 'ORANGE', 'AIRTEL', 'CARD', 'BANK', 'INSURANCE',
];

export function money(amount: string | number, currency: Currency): string {
  const n = Number(amount);
  if (currency === 'USD') {
    return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  }
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FC`;
}

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  UNPAID: 'danger',
  PARTIAL: 'warning',
  PAID: 'success',
  CANCELLED: 'muted',
};

export function Caisse() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = (q: string) => {
    setLoading(true);
    api.invoices
      .list(undefined, q)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    const tm = setTimeout(() => load(search), 300);
    return () => clearTimeout(tm);
  }, [search]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.caisse')}</h1>
          <div className="sub">{t('caisse.subtitle')}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <IconSearch width={18} height={18} />
          <input
            className="input"
            placeholder={t('caisse.searchPh')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoCapitalize="none"
          />
        </div>
        <button className="btn btn--primary" onClick={() => setShowNew(true)}>
          <IconPlus width={18} height={18} />
          <span className="hide-xs">{t('caisse.new')}</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">{t('common.loading')}</div>
        ) : list.length === 0 ? (
          <div className="empty">
            <span className="ic"><IconCaisse width={30} height={30} /></span>
            <h3 style={{ fontSize: 16 }}>{t('caisse.none')}</h3>
            <p style={{ margin: 0, maxWidth: 280 }}>{t('caisse.noneHint')}</p>
          </div>
        ) : (
          list.map((inv) => (
            <button key={inv.id} className="pt-row" onClick={() => setDetailId(inv.id)}>
              <span className="ic-round" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <IconCaisse width={19} height={19} />
              </span>
              <span className="pt-main">
                <span className="pt-name">
                  <span className="mrn">{inv.number}</span>{' '}
                  {inv.patient ? `${inv.patient.lastName} ${inv.patient.firstName}` : t('caisse.noPatient')}
                </span>
                <span className="pt-meta">
                  {money(inv.total, inv.currency)} · {t('caisse.paid')} {money(inv.paid, inv.currency)}
                </span>
              </span>
              <span className={`badge badge--${STATUS_BADGE[inv.status]}`}>
                {t(`status.${inv.status}`)}
              </span>
            </button>
          ))
        )}
      </div>

      {showNew && (
        <NewInvoiceModal
          onClose={() => setShowNew(false)}
          onCreated={(inv) => {
            setShowNew(false);
            load('');
            setDetailId(inv.id);
          }}
        />
      )}

      {detailId && (
        <InvoiceDetail
          id={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => load(search)}
        />
      )}
    </>
  );
}

/* ---- Nouvelle facture ---- */
function NewInvoiceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (inv: Invoice) => void;
}) {
  const { t } = useI18n();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [currency, setCurrency] = useState<Currency>('CDF');
  const [items, setItems] = useState<NewInvoiceItem[]>([
    { label: '', quantity: 1, unitPrice: 0 },
  ]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (patient) return;
    const tm = setTimeout(() => {
      if (search.trim().length < 1) return setResults([]);
      api.patients.list(search).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(tm);
  }, [search, patient]);

  const setItem = (i: number, patch: Partial<NewInvoiceItem>) =>
    setItems((arr) => arr.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = items.filter((it) => it.label.trim() && it.unitPrice > 0);
    if (clean.length === 0) {
      setError(t('caisse.createError'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const inv = await api.invoices.create({
        patientId: patient?.id,
        currency,
        items: clean,
      });
      onCreated(inv);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('caisse.createError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal__head">
          <h3>{t('caisse.newInvoice')}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        <div className="modal__body">
          {error && <div className="auth__error">{error}</div>}

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>{t('caisse.patient')}</label>
              {patient ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mrn">{patient.mrn}</span>
                  <span style={{ flex: 1 }}>{patient.lastName} {patient.firstName}</span>
                  <button type="button" className="btn btn--ghost" onClick={() => setPatient(null)}>
                    {t('common.change')}
                  </button>
                </div>
              ) : (
                <input
                  className="input"
                  placeholder={t('admit.searchPatient')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoCapitalize="none"
                />
              )}
              {!patient && results.length > 0 && (
                <div className="card" style={{ marginTop: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {results.map((p) => (
                    <button key={p.id} type="button" className="pt-row" onClick={() => { setPatient(p); setResults([]); setSearch(''); }}>
                      <span className="pt-main">
                        <span className="pt-name">{p.lastName} {p.firstName}</span>
                        <span className="pt-meta"><span className="mrn">{p.mrn}</span></span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>{t('caisse.currency')}</label>
              <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                <option value="CDF">CDF (FC)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading)' }}>{t('caisse.items')}</label>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder={t('caisse.itemLabel')}
                value={it.label}
                onChange={(e) => setItem(i, { label: e.target.value })}
              />
              <input
                className="input"
                style={{ width: 56 }}
                type="number"
                min={1}
                value={it.quantity}
                onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                aria-label={t('caisse.qty')}
              />
              <input
                className="input"
                style={{ width: 96 }}
                type="number"
                min={0}
                step="0.01"
                placeholder={t('caisse.unitPrice')}
                value={it.unitPrice || ''}
                onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
              />
              {items.length > 1 && (
                <button type="button" className="iconbtn" aria-label={t('caisse.remove')} onClick={() => setItems((a) => a.filter((_, j) => j !== i))}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn--ghost" onClick={() => setItems((a) => [...a, { label: '', quantity: 1, unitPrice: 0 }])}>
            <IconPlus width={16} height={16} /> {t('caisse.addItem')}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>{t('caisse.total')}</span>
            <strong style={{ fontSize: 18, color: 'var(--heading)' }}>{money(total, currency)}</strong>
          </div>

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? <span className="spinner" /> : t('caisse.create')}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---- Detail facture + encaissement ---- */
function InvoiceDetail({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useI18n();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [method, setMethod] = useState<PayMethod>('CASH');
  const [payCurrency, setPayCurrency] = useState<Currency>('CDF');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () =>
    api.invoices.get(id).then((i) => {
      setInv(i);
      setPayCurrency(i.currency);
    });
  useEffect(() => { reload(); }, [id]);

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.invoices.pay(id, {
        method,
        currency: payCurrency,
        amount: n,
        reference: reference || undefined,
      });
      setInv(updated);
      setAmount('');
      setReference('');
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('caisse.payError'));
    } finally {
      setBusy(false);
    }
  };

  const balance = inv ? Number(inv.total) - Number(inv.paid) : 0;
  const settled = inv ? inv.status === 'PAID' || inv.status === 'CANCELLED' : false;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{t('caisse.invoice')} {inv?.number ?? ''}</h3>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="×">✕</button>
        </div>
        {!inv ? (
          <div className="empty">{t('common.loading')}</div>
        ) : (
          <div className="modal__body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--muted)' }}>
                {inv.patient ? `${inv.patient.lastName} ${inv.patient.firstName}` : t('caisse.noPatient')}
              </span>
              <span className={`badge badge--${STATUS_BADGE[inv.status]}`}>{t(`status.${inv.status}`)}</span>
            </div>

            <div className="list">
              {inv.items?.map((it) => (
                <div className="list__row" key={it.id}>
                  <span className="list__main">
                    <span className="list__title">{it.label}</span>
                    <span className="list__sub">{it.quantity} × {money(it.unitPrice, inv.currency)}</span>
                  </span>
                  <span className="amount">{money(it.amount, inv.currency)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--muted)' }}>{t('caisse.total')}</span>
              <strong>{money(inv.total, inv.currency)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>{t('caisse.paid')}</span>
              <span>{money(inv.paid, inv.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 6 }}>
              <strong>{t('caisse.balance')}</strong>
              <strong style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>{money(balance, inv.currency)}</strong>
            </div>

            {inv.payments && inv.payments.length > 0 && (
              <>
                <div className="nav__group" style={{ margin: '14px 0 4px' }}>{t('caisse.payments')}</div>
                <div className="list">
                  {inv.payments.map((p) => (
                    <div className="list__row" key={p.id}>
                      <span className="list__main">
                        <span className="list__title">{t(`pay.${p.method}`)}</span>
                        {p.reference && <span className="list__sub">{p.reference}</span>}
                      </span>
                      <span className="amount">{money(p.amount, p.currency)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {settled ? (
              <div className="badge badge--success" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 12 }}>
                {t('caisse.fullyPaid')}
              </div>
            ) : (
              <form onSubmit={pay} style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                {error && <div className="auth__error">{error}</div>}
                <div className="form-grid">
                  <div className="field" style={{ margin: 0 }}>
                    <label>{t('caisse.method')}</label>
                    <select className="select" value={method} onChange={(e) => setMethod(e.target.value as PayMethod)}>
                      {METHODS.map((m) => <option key={m} value={m}>{t(`pay.${m}`)}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>{t('caisse.currency')}</label>
                    <select className="select" value={payCurrency} onChange={(e) => setPayCurrency(e.target.value as Currency)}>
                      <option value="CDF">CDF (FC)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div className="field col-2" style={{ margin: 0 }}>
                    <label>{t('caisse.amount')}</label>
                    <input className="input" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                  </div>
                  <div className="field col-2" style={{ margin: 0 }}>
                    <label>{t('caisse.reference')}</label>
                    <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TX-..." />
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={busy} style={{ marginTop: 14 }}>
                  {busy ? <span className="spinner" /> : t('caisse.pay')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
