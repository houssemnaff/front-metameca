import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, CalendarCheck,
  LogOut, Menu, Bell, ChevronRight, Settings,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/admin",              icon: LayoutDashboard, label: "Dashboard",     end: true },
  { to: "/admin/products",     icon: Package,         label: "Produits" },
  { to: "/admin/clients",      icon: Users,           label: "Clients" },
  { to: "/admin/reservations", icon: CalendarCheck,   label: "Réservations" },
];

const pageTitles: Record<string, string> = {
  "/admin":              "Dashboard",
  "/admin/products":     "Produits",
  "/admin/clients":      "Clients",
  "/admin/reservations": "Réservations",
};

export default function AdminLayout() {
  const { user: admin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const pageTitle = pageTitles[location.pathname] ?? "Admin";
  const initials  = (admin?.name ?? "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside style={{ ...S.sidebar, width: collapsed ? 68 : 240 }}>

        {/* Brand */}
        <div style={S.brand}>
          <div style={S.brandLogo}>
            <span style={S.brandLogoText}>M</span>
          </div>
          {!collapsed && (
            <div style={S.brandWords}>
              <span style={S.brandName}>Meta Meca</span>
              <span style={S.brandSub}>Administration</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={S.nav}>
          <p style={{ ...S.navSection, opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto", overflow: "hidden", transition: "opacity .2s, height .2s" }}>
            MENU
          </p>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                ...S.navItem,
                ...(isActive ? S.navItemActive : {}),
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "11px 0" : "11px 14px",
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{
                    ...S.navIconWrap,
                    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  }}>
                    <Icon size={17} />
                  </span>
                  {!collapsed && (
                    <>
                      <span style={S.navLabel}>{label}</span>
                      {isActive && <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.5 }} />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={S.sidebarBottom}>
          {/* Settings */}
          <button
            className="sb-action"
            title="Paramètres"
            style={{ ...S.sbAction, justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <Settings size={16} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Paramètres</span>}
          </button>

          {/* Divider */}
          <div style={S.divider} />

          {/* User row */}
          <div style={{ ...S.userRow, justifyContent: collapsed ? "center" : "space-between" }}>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={S.avatar}>{initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={S.userName}>{admin?.name ?? "Admin"}</div>
                  <div style={S.userEmail}>{admin?.email ?? ""}</div>
                </div>
              </div>
            )}
            {collapsed && <div style={S.avatar}>{initials}</div>}
            {!collapsed && (
              <button className="logout-btn" onClick={handleLogout} title="Déconnexion" style={S.logoutBtn}>
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ══════════════════ MAIN ══════════════════ */}
      <div style={S.main}>

        {/* Top Navbar */}
        <header style={S.topbar}>
          <div style={S.topbarLeft}>
            {/* Collapse toggle */}
            <button className="topbar-btn" onClick={() => setCollapsed(c => !c)} style={S.topbarBtn} title="Toggle sidebar">
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div style={S.breadcrumb}>
              <span style={S.breadcrumbRoot}>Admin</span>
              <ChevronRight size={13} color="#cbd5e1" />
              <span style={S.breadcrumbPage}>{pageTitle}</span>
            </div>
          </div>

          <div style={S.topbarRight}>
            {/* Notification bell */}
            <button className="topbar-btn" style={S.topbarBtn} title="Notifications">
              <Bell size={18} />
              <span style={S.notifDot} />
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 22, background: "#e8edf4", margin: "0 4px" }} />

            {/* User chip */}
            <div style={S.topbarUser}>
              <div style={S.topbarAvatar}>{initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{admin?.name ?? "Admin"}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Administrateur</div>
              </div>
            </div>

            {/* Logout */}
            <button className="topbar-btn" onClick={handleLogout} style={{ ...S.topbarBtn, color: "#ef4444" }} title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={S.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ─── CSS ────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sb-action { background: transparent; border: none; color: rgba(255,255,255,0.55); cursor: pointer;
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 8px;
    transition: background .15s, color .15s; }
  .sb-action:hover { background: rgba(255,255,255,0.08); color: #fff; }

  .logout-btn { background: transparent; border: none; color: rgba(255,255,255,0.45); cursor: pointer;
    display: flex; align-items: center; padding: 6px; border-radius: 7px; transition: background .15s, color .15s; flex-shrink: 0; }
  .logout-btn:hover { background: rgba(239,68,68,0.2); color: #fca5a5; }

  .topbar-btn { background: transparent; border: none; cursor: pointer; display: flex; align-items: center;
    position: relative; color: #64748b; padding: 8px; border-radius: 9px; transition: background .15s, color .15s; }
  .topbar-btn:hover { background: #f1f5f9; color: #0f172a; }
`;

/* ─── Styles ─────────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f4f6fb",
  },

  /* ── Sidebar ── */
  sidebar: {
    background: "linear-gradient(180deg, #1e2337 0%, #16192a 100%)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "hidden",
    transition: "width .25s cubic-bezier(.4,0,.2,1)",
    zIndex: 20,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "22px 16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  brandLogoText: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
  },
  brandWords: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
    overflow: "hidden",
  },
  brandName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
  },
  brandSub: {
    fontSize: 10,
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },

  nav: {
    flex: 1,
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  navSection: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.25)",
    padding: "0 6px",
    marginBottom: 6,
    marginTop: 4,
    transition: "opacity .2s",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: 500,
    textDecoration: "none",
    transition: "all .18s",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  navItemActive: {
    color: "#fff",
    background: "rgba(99,102,241,0.25)",
    borderLeft: "3px solid #6366f1",
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background .18s",
  },
  navLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },

  sidebarBottom: {
    padding: "10px 10px 16px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    margin: "6px 0",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 4px",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 120,
  },
  userEmail: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 120,
  },
  sbAction: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.55)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "9px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    transition: "background .15s, color .15s",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  logoutBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.45)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 6,
    borderRadius: 7,
    transition: "background .15s, color .15s",
    flexShrink: 0,
  },

  /* ── Main ── */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #e8edf4",
    height: 62,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px 0 16px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 1px 0 #e8edf4",
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  topbarBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    position: "relative",
    color: "#64748b",
    padding: 8,
    borderRadius: 9,
    transition: "background .15s, color .15s",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  breadcrumbRoot: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 500,
  },
  breadcrumbPage: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 700,
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#6366f1",
    border: "2px solid #fff",
  },
  topbarUser: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "6px 12px",
    borderRadius: 10,
    background: "#f8fafc",
    border: "1px solid #e8edf4",
    margin: "0 4px",
  },
  topbarAvatar: {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: "28px",
    overflowY: "auto",
  },
};
