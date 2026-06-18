import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Users, CalendarCheck, TrendingUp,
  Clock, CheckCircle, XCircle, ArrowUpRight,
  BarChart2, ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "../../utils/api";
import type { Reservation, ReservationStats } from "../../types";

/* ─── types ─────────────────────────────────────────────────────────── */
interface KPI {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bg: string;
  path: string;
}

/* ─── component ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats]                     = useState<ReservationStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [productCount, setProductCount]       = useState(0);
  const [clientCount, setClientCount]         = useState(0);
  const [loading, setLoading]                 = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getReservationStats(),
      api.getReservations({ limit: "5" }),
      api.getProducts(),
      api.getClients(),
    ]).then(([s, r, p, c]) => {
      setStats(s);
      setRecentReservations(r.slice(0, 6));
      setProductCount(p.length);
      setClientCount(c.length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  const total = stats?.total || 1;
  

  const kpis: KPI[] = [
    { label: "Produits",       value: productCount,                                    icon: Package,       color: "#6366f1", bg: "#eef2ff", path: "/admin/products" },
    { label: "Clients",        value: clientCount,                                     icon: Users,         color: "#0ea5e9", bg: "#e0f2fe", path: "/admin/clients" },
    { label: "Réservations",   value: stats?.total ?? 0,                               icon: CalendarCheck, color: "#f59e0b", bg: "#fef3c7", path: "/admin/reservations" },
    { label: "Revenu total",   value: `${(stats?.revenue ?? 0).toLocaleString()} DT`,  icon: TrendingUp,    color: "#10b981", bg: "#d1fae5", path: "/admin/reservations" },
  ];

  const statusRows = [
    { label: "En attente",  value: stats?.pending   ?? 0, color: "#f59e0b", icon: Clock },
    { label: "Confirmés",   value: stats?.confirmed ?? 0, color: "#10b981", icon: CheckCircle },
    { label: "Annulés",     value: stats?.cancelled ?? 0, color: "#ef4444", icon: XCircle },
    { label: "Complétés",   value: stats?.completed ?? 0, color: "#6366f1", icon: BarChart2 },
  ];

  return (
    <div className="dash-page" style={S.page}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="dash-header" style={S.header}>
        <div>
          <p style={S.headerSub}>Vue d'ensemble</p>
          <h1 style={S.headerTitle}>Tableau de bord</h1>
        </div>
        <div className="dash-header-date" style={S.headerDate}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────── */}
      <div className="dash-kpi" style={S.kpiGrid}>
        {kpis.map(({ label, value, icon: Icon, color, bg, path }) => (
          <div key={label} className="kpi" onClick={() => navigate(path)} style={S.kpiCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ ...S.kpiIcon, background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <ArrowUpRight size={15} color="#cbd5e1" />
            </div>
            <div style={{ ...S.kpiValue, color }}>{value}</div>
            <div style={S.kpiLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Body: table + sidebar ──────────────────────────────────── */}
      <div className="dash-body" style={S.body}>

        {/* Recent reservations */}
        <div style={S.tableCard}>
          <div style={S.cardHeader}>
            <div style={S.cardTitle}>
              <ShoppingBag size={16} color="#6366f1" />
              Réservations récentes
            </div>
            <button className="view-btn" onClick={() => navigate("/admin/reservations")} style={S.viewBtn}>
              Voir tout <ArrowUpRight size={13} />
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["Client", "Produit", "Qté", "Montant", "Date", "Statut"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((r, i) => {
                  const hue = (r.client?.name?.charCodeAt(0) ?? 0) * 15 % 360;
                  return (
                    <tr key={r._id} className="trow" onClick={() => navigate("/admin/reservations")}
                      style={{ ...S.tr, background: i % 2 === 0 ? "#fff" : "#fafbfd" }}>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ ...S.avatar, background: `hsl(${hue},60%,88%)`, color: `hsl(${hue},50%,32%)` }}>
                            {r.client?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <span style={{ fontWeight: 500, color: "#0f172a", fontSize: 13 }}>{r.client?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={S.pill}>{r.product?.name ?? "—"}</span>
                      </td>
                      <td style={{ ...S.td, color: "#475569" }}>{r.quantity}</td>
                      <td style={{ ...S.td, fontWeight: 600, color: "#0f172a" }}>{r.totalPrice?.toLocaleString()} DT</td>
                      <td style={{ ...S.td, color: "#94a3b8", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td style={S.td}><StatusBadge status={r.status} /></td>
                    </tr>
                  );
                })}
                {recentReservations.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "48px 0", textAlign: "center", color: "#cbd5e1", fontSize: 14 }}>
                      Aucune réservation pour l'instant
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div style={S.sidebar}>

          {/* Completion gauge */}
          

          {/* Status breakdown */}
          <div style={S.sideCard}>
            <div style={{ ...S.cardTitle, marginBottom: 16 }}>
              <CalendarCheck size={15} color="#6366f1" />
              Répartition statuts
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {statusRows.map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{value}</span>
                    </div>
                    <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((value / total) * 100)}%`, background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div style={S.sideCard}>
            <div style={{ ...S.cardTitle, marginBottom: 14 }}>
              <ArrowUpRight size={15} color="#6366f1" />
              Navigation rapide
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Gérer les produits",      icon: Package,       path: "/admin/products",     color: "#6366f1" },
                { label: "Gérer les clients",        icon: Users,         path: "/admin/clients",      color: "#0ea5e9" },
                { label: "Voir les réservations",    icon: CalendarCheck, path: "/admin/reservations", color: "#f59e0b" },
              ].map(({ label, icon: Icon, path, color }) => (
                <button key={label} className="nav-btn" onClick={() => navigate(path)} style={S.navBtn}>
                  <Icon size={14} color={color} />
                  <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{label}</span>
                  <ArrowUpRight size={12} color="#cbd5e1" style={{ marginLeft: "auto" }} />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── StatusBadge ────────────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map: Record<Reservation["status"], { label: string; color: string; bg: string }> = {
    pending:   { label: "En attente", color: "#92400e", bg: "#fef3c7" },
    confirmed: { label: "Confirmé",   color: "#065f46", bg: "#d1fae5" },
    cancelled: { label: "Annulé",     color: "#991b1b", bg: "#fee2e2" },
    completed: { label: "Complété",   color: "#3730a3", bg: "#eef2ff" },
  };
  const s = map[status];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────── */
function Skeleton() {
  const p: React.CSSProperties = {
    background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 12,
  };
  return (
    <div style={{ padding: "32px 28px", background: "#f4f6fb", minHeight: "100vh" }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div style={{ ...p, height: 60, maxWidth: 320, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ ...p, height: 110 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ ...p, height: 360 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[180, 200, 140].map((h, i) => <div key={i} style={{ ...p, height: h }} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .kpi { animation: fadeUp .4s ease both; cursor: pointer; transition: box-shadow .2s, transform .2s; }
  .kpi:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.10) !important; }
  .trow { cursor: pointer; transition: background .12s; }
  .trow:hover td { background: #f0f4ff !important; }
  .view-btn:hover { background: #eef2ff !important; color: #4f46e5 !important; }
  .nav-btn:hover { background: #f8faff !important; border-color: #c7d2fe !important; }

  .dash-page { padding: 32px 28px !important; }
  .dash-header { flex-wrap: wrap; gap: 8px; }
  .dash-body { grid-template-columns: 1fr 300px; }
  .dash-kpi { grid-template-columns: repeat(auto-fit, minmax(190px,1fr)); }

  @media (max-width: 1024px) {
    .dash-body { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .dash-page { padding: 20px 14px !important; }
    .dash-kpi { grid-template-columns: repeat(2, 1fr) !important; }
    .dash-header-date { display: none !important; }
  }
  @media (max-width: 380px) {
    .dash-kpi { grid-template-columns: 1fr !important; }
  }
`;

const S: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#ffffff",
    minHeight: "100vh",
    padding: "32px 28px",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 28,
    animation: "fadeUp .35s ease both",
  },
  headerSub: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6366f1",
    margin: "0 0 4px",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  headerDate: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    background: "#fff",
    border: "1px solid #e8edf4",
    borderRadius: 16,
    padding: "20px 18px",
    boxShadow: "0 1px 6px rgba(0,0,0,.05)",
  },
  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 500,
    letterSpacing: "0.02em",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: 20,
    animation: "fadeUp .45s ease .1s both",
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #e8edf4",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 6px rgba(0,0,0,.05)",
  },
  sideCard: {
    background: "#fff",
    border: "1px solid #e8edf4",
    borderRadius: 16,
    padding: "18px 16px",
    boxShadow: "0 1px 6px rgba(0,0,0,.05)",
    marginBottom: 16,
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "1px solid #e2e8f0",
    color: "#6366f1",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: 8,
    padding: "5px 12px",
    transition: "all .15s",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "11px 16px",
    textAlign: "left" as const,
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    background: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap" as const,
  },
  tr: {
    borderBottom: "1px solid #f8fafc",
    transition: "background .12s",
  },
  td: {
    padding: "12px 16px",
    fontSize: 13,
    color: "#334155",
    verticalAlign: "middle" as const,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  pill: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  gaugeWrap: {
    position: "relative" as const,
    marginTop: 10,
    marginBottom: -10,
  },
  gaugeLabel: {
    position: "absolute" as const,
    bottom: 14,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: "1px solid #e8edf4",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
    transition: "all .15s",
  },
};
