// Client API de Docta. En dev, les appels relatifs passent par le proxy Vite
// (/api -> http://localhost:3000). En prod, definir VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

const TOKEN_KEY = 'docta-token';
const ACCOUNT_TOKEN_KEY = 'docta-account-token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const accountTokenStore = {
  get: () => localStorage.getItem(ACCOUNT_TOKEN_KEY),
  set: (t: string) => localStorage.setItem(ACCOUNT_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(ACCOUNT_TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean; tokenKind?: 'staff' | 'account' } = {},
): Promise<T> {
  const { auth = true, tokenKind = 'staff', headers, ...rest } = options;
  const h = new Headers(headers);
  h.set('Content-Type', 'application/json');
  if (auth) {
    const store = tokenKind === 'account' ? accountTokenStore : tokenStore;
    const t = store.get();
    if (t) h.set('Authorization', `Bearer ${t}`);
  }

  const res = await fetch(`${BASE}/api${path}`, { ...rest, headers: h });

  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      msg = (Array.isArray(body?.message) ? body.message[0] : body?.message) || msg;
    } catch {
      /* corps non JSON */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/* ---- Types ---- */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantSlug?: string;
  fullName?: string;
}
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
export interface ExchangeRate {
  id: string;
  cdfPerUsd: string;
  date: string;
}

export type Sex = 'M' | 'F';
export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  sex: Sex | null;
  birthDate: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}
export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  sex?: Sex;
  birthDate?: string;
  phone?: string;
  address?: string;
}

export interface WardOccupancy {
  id: string;
  name: string;
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
}
export interface AvailableBed {
  id: string;
  label: string;
  roomName: string;
  wardId: string;
  wardName: string;
}
export interface Admission {
  id: string;
  status: string;
  reason: string | null;
  admittedAt: string;
  patient: Patient;
  ward: { id: string; name: string };
  bed: { id: string; label: string; room: { name: string } };
}

export interface DashboardStats {
  patientsTotal: number;
  patientsToday: number;
  bedsTotal: number;
  bedsOccupied: number;
  inpatients: number;
  revenueTodayCdf: number;
  revenueTodayUsd: number;
}

export type Currency = 'CDF' | 'USD';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type PayMethod =
  | 'CASH'
  | 'MPESA'
  | 'ORANGE'
  | 'AIRTEL'
  | 'CARD'
  | 'BANK'
  | 'INSURANCE';

export interface InvoiceItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: string;
  amount: string;
}
export interface PaymentRec {
  id: string;
  method: PayMethod;
  currency: Currency;
  amount: string;
  amountInvoice: string;
  reference: string | null;
  createdAt: string;
}
export interface Invoice {
  id: string;
  number: string;
  currency: Currency;
  total: string;
  paid: string;
  status: InvoiceStatus;
  createdAt: string;
  patient: Patient | null;
  items?: InvoiceItem[];
  payments?: PaymentRec[];
}
export interface NewInvoiceItem {
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface PublicAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
}
export interface AccountAuthResponse {
  accessToken: string;
  account: PublicAccount;
  devLink?: string;
}

export interface AdmissionSummary {
  ward: string;
  bed: string;
  reason: string | null;
  status: string;
  admittedAt: string;
  dischargedAt: string | null;
}
export interface RecordEntry {
  hospital: string;
  city: string | null;
  mrn: string;
  patient: {
    firstName: string;
    lastName: string;
    sex: Sex | null;
    birthDate: string | null;
    phone: string | null;
  };
  admissions: AdmissionSummary[];
}
export interface RecordSummary {
  account: { fullName: string; email: string } | null;
  records: RecordEntry[];
}
export interface ShareCode {
  code: string;
  expiresAt: string;
}

export interface HospitalListing {
  slug: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  bedsTotal: number;
  bedsAvailable: number;
  services: string[];
  distanceKm: number | null;
}

/* ---- Endpoints ---- */
export const api = {
  login: (tenantSlug: string, email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ tenantSlug, email, password }),
    }),

  register: (data: {
    tenantName: string;
    fullName: string;
    email: string;
    password: string;
    city?: string;
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>('/auth/me'),

  currencyRate: () => request<ExchangeRate>('/currency/rate'),

  patients: {
    list: (search?: string) =>
      request<Patient[]>(
        `/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      ),
    get: (id: string) => request<Patient>(`/patients/${id}`),
    create: (data: CreatePatientInput) =>
      request<Patient>('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  hospital: {
    wards: () => request<WardOccupancy[]>('/hospital/wards'),
    beds: (wardId?: string) =>
      request<AvailableBed[]>(
        `/hospital/beds${wardId ? `?wardId=${wardId}` : ''}`,
      ),
    admissions: () => request<Admission[]>('/hospital/admissions'),
    setupDemo: () =>
      request<{ created: boolean }>('/hospital/setup-demo', { method: 'POST' }),
    admit: (patientId: string, bedId: string, reason?: string) =>
      request<Admission>('/hospital/admissions', {
        method: 'POST',
        body: JSON.stringify({ patientId, bedId, reason }),
      }),
    transfer: (admissionId: string, bedId: string) =>
      request<Admission>(`/hospital/admissions/${admissionId}/transfer`, {
        method: 'PATCH',
        body: JSON.stringify({ bedId }),
      }),
    discharge: (admissionId: string) =>
      request<unknown>(`/hospital/admissions/${admissionId}/discharge`, {
        method: 'PATCH',
      }),
  },

  stats: {
    dashboard: () => request<DashboardStats>('/stats/dashboard'),
  },

  invoices: {
    list: (status?: InvoiceStatus, search?: string) => {
      const p = new URLSearchParams();
      if (status) p.set('status', status);
      if (search) p.set('search', search);
      const qs = p.toString();
      return request<Invoice[]>(`/invoices${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<Invoice>(`/invoices/${id}`),
    create: (data: {
      patientId?: string;
      currency: Currency;
      items: NewInvoiceItem[];
    }) =>
      request<Invoice>('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    pay: (
      id: string,
      data: {
        method: PayMethod;
        currency: Currency;
        amount: number;
        reference?: string;
      },
    ) =>
      request<Invoice>(`/invoices/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  account: {
    register: (data: {
      fullName: string;
      email: string;
      password: string;
      phone?: string;
    }) =>
      request<AccountAuthResponse>('/account/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(data),
      }),
    login: (email: string, password: string) =>
      request<AccountAuthResponse>('/account/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<PublicAccount>('/account/me', { tokenKind: 'account' }),
    verifyEmail: (token: string) =>
      request<{ verified: boolean }>('/account/verify-email', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ token }),
      }),
    requestReset: (email: string) =>
      request<{ sent: boolean }>('/account/request-reset', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string) =>
      request<{ reset: boolean }>('/account/reset-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ token, password }),
      }),
    resendVerification: () =>
      request<{ sent: boolean; alreadyVerified?: boolean }>(
        '/account/resend-verification',
        { method: 'POST', tokenKind: 'account' },
      ),
  },

  records: {
    // cote patient (compte)
    list: () => request<RecordSummary>('/account/records', { tokenKind: 'account' }),
    link: (code: string) =>
      request<{ linked: boolean }>('/account/records/link', {
        method: 'POST',
        tokenKind: 'account',
        body: JSON.stringify({ code }),
      }),
    share: () =>
      request<ShareCode>('/account/records/share', {
        method: 'POST',
        tokenKind: 'account',
      }),
    // cote personnel
    linkCode: (patientId: string) =>
      request<ShareCode>('/records/link-code', {
        method: 'POST',
        body: JSON.stringify({ patientId }),
      }),
    redeem: (code: string) =>
      request<RecordSummary>('/records/redeem', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  },

  public: {
    hospitals: (params?: { lat?: number; lng?: number; q?: string }) => {
      const p = new URLSearchParams();
      if (params?.lat != null) p.set('lat', String(params.lat));
      if (params?.lng != null) p.set('lng', String(params.lng));
      if (params?.q) p.set('q', params.q);
      const qs = p.toString();
      return request<HospitalListing[]>(`/public/hospitals${qs ? `?${qs}` : ''}`, {
        auth: false,
      });
    },
  },
};
