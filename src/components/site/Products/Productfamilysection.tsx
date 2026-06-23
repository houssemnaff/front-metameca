import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */
interface FamilyProduct {
  _id: string;
  name: string;
  price: number | string;
  category?: string;
  images: { url: string }[];
  status: "active" | "inactive";
  family?: string;
}

/* ─────────────────────────── Tokens ────────────────────────── */
const T = {
  bg:        "#ffffff",
  surface:   "#ffffff",
  border:    "#e4e0d8",
  text:      "#111111",
  muted:     "#0f4fd4",
  faint:     "#c8c4bc",
  warm:      "#ede9e2",
  accent:    "#1a1a2e",
  blue:      "#0f4fd4",
};

/* ─────────────────────────── Skeleton Card ─────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      flexShrink: 0,
      width: 220,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <div style={{
        width: "100%",
        aspectRatio: "3/4",
        borderRadius: 10,
        background: `linear-gradient(90deg, ${T.warm} 25%, #e8e4dc 50%, ${T.warm} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 2px" }}>
        <div style={{ height: 10, width: "70%", borderRadius: 4, background: T.warm, animation: "shimmer 1.6s ease-in-out infinite" }} />
        <div style={{ height: 10, width: "40%", borderRadius: 4, background: T.warm, animation: "shimmer 1.6s 0.1s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Product Card ──────────────────── */
function FamilyCard({ product, currentId }: { product: FamilyProduct; currentId?: string }) {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isActive  = product._id === currentId;
  const image     = product.images?.[0]?.url;

  return (
    <div
      onClick={() => navigate(`/produits/${product._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 220,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: isActive ? 1 : 1,
      }}
    >
      {/* Image */}
      <div style={{
        width: "100%",
        aspectRatio: "3/4",
        borderRadius: 10,
        overflow: "hidden",
        background: T.warm,
        position: "relative",
        outline: isActive ? `2px solid ${T.accent}` : "none",
        outlineOffset: 2,
      }}>
        {image ? (
          <img
            src={image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.faint, fontSize: 11,
          }}>
            —
          </div>
        )}

        {/* Active badge */}
        {isActive && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: T.accent, color: "#fff",
            fontSize: 8, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 3,
          }}>
            Affiché
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: hovered ? "rgba(0,0,0,0.03)" : "transparent",
          transition: "background 0.3s",
          borderRadius: 10,
        }} />
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 2px" }}>
        <p style={{
          fontSize: 12, fontWeight: 500, color: T.text,
          margin: 0, lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          transition: "color 0.2s",
        }}>
          {product.name}
        </p>
        <p style={{
          fontSize: 13, fontWeight: 600,
          color: hovered ? T.blue : T.muted,
          margin: 0, letterSpacing: "-0.01em",
          transition: "color 0.2s",
        }}>
          {Number(product.price).toLocaleString("fr-TN")} DT
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Nav Arrow ─────────────────────── */
function NavArrow({
  direction, onClick, visible,
}: { direction: "left" | "right"; onClick: () => void; visible: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top: "38%",
        [direction]: -20,
        transform: "translateY(-50%)",
        zIndex: 10,
        width: 40, height: 40,
        borderRadius: "50%",
        background: hovered ? T.accent : T.surface,
        border: `1px solid ${hovered ? T.accent : T.border}`,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hovered ? "#fff" : T.text,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "all 0.2s",
        boxShadow: hovered ? "0 4px 16px rgba(26,26,46,0.18)" : "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      {direction === "left"
        ? <ChevronLeft size={16} />
        : <ChevronRight size={16} />
      }
    </button>
  );
}

/* ─────────────────────────── Main Component ────────────────── */
interface Props {
  family: string;
  currentProductId?: string;
}

export default function ProductFamilySection({ family, currentProductId }: Props) {
  const [products, setProducts]   = useState<FamilyProduct[]>([]);
  const [loading, setLoading]     = useState(true);
  const [canLeft, setCanLeft]     = useState(false);
  const [canRight, setCanRight]   = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ── */
  useEffect(() => {
    if (!family) return;
    setLoading(true);

    const base = import.meta.env.VITE_API_URL ;
    fetch(`${base}/products?family=${encodeURIComponent(family)}`)
      .then(r => r.json())
      .then((data: FamilyProduct[]) => {
        const active = Array.isArray(data)
          ? data.filter(p => p.status === "active")
          : [];
        setProducts(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [family]);

  /* ── Scroll state ── */
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, [products, updateArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
  };

  /* ── Drag scroll ── */
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.active || !trackRef.current) return;
    const x    = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.2;
    trackRef.current.scrollLeft = drag.current.scrollLeft - walk;
  };

  const onMouseUp = () => {
    drag.current.active = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab";
      trackRef.current.style.userSelect = "";
    }
  };

  /* ── Guards ── */
  if (!family) return null;
  if (!loading && products.length === 0) return null;

  const title = family.charAt(0).toUpperCase() + family.slice(1).toLowerCase();

  return (
    <section style={{
      width: "100%",
      background: T.bg,
      paddingTop: 72,
      paddingBottom: 80,
    }}>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 48px" }}>

        {/* ── Section header ── */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 40,
          paddingBottom: 24,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", color: T.faint,
              margin: "0 0 8px",
            }}>
              Collection
            </p>
            <h2 style={{
              fontSize: 28, fontWeight: 400, color: T.text,
              margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1,
              fontStyle: "italic",
            }}>
              {title}
            </h2>
          </div>

          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
            {loading ? "" : `${products.length} pièce${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Carousel ── */}
        <div style={{ position: "relative" }}>

          {/* Nav arrows */}
          <NavArrow direction="left"  onClick={() => scroll("left")}  visible={canLeft}  />
          <NavArrow direction="right" onClick={() => scroll("right")} visible={canRight} />

          {/* Track */}
          <div
            ref={trackRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              overflowY: "hidden",
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              cursor: "grab",
              paddingBottom: 4,
              /* hide scrollbar */
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Webkit scrollbar hide via style tag */}
            <style>{`
              .family-track::-webkit-scrollbar { display: none; }
              @keyframes shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>

            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 220, scrollSnapAlign: "start" }}>
                    <SkeletonCard />
                  </div>
                ))
              : products.map(p => (
                  <div key={p._id} style={{ flexShrink: 0, scrollSnapAlign: "start" }}>
                    <FamilyCard product={p} currentId={currentProductId} />
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </section>
  );
}