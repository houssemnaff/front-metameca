
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type ProductImage = { filename: string; url: string };

type Product = {
  _id: string;
  name: string;
  price: number;
  category?: string;
  family?: string;
  images?: ProductImage[];
  description?: string;
};

type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";

type MyReservation = {
  _id: string;
  status: ReservationStatus;
  createdAt: string;
  scheduledDate?: string;
  notes?: string;
  quantity: number;
  totalPrice: number;
  product?: {
    _id: string;
    name: string;
    category?: string;
    images?: ProductImage[];
    price?: number;
  };
};

type EnrichedReservation = MyReservation & { productDetail?: Product };

type SortKey = "date_desc" | "date_asc" | "price_desc" | "price_asc";
type FilterStatus = "all" | ReservationStatus;

/* ─── Constants ─────────────────────────────────────────────────────────── */

const STATUS_META: Record<ReservationStatus, { label: string; color: string; bg: string; dot: string; border: string }> = {
  pending:   { label: "En attente",  color: "#92400e", bg: "#fffbeb", dot: "#f59e0b", border: "#fde68a" },
  confirmed: { label: "Confirmée",   color: "#1e40af", bg: "#eff6ff", dot: "#3b82f6", border: "#bfdbfe" },
  completed: { label: "Terminée",    color: "#065f46", bg: "#f0fdf4", dot: "#10b981", border: "#a7f3d0" },
  cancelled: { label: "Annulée",     color: "#991b1b", bg: "#fff5f5", dot: "#ef4444", border: "#fecaca" },
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_desc",  label: "Plus récentes" },
  { value: "date_asc",   label: "Plus anciennes" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "price_asc",  label: "Prix croissant" },
];

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all",       label: "Toutes" },
  { value: "pending",   label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "completed", label: "Terminées" },
  { value: "cancelled", label: "Annulées" },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const StatusBadge = memo(({ status }: { status: ReservationStatus }) => {
  const m = STATUS_META[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "4px 10px", borderRadius: 20,
      background: m.bg, color: m.color,
      border: `1px solid ${m.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
});

const ReservationGallery = memo(({ images, name }: { images?: ProductImage[]; name?: string }) => {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div style={{
        width: "100%", aspectRatio: "4/3", borderRadius: 12,
        background: "#f7f7f5", border: "1px solid #efefed",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 8, color: "#d0cfc8",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span style={{ fontSize: 11, letterSpacing: "0.08em" }}>Aucune image</span>
      </div>
    );
  }

  const go = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i + dir + images.length) % images.length);
  };

  return (
    <div>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#f7f7f5" }}>
        <img
          src={images[idx].url}
          alt={name}
          loading="lazy"
          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", transition: "opacity 0.2s" }}
        />
        {images.length > 1 && (
          <>
            {[{ dir: -1 as const, side: "left", icon: "M15 18 9 12 15 6" }, { dir: 1 as const, side: "right", icon: "M9 18 15 12 9 6" }].map(({ dir, side, icon }) => (
              <button key={side} onClick={go(dir)} style={{
                position: "absolute", [side]: 8, top: "50%", transform: "translateY(-50%)",
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.9)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"><polyline points={icon}/></svg>
              </button>
            ))}
            <div style={{
              position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "3px 9px",
              fontSize: 10, color: "#fff", letterSpacing: "0.06em",
            }}>
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} style={{
              width: 40, height: 40, borderRadius: 7, padding: 0, cursor: "pointer",
              border: i === idx ? "2px solid #1a1a1a" : "1px solid #e8e8e5",
              overflow: "hidden", background: "none", flexShrink: 0, transition: "border-color 0.15s",
            }}>
              <img src={img.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const SkeletonCard = () => (
  <div style={{
    background: "#fff", border: "1px solid #efefed", borderRadius: 16,
    padding: "20px 24px", marginBottom: 8,
  }}>
    <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.sk{background:linear-gradient(90deg,#f5f5f3 25%,#eeeeeb 50%,#f5f5f3 75%);background-size:400px 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:6px;}`}</style>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div className="sk" style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="sk" style={{ width: "30%", height: 10, marginBottom: 8 }} />
        <div className="sk" style={{ width: "55%", height: 14, marginBottom: 8 }} />
        <div className="sk" style={{ width: "40%", height: 10 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div className="sk" style={{ width: 80, height: 22, borderRadius: 20 }} />
        <div className="sk" style={{ width: 60, height: 17 }} />
      </div>
    </div>
  </div>
);

const ReservationCard = memo(({
  reservation, isOpen, onToggle,
}: {
  reservation: EnrichedReservation;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const r = reservation;
  const pd = r.productDetail;
  const images = pd?.images || r.product?.images || [];
  const thumbSrc = images[0]?.url;
  const name = pd?.name || r.product?.name || "—";
  const category = pd?.category || r.product?.category;
  const price = pd?.price ?? r.product?.price;

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isOpen ? "#d8d8d5" : "#efefed"}`,
      borderRadius: 16, overflow: "hidden", marginBottom: 8,
      boxShadow: isOpen ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
      transition: "box-shadow 0.25s, border-color 0.25s",
    }}
      onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLDivElement).style.borderColor = "#dededb"; }}
      onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLDivElement).style.borderColor = "#efefed"; }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 10, flexShrink: 0, overflow: "hidden",
          border: "1px solid #efefed", background: "#f7f7f5",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {thumbSrc ? (
            <img src={thumbSrc} alt={name} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {category && (
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", margin: "0 0 3px" }}>
              {category}
            </p>
          )}
          <p style={{ fontSize: 14, fontWeight: 500, color: "#111", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </p>
          <p style={{ fontSize: 12, color: "#bbb", margin: 0, fontWeight: 300 }}>
            {r.quantity} unité{r.quantity > 1 ? "s" : ""} · {new Date(r.createdAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <StatusBadge status={r.status} />
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#111", fontWeight: 400 }}>
            {r.totalPrice.toLocaleString("fr-TN")} TND
          </span>
        </div>

        <svg
          style={{ color: "#ccc", flexShrink: 0, marginLeft: 4, transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{
          borderTop: "1px solid #f3f3f0",
          padding: "0 22px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 28,
          animation: "fadeSlideIn 0.22s ease",
        }}>
          <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Left — gallery + description */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", margin: "20px 0 12px" }}>
              Produit{images.length > 0 ? ` · ${images.length} photo${images.length > 1 ? "s" : ""}` : ""}
            </p>
            <ReservationGallery images={images} name={name} />
            {pd?.description && (
              <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.75, fontWeight: 300, marginTop: 10 }}>
                {pd.description}
              </p>
            )}
          </div>

          {/* Right — info rows */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", margin: "20px 0 12px" }}>
              Détails de la commande
            </p>

            {[
              { key: "Référence", val: <span style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.06em" }}>#{r._id.slice(-8).toUpperCase()}</span> },
              { key: "Produit", val: name },
              ...(category ? [{ key: "Catégorie", val: category }] : []),
              { key: "Prix unitaire", val: price != null ? `${price.toLocaleString("fr-TN")} TND` : "—" },
              { key: "Quantité", val: String(r.quantity) },
              { key: "Total", val: <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, color: "#111" }}>{r.totalPrice.toLocaleString("fr-TN")} TND</span> },
              { key: "Statut", val: <StatusBadge status={r.status} /> },
              { key: "Créée le", val: new Date(r.createdAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "long", year: "numeric" }) },
              ...(r.scheduledDate ? [{ key: "Date prévue", val: new Date(r.scheduledDate).toLocaleDateString("fr-TN", { day: "2-digit", month: "long", year: "numeric" }) }] : []),
            ].map(({ key, val }, i, arr) => (
              <div key={key} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #f5f5f2" : "none",
                fontSize: 13,
              }}>
                <span style={{ color: "#aaa", fontWeight: 300 }}>{key}</span>
                <span style={{ color: "#222", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{val}</span>
              </div>
            ))}

            {r.notes && (
              <div style={{
                marginTop: 16, padding: "12px 14px", background: "#fafaf8",
                borderRadius: 9, borderLeft: "2px solid #e8e8e3",
                fontSize: 12, color: "#777", fontStyle: "italic", lineHeight: 1.7, fontWeight: 300,
              }}>
                <span style={{ fontStyle: "normal", fontWeight: 500, color: "#aaa", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Note</span>
                {r.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/* ─── Main page ─────────────────────────────────────────────────────────── */

export default function MyReservationsPage() {
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState<EnrichedReservation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey]           = useState<SortKey>("date_desc");
  const [search, setSearch]             = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .getMyReservations()
      .then(async (data) => {
        const list = data as unknown as MyReservation[];
        const enriched = await Promise.all(
          list.map(async (r) => {
            if (!r.product?._id) return r;
            try {
              const productDetail = await api.getProduct(r.product._id);
              return { ...r, productDetail };
            } catch {
              return r;
            }
          })
        );
        setReservations(enriched);
      })
      .catch(() => setError("Impossible de charger vos réservations."))
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = useCallback((id: string) => {
    setExpanded(p => p === id ? null : id);
  }, []);

  const filtered = useMemo(() => {
    let list = [...reservations];

    if (filterStatus !== "all") {
      list = list.filter(r => r.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => {
        const name = r.productDetail?.name || r.product?.name || "";
        return name.toLowerCase().includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortKey === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "date_asc")  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === "price_desc") return b.totalPrice - a.totalPrice;
      if (sortKey === "price_asc")  return a.totalPrice - b.totalPrice;
      return 0;
    });

    return list;
  }, [reservations, filterStatus, search, sortKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reservations.length };
    reservations.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [reservations]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        *{box-sizing:border-box;}
        .rp-input{
          width:100%; padding:9px 14px 9px 36px;
          background:#fafaf8; border:1px solid #efefed; border-radius:9px;
          font-size:13px; color:#222; font-family:'DM Sans',sans-serif;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .rp-input:focus{ border-color:#c8c8c4; box-shadow:0 0 0 3px rgba(0,0,0,0.04); }
        .rp-input::placeholder{ color:#bbb; }
        .rp-select{
          padding:8px 32px 8px 12px; background:#fafaf8;
          border:1px solid #efefed; border-radius:9px;
          font-size:12px; color:#555; font-family:'DM Sans',sans-serif;
          outline:none; cursor:pointer; appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23aaa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 10px center;
          transition:border-color 0.2s;
        }
        .rp-select:focus{ border-color:#c8c8c4; }
        .rp-filter-btn{
          padding:7px 14px; border-radius:20px; border:1px solid #efefed;
          background:#fafaf8; font-size:11px; font-weight:500;
          font-family:'DM Sans',sans-serif; cursor:pointer; color:#888;
          transition:all 0.15s; white-space:nowrap; letter-spacing:0.03em;
          display:inline-flex; align-items:center; gap:5px;
        }
        .rp-filter-btn:hover{ border-color:#d8d8d5; color:#555; }
        .rp-filter-btn.active{ background:#1a1a1a; border-color:#1a1a1a; color:#fff; }
        .rp-logout{
          display:inline-flex; align-items:center; gap:6px; margin-top:10px;
          font-size:12px; color:#bbb; background:none; border:1px solid #ebebeb;
          border-radius:7px; padding:5px 12px; cursor:pointer;
          font-family:'DM Sans',sans-serif; transition:all 0.2s;
        }
        .rp-logout:hover{ border-color:#ccc; color:#777; }
        @media(max-width:560px){
          .rp-controls{ flex-direction:column !important; }
          .rp-filters{ flex-wrap:wrap !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fafaf8", padding: "108px 20px 80px", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#bbb", margin: "0 0 8px" }}>
              Espace client
            </p>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,38px)", color: "#111", fontWeight: 400, margin: "0 0 5px", lineHeight: 1.15 }}>
              Mes réservations
            </h1>
            {user && (
              <p style={{ fontSize: 13, color: "#bbb", margin: 0, fontWeight: 300 }}>
                {user.name} · {user.email}
              </p>
            )}
          
          </div>

          {/* Controls */}
          {!loading && !error && reservations.length > 0 && (
            <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Search + Sort */}
              <div className="rp-controls" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    className="rp-input"
                    type="text"
                    placeholder="Rechercher par produit…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="rp-select" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Filter tabs */}
              <div className="rp-filters" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
                {FILTER_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    className={`rp-filter-btn${filterStatus === o.value ? " active" : ""}`}
                    onClick={() => setFilterStatus(o.value)}
                  >
                    {o.label}
                    {counts[o.value] > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: filterStatus === o.value ? "rgba(255,255,255,0.2)" : "#ebebeb",
                        color: filterStatus === o.value ? "#fff" : "#888",
                        borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center",
                      }}>
                        {counts[o.value]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && [1, 2, 3].map(i => <SkeletonCard key={i} />)}

          {/* Error */}
          {!loading && error && (
            <div style={{ fontSize: 13, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px" }}>
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && reservations.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "#f3f3f0",
                border: "1px solid #ebebe8", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 20px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <p style={{ fontSize: 15, color: "#aaa", margin: "0 0 6px", fontWeight: 400 }}>Aucune réservation</p>
              <p style={{ fontSize: 13, color: "#ccc", margin: 0, fontWeight: 300 }}>Vos réservations apparaîtront ici une fois créées.</p>
            </div>
          )}

          {/* No results after filter */}
          {!loading && !error && reservations.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
              <p style={{ fontSize: 13, margin: 0 }}>Aucun résultat pour ces filtres.</p>
            </div>
          )}

          {/* List */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "#bbb", letterSpacing: "0.04em", margin: "0 0 16px" }}>
                {filtered.length} réservation{filtered.length > 1 ? "s" : ""}
                {(filterStatus !== "all" || search) && <span style={{ color: "#d0cfc8" }}> · filtrées</span>}
              </p>
              {filtered.map(r => (
                <ReservationCard
                  key={r._id}
                  reservation={r}
                  isOpen={expanded === r._id}
                  onToggle={() => toggle(r._id)}
                />
              ))}
            </>
          )}

        </div>
      </div>
    </>
  );
}
