import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Users, CalendarCheck, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Plus, FileText, Eye, Zap, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "../../utils/api";
import type { Reservation, ReservationStats } from "../../types";

interface KPI {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string;
  accentLight: string;
  trend: string;
  trendUp: boolean;
  path: string;
}

interface StatusCard {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  accentLight: string;
  percent: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [clientCount, setClientCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
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

  if (loading) return <SkeletonLoader />;

  const total = stats?.total || 1;

  const kpis: KPI[] = [
    { label: "Produits",        value: productCount,                                   icon: Package,       accent: "#6366f1", accentLight: "#eef2ff", trend: "+8%",  trendUp: true,  path: "/admin/products" },
    { label: "Clients",         value: clientCount,                                    icon: Users,         accent: "#0ea5e9", accentLight: "#e0f2fe", trend: "+14%", trendUp: true,  path: "/admin/clients" },
    { label: "Réservations",    value: stats?.total ?? 0,                              icon: CalendarCheck, accent: "#f59e0b", accentLight: "#fef3c7", trend: "+5%",  trendUp: true,  path: "/admin/reservations" },
    { label: "Revenu complété", value: `${(stats?.revenue ?? 0).toLocaleString()} DT`, icon: TrendingUp,    accent: "#10b981", accentLight: "#d1fae5", trend: "+21%", trendUp: true,  path: "/admin/reservations" },
  ];

  const statusCards: StatusCard[] = [
    { label: "En attente", value: stats?.pending   ?? 0, icon: Clock,        accent: "#f59e0b", accentLight: "#fef3c7", percent: Math.round(((stats?.pending   ?? 0) / total) * 100) },
    { label: "Confirmés",  value: stats?.confirmed ?? 0, icon: CheckCircle,  accent: "#10b981", accentLight: "#d1fae5", percent: Math.round(((stats?.confirmed ?? 0) / total) * 100) },
    { label: "Annulés",    value: stats?.cancelled ?? 0, icon: XCircle,      accent: "#ef4444", accentLight: "#fee2e2", percent: Math.round(((stats?.cancelled ?? 0) / total) * 100) },
    { label: "Complétés",  value: stats?.completed ?? 0, icon: AlertCircle,  accent: "#6366f1", accentLight: "#eef2ff", percent: Math.round(((stats?.completed ?? 0) / total) * 100) },
  ];

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f8f9fc", minHeight: "100vh", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.10) !important; }
        .kpi-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .status-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.08) !important; }
        .status-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .res-row:hover { background: #f1f5f9 !important; }
        .res-row { transition: background 0.15s; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.18) !important; }
        .action-btn { transition: all 0.18s ease; }
        .section-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0, padding: "32px 28px" }}>

          {/* HERO HEADER */}
         

          {/* KPI CARDS */}
          <div className="section-fade" style={{ animationDelay: "60ms", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            {kpis.map(({ label, value, icon: Icon, accent, accentLight, trend, trendUp, path }) => (
              <div key={label} className="kpi-card" onClick={() => navigate(path)} style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 16, padding: "22px 20px", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={accent} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: trendUp ? "#10b981" : "#ef4444", background: trendUp ? "#d1fae5" : "#fee2e2", padding: "3px 8px", borderRadius: 20 }}>
                    {trend}
                  </span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* STATUS SECTION */}
          <div className="section-fade" style={{ animationDelay: "120ms", marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Statut des réservations</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
              {statusCards.map(({ label, value, icon: Icon, accent, accentLight, percent }) => (
                <div key={label} className="status-card" style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 14, padding: "18px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderLeft: `3px solid ${accent}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={15} color={accent} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>{percent}%</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 10 }}>{label}</div>
                  <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", background: accent, borderRadius: 4, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT RESERVATIONS */}
          <div className="section-fade" style={{ animationDelay: "180ms" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Réservations récentes</h2>
              <button onClick={() => navigate("/admin/reservations")} style={{ background: "none", border: "1px solid #e2e8f0", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 8, padding: "6px 14px", transition: "all 0.15s" }}>
                Voir tout →
              </button>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8eaf0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fc" }}>
                      {["Client", "Produit", "Quantité", "Montant", "Date", "Statut"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.map((r, i) => (
                      <tr key={r.id} className="res-row" onClick={() => navigate("/admin/reservations")} style={{ cursor: "pointer", background: i % 2 === 0 ? "#fff" : "#fafbfc", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(r.client?.name?.charCodeAt(0) ?? 0) * 15 % 360}, 60%, 88%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: `hsl(${(r.client?.name?.charCodeAt(0) ?? 0) * 15 % 360}, 50%, 35%)`, flexShrink: 0 }}>
                              {r.client?.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", whiteSpace: "nowrap" }}>{r.client?.name ?? "—"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontSize: 13, color: "#475569", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, fontWeight: 500, whiteSpace: "nowrap" }}>{r.product?.name ?? "—"}</span>
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#334155", fontWeight: 500 }}>{r.quantity}</td>
                        <td style={{ padding: "13px 16px", fontSize: 14, color: "#0f172a", fontWeight: 600 }}>{r.totalPrice?.toLocaleString()} DT</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                    {recentReservations.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                          Aucune réservation pour l'instant
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ width: 260, flexShrink: 0, padding: "32px 24px 32px 0" }}>

          {/* QUICK ACTIONS */}
        

          {/* SYSTEM STATUS */}
        

          {/* TODAY SUMMARY */}
          <div className="section-fade" style={{ animationDelay: "200ms", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "1px solid #bae6fd", borderRadius: 16, padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Eye size={15} color="#0ea5e9" />
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0c4a6e", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Résumé du jour</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 500 }}>En attente</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0c4a6e" }}>{stats?.pending ?? 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 500 }}>Confirmés</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0c4a6e" }}>{stats?.confirmed ?? 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 500 }}>Taux de complétion</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0c4a6e" }}>{Math.round(((stats?.completed ?? 0) / total) * 100)}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map: Record<Reservation["status"], { label: string; color: string; bg: string }> = {
    pending:   { label: "En attente", color: "#b45309", bg: "#fef3c7" },
    confirmed: { label: "Confirmé",   color: "#065f46", bg: "#d1fae5" },
    cancelled: { label: "Annulé",     color: "#991b1b", bg: "#fee2e2" },
    completed: { label: "Complété",   color: "#3730a3", bg: "#eef2ff" },
  };
  const s = map[status];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function SkeletonLoader() {
  const pulse: React.CSSProperties = {
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: 10,
  };
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "32px 28px", background: "#f8f9fc", minHeight: "100vh" }}>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      <div style={{ ...pulse, height: 140, marginBottom: 28, borderRadius: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ ...pulse, height: 110, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ ...pulse, height: 90, borderRadius: 14 }} />)}
      </div>
      <div style={{ ...pulse, height: 280, borderRadius: 16 }} />
    </div>
  );
}