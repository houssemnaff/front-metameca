  import type { AuthUser, Client, Product, Reservation, ReservationStats } from "../types";

  /* ─── Base & token ───────────────────────────────────────────────────────── */

  const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

  const getToken = (): string | null => {
    const token = localStorage.getItem("mm_token");
   
    return token;
  };
  /* ─── Core request helpers ───────────────────────────────────────────────── */

  /** JSON request — sets Content-Type and Authorization automatically. */
  async function request<T = unknown>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const token = getToken();

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? data.error ?? `Erreur ${res.status}`);
    return data as T;
  }

  /** FormData (multipart) request — never sets Content-Type (browser does it). */
  async function requestForm<T = unknown>(
    method: string,
    path: string,
    body: FormData
  ): Promise<T> {
    const token = getToken();

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? data.error ?? `Erreur ${res.status}`);
    return data as T;
  }

  /** Accepts either JSON or FormData and dispatches to the right helper. */
  function requestAuto<T = unknown>(
    method: string,
    path: string,
    body: FormData | Record<string, unknown>
  ): Promise<T> {
    return body instanceof FormData
      ? requestForm<T>(method, path, body)
      : request<T>(method, path, body);
  }

  /* ─── API ────────────────────────────────────────────────────────────────── */

  export const api = {

    /* Auth ------------------------------------------------------------------ */

    /** POST /api/auth/login — returns token + user (role-agnostic) */
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>("POST", "/auth/login", { email, password }),
meUser: () =>
  request<AuthUser>("GET", "/clients/me"),      // ← pour les clients

    /** GET /api/auth/me — returns the currently authenticated user */
    me: () =>
      request<AuthUser>("GET", "/auth/me"),

    
   register: (data: {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  company?:  string;
  phone?:    string;
}) =>
  request<{ token: string; user: AuthUser }>("POST", "/clients/register", {
    ...data,
    name: `${data.firstName} ${data.lastName}`.trim(),  // ← add this
    role: "client",
  }),
    /* Products -------------------------------------------------------------- */

    getProducts: (params: Record<string, string> = {}) =>
      request<Product[]>("GET", `/products?${new URLSearchParams(params)}`),

    getProduct: (id: string) =>
      request<Product>("GET", `/products/${id}`),

    createProduct: (data: FormData | Record<string, unknown>) =>
      requestAuto<Product>("POST", "/products", data),

    updateProduct: (id: string, data: FormData | Record<string, unknown>) =>
      requestAuto<Product>("PUT", `/products/${id}`, data),

    deleteProduct: (id: string) =>
      request<void>("DELETE", `/products/${id}`),

    getCategories: () =>
      request<string[]>("GET", "/products/categories/list"),

    /* Clients --------------------------------------------------------------- */

    getClients: (params: Record<string, string> = {}) =>
      request<Client[]>("GET", `/clients?${new URLSearchParams(params)}`),

    getClient: (id: string) =>
      request<Client>("GET", `/clients/${id}`),

    createClient: (data: Record<string, unknown>) =>
      request<Client>("POST", "/clients", data),

    updateClient: (id: string, data: Record<string, unknown>) =>
      request<Client>("PUT", `/clients/${id}`, data),

    deleteClient: (id: string) =>
      request<void>("DELETE", `/clients/${id}`),

    /* Reservations ---------------------------------------------------------- */

    getReservations: (params: Record<string, string> = {}) =>
      request<Reservation[]>("GET", `/reservations?${new URLSearchParams(params)}`),

    getReservation: (id: string) =>
      request<Reservation>("GET", `/reservations/${id}`),

    createReservation: (data: Record<string, unknown>) =>
      request<Reservation>("POST", "/reservations", data),

    updateReservationStatus: (id: string, status: string) =>
      request<Reservation>("PUT", `/reservations/${id}/status`, { status }),

    deleteReservation: (id: string) =>
      request<void>("DELETE", `/reservations/${id}`),

    getReservationStats: () =>
      request<ReservationStats>("GET", "/reservations/stats/summary"),

    uploadReservationFiles: (id: string, files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      return requestForm<{ files: string[] }>("POST", `/reservations/${id}/files`, form);
    },

    deleteReservationFile: (id: string, filename: string) =>
      request<void>("DELETE", `/reservations/${id}/files/${filename}`),
  // In api.ts, add inside the `api` object:
  getMyReservations: () =>
    request<Reservation[]>("GET", "/reservations/mine"),  
    /* Public (no auth) ------------------------------------------------------ */

    publicReservation: (data: Record<string, unknown>) =>
      request<Reservation>("POST", "/reservations/public", data),

    /* Notifications --------------------------------------------------------- */

    getNotifications: () =>
      request<{ notifications: AppNotification[]; total: number }>("GET", "/notifications"),

    markNotificationRead: (id: string) =>
      request<void>("PATCH", `/notifications/${id}/read`),

    markAllNotificationsRead: () =>
      request<void>("PATCH", "/notifications/read-all"),
  };
