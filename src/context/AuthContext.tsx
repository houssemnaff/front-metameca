import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type UserRole = "superadmin" | "client";
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "client";
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

interface AuthContextValue {
  user:            AuthUser | null;
  loading:         boolean;
  isAuthenticated: boolean;
  login:           (email: string, password: string) => Promise<AuthUser>;
  logout:          () => void;
    register:        (data: RegisterData) => Promise<AuthUser>;  // ← add


}
export type RegisterData = {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  company?:  string;
  phone?:    string;
};
/* ─── Storage keys ───────────────────────────────────────────────────────── */

const TOKEN_KEY = "mm_token";
const USER_KEY  = "mm_user";

/* ─── Context ────────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null);
function getInitialUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser); // ← lazy init
  const [loading, setLoading] = useState(false); 

  /* Rehydrate session on mount */
 

  /* ── login ────────────────────────────────────────────────────────────── */
 const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
  const res = await api.login(email, password) as LoginResponse;


  if (!res.user) {
    throw new Error("Invalid login response");
  }

  const authUser: AuthUser = {
    id:    res.user.id,
    name:  res.user.name,
    email: res.user.email,
    role:  res.user.role,
  };

  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  setUser(authUser);

  return authUser;
}, []);

const register = useCallback(async (data: RegisterData): Promise<AuthUser> => {
  const res = await api.register(data) as LoginResponse;

  if (!res.user) throw new Error("Invalid register response");

  const authUser: AuthUser = {
    id:    res.user.id,
    name:  res.user.name,
    email: res.user.email,
    role:  res.user.role,
  };

  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  setUser(authUser);

  return authUser;
}, []);




  /* ── logout ───────────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
<AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}


/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}

/* ─── Internal helper ────────────────────────────────────────────────────── */

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}