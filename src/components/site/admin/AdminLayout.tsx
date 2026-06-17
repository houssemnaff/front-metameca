import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, CalendarCheck, LogOut, Menu, X, ChevronRight, Bell } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/admin",              icon: LayoutDashboard, label: "Dashboard",     end: true },
  { to: "/admin/products",     icon: Package,         label: "Produits" },
  { to: "/admin/clients",      icon: Users,           label: "Clients" },
  { to: "/admin/reservations", icon: CalendarCheck,   label: "Réservations" },
];

export default function AdminLayout() {
  const { user: admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 72 }}>
        <div style={styles.sidebarTop}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>A</div>
            {sidebarOpen && <span style={styles.brandText}>Meta meca admin</span>}
          </div>
          <button style={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={styles.navLabel}>{label}</span>}
              {sidebarOpen && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.adminInfo}>
            <div style={styles.adminAvatar}>{admin?.name?.[0]?.toUpperCase()}</div>
            {sidebarOpen && (
              <div>
                <div style={styles.adminName}>{admin?.name}</div>
                <div style={styles.adminRole}>{admin?.email}</div>
              </div>
            )}
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        <header style={styles.header}>
          <div />
          <div style={styles.headerRight}>
            <button style={styles.notifBtn}>
              <Bell size={18} />
            </button>
            <span style={styles.adminChip}>{admin?.name}</span>
          </div>
        </header>
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root:         { display: "flex", minHeight: "100vh", background: "var(--bg)" },
  sidebar:      { background: "var(--bg2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", transition: "width .25s ease", overflow: "hidden", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  sidebarTop:   { padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" },
  brand:        { display: "flex", alignItems: "center", gap: 10, overflow: "hidden" },
  brandIcon:    { width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, var(--accent), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, fontFamily: "var(--font-display)" },
  brandText:    { fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", color: "var(--text)" },
  toggleBtn:    { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "5px 7px", color: "var(--text2)", display: "flex", alignItems: "center", cursor: "pointer" },
  nav:          { flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 },
  navItem:      { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, color: "var(--text2)", fontSize: 14, fontWeight: 500, transition: "all .15s", whiteSpace: "nowrap", overflow: "hidden", textDecoration: "none" },
  navItemActive:{ background: "var(--accent-glow)", color: "var(--accent2)", border: "1px solid rgba(99,102,241,0.2)" },
  navLabel:     { overflow: "hidden", textOverflow: "ellipsis" },
  sidebarBottom:{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 },
  adminInfo:    { display: "flex", alignItems: "center", gap: 9, flex: 1, overflow: "hidden", minWidth: 0 },
  adminAvatar:  { width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff" },
  adminName:    { fontSize: 13, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  adminRole:    { fontSize: 11, color: "var(--text3)", textTransform: "capitalize" },
  logoutBtn:    { background: "transparent", border: "none", color: "var(--text3)", padding: 7, borderRadius: 7, display: "flex", alignItems: "center", transition: "color .15s, background .15s", flexShrink: 0, cursor: "pointer" },
  main:         { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  header:       { background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  headerRight:  { display: "flex", alignItems: "center", gap: 12 },
  notifBtn:     { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 9px", color: "var(--text2)", display: "flex", alignItems: "center", cursor: "pointer" },
  adminChip:    { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "var(--text2)" },
  content:      { flex: 1, padding: "28px", overflowY: "auto" },
};