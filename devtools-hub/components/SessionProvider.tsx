'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface UserInfo {
  userId: number;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPro: boolean;
  plan: string;
}

interface SessionContextType {
  user: UserInfo | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser({
          userId: data.userId,
          email: data.email,
          name: data.name || null,
          avatarUrl: data.avatarUrl || null,
          isPro: data.isPro,
          plan: data.subscription?.plan || 'free',
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refresh: fetchUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
