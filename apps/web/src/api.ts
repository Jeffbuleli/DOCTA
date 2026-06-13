// Client API de Docta. En dev, les appels relatifs passent par le proxy Vite
// (/api -> http://localhost:3000). En prod, definir VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

const ACCOUNT_TOKEN_KEY = 'docta-account-token';
const ACTIVE_TENANT_KEY = 'docta-active-tenant';

// Token unique de la personne (identite globale).
export const accountTokenStore = {
  get: () => localStorage.getItem(ACCOUNT_TOKEN_KEY),
  set: (t: string) => localStorage.setItem(ACCOUNT_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(ACCOUNT_TOKEN_KEY),
};

// Hopital actif (contexte "personnel") — envoye en en-tete X-Tenant.
export const activeTenantStore = {
  get: () => localStorage.getItem(ACTIVE_TENANT_KEY),
  set: (id: string) => localStorage.setItem(ACTIVE_TENANT_KEY, id),
  clear: () => localStorage.removeItem(ACTIVE_TENANT_KEY),
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
  options: RequestInit & { auth?: boolean; tenant?: boolean } = {},
): Promise<T> {
  const { auth = true, tenant = false, headers, ...rest } = options;
  const h = new Headers(headers);
  h.set('Content-Type', 'application/json');
  if (auth) {
    const t = accountTokenStore.get();
    if (t) h.set('Authorization', `Bearer ${t}`);
  }
  // Appels "personnel" : preciser l'hopital actif.
  if (tenant) {
    const tid = activeTenantStore.get();
    if (tid) h.set('X-Tenant', tid);
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

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'ENDED';
export interface Membership {
  id: string;
  tenantId: string;
  role: string;
  title: string | null;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  tenant: { id: string; name: string; slug: string; city: string | null };
}
export interface HospitalCreated {
  id: string;
  name: string;
  slug: string;
  city: string | null;
}
export interface MemberRow {
  id: string;
  role: string;
  title: string | null;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  invitedEmail: string | null;
  account: { id: string; fullName: string; email: string; headline: string | null } | null;
}
export interface PublicProfile {
  account: { id: string; fullName: string; headline: string | null; bio: string | null };
  experience: {
    hospital: string;
    city: string | null;
    role: string;
    title: string | null;
    status: MembershipStatus;
    startDate: string | null;
    endDate: string | null;
  }[];
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

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export interface Doctor {
  accountId: string;
  fullName: string;
  title: string | null;
}
export interface PatientAppointment {
  id: string;
  reason: string | null;
  scheduledAt: string;
  online: boolean;
  status: AppointmentStatus;
  tenant: { id: string; name: string; city: string | null };
  doctor: { id: string; fullName: string } | null;
}
export interface StaffAppointment {
  id: string;
  reason: string | null;
  scheduledAt: string;
  online: boolean;
  status: AppointmentStatus;
  account: { id: string; fullName: string; phone: string | null };
  doctor: { id: string; fullName: string } | null;
}

export interface HospitalListing {
  id: string;
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
  currencyRate: () => request<ExchangeRate>('/currency/rate', { tenant: true }),

  patients: {
    list: (search?: string) =>
      request<Patient[]>(
        `/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`,
        { tenant: true },
      ),
    get: (id: string) => request<Patient>(`/patients/${id}`, { tenant: true }),
    create: (data: CreatePatientInput) =>
      request<Patient>('/patients', {
        method: 'POST',
        tenant: true,
        body: JSON.stringify(data),
      }),
  },

  hospital: {
    wards: () => request<WardOccupancy[]>('/hospital/wards', { tenant: true }),
    beds: (wardId?: string) =>
      request<AvailableBed[]>(
        `/hospital/beds${wardId ? `?wardId=${wardId}` : ''}`,
        { tenant: true },
      ),
    admissions: () => request<Admission[]>('/hospital/admissions', { tenant: true }),
    setupDemo: () =>
      request<{ created: boolean }>('/hospital/setup-demo', { method: 'POST', tenant: true }),
    admit: (patientId: string, bedId: string, reason?: string) =>
      request<Admission>('/hospital/admissions', {
        method: 'POST',
        tenant: true,
        body: JSON.stringify({ patientId, bedId, reason }),
      }),
    transfer: (admissionId: string, bedId: string) =>
      request<Admission>(`/hospital/admissions/${admissionId}/transfer`, {
        method: 'PATCH',
        tenant: true,
        body: JSON.stringify({ bedId }),
      }),
    discharge: (admissionId: string) =>
      request<unknown>(`/hospital/admissions/${admissionId}/discharge`, {
        method: 'PATCH',
        tenant: true,
      }),
  },

  stats: {
    dashboard: () => request<DashboardStats>('/stats/dashboard', { tenant: true }),
  },

  invoices: {
    list: (status?: InvoiceStatus, search?: string) => {
      const p = new URLSearchParams();
      if (status) p.set('status', status);
      if (search) p.set('search', search);
      const qs = p.toString();
      return request<Invoice[]>(`/invoices${qs ? `?${qs}` : ''}`, { tenant: true });
    },
    get: (id: string) => request<Invoice>(`/invoices/${id}`, { tenant: true }),
    create: (data: {
      patientId?: string;
      currency: Currency;
      items: NewInvoiceItem[];
    }) =>
      request<Invoice>('/invoices', {
        method: 'POST',
        tenant: true,
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
        tenant: true,
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
    me: () => request<PublicAccount>('/account/me'),
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
        { method: 'POST' },
      ),
  },

  me: {
    memberships: () => request<Membership[]>('/me/memberships'),
    createHospital: (data: {
      name: string;
      city?: string;
      address?: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
    }) =>
      request<HospitalCreated>('/me/hospitals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    accept: (id: string) =>
      request<Membership>(`/me/memberships/${id}/accept`, { method: 'POST' }),
    decline: (id: string) =>
      request<{ declined: boolean }>(`/me/memberships/${id}/decline`, { method: 'POST' }),
    end: (id: string) =>
      request<Membership>(`/me/memberships/${id}/end`, { method: 'POST' }),
    invite: (tenantId: string, data: { email: string; role: string; title?: string }) =>
      request<MemberRow>(`/me/hospitals/${tenantId}/invite`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    members: (tenantId: string) =>
      request<MemberRow[]>(`/me/hospitals/${tenantId}/members`),
    updateProfile: (data: { headline?: string; bio?: string }) =>
      request<unknown>('/me/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    profile: (accountId: string) =>
      request<PublicProfile>(`/public/profile/${accountId}`, { auth: false }),
    appointments: () => request<PatientAppointment[]>('/me/appointments'),
    bookAppointment: (data: {
      tenantId: string;
      doctorAccountId?: string;
      reason?: string;
      scheduledAt: string;
      online?: boolean;
    }) =>
      request<PatientAppointment>('/me/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cancelAppointment: (id: string) =>
      request<PatientAppointment>(`/me/appointments/${id}/cancel`, { method: 'PATCH' }),
  },

  appointments: {
    list: () => request<StaffAppointment[]>('/appointments', { tenant: true }),
    setStatus: (id: string, status: AppointmentStatus) =>
      request<StaffAppointment>(`/appointments/${id}/status`, {
        method: 'PATCH',
        tenant: true,
        body: JSON.stringify({ status }),
      }),
  },

  records: {
    // cote patient (compte)
    list: () => request<RecordSummary>('/account/records'),
    link: (code: string) =>
      request<{ linked: boolean }>('/account/records/link', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    share: () =>
      request<ShareCode>('/account/records/share', {
        method: 'POST',
      }),
    // cote personnel
    linkCode: (patientId: string) =>
      request<ShareCode>('/records/link-code', {
        method: 'POST',
        tenant: true,
        body: JSON.stringify({ patientId }),
      }),
    redeem: (code: string) =>
      request<RecordSummary>('/records/redeem', {
        method: 'POST',
        tenant: true,
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
    doctors: (tenantId: string) =>
      request<Doctor[]>(`/public/hospitals/${tenantId}/doctors`, { auth: false }),
  },
};
