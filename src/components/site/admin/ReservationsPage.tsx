import { useEffect, useState, type FormEvent } from "react";
import {
  Plus, Trash2, Search, X, CalendarCheck, User, Package,
  ChevronDown, FileText, Upload, Eye, Clock, CheckCircle2,
  XCircle, Award, ArrowUpRight, Filter,
} from "lucide-react";
import { api } from "../../../utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  category?: string;
}

interface ReservationFile {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface Reservation {
  _id: string;
  client: { name: string; email: string; phone?: string };
  product: { name: string; price: number; category?: string; image?: string };
  quantity: number;
  totalPrice: number;
  notes?: string;
  scheduledDate?: string;
  createdAt: string;
  status: ReservationStatus;
  source: "admin" | "public";
  files?: ReservationFile[];
}

interface ReservationForm {
  clientId: string;
  productId: string;
  quantity: number;
  notes: string;
  scheduledDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const emptyForm: ReservationForm = {
  clientId: "",
  productId: "",
  quantity: 1,
  notes: "",
  scheduledDate: "",
};

const STATUS_CONFIG: Record<ReservationStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}> = {
  pending:   {
    label: "En attente",
    color: "#d97706",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    icon: <Clock size={11} />,
  },
  confirmed: {
    label: "Confirmé",
    color: "#059669",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    icon: <CheckCircle2 size={11} />,
  },
  cancelled: {
    label: "Annulé",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    icon: <XCircle size={11} />,
  },
  completed: {
    label: "Complété",
    color: "#7c3aed",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
    icon: <Award size={11} />,
  },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients]           = useState<Client[]>([]);
  const [products, setProducts]         = useState<Product[]>([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState<ReservationForm>(emptyForm);
  const [loading, setLoading]           = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [delConfirm, setDelConfirm]     = useState<string | null>(null);
  const [detailRes, setDetailRes]       = useState<Reservation | null>(null);
  const [hoveredRow, setHoveredRow]     = useState<string | null>(null);

  const selectedProduct = products.find((p) => p._id === form.productId);
  const computedTotal = selectedProduct ? Number(selectedProduct.price) * form.quantity : 0;

  // KPIs
  const total      = reservations.length;
  const pending    = reservations.filter(r => r.status === "pending").length;
  const confirmed  = reservations.filter(r => r.status === "confirmed").length;
  const revenue    = reservations
    .filter(r => r.status !== "cancelled")
    .reduce((sum, r) => sum + Number(r.totalPrice), 0);

  const load = async () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const data = await api.getReservations(params);
    setReservations(data as unknown as Reservation[]);
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  useEffect(() => {
    api.getClients({}).then((data) => setClients(data as unknown as Client[]));
    api.getProducts({}).then((data) => setProducts(data as unknown as Product[]));
  }, []);

  const openAdd    = () => { setForm(emptyForm); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(emptyForm); };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.clientId || !form.productId) return alert("Choisissez un client et un produit.");
    setLoading(true);
    try {
      await api.createReservation({
        clientId: form.clientId,
        productId: form.productId,
        quantity: form.quantity,
        totalPrice: computedTotal,
        notes: form.notes,
        scheduledDate: form.scheduledDate || null,
        source: "admin",
      });
      closeModal();
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    await api.updateReservationStatus(id, status);
    load();
    if (detailRes?._id === id) setDetailRes((prev) => prev ? { ...prev, status } : null);
  };

  const handleDelete = async (id: string) => {
    await api.deleteReservation(id);
    setDelConfirm(null);
    load();
  };
const isUpcoming = (date?: string) => {
  if (!date) return false;

  const target = new Date(date).getTime();
  const now = new Date().getTime();

  const diffDays = (target - now) / (1000 * 60 * 60 * 24);

  return diffDays <= 2 && diffDays >= 0; // 2 jours ou moins
};

const isOverdue = (date?: string) => {
  if (!date) return false;

  return new Date(date).getTime() < new Date().getTime();
};
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!detailRes) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadLoading(true);
    try {
      const updated = await api.uploadReservationFiles(detailRes._id, files) as unknown as ReservationFile[];
      setDetailRes({ ...detailRes, files: updated });
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadLoading(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!detailRes) return;
    await api.deleteReservationFile(detailRes._id, filename);
    setDetailRes({ ...detailRes, files: detailRes.files?.filter((x) => x.filename !== filename) });
    load();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: "fadeIn .3s ease", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .rp-header { flex-wrap: wrap !important; gap: 12px !important; }
        .rp-kpi { flex-wrap: wrap !important; }
        .rp-filters { flex-wrap: wrap !important; }
        .rp-search { max-width: 100% !important; width: 100% !important; }
        @media (max-width: 640px) {
          .rp-header button { width: 100%; justify-content: center; }
          .rp-kpi > * { flex: 1 1 calc(50% - 6px); min-width: 130px; }
          .rp-table-wrap { overflow-x: auto !important; }
        }
        @media (max-width: 420px) {
          .rp-kpi > * { flex: 1 1 100%; }
        }
        @media (max-width: 480px) {
          .modal-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="rp-header" style={S.header}>
        <div>
          <h1 style={S.title}>Réservations</h1>
          <p style={S.sub}>Gérez et suivez toutes vos réservations</p>
        </div>
        <button style={S.addBtn} onClick={openAdd}>
          <Plus size={15} strokeWidth={2.5} /> Nouvelle réservation
        </button>
      </div>

      {/* KPI bar */}
      <div className="rp-kpi" style={S.kpiBar}>
        <KpiCard icon={<CalendarCheck size={16} color="#6366f1" />} label="Total" value={total} accent="#6366f1" bg="rgba(99,102,241,0.08)" />
        <KpiCard icon={<Clock size={16} color="#d97706" />}         label="En attente" value={pending} accent="#d97706" bg="rgba(245,158,11,0.08)" />
        <KpiCard icon={<CheckCircle2 size={16} color="#059669" />}  label="Confirmées" value={confirmed} accent="#059669" bg="rgba(16,185,129,0.08)" />
        <KpiCard
          icon={<ArrowUpRight size={16} color="#7c3aed" />}
          label="Chiffre d'affaires"
          value={`${revenue.toLocaleString()} DT`}
          accent="#7c3aed"
          bg="rgba(139,92,246,0.08)"
          wide
        />
      </div>

      {/* Filters */}
      <div className="rp-filters" style={S.filtersRow}>
        <div style={S.searchWrap}>
          <Search size={15} color="#9ca3af" />
          <input
            style={S.searchInput}
            placeholder="Rechercher client, produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={S.clearBtn} onClick={() => setSearch("")}><X size={13} /></button>
          )}
        </div>

        <div style={S.selectWrap}>
          <Filter size={14} color="#9ca3af" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
          <select
            style={S.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUS_CONFIG) as ReservationStatus[]).map(k => (
              <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>
            ))}
          </select>
          <ChevronDown size={13} color="#9ca3af" style={{ position: "absolute", right: 12, pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div className="rp-table-wrap" style={{ ...S.tableWrap, overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Client", "Produit", "Qté", "Total", "Date prévue", "Statut", "Source", ""].map((h, i) => (
                <th key={i} style={{ ...S.th, textAlign: (i >= 5 ? "center" : "left") as React.CSSProperties["textAlign"] }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const st = STATUS_CONFIG[r.status];
              const isHovered = hoveredRow === r._id;
              return (
                <tr
                  key={r._id}
                  style={{
                    ...S.tr,
                    background: isHovered ? "rgba(99,102,241,0.035)" : "transparent",
                  }}
                  onMouseEnter={() => setHoveredRow(r._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Client */}
                  <td style={S.td}>
                    <div
                      style={S.clientCell}
                      onClick={() => setDetailRes(r)}
                      role="button"
                      title="Voir les détails"
                    >
                      <div style={S.avatar}>{r.client?.name?.[0]?.toUpperCase() ?? "?"}</div>
                      <div>
                        <div style={S.clientName}>{r.client?.name ?? "—"}</div>
                        <div style={S.clientEmail}>{r.client?.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td style={S.td}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{r.product?.name ?? "—"}</div>
                    {r.product?.category && (
                      <div style={S.categoryPill}>{r.product.category}</div>
                    )}
                  </td>

                  {/* Qty */}
                  <td style={{ ...S.td, textAlign: "center" as const }}>
                    <span style={S.qtyBadge}>{r.quantity}</span>
                  </td>

                  {/* Total */}
                  <td style={S.td}>
                    <span style={S.totalPrice}>{Number(r.totalPrice).toLocaleString()} DT</span>
                  </td>

                  {/* Date */}
                  <td style={S.td}>
                   {r.scheduledDate ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <span>
      {new Date(r.scheduledDate).toLocaleDateString("fr-FR")}
    </span>

    {isOverdue(r.scheduledDate) && (
      <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>
        ⚠ Dépassée
      </span>
    )}

    {!isOverdue(r.scheduledDate) && isUpcoming(r.scheduledDate) && (
      <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600 }}>
        ⏳ Bientôt
      </span>
    )}
  </div>
) : (
  <span style={{ color: "var(--text3)" }}>—</span>

                    )}
                  </td>

                  {/* Status dropdown */}
                  <td style={{ ...S.td, textAlign: "center" as const }}>
                    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r._id, e.target.value as ReservationStatus)}
                        style={{
                          border: `1px solid ${st.border}`,
                          background: st.bg,
                          color: st.color,
                          borderRadius: 99,
                          padding: "4px 26px 4px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          outline: "none",
                          appearance: "none",
                          letterSpacing: 0.2,
                        }}
                      >
                        {(Object.keys(STATUS_CONFIG) as ReservationStatus[]).map(k => (
                          <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} color={st.color} style={{ position: "absolute", right: 7, pointerEvents: "none" }} />
                    </div>
                  </td>

                  {/* Source */}
                  <td style={{ ...S.td, textAlign: "center" as const }}>
                    <span style={{
                      ...S.sourceBadge,
                      background: r.source === "admin" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)",
                      color: r.source === "admin" ? "#6366f1" : "#059669",
                      border: `1px solid ${r.source === "admin" ? "rgba(99,102,241,0.25)" : "rgba(16,185,129,0.25)"}`,
                    }}>
                      {r.source === "admin" ? "Admin" : "Public"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ ...S.td, textAlign: "center" as const }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button
                        style={S.eyeBtn}
                        title="Voir détails"
                        onClick={() => setDetailRes(r)}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        style={S.deleteBtn}
                        title="Supprimer"
                        onClick={() => setDelConfirm(r._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 0, border: "none" }}>
                  <div style={S.emptyState}>
                    <div style={S.emptyIcon}>
                      <CalendarCheck size={28} color="#cbd5e1" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                      Aucune réservation trouvée
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text3)", maxWidth: 280, textAlign: "center" }}>
                      {search || statusFilter
                        ? "Aucun résultat pour ce filtre. Essayez de le modifier."
                        : "Créez votre première réservation en cliquant sur le bouton ci-dessus."}
                    </div>
                    {!search && !statusFilter && (
                      <button style={{ ...S.addBtn, marginTop: 20 }} onClick={openAdd}>
                        <Plus size={14} /> Créer une réservation
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add reservation modal ──────────────────────────────────────── */}
      {showModal && (
        <Modal title="Nouvelle réservation" onClose={closeModal} maxWidth={560}>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <FormField label="Client" icon={<User size={13} />} required>
              <select style={inp} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
                <option value="">— Sélectionner un client —</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </FormField>

            <FormField label="Produit" icon={<Package size={13} />} required>
              <select
                style={inp}
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value, quantity: 1 })}
                required
              >
                <option value="">— Sélectionner un produit —</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {Number(p.price).toLocaleString()} DT
                    {p.stock !== undefined ? ` (stock: ${p.stock})` : ""}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="modal-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Quantité" required>
                <input
                  style={inp}
                  type="number"
                  min={1}
                  max={selectedProduct?.stock ?? 9999}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  required
                />
              </FormField>
              <FormField label="Total calculé">
                <div style={{
                  ...inp,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 700,
                  fontSize: 15,
                  background: "rgba(99,102,241,0.06)",
                  color: "#6366f1",
                  border: "1px solid rgba(99,102,241,0.2)",
                  cursor: "default",
                }}>
                  {computedTotal.toLocaleString()} DT
                </div>
              </FormField>
            </div>

            <FormField label="Date prévue">
              <input
                style={inp}
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                style={{ ...inp, height: 80, resize: "vertical", lineHeight: 1.6 }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Remarques éventuelles..."
              />
            </FormField>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" style={Btn.cancel} onClick={closeModal}>Annuler</button>
              <button type="submit" style={Btn.primary} disabled={loading}>
                {loading ? "Création..." : "Créer la réservation"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Detail modal ─────────────────────────────────────────────── */}
      {detailRes && (
        <Modal title="Détail de la réservation" onClose={() => setDetailRes(null)} maxWidth={600}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Status badge at top */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <StatusPill status={detailRes.status} />
              <span style={{ fontSize: 12, color: "var(--text3)" }}>
                Créée le {new Date(detailRes.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <InfoCard label="Client"      value={detailRes.client?.name} />
              <InfoCard label="Email"       value={detailRes.client?.email} />
              <InfoCard label="Téléphone"   value={detailRes.client?.phone ?? "—"} />
              <InfoCard label="Source"      value={detailRes.source === "admin" ? "Admin" : "Public"} />
              <InfoCard label="Produit"     value={detailRes.product?.name} />
              <InfoCard label="Catégorie"   value={detailRes.product?.category ?? "—"} />
              <InfoCard label="Quantité"    value={String(detailRes.quantity)} />
              <InfoCard label="Total"       value={`${Number(detailRes.totalPrice).toLocaleString()} DT`} highlight />
              <InfoCard label="Date prévue" value={detailRes.scheduledDate ? new Date(detailRes.scheduledDate).toLocaleDateString("fr-FR") : "—"} />
            </div>

            {/* Notes */}
            {detailRes.notes && (
              <div style={{
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: "var(--text2)",
                lineHeight: 1.6,
              }}>
                <span style={{ fontWeight: 600, color: "#6366f1" }}>Notes:</span> {detailRes.notes}
              </div>
            )}

            {/* Change status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text2)", letterSpacing: 0.1 }}>
                Changer le statut
              </label>
              <div style={{ position: "relative" }}>
                <select
                  style={{
                    ...inp,
                    background: STATUS_CONFIG[detailRes.status].bg,
                    color: STATUS_CONFIG[detailRes.status].color,
                    border: `1px solid ${STATUS_CONFIG[detailRes.status].border}`,
                    fontWeight: 600,
                    paddingRight: 36,
                    appearance: "none",
                  }}
                  value={detailRes.status}
                  onChange={(e) => handleStatusChange(detailRes._id, e.target.value as ReservationStatus)}
                >
                  {(Object.keys(STATUS_CONFIG) as ReservationStatus[]).map(k => (
                    <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>
                  ))}
                </select>
                <ChevronDown size={14} color={STATUS_CONFIG[detailRes.status].color} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Files section */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
                <FileText size={15} color="#6366f1" />
                Fichiers joints ({detailRes.files?.length ?? 0})
              </h3>

              {/* Upload zone */}
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: uploadLoading ? "var(--bg2)" : "rgba(99,102,241,0.04)",
                border: `2px dashed ${uploadLoading ? "var(--border)" : "rgba(99,102,241,0.3)"}`,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: uploadLoading ? "not-allowed" : "pointer",
                fontSize: 13,
                color: uploadLoading ? "var(--text3)" : "#6366f1",
                fontWeight: 500,
                marginBottom: 14,
                transition: "all 0.15s",
                opacity: uploadLoading ? 0.65 : 1,
              }}>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: "none" }}
                  disabled={uploadLoading}
                  onChange={handleUpload}
                />
                <Upload size={15} />
                {uploadLoading ? "Envoi en cours..." : "Cliquez pour ajouter des fichiers (images, PDF — max 10 Mo)"}
              </label>

              {/* File list */}
              {detailRes.files && detailRes.files.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {detailRes.files.map((f) => (
                    <FileRow
                      key={f.filename}
                      file={f}
                      onDelete={() => handleDeleteFile(f.filename)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 13 }}>
                  <FileText size={24} color="#cbd5e1" style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                  Aucun fichier joint
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm modal ──────────────────────────────────────── */}
      {delConfirm && (
        <Modal title="Supprimer cette réservation ?" onClose={() => setDelConfirm(null)} maxWidth={420}>
          <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
            Cette action est irréversible. La réservation et ses fichiers associés seront définitivement supprimés.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={Btn.cancel} onClick={() => setDelConfirm(null)}>Annuler</button>
            <button
              style={{ ...Btn.primary, background: "#ef4444", boxShadow: "0 2px 8px rgba(239,68,68,0.3)" }}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, bg, wide,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
  bg: string;
  wide?: boolean;
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
      flex: wide ? 1.4 : 1,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", lineHeight: 1, letterSpacing: -0.3 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 99, padding: "4px 12px",
      fontSize: 12, fontWeight: 700, letterSpacing: 0.2,
    }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div style={{
      background: "var(--bg2)",
      borderRadius: 9,
      padding: "10px 13px",
      border: highlight ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
    }}>
      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3, fontWeight: 500 }}>{label}</div>
      <div style={{
        fontSize: 14,
        color: highlight ? "#6366f1" : "var(--text)",
        fontWeight: highlight ? 700 : 500,
      }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function FileRow({ file, onDelete }: { file: ReservationFile; onDelete: () => void }) {
  const isImage = file.mimetype.startsWith("image/");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 9,
      padding: "8px 12px",
    }}>
      {isImage ? (
        <img
          src={`http://localhost:4000${file.url}`}
          alt={file.originalName}
          style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 38, height: 38, borderRadius: 6,
          background: "rgba(239,68,68,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <FileText size={16} color="#ef4444" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: "var(--text)",
        }}>
          {file.originalName}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
          {(file.size / 1024).toFixed(0)} KB
        </div>
      </div>
      <a
        href={`http://localhost:4000${file.url}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex", alignItems: "center", gap: 4,
          color: "#6366f1", fontSize: 12, textDecoration: "none",
          fontWeight: 500, whiteSpace: "nowrap",
          padding: "4px 10px",
          background: "rgba(99,102,241,0.08)",
          borderRadius: 6,
        }}
      >
        <Eye size={12} /> Voir
      </a>
      <button
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "none", cursor: "pointer",
          color: "#ef4444", display: "flex", padding: "6px 8px", borderRadius: 6,
        }}
        onClick={onDelete}
        title="Supprimer le fichier"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function FormField({
  label, icon, required, children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{
        fontSize: 12.5, fontWeight: 600,
        color: "var(--text2)", letterSpacing: 0.1,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {icon}
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

function Modal({ title, onClose, children, maxWidth = 520 }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: "#ffffff",
        color: "#111827",
        borderRadius: 18,
        width: "100%",
        maxWidth,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        border: "1px solid #e5e7eb",
        animation: "fadeIn .2s ease",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px 0",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none", cursor: "pointer",
              color: "#64748b", borderRadius: 8,
              width: 32, height: 32,
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 9,
  padding: "10px 13px",
  color: "#111827",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const Btn = {
  cancel: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 9, padding: "9px 18px",
    color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500,
  } as React.CSSProperties,
  primary: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none",
    borderRadius: 9, padding: "9px 20px",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
  } as React.CSSProperties,
};

const S: Record<string, React.CSSProperties> = {
  header:      { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title:       { fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 800, color: "var(--text)", marginBottom: 3, letterSpacing: -0.5 },
  sub:         { color: "var(--text3)", fontSize: 13 },
  addBtn:      {
    display: "flex", alignItems: "center", gap: 7,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none", borderRadius: 10,
    padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
    whiteSpace: "nowrap",
  },
  kpiBar:      { display: "flex", gap: 12, marginBottom: 22 },
  filtersRow:  { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" },
  searchWrap:  {
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 11, padding: "0 13px", flex: 1, maxWidth: 380,
  },
  searchInput: { flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, padding: "11px 0" },
  clearBtn:    { background: "none", border: "none", color: "var(--text3)", display: "flex", alignItems: "center", cursor: "pointer" },
  selectWrap:  { position: "relative", display: "flex", alignItems: "center" },
  select:      {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 11, padding: "10px 36px 10px 34px",
    fontSize: 13, color: "var(--text)", outline: "none",
    appearance: "none", cursor: "pointer",
  },
  tableWrap:   {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 14, overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  table:       { width: "100%", borderCollapse: "collapse" },
  th:          {
    padding: "13px 14px",
    fontSize: 11, color: "var(--text3)", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.07em",
    borderBottom: "1px solid var(--border)", background: "var(--bg2)",
  },
  tr:          { transition: "background 0.12s", cursor: "default" },
  td:          { padding: "13px 14px", fontSize: 13, color: "var(--text)", borderBottom: "1px solid var(--border)", verticalAlign: "middle" },
  clientCell:  { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  clientName:  { fontWeight: 600, fontSize: 13, color: "#6366f1", lineHeight: 1.2 },
  clientEmail: { fontSize: 11, color: "var(--text3)", marginTop: 2 },
  avatar:      {
    width: 34, height: 34, borderRadius: 9,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
  },
  categoryPill: {
    display: "inline-block",
    marginTop: 4,
    background: "#f1f5f9",
    color: "#64748b",
    borderRadius: 4,
    padding: "1px 7px",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  qtyBadge:    {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 26, height: 22, borderRadius: 6,
    background: "var(--bg2)", border: "1px solid var(--border)",
    fontSize: 12, fontWeight: 700, color: "var(--text2)",
    padding: "0 8px",
  },
  totalPrice:  { fontWeight: 700, fontSize: 14, color: "var(--text)" },
  sourceBadge: {
    padding: "3px 10px", borderRadius: 99,
    fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
  },
  eyeBtn:      {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 7,
    border: "1px solid rgba(99,102,241,0.2)",
    background: "rgba(99,102,241,0.06)",
    color: "#6366f1", cursor: "pointer",
  },
  deleteBtn:   {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 7,
    border: "1px solid #fee2e2", background: "#fff5f5",
    color: "#dc2626", cursor: "pointer",
  },
  emptyState:  {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "64px 24px", gap: 8,
  },
  emptyIcon:   {
    width: 64, height: 64, borderRadius: 16,
    background: "var(--bg2)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
};