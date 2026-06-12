import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, accountTokenStore, type PublicAccount } from './api';

interface AccountCtx {
  account: PublicAccount | null;
  loading: boolean;
  setAccount: (a: PublicAccount) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<string | undefined>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AccountCtx>({
  account: null,
  loading: true,
  setAccount: () => {},
  login: async () => {},
  register: async () => undefined,
  logout: () => {},
  refresh: async () => {},
});

const ACCOUNT_KEY = 'docta-account';

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<PublicAccount | null>(() => {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as PublicAccount) : null;
  });
  const [loading, setLoading] = useState(true);

  const persist = (a: PublicAccount) => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a));
    setAccount(a);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accountTokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.account.me();
        if (!cancelled) persist(me);
      } catch {
        if (!cancelled) {
          accountTokenStore.clear();
          localStorage.removeItem(ACCOUNT_KEY);
          setAccount(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.account.login(email, password);
    accountTokenStore.set(res.accessToken);
    persist(res.account);
  };

  const register: AccountCtx['register'] = async (data) => {
    const res = await api.account.register(data);
    accountTokenStore.set(res.accessToken);
    persist(res.account);
    return res.devLink;
  };

  const logout = () => {
    accountTokenStore.clear();
    localStorage.removeItem(ACCOUNT_KEY);
    setAccount(null);
  };

  const refresh = async () => {
    try {
      const me = await api.account.me();
      persist(me);
    } catch {
      /* ignore */
    }
  };

  return (
    <Ctx.Provider
      value={{ account, loading, setAccount: persist, login, register, logout, refresh }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAccount = () => useContext(Ctx);
