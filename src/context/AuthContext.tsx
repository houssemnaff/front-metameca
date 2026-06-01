import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "../utils/api";

/* ─── Types ───────────────────────────────────────── */

export type UserRole = "superadmin" | "client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  register: (data: RegisterData) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
}

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
};

/* ─── Storage ───────────────────────────────────────── */

const TOKEN_KEY = "mm_token";

/* ─── Context ───────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ───────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* ─── GET USER FROM BACKEND ─── */
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      let me: AuthUser;

      try {
        me = await api.me(); // GET /auth/me
      } catch {
        me = await api.meUser(); // GET /clients/me
      }

      setUser(me);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── INIT APP ─── */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /* ─── LOGIN ─── */
  const login = useCallback(async (email: string, password: string) => {
    const res = (await api.login(email, password)) as LoginResponse;

    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);

    return res.user;
  }, []);

  /* ─── REGISTER ─── */
  const register = useCallback(async (data: RegisterData) => {
    const res = (await api.register(data)) as LoginResponse;

    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);

    return res.user;
  }, []);

  /* ─── LOGOUT ─── */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}