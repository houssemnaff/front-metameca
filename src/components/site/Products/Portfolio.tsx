import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../../utils/api";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number | string;
  stock?: number | string;
  category?: string;
  status: "active" | "inactive";
  images: { url: string }[];
  slug?: string;
}

const MAX_VISIBLE = 6;

/* ── Scroll reveal hook ── */
function useReveal(threshold = 0.12) {
  const ref     = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

/* ── Hero card (first / featured product) ── */
function HeroCard({ product, delay }: { product: Product; delay: number }) {
  const [hovered, setHovered] = useState(false);
  const { ref, vis } = useReveal(0.08);

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <Link
        to={`/produits/${product._id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block",
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          borderRadius: 2,
          background: "#1a1916",
          textDecoration: "none",
        }}
      >
        {/* Image */}
        {product.images?.[0]?.url && (
          <img
            src={product.images[0].url}
            alt={product.name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 1600ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.6s ease",
              transform: hovered ? "scale(1.07)" : "scale(1.02)",
              opacity: hovered ? 0.82 : 0.72,
            }}
          />
        )}

        {/* Cinematic vignette — soft, not harsh */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,9,7,0.55) 100%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,9,7,0.88) 0%, rgba(10,9,7,0.1) 55%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Category chip */}
        {product.category && (
          <div style={{
            position: "absolute", top: 28, left: 32,
            fontSize: 9, letterSpacing: "0.22em",
            textTransform: "uppercase", fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "4px 10px", borderRadius: 1,
            backdropFilter: "blur(8px)",
            background: "rgba(255,255,255,0.06)",
          }}>
            {product.category}
          </div>
        )}

        {/* Arrow */}
        <div style={{
          position: "absolute", top: 28, right: 32,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translate(0,0)" : "translate(4px,-4px)",
          transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <ArrowUpRight size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
        </div>

        {/* Content */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 32px 36px",
        }}>
          <h3 style={{
            fontSize: "clamp(22px, 3vw, 38px)",
            fontWeight: 300,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#fff",
            margin: "0 0 10px",
            maxWidth: 520,
          }}>
            {product.name}
          </h3>
          {product.description && (
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.48)",
              lineHeight: 1.65, maxWidth: 400, margin: "0 0 18px",
              fontWeight: 400,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}>
              {product.description}
            </p>
          )}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: "#ffffff", letterSpacing: "0.04em",
            }}>
              {Number(product.price).toLocaleString("fr-TN")} DT
            </span>
            <div style={{
              height: 1, width: hovered ? 48 : 24,
              background: "rgba(201,169,110,0.6)",
              transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
            }} />
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Standard cinematic card ── */
function ShowroomCard({
  product, delay, ratio = "3/4", large = false,
}: {
  product: Product; delay: number; ratio?: string; large?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { ref, vis } = useReveal(0.1);

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.85s ease ${delay}ms, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <Link
        to={`/produits/${product._id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block",
          position: "relative",
          width: "100%",
          aspectRatio: ratio,
          overflow: "hidden",
          borderRadius: 2,
          background: "#1c1a17",
          textDecoration: "none",
        }}
      >
        {/* Image */}
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 1400ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.5s",
              transform: hovered ? "scale(1.08)" : "scale(1.02)",
              opacity: hovered ? 0.78 : 0.68,
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.18)", fontSize: 12, letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            — —
          </div>
        )}

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(10,9,7,0.9) 0%, rgba(10,9,7,0.05) 50%, transparent 100%)",
        }} />

        {/* Category */}
        {product.category && (
          <div style={{
            position: "absolute",
            top: 18, left: 20,
            fontSize: 8, letterSpacing: "0.2em",
            textTransform: "uppercase", fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
          }}>
            {product.category}
          </div>
        )}

        {/* Hover arrow */}
        <div style={{
          position: "absolute", top: 16, right: 18,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translate(0,0) rotate(0deg)" : "translate(6px,-6px) rotate(-10deg)",
          transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <ArrowUpRight size={15} style={{ color: "rgba(201,169,110,0.85)" }} />
        </div>

        {/* Text */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: large ? "0 22px 26px" : "0 18px 20px",
        }}>
          <h3 style={{
            fontSize: large ? "clamp(16px,2vw,22px)" : "clamp(14px,1.5vw,17px)",
            fontWeight: 400,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            color: "#f0ece4",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            margin: "0 0 8px",
          }}>
            {product.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, color: "#ffffff",
              letterSpacing: "0.04em",
            }}>
              {Number(product.price).toLocaleString("fr-TN")} DT
            </span>
            <div style={{
              height: 1,
              width: hovered ? 36 : 0,
              background: "rgba(201,169,110,0.5)",
              transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
            }} />
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton({ ratio = "4/5" }: { ratio?: string }) {
  return (
    <div style={{
      aspectRatio: ratio, borderRadius: 2,
      background: "linear-gradient(90deg, #1c1a17 25%, #252318 50%, #1c1a17 75%)",
      backgroundSize: "200% 100%",
      animation: "skShimmer 1.8s ease-in-out infinite",
    }} />
  );
}

/* ── Filter bar ── */
function FilterBar({
  categories, active, onChange,
}: {
  categories: string[]; active: string; onChange: (c: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{
      position: "relative",
      marginBottom: 56,
    }}>
      {/* Fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
        background: "linear-gradient(to right, #faf9f6, transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
        background: "linear-gradient(to left, #faf9f6, transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />

      <div
        ref={trackRef}
        style={{
          display: "flex", gap: 0,
          overflowX: "auto", scrollbarWidth: "none",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              style={{
                flexShrink: 0,
                padding: "12px 28px 11px",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#1c1a17" : "rgba(0,0,0,0.35)",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom: isActive ? "2px solid #1c1a17" : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ── */
export function Portfolio() {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive]     = useState<string>("Tous");
  const [loading, setLoading]   = useState(true);
  const { ref: headerRef, vis: headerVis } = useReveal(0.1);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getProducts({});
        setProducts(data.filter((p: Product) => p.status === "active"));
      } catch (err) {
        console.error("Erreur chargement produits:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = [
    "Tous",
    ...Array.from(new Set(
      products.map((p) => p.category).filter((c): c is string => !!c && c.trim() !== "")
    )),
  ];

  const filtered = active === "Tous" ? products : products.filter((p) => p.category === active);
  const visible  = filtered.slice(0, MAX_VISIBLE);
  const hasMore  = filtered.length > MAX_VISIBLE;

  const [hero, second, third, ...rest] = visible;

  return (
    <section
      id="projets"
      className="pf-section"
      style={{ background: "#ffffff", padding: "100px 0 96px", position: "relative" }}
    >
      <style>{`
        @keyframes skShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .pf-section { padding: 64px 0 60px !important; }
          .pf-inner { padding: 0 16px !important; }
          .pf-row2 { grid-template-columns: 1fr !important; }
          .pf-row3 { grid-template-columns: 1fr !important; }
          .pf-skeleton-row { grid-template-columns: 1fr !important; }
          .pf-header { margin-bottom: 40px !important; }
        }
        @media (max-width: 480px) {
          .pf-section { padding: 48px 0 40px !important; }
        }
      `}</style>

      <div className="pf-inner" style={{ width: "100%", margin: 0, padding: "0 24px" }}>

        {/* ── Header ── */}
        <div
          ref={headerRef}
          style={{
            marginBottom: 64,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            opacity: headerVis ? 1 : 0,
            transform: headerVis ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ height: 1, width: 40, background: "rgba(201,169,110,0.6)" }} />
            <span style={{
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 600, color: "#ffffff",
            }}>
              Réalisations
            </span>
          </div>

          {/* Title + subtitle row */}
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", gap: 24,
            flexWrap: "wrap",
          }}>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 60px)",
              fontWeight: 300,
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1a1816",
              margin: 0,
            }}>
              Nos{" "}
              <span style={{ fontStyle: "normal", fontWeight: 300 }}>créations</span>
            </h2>

            <p style={{
              fontSize: 13, color: "rgba(0,0,0,0.4)", lineHeight: 1.7,
              maxWidth: 320, margin: 0, fontWeight: 400,
              paddingBottom: 6,
            }}>
              Chaque pièce est conçue avec exigence —<br />
              entre geste artisanal et précision industrielle.
            </p>
          </div>
        </div>

        {/* ── Filter bar ── */}
        {!loading && categories.length > 1 && (
          <FilterBar categories={categories} active={active} onChange={setActive} />
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton ratio="16/9" />
            <div className="pf-skeleton-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Skeleton ratio="3/4" />
              <Skeleton ratio="3/4" />
              <Skeleton ratio="3/4" />
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && filtered.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "96px 0",
            color: "rgba(0,0,0,0.28)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.4 }}>—</div>
            <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
              Aucune pièce dans cette collection
            </p>
          </div>
        )}

        {/* ── Showroom Layout ── */}
        {!loading && visible.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Row 1: Hero full-width */}
            {hero && <HeroCard product={hero} delay={0} />}

            {/* Row 2: 3-column asymmetric (tall / short / tall) */}
            {(second || third) && (
              <div className="pf-row2" style={{ display: "grid", gridTemplateColumns: "5fr 4fr 5fr", gap: 12 }}>
                {second && <ShowroomCard product={second} delay={80}  ratio="4/5" large />}
                {third  && <ShowroomCard product={third}  delay={160} ratio="4/5" />}
                {rest[0] && <ShowroomCard product={rest[0]} delay={240} ratio="4/5" large />}
              </div>
            )}

            {/* Row 3: 2-column wide landscape */}
            {rest.slice(1).length > 0 && (
              <div className="pf-row3" style={{
                display: "grid",
                gridTemplateColumns: rest.slice(1).length === 1 ? "1fr" : "3fr 2fr",
                gap: 12,
              }}>
                {rest.slice(1, 3).map((p, i) => (
                  <ShowroomCard
                    key={p._id}
                    product={p}
                    delay={320 + i * 80}
                    ratio={rest.slice(1).length === 1 ? "21/9" : i === 0 ? "16/9" : "4/3"}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        {!loading && (
          <div style={{
            marginTop: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            paddingTop: 36,
            flexWrap: "wrap",
            gap: 20,
          }}>
            <p style={{
              fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(0,0,0,0.3)", fontWeight: 500, margin: 0,
            }}>
              {hasMore
                ? `${visible.length} pièces affichées sur ${filtered.length}`
                : `${filtered.length} pièce${filtered.length !== 1 ? "s" : ""} dans la collection`
              }
            </p>

            <Link
              to="/produits"
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                textDecoration: "none",
                fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                fontWeight: 600, color: "#1a1816",
                borderBottom: "1px solid rgba(0,0,0,0.25)",
                paddingBottom: 3,
                transition: "border-color 0.3s, color 0.3s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#341010";
                (e.currentTarget as HTMLAnchorElement).style.color = "#341010";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,0,0,0.25)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#1a1816";
              }}
            >
              {hasMore ? "Voir toutes les pièces" : "Parcourir le catalogue"}
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}