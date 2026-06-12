import { createContext, useContext, useState, type ReactNode } from 'react';
import { activeTenantStore } from './api';

export interface ActiveTenant {
  tenantId: string;
  name: string;
  role: string;
}

interface Ctx {
  active: ActiveTenant | null;
  enter: (a: ActiveTenant) => void;
  exit: () => void;
}

const META_KEY = 'docta-active-tenant-meta';

const Context = createContext<Ctx>({ active: null, enter: () => {}, exit: () => {} });

export function ActiveTenantProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveTenant | null>(() => {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as ActiveTenant) : null;
  });

  const enter = (a: ActiveTenant) => {
    activeTenantStore.set(a.tenantId);
    localStorage.setItem(META_KEY, JSON.stringify(a));
    setActive(a);
  };

  const exit = () => {
    activeTenantStore.clear();
    localStorage.removeItem(META_KEY);
    setActive(null);
  };

  return <Context.Provider value={{ active, enter, exit }}>{children}</Context.Provider>;
}

export const useActiveTenant = () => useContext(Context);
