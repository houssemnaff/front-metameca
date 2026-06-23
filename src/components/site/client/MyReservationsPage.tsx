import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";
import { Link } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────── */
type ProductImage = { filename: string; url: string };
type Product = {
  _id: string; name: string; price: number | string;
  category?: string; family?: string;
  images?: ProductImage[]; description?: string;
};
type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";
type MyReservation = {
  _id: string; status: ReservationStatus; createdAt: string;
  scheduledDate?: string; notes?: string;
  quantity: number; totalPrice: number;
  product?: { _id: string; name: string; category?: string; images?: ProductImage[]; price?: number };
};
type EnrichedReservation = MyReservation & { productDetail?: Product };
type SortKey = "date_desc" | "date_asc" | "price_desc" | "price_asc";
type FilterStatus = "all" | ReservationStatus;

/* ─── Design tokens ──────────────────────────────────────── */
const C = {
  bg: "#f8f7f4",
  card: "#ffffff",
  border: "#ececea",
  borderHover: "#d8d8d4",
  ink: "#111",
  inkMid: "#555",
  inkLight: "#999",
  inkFaint: "#ccc",
  accent: "#0d3875",
  accentSoft: "#eef2fb",
};

const STATUS: Record<ReservationStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: "En attente",  color: "#854d0e", bg: "#fef9ee", dot: "#f59e0b" },
  confirmed: { label: "Confirmée",   color: "#1e40af", bg: "#eff6ff", dot: "#3b82f6" },
  completed: { label: "Terminée",    color: "#166534", bg: "#f0fdf4", dot: "#22c55e" },
  cancelled: { label: "Annulée",     color: "#7f1d1d", bg: "#fff5f5", dot: "#ef4444" },
};

const SORT_OPTS: { value: SortKey; label: string }[] = [
  { value: "date_desc",  label: "Plus récentes" },
  { value: "date_asc",   label: "Plus anciennes" },
  { value: "price_desc", label: "Prix ↓" },
  { value: "price_asc",  label: "Prix ↑" },
];

const FILTER_OPTS: { value: FilterStatus; label: string }[] = [
  { value: "all",       label: "Toutes" },
  { value: "pending",   label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
];

const fmt = (n: number | string) => Number(n).toLocaleString("fr-TN");

/* ─── StatusBadge ────────────────────────────────────────── */
const StatusBadge = memo(({ status }: { status: ReservationStatus }) => {
  const s = STATUS[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 500, letterSpacing: "0.05em",
      padding: "4px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
});

/* ─── InfoRow ────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "10px 0", borderBottom: `1px solid ${C.border}`, gap: 12,
    }}>
      <span style={{ fontSize: 12, color: C.inkLight, fontWeight: 400, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.ink, fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────── */
const ReservationCard = memo(({
  reservation: r, isOpen, onToggle,
}: { reservation: EnrichedReservation; isOpen: boolean; onToggle: () => void }) => {
  const pd = r.productDetail;
  const images = pd?.images || r.product?.images || [];
  const thumb = images[0]?.url;
  const name = pd?.name || r.product?.name || "—";
  const category = pd?.category || r.product?.category;
  const price = pd?.price ?? r.product?.price;
  const date = new Date(r.createdAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" });
  const scheduled = r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString("fr-TN", { day: "2-digit", month: "long", year: "numeric" }) : null;

  return (
    <article style={{
      background: C.card,
      border: `1px solid ${isOpen ? C.borderHover : C.border}`,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 10,
      boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
      transition: "box-shadow 0.2s, border-color 0.2s",
    }}>

      {/* ── Summary row ── */}
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", userSelect: "none" }}
      >
        {/* Thumbnail */}
        <div style={{
          width: 56, height: 56, borderRadius: 10, flexShrink: 0,
          overflow: "hidden", background: "#f4f3f0", border: `1px solid ${C.border}`,
        }}>
          {thumb
            ? <img src={thumb} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {category && (
            <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, margin: "0 0 2px" }}>
              {category}
            </p>
          )}
          <p style={{ fontSize: 14, fontWeight: 500, color: C.ink, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </p>
          <p style={{ fontSize: 11, color: C.inkLight, margin: 0 }}>
            {r.quantity} × · {date}
          </p>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <StatusBadge status={r.status} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
            {fmt(r.totalPrice)} <span style={{ fontSize: 11, fontWeight: 400, color: C.inkLight }}>DT</span>
          </span>
        </div>

        {/* Chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* ── Expanded detail ── */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${C.border}`, animation: "mrFadeIn 0.2s ease" }}>
          <div className="mr-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

            {/* Left — image + description */}
            <div style={{ padding: "20px 20px 24px", borderRight: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.inkFaint, margin: "0 0 14px" }}>
                Aperçu produit
              </p>
              {thumb ? (
                <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", background: "#f4f3f0" }}>
                  <img src={thumb} alt={name} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ) : (
                <div style={{ aspectRatio: "4/3", borderRadius: 10, background: "#f4f3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.3"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
              {pd?.description && (
                <p style={{ fontSize: 12, color: C.inkLight, lineHeight: 1.7, margin: "12px 0 0", fontWeight: 300 }}>
                  {pd.description.slice(0, 200)}{pd.description.length > 200 ? "…" : ""}
                </p>
              )}
            </div>

            {/* Right — details */}
            <div style={{ padding: "20px 20px 24px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.inkFaint, margin: "0 0 4px" }}>
                Détails
              </p>
              <InfoRow label="Réf." value={<span style={{ fontFamily: "monospace", fontSize: 11, color: C.inkLight }}>#{r._id.slice(-8).toUpperCase()}</span>} />
              <InfoRow label="Produit" value={name} />
              {category && <InfoRow label="Catégorie" value={category} />}
              <InfoRow label="Prix unitaire" value={price != null ? `${fmt(price)} DT` : "—"} />
              <InfoRow label="Quantité" value={String(r.quantity)} />
              <InfoRow label="Total" value={<span style={{ fontWeight: 700, color: C.accent }}>{fmt(r.totalPrice)} DT</span>} />
              <InfoRow label="Statut" value={<StatusBadge status={r.status} />} />
              <InfoRow label="Créée le" value={new Date(r.createdAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "long", year: "numeric" })} />
              {scheduled && <InfoRow label="Date prévue" value={scheduled} />}

              {r.notes && (
                <div style={{ marginTop: 14, padding: "10px 12px", background: "#fafaf8", borderRadius: 8, borderLeft: `2px solid ${C.border}` }}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.inkFaint, margin: "0 0 4px" }}>Note</p>
                  <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{r.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
});

/* ─── Skeleton ───────────────────────────────────────────── */
const Skeleton = () => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="mr-sk" style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="mr-sk" style={{ width: "25%", height: 10, marginBottom: 8, borderRadius: 4 }} />
        <div className="mr-sk" style={{ width: "55%", height: 14, marginBottom: 8, borderRadius: 4 }} />
        <div className="mr-sk" style={{ width: "35%", height: 10, borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div className="mr-sk" style={{ width: 84, height: 24, borderRadius: 20 }} />
        <div className="mr-sk" style={{ width: 64, height: 16, borderRadius: 4 }} />
      </div>
    </div>
  </div>
);

/* ─── Main page ──────────────────────────────────────────── */
export default function MyReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<EnrichedReservation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey]   = useState<SortKey>("date_desc");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    if (!user) return;
    api.getMyReservations()
      .then(async (data) => {
        const list = data as unknown as MyReservation[];
        const enriched = await Promise.all(list.map(async (r) => {
          if (!r.product?._id) return r;
          try { return { ...r, productDetail: await api.getProduct(r.product._id) }; }
          catch { return r; }
        }));
        setReservations(enriched);
      })
      .catch(() => setError("Impossible de charger vos réservations."))
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = useCallback((id: string) => setExpanded(p => p === id ? null : id), []);

  const filtered = useMemo(() => {
    let list = [...reservations];
    if (filterStatus !== "all") list = list.filter(r => r.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => (r.productDetail?.name || r.product?.name || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (sortKey === "date_desc")  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "date_asc")   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "price_desc") return b.totalPrice - a.totalPrice;
      return a.totalPrice - b.totalPrice;
    });
  }, [reservations, filterStatus, search, sortKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reservations.length };
    reservations.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [reservations]);

  /* Stats per status */
  const statsRow = (["pending", "confirmed", "completed", "cancelled"] as ReservationStatus[]).map(s => ({
    ...STATUS[s], count: counts[s] || 0, key: s,
  })).filter(s => s.count > 0);

  const initials = user?.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes mrFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes mrSk { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .mr-sk {
          background: linear-gradient(90deg, #efefed 25%, #e6e6e3 50%, #efefed 75%);
          background-size: 400px 100%;
          animation: mrSk 1.4s ease-in-out infinite;
        }
        .mr-input {
          width: 100%; padding: 10px 14px 10px 38px;
          background: #fff; border: 1px solid ${C.border}; border-radius: 10px;
          font-size: 13px; color: ${C.ink}; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mr-input:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px rgba(13,56,117,0.08); }
        .mr-input::placeholder { color: ${C.inkFaint}; }
        .mr-select {
          padding: 10px 32px 10px 12px; background: #fff;
          border: 1px solid ${C.border}; border-radius: 10px;
          font-size: 12px; color: ${C.inkMid}; font-family: 'DM Sans', sans-serif;
          outline: none; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='https://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
          transition: border-color 0.2s;
        }
        .mr-select:focus { border-color: ${C.accent}; }
        .mr-filter-btn {
          padding: 7px 14px; border-radius: 20px; border: 1px solid ${C.border};
          background: #fff; font-size: 11px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; color: ${C.inkLight};
          transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;
        }
        .mr-filter-btn:hover { border-color: ${C.borderHover}; color: ${C.inkMid}; }
        .mr-filter-btn.active { background: ${C.accent}; border-color: ${C.accent}; color: #fff; }
        .mr-filter-btn.active .mr-count { background: rgba(255,255,255,0.2); color: #fff; }
        .mr-count { background: #f0f0ee; color: ${C.inkLight}; border-radius: 10px; padding: 1px 7px; font-size: 10px; font-weight: 600; }
        @media (max-width: 600px) {
          .mr-controls { flex-direction: column !important; }
          .mr-detail-grid { grid-template-columns: 1fr !important; }
          .mr-detail-grid > div:first-child { border-right: none !important; border-bottom: 1px solid ${C.border}; }
          .mr-stats { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Header band ── */}
        <div style={{ background: C.accent, paddingTop: 88, paddingBottom: 40, paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 600, color: "#fff", flexShrink: 0,
                letterSpacing: "0.02em",
              }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
                  Espace client
                </p>
                <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(24px,4vw,34px)", color: "#fff", fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
                  Mes réservations
                </h1>
              </div>
            </div>

            {/* Stats chips */}
            {!loading && statsRow.length > 0 && (
              <div className="mr-stats" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {statsRow.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setFilterStatus(s.key as FilterStatus)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 20,
                      background: filterStatus === s.key ? "#fff" : "rgba(255,255,255,0.12)",
                      border: "1px solid",
                      borderColor: filterStatus === s.key ? "#fff" : "rgba(255,255,255,0.2)",
                      color: filterStatus === s.key ? C.accent : "rgba(255,255,255,0.8)",
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
                    {s.label}
                    <span style={{ fontWeight: 700 }}>{s.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 80px" }}>

          {/* Controls */}
          {!loading && !error && reservations.length > 0 && (
            <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="mr-controls" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input className="mr-input" type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="mr-select" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
                  {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {FILTER_OPTS.map(o => (
                  <button key={o.value} className={`mr-filter-btn${filterStatus === o.value ? " active" : ""}`}
                    onClick={() => setFilterStatus(o.value)}>
                    {o.label}
                    {(counts[o.value] ?? 0) > 0 && (
                      <span className="mr-count">{counts[o.value]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && [1, 2, 3].map(i => <Skeleton key={i} />)}

          {/* Error */}
          {!loading && error && (
            <div style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px" }}>
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && reservations.length === 0 && (
            <div style={{ textAlign: "center", padding: "72px 20px" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: "#fff",
                border: `1px solid ${C.border}`, display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 20px",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.inkFaint} strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p style={{ fontSize: 16, color: C.inkMid, margin: "0 0 6px", fontWeight: 400 }}>Aucune réservation</p>
              <p style={{ fontSize: 13, color: C.inkFaint, margin: "0 0 24px" }}>Parcourez nos produits et effectuez votre première réservation.</p>
              <Link to="/produits" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.accent, color: "#fff", textDecoration: "none",
                fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "11px 24px", borderRadius: 8,
              }}>
                Voir le catalogue
              </Link>
            </div>
          )}

          {/* No filter results */}
          {!loading && !error && reservations.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.inkLight }}>
              <p style={{ fontSize: 13, margin: 0 }}>Aucun résultat pour ces filtres.</p>
            </div>
          )}

          {/* List */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <p style={{ fontSize: 11, color: C.inkFaint, letterSpacing: "0.04em", margin: "0 0 12px" }}>
                {filtered.length} réservation{filtered.length > 1 ? "s" : ""}
                {(filterStatus !== "all" || search) && " · filtrées"}
              </p>
              {filtered.map(r => (
                <ReservationCard key={r._id} reservation={r} isOpen={expanded === r._id} onToggle={() => toggle(r._id)} />
              ))}
            </>
          )}

        </div>
      </div>
    </>
  );
}
