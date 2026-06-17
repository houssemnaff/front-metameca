import type { UserRole } from "../context/AuthContext";

export interface Admin {
  _id: string;
  email: string;
  name?: string;
}
export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  UserRole;
}
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Reservation {
  _id: string;
  client: { name: string; email: string; phone?: string };  // ← pas clientId
  product: { name: string; price: number; category?: string; image?: string }; // ← pas productId
  quantity: number;
  totalPrice: number;
  notes?: string;
  scheduledDate?: string;
  createdAt: string;
  status: ReservationStatus;
  source: "admin" | "public";
}

export interface ReservationStats {
  total: number;
  revenue: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface ProductImage {
  filename: string;
  url: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number | string;
  stock?: number | string;
  category?: string;
  status: "active" | "inactive";

  images: ProductImage[];
}
export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  reservationCount?: number;
  reservations?: Reservation[];
}