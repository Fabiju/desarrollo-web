import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import {
  fetchCurrentUser,
  getToken,
  loginRequest,
  removeToken,
  saveToken,
} from '../services/auth';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean; 
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => getToken() !== null);

  useEffect(() => {
    const stored = getToken();
    if (!stored) return;

    fetchCurrentUser(stored)
      .then((me) => {
        setUser(me);
        setToken(stored);
      })
      .catch(() => {
        removeToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { accessToken, refreshToken: _refreshToken, ...userData } = await loginRequest(
      username,
      password,
    );
    saveToken(accessToken);
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
