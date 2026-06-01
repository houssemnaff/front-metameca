import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Search, X, User, Phone, Building2, Mail, Crown, Star, TrendingUp, Users } from "lucide-react";
import { api } from "../../../utils/api";

interface Client {
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

interface Reservation {
  _id: string;
  createdAt: string;
  totalPrice?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  product?: { name: string };
}

type ClientForm = Omit<Client, "_id" | "reservationCount" | "reservations"> & {
  password?: string;
};

const emptyForm: ClientForm = {
  name: "", email: "", phone: "", company: "", address: "", notes: "", password: "",
};

// ─── Client tier helpers ──────────────────────────────────────────────────────

type ClientTier = "vip" | "active" | "inactive" | "normal";

function getClientTier(count: number = 0): ClientTier {
  if (count >= 10) return "vip";
  if (count >= 3) return "active";
  if (count === 0) return "inactive";
  return "normal";
}

const tierConfig: Record<ClientTier, {
  avatarBg: string;
  badgeLabel: string | null;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  icon: React.ReactNode | null;
}> = {
  vip: {
    avatarBg: "linear-gradient(135deg, #f59e0b, #ef4444)",
    badgeLabel: "VIP",
    badgeBg: "rgba(245,158,11,0.12)",
    badgeColor: "#b45309",
    badgeBorder: "rgba(245,158,11,0.35)",
    icon: <Crown size={10} />,
  },
  active: {
    avatarBg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    badgeLabel: "Actif",
    badgeBg: "rgba(99,102,241,0.1)",
    badgeColor: "#4f46e5",
    badgeBorder: "rgba(99,102,241,0.25)",
    icon: <Star size={10} />,
  },
  normal: {
    avatarBg: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    badgeLabel: null,
    badgeBg: "",
    badgeColor: "",
    badgeBorder: "",
    icon: null,
  },
  inactive: {
    avatarBg: "linear-gradient(135deg, #d1d5db, #9ca3af)",
    badgeLabel: "Inactif",
    badgeBg: "rgba(156,163,175,0.12)",
    badgeColor: "#6b7280",
    badgeBorder: "rgba(156,163,175,0.3)",
    icon: null,
  },
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const load = async () => {
    const data = await api.getClients(search ? { search } : {});
    setClients(data);
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (c: Client) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, address: c.address, notes: c.notes });
    setEditId(c._id); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditId(null); };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const currentEditId = editId;
    try {
      if (currentEditId) await api.updateClient(currentEditId, form);
      else await api.createClient(form);
      closeModal();
      load();
    } catch (err) { alert((err as Error).message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteClient(id);
      setDelConfirm(null);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const openDetail = async (id: string) => {
    const data = await api.getClient(id) as Client;
    setDetailClient(data);
  };

  // KPI derived values
  const totalClients = clients.length;
  const vipClients = clients.filter(c => (c.reservationCount ?? 0) >= 10).length;
  const activeClients = clients.filter(c => (c.reservationCount ?? 0) >= 3).length;

  return (
    <div style={{ animation: "fadeIn .3s ease", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Clients</h1>
          <p style={S.sub}>Gérez votre base clients et leurs réservations</p>
        </div>
        <button style={S.addBtn} onClick={openAdd}>
          <Plus size={15} strokeWidth={2.5} />
          Nouveau client
        </button>
      </div>

      {/* ── KPI Summary bar ───────────────────────────────────────────────── */}
      <div style={S.kpiBar}>
        <KpiCard
          icon={<Users size={16} color="#6366f1" />}
          label="Total clients"
          value={totalClients}
          bg="rgba(99,102,241,0.07)"
          accent="#6366f1"
        />
       
        <KpiCard
          icon={<TrendingUp size={16} color="#10b981" />}
          label="Clients actifs"
          value={activeClients}
          bg="rgba(16,185,129,0.07)"
          accent="#10b981"
        />
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <div style={S.searchWrap}>
        <Search size={15} color="#9ca3af" />
        <input
          style={S.searchInput}
          placeholder="Rechercher un client, email, entreprise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button style={S.clearBtn} onClick={() => setSearch("")}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Client", "Contact", "Entreprise", "Réservations", "Statut", "Actions"].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const tier = getClientTier(c.reservationCount);
              const cfg = tierConfig[tier];
              const isHovered = hoveredRow === c._id;
              const count = c.reservationCount ?? 0;

              return (
                <tr
                  key={c._id}
                  style={{
                    ...S.tr,
                    background: isHovered ? "rgba(99,102,241,0.04)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={() => setHoveredRow(c._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => openDetail(c._id)}
                >
                  {/* Client: avatar + name */}
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ ...S.avatar, background: cfg.avatarBg, position: "relative" }}>
                        {c.name[0].toUpperCase()}
                        {tier === "vip" && (
                          <span style={S.crownDot}>
                            <Crown size={8} color="#fff" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", lineHeight: 1.2 }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                          {c.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact: phone */}
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)" }}>
                      {c.phone ? (
                        <>
                          <Phone size={12} color="#9ca3af" />
                          {c.phone}
                        </>
                      ) : (
                        <span style={{ color: "var(--text3)" }}>—</span>
                      )}
                    </div>
                  </td>

                  {/* Company */}
                  <td style={S.td}>
                    {c.company ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)" }}>
                        <Building2 size={12} color="#9ca3af" />
                        {c.company}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text3)", fontSize: 13 }}>—</span>
                    )}
                  </td>

                  {/* Reservations count */}
                  <td style={S.td}>
                    <div style={S.resBadge(count)}>
                      {count}
                    </div>
                  </td>

                  {/* Status tier badge */}
                  <td style={S.td}>
                    {cfg.badgeLabel ? (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: cfg.badgeBg,
                        color: cfg.badgeColor,
                        border: `1px solid ${cfg.badgeBorder}`,
                        borderRadius: 99,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.3,
                      }}>
                        {cfg.icon}
                        {cfg.badgeLabel}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text3)", fontSize: 12 }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={S.td} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        style={S.editBtn}
                        title="Modifier"
                        onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        style={S.deleteBtn}
                        title="Supprimer"
                        onClick={(e) => { e.stopPropagation(); setDelConfirm(c._id); }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 0, border: "none" }}>
                  <div style={S.emptyState}>
                    <div style={S.emptyIconWrap}>
                      <User size={28} color="#cbd5e1" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                      Aucun client trouvé
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text3)", maxWidth: 260, textAlign: "center" }}>
                      {search
                        ? `Aucun résultat pour « ${search} ». Essayez un autre terme.`
                        : "Commencez par ajouter votre premier client."}
                    </div>
                    {!search && (
                      <button style={{ ...S.addBtn, marginTop: 18 }} onClick={openAdd}>
                        <Plus size={14} /> Ajouter un client
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit modal ─────────────────────────────────────────────── */}
      {showModal && (
        <Modal title={editId ? "Modifier le client" : "Nouveau client"} onClose={closeModal}>
          <form onSubmit={handleSave} style={fStyles.form}>
            <Row>
              <Field label="Nom complet *">
                <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Email *">
                <input style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </Field>
            </Row>
            <Row>
              <Field label="Téléphone">
                <input style={inp} value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Entreprise">
                <input style={inp} value={form.company ?? ""} onChange={e => setForm({ ...form, company: e.target.value })} />
              </Field>
            </Row>
            {/* ← Ajouter ce bloc, uniquement à la création */}
{!editId && (
  <Field label="Mot de passe *">
    <input
      style={inp}
      type="password"
      placeholder="Mot de passe initial du client"
      value={form.password ?? ""}
      onChange={e => setForm({ ...form, password: e.target.value })}
      required
    />
  </Field>
)}
            <Field label="Adresse">
              <input style={inp} value={form.address ?? ""} onChange={e => setForm({ ...form, address: e.target.value })} />
            </Field>
            <Field label="Notes">
              <textarea style={{ ...inp, height: 72, resize: "vertical" }} value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </Field>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" style={fStyles.cancelBtn} onClick={closeModal}>Annuler</button>
              <button type="submit" style={fStyles.saveBtn} disabled={loading}>
                {loading ? "Enregistrement..." : editId ? "Enregistrer" : "Créer le client"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      {detailClient && (
        <Modal title={detailClient.name} onClose={() => setDetailClient(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tier badge in header area */}
            {(() => {
              const tier = getClientTier(detailClient.reservationCount);
              const cfg = tierConfig[tier];
              return cfg.badgeLabel ? (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: cfg.badgeBg,
                  color: cfg.badgeColor,
                  border: `1px solid ${cfg.badgeBorder}`,
                  borderRadius: 99,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  alignSelf: "flex-start",
                  marginTop: -6,
                }}>
                  {cfg.icon}
                  {cfg.badgeLabel}
                </span>
              ) : null;
            })()}

            <div style={detailStyles.infoGrid}>
              {[
                { icon: Mail, label: "Email", value: detailClient.email },
                { icon: Phone, label: "Téléphone", value: detailClient.phone || "—" },
                { icon: Building2, label: "Entreprise", value: detailClient.company || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={detailStyles.infoItem}>
                  <Icon size={14} color="var(--accent2)" />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {detailClient.notes && (
              <div style={{ background: "var(--bg2)", borderRadius: 8, padding: 12, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                {detailClient.notes}
              </div>
            )}

            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
                Réservations ({detailClient.reservations?.length ?? 0})
              </h3>
              {detailClient.reservations && detailClient.reservations.length > 0
                ? detailClient.reservations.map((r) => (
                  <div key={r._id} style={detailStyles.resItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.product?.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                        {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent2)" }}>
                      {r.totalPrice?.toLocaleString()} DT
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))
                : <p style={{ color: "var(--text3)", fontSize: 13 }}>Aucune réservation</p>
              }
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      {delConfirm && (
        <Modal title="Supprimer ce client ?" onClose={() => setDelConfirm(null)}>
          <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
            Cette action est irréversible. Toutes les réservations associées seront également affectées.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button style={fStyles.cancelBtn} onClick={() => setDelConfirm(null)}>Annuler</button>
            <button
              style={{ ...fStyles.saveBtn, background: "#ef4444", boxShadow: "0 2px 8px rgba(239,68,68,0.25)" }}
              onClick={() => handleDelete(delConfirm)}
            >
              Supprimer définitivement
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, bg, accent }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  accent: string;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "14px 18px",
      flex: 1,
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map: Record<Reservation["status"], { label: string; color: string; bg: string }> = {
    pending:   { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: "Confirmé",   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    cancelled: { label: "Annulé",     color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    completed: { label: "Complété",   color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  };
  const s = map[status] ?? { label: status, color: "var(--text2)", bg: "var(--surface)" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: "#ffffff",
        color: "#111827",
        borderRadius: 18,
        width: "100%",
        maxWidth: 520,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        border: "1px solid #e5e7eb",
        animation: "fadeIn .2s ease",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px 0",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none", cursor: "pointer",
              color: "#64748b", borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, color: "var(--text2)", fontWeight: 600, letterSpacing: 0.1 }}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

const inp: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 9,
  padding: "10px 12px", color: "var(--text)", fontSize: 14, outline: "none", width: "100%",
  transition: "border-color 0.15s",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> & {
  resBadge: (count: number) => React.CSSProperties;
} = {
  header:     { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title:      { fontFamily: "var(--font-display)", fontSize: 27, color: "var(--text)", fontWeight: 800, marginBottom: 3, letterSpacing: -0.5 },
  sub:        { color: "var(--text3)", fontSize: 13 },
  addBtn:     {
    display: "flex", alignItems: "center", gap: 7,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 18px", fontSize: 14, fontWeight: 600,
    cursor: "pointer", boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
    whiteSpace: "nowrap" as const,
  },
  kpiBar:     { display: "flex", gap: 12, marginBottom: 22 },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 10,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 11, padding: "0 14px", marginBottom: 18, maxWidth: 420,
  },
  searchInput:{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, padding: "11px 0" },
  clearBtn:   { background: "none", border: "none", color: "var(--text3)", display: "flex", alignItems: "center", cursor: "pointer" },
  tableWrap:  {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 14, overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  table:      { width: "100%", borderCollapse: "collapse" },
  th:         {
    padding: "13px 16px", textAlign: "left" as const,
    fontSize: 11, color: "var(--text3)", fontWeight: 700,
    textTransform: "uppercase" as const, letterSpacing: "0.07em",
    borderBottom: "1px solid var(--border)", background: "var(--bg2)",
  },
  tr:         { cursor: "pointer" },
  td:         { padding: "14px 16px", fontSize: 14, color: "var(--text)", borderBottom: "1px solid var(--border)" },
  avatar:     {
    width: 36, height: 36, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
    position: "relative" as const,
  },
  crownDot:   {
    position: "absolute" as const, bottom: -3, right: -3,
    background: "#f59e0b", borderRadius: "50%",
    width: 16, height: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #fff",
  },
  editBtn:    {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 7,
    border: "1px solid var(--border)", background: "var(--bg2)",
    color: "var(--text2)", cursor: "pointer",
  },
  deleteBtn:  {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 7,
    border: "1px solid #fee2e2", background: "#fff5f5",
    color: "#dc2626", cursor: "pointer",
  },
  emptyState: {
    display: "flex", flexDirection: "column" as const, alignItems: "center",
    justifyContent: "center", padding: "64px 24px", gap: 8,
  },
  emptyIconWrap: {
    width: 60, height: 60, borderRadius: 16,
    background: "var(--bg2)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },

  resBadge: (count: number): React.CSSProperties => {
    if (count >= 10) return {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 28, height: 22, borderRadius: 6,
      background: "rgba(245,158,11,0.12)", color: "#b45309",
      fontSize: 12, fontWeight: 700, padding: "0 8px",
    };
    if (count >= 3) return {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 28, height: 22, borderRadius: 6,
      background: "rgba(99,102,241,0.1)", color: "#4f46e5",
      fontSize: 12, fontWeight: 700, padding: "0 8px",
    };
    if (count === 0) return {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 28, height: 22, borderRadius: 6,
      background: "var(--bg2)", color: "var(--text3)",
      fontSize: 12, fontWeight: 600, padding: "0 8px",
    };
    return {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 28, height: 22, borderRadius: 6,
      background: "var(--surface2, var(--bg2))", color: "var(--text2)",
      fontSize: 12, fontWeight: 600, padding: "0 8px",
      border: "1px solid var(--border)",
    };
  },
};

const fStyles: Record<string, React.CSSProperties> = {
  form:      { display: "flex", flexDirection: "column", gap: 14 },
  cancelBtn: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 9, padding: "9px 18px", color: "var(--text2)", fontSize: 14, cursor: "pointer",
  },
  saveBtn:   {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none", borderRadius: 9,
    padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
  },
};

const detailStyles: Record<string, React.CSSProperties> = {
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoItem: {
    display: "flex", alignItems: "flex-start", gap: 10,
    background: "var(--bg2)", borderRadius: 10, padding: "12px 14px",
  },
  resItem:  {
    display: "flex", alignItems: "center", gap: 12,
    padding: "11px 14px", background: "var(--bg2)",
    borderRadius: 10, marginBottom: 8,
  },
};