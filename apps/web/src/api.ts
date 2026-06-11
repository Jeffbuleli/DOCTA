// Client API de Docta. En dev, les appels relatifs passent par le proxy Vite
// (/api -> http://localhost:3000). En prod, definir VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

const TOKEN_KEY = 'docta-token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
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
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const h = new Headers(headers);
  h.set('Content-Type', 'application/json');
  if (auth) {
    const t = tokenStore.get();
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
};
