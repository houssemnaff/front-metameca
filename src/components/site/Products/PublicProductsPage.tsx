  /**
   * PublicProductsPage — Premium Editorial E-Commerce Redesign
   *
   * Component structure:
   *   PublicProductsPage          root, state, data fetching
   *   ├─ HeroFeature              cinematic full-width featured product
   *   ├─ StickyBar                glassmorphism filter/search/sort bar
   *   ├─ ActiveFilterChips        pill chips for active filters
   *   ├─ FilterDrawer             slide-in filter panel (category + price)
   *   ├─ CollectionSection        horizontal-scroll "Netflix" section
   *   │   └─ EditorialCard        hover-reveal magazine card
   *   ├─ EditorialGrid            main paginated product grid
   *   │   └─ EditorialCard
   *   └─ Pagination               minimal numbered pagination
   *
   * Design language: luxury-minimal editorial
   *   - Typefaces: "Cormorant Garamond" (display) + "DM Sans" (UI)
   *   - Palette: warm-white ground, near-black ink, petrol-blue accent
   *   - Motion: CSS transitions + IntersectionObserver fade-in-up
   *   - Layout: asymmetric grid, generous whitespace, zero heavy borders
   */

  import {
    useState, useEffect, useMemo, useRef, useCallback,
  } from "react";
  import {
    Search, X, SlidersHorizontal, ChevronLeft, ChevronRight,
    ArrowRight, ArrowUpRight,
  } from "lucide-react";
  import { Link } from "react-router-dom";
  import { api } from "../../../utils/api";

  /* ─────────────────────────────────────────────
    TYPES
  ───────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────
    DESIGN TOKENS
  ───────────────────────────────────────────── */
  const T = {
    // Ground palette
    cream:       "#ffffff",
    parchment:   "#f2ede4",
    border:      "#e8e3da",
    borderHover: "#cfc9bc",

    // Ink
    ink:         "#111008",
    inkMid:      "#4a4538",
    inkLight:    "#9e9587",

    // Accent — petrol blue
    accent:      "#0d3875",
    accentSoft:  "#e8eef8",
    accentMid:   "#3565b8",

    // Semantics
    success:     "#3a6b28",
    amber:       "#9e6b20",
    danger:      "#8f3333",

    // Typography
    fontDisplay: "'Cormorant Garamond', 'Georgia', serif",
    fontUI:      "'DM Sans', 'Helvetica Neue', sans-serif",
  };

  /* ─────────────────────────────────────────────
    CONSTANTS
  ───────────────────────────────────────────── */
  const PER_PAGE   = 12;
  const SORT_OPTS  = [
    { value: "default",    label: "Mise en avant" },
    { value: "price_asc",  label: "Prix croissant" },
    { value: "price_desc", label: "Prix décroissant" },
    { value: "name_asc",   label: "A → Z" },
    { value: "name_desc",  label: "Z → A" },
  ];

  /* ─────────────────────────────────────────────
    GLOBAL STYLES (injected once)
  ───────────────────────────────────────────── */
  const GLOBAL_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');



    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    .ppe-fade-up {
      opacity: 0;
      transition: opacity 0.7s ease, transform 0.7s ease;
      transform: translateY(18px);
    }
    .ppe-fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .ppe-skeleton {
      background: linear-gradient(90deg, ${T.parchment} 25%, #ede8df 50%, ${T.parchment} 75%);
      background-size: 600px 100%;
      animation: shimmer 1.6s infinite;
    }
    /* Hide scrollbar but keep scroll */
    .ppe-scroll-row::-webkit-scrollbar { display: none; }
    .ppe-scroll-row { -ms-overflow-style: none; scrollbar-width: none; }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  `;

  function GlobalStyles() {
    useEffect(() => {
      const id = "ppe-global-styles";
      if (document.getElementById(id)) return;
      const el = document.createElement("style");
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }, []);
    return null;
  }

  /* ─────────────────────────────────────────────
    FADE-IN HOOK
  ───────────────────────────────────────────── */
  function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
        { threshold: 0.08 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    return ref;
  }

  /* ─────────────────────────────────────────────
    HELPERS
  ───────────────────────────────────────────── */
  const fmt = (n: number | string) =>
    Number(n).toLocaleString("fr-TN", { minimumFractionDigits: 0 });

  function stockLabel(stock: number | string | undefined): { text: string; color: string } | null {
    if (stock === undefined) return null;
    const n = Number(stock);
    if (n === 0)  return { text: "Épuisé",         color: T.danger };
    if (n < 5)   return { text: `${n} restants`,   color: T.amber };
    return         { text: "En stock",             color: T.success };
  }

  /* ─────────────────────────────────────────────
    HERO FEATURE
  ───────────────────────────────────────────── */
  function HeroFeature({ product: p }: { product: Product | null }) {
    const [loaded, setLoaded] = useState(false);
    if (!p) return null;
    const imgUrl = p.images?.[0]?.url;

    return (
      <section style={{ position: "relative", width: "100%", height: "min(88vh, 720px)", overflow: "hidden", background: T.parchment }}>
        {/* Background image */}
        {imgUrl && (
          <img
            src={imgUrl}
            alt={p.name}
            onLoad={() => setLoaded(true)}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              opacity: loaded ? 1 : 0,
              transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}

        {/* Cinematic gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(8,6,2,0.72) 0%, rgba(8,6,2,0.38) 45%, rgba(8,6,2,0.08) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "0 6vw 7vh",
          maxWidth: 900,
        }}>
          {p.category && (
            <p style={{
              fontFamily: T.fontUI, fontSize: 11, fontWeight: 500,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)", marginBottom: 16,
              animation: "fadeUp 0.8s ease both",
            }}>
              {p.category}
            </p>
          )}
          <h1 style={{
            fontFamily: T.fontDisplay, fontSize: "clamp(38px, 5.5vw, 76px)",
            fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.01em",
            color: "#fff", marginBottom: 20,
            animation: "fadeUp 0.9s 0.08s ease both",
          }}>
            {p.name}
          </h1>
          {p.description && (
            <p style={{
              fontFamily: T.fontUI, fontSize: 15, fontWeight: 300,
              color: "rgba(255,255,255,0.65)", maxWidth: 440, lineHeight: 1.65,
              marginBottom: 32,
              animation: "fadeUp 0.9s 0.14s ease both",
            }}>
              {p.description.slice(0, 140)}{p.description.length > 140 ? "…" : ""}
            </p>
          )}
          <div style={{
            display: "flex", alignItems: "center", gap: 24,
            animation: "fadeUp 0.9s 0.22s ease both",
          }}>
            <Link
              to={`/produits/${p._id}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "#fff", color: T.ink,
                fontFamily: T.fontUI, fontSize: 13, fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase",
                textDecoration: "none",
                padding: "14px 28px", borderRadius: 2,
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = T.accent;
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.color = T.ink;
              }}
            >
              Découvrir <ArrowRight size={14} />
            </Link>
            <span style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
              {fmt(p.price)} DT
            </span>
          </div>
        </div>

        {/* Bottom label bar */}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          padding: "10px 24px",
          background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
        }}>
          <p style={{ fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
            À la une
          </p>
        </div>
      </section>
    );
  }

  /* ─────────────────────────────────────────────
    EDITORIAL CARD (grid + horizontal scroll)
  ───────────────────────────────────────────── */
  interface CardProps { product: Product; size?: "normal" | "tall" }
function EditorialCard({ product: p, size = "normal" }: CardProps) {
  const [hovered, setHovered] = useState(false);

  const ratio = size === "tall" ? "2/3" : "3/4";
  const stock = stockLabel(p.stock);
  const outStock = Number(p.stock) === 0 && p.stock !== undefined;

  const mainImage = p.images?.[0]?.url;
  const hoverImage = p.images?.[1]?.url;

  return (
    <Link
      to={`/produits/${p._id}`}
      style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          aspectRatio: ratio,
          overflow: "hidden",
          background: T.parchment,
          flexShrink: 0,
        }}
      >
        {mainImage ? (
          <>
            {/* Image principale */}
            <img
              src={mainImage}
              alt={p.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: hovered && hoverImage ? 0 : 1,
                transform: hovered ? "scale(1.07)" : "scale(1)",
                transition: "opacity 0.5s ease, transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            />

            {/* Image hover */}
            {hoverImage && (
              <img
                src={hoverImage}
                alt={p.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? "scale(1.07)" : "scale(1)",
                  transition: "opacity 0.5s ease, transform 0.65s cubic-bezier(0.25, 0.46, 0.94)",
                }}
              />
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: T.fontUI, fontSize: 11, color: T.inkLight }}>
              —
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hovered
              ? "linear-gradient(to top, rgba(8,6,2,0.55) 0%, rgba(8,6,2,0.12) 55%, transparent 100%)"
              : "linear-gradient(to top, rgba(8,6,2,0.22) 0%, transparent 60%)",
            transition: "background 0.4s ease",
          }}
        />

        {/* OUT OF STOCK */}
        {outStock && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              fontFamily: T.fontUI,
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.9)",
              color: T.inkMid,
              padding: "4px 10px",
            }}
          >
            Épuisé
          </span>
        )}

        {/* Hover overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px 16px 16px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          <span
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 22,
              fontWeight: 500,
              color: "#fff",
            }}
          >
            {fmt(p.price)} DT
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: T.fontUI,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "#fff",
              color: T.ink,
              padding: "8px 14px",
            }}
          >
            Voir <ArrowUpRight size={11} />
          </span>
        </div>
      </div>

      {/* CAPTION */}
      <div style={{ paddingTop: 12 }}>
        {p.category && (
          <p
            style={{
              fontFamily: T.fontUI,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.inkLight,
              marginBottom: 5,
            }}
          >
            {p.category}
          </p>
        )}

        <h3
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.3,
            color: T.ink,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: 6,
          }}
        >
          {p.name}
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 17,
              fontWeight: 500,
              color: hovered ? T.inkLight : T.accent,
              transition: "color 0.3s",
            }}
          >
            {fmt(p.price)} DT
          </span>

          {stock && (
            <span style={{ fontFamily: T.fontUI, fontSize: 11, color: stock.color }}>
              {stock.text}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

  /* ─────────────────────────────────────────────
    COLLECTION SECTION (horizontal Netflix scroll)
  ───────────────────────────────────────────── */
  interface CollectionProps {
    title: string;
    subtitle?: string;
    products: Product[];
    ctaLabel?: string;
    onCta?: () => void;
  }

  function CollectionSection({ title, subtitle, products, ctaLabel, onCta }: CollectionProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const fadeRef = useFadeIn();
    const [canLeft, setCanLeft]  = useState(false);
    const [canRight, setCanRight] = useState(true);

    const scroll = (dir: "left" | "right") => {
      const el = rowRef.current;
      if (!el) return;
      el.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
    };

    const onScroll = useCallback(() => {
      const el = rowRef.current;
      if (!el) return;
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    }, []);

    if (!products.length) return null;

    return (
      <div ref={fadeRef} className="ppe-fade-up" style={{ marginBottom: 72 }}>
        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: 28, paddingBottom: 16,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <h2 style={{
              fontFamily: T.fontDisplay, fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 400, color: T.ink, lineHeight: 1.1, marginBottom: 6,
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkLight, fontWeight: 300 }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {ctaLabel && (
              <button
                onClick={onCta}
                style={{
                  fontFamily: T.fontUI, fontSize: 12, fontWeight: 500,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: T.accent, background: "none", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  textDecoration: "underline", textUnderlineOffset: 3, paddingRight: 8,
                }}
              >
                {ctaLabel} <ArrowRight size={12} />
              </button>
            )}
            <button
              onClick={() => scroll("left")}
              disabled={!canLeft}
              aria-label="Précédent"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1px solid ${canLeft ? T.borderHover : T.border}`,
                background: "none", cursor: canLeft ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: canLeft ? T.inkMid : T.inkLight,
                transition: "all 0.2s",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canRight}
              aria-label="Suivant"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1px solid ${canRight ? T.borderHover : T.border}`,
                background: "none", cursor: canRight ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: canRight ? T.inkMid : T.inkLight,
                transition: "all 0.2s",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll row */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="ppe-scroll-row"
          style={{
            display: "flex", gap: 20,
            overflowX: "auto", paddingBottom: 4,
          }}
        >
          {products.map(p => (
            <div key={p._id} style={{ flex: "0 0 220px" }}>
              <EditorialCard product={p} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    EDITORIAL GRID (main paginated area)
  ───────────────────────────────────────────── */
  function EditorialGrid({ products }: { products: Product[] }) {
    const ref = useFadeIn();
    if (!products.length) return null;

    return (
      <div
        ref={ref}
        className="ppe-fade-up"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: "44px 28px",
        }}
      >
        {products.map((p, i) => (
          <EditorialCard key={p._id} product={p} size={i % 7 === 0 ? "tall" : "normal"} />
        ))}
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    SKELETON GRID
  ───────────────────────────────────────────── */
  function SkeletonGrid() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "44px 28px" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="ppe-skeleton" style={{ aspectRatio: "3/4", borderRadius: 2, marginBottom: 12 }} />
            <div className="ppe-skeleton" style={{ height: 11, width: "50%", borderRadius: 2, marginBottom: 8 }} />
            <div className="ppe-skeleton" style={{ height: 16, width: "80%", borderRadius: 2, marginBottom: 8 }} />
            <div className="ppe-skeleton" style={{ height: 16, width: "35%", borderRadius: 2 }} />
          </div>
        ))}
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    STICKY BAR (glassmorphism)
  ───────────────────────────────────────────── */
  interface StickyBarProps {
    search: string;
    onSearch: (v: string) => void;
    sort: string;
    onSort: (v: string) => void;
    filtersOpen: boolean;
    onToggleFilters: () => void;
    activeFilterCount: number;
    resultCount: number;
    title: string;
  }

  function StickyBar({
    search, onSearch, sort, onSort, filtersOpen, onToggleFilters,
    activeFilterCount, resultCount, title,
  }: StickyBarProps) {
    return (
      <div style={{
        position: "sticky", top: 72, zIndex: 40,
        background: "rgba(250,249,246,0.82)",
        backdropFilter: "blur(18px) saturate(1.4)",
        WebkitBackdropFilter: "blur(18px) saturate(1.4)",
        borderBottom: `1px solid ${T.border}`,
        marginBottom: 0,
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "14px 24px",
          display: "flex", alignItems: "center", gap: 16,
          justifyContent: "space-between",
        }}>
          {/* Left: title + count */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexShrink: 0 }}>
            <h2 style={{
              fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400,
              color: T.ink, letterSpacing: "-0.01em",
            }}>
              {title}
            </h2>
            <span style={{ fontFamily: T.fontUI, fontSize: 12, color: T.inkLight }}>
              {resultCount} produit{resultCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Right: controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.inkLight, pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => onSearch(e.target.value)}
                style={{
                  fontFamily: T.fontUI, fontSize: 13, color: T.ink,
                  background: T.cream, border: `1px solid ${T.border}`,
                  borderRadius: 2, padding: "8px 30px 8px 32px",
                  outline: "none", width: 190,
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = T.border)}
              />
              {search && (
                <button
                  onClick={() => onSearch("")}
                  style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.inkLight, display: "flex" }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => onSort(e.target.value)}
              style={{
                fontFamily: T.fontUI, fontSize: 12, color: T.inkMid,
                background: T.cream, border: `1px solid ${T.border}`,
                borderRadius: 2, padding: "8px 12px", outline: "none", cursor: "pointer",
              }}
            >
              {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filter toggle */}
            <button
              onClick={onToggleFilters}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: T.fontUI, fontSize: 12, fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "8px 14px", borderRadius: 2, cursor: "pointer",
                border: `1px solid ${filtersOpen ? T.accent : T.border}`,
                background: filtersOpen ? T.accentSoft : "transparent",
                color: filtersOpen ? T.accent : T.inkMid,
                transition: "all 0.2s",
              }}
            >
              <SlidersHorizontal size={13} />
              Filtres
              {activeFilterCount > 0 && (
                <span style={{
                  background: T.accent, color: "#fff",
                  fontFamily: T.fontUI, fontSize: 10, fontWeight: 500,
                  padding: "2px 6px", borderRadius: 10,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    FILTER DRAWER
  ───────────────────────────────────────────── */
  interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;          // ← nouveau
  categories: string[];
  activeCategory: string;
  onCategory: (c: string) => void;
  priceMin: string;
  priceMax: string;
  onPriceMin: (v: string) => void;
  onPriceMax: (v: string) => void;
  onReset: () => void;
  hasActive: boolean;
}
function FilterDrawer({
  open, onClose, categories, activeCategory, onCategory,
  priceMin, priceMax, onPriceMin, onPriceMax, onReset, hasActive,
}: FilterDrawerProps) {
  return (
    <>
      {/* Backdrop — clique dessus pour fermer */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(17,16,8,0.28)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.32s ease",
        }}
      />

      {/* Panel latéral — glisse depuis la droite */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(360px, 88vw)",
        zIndex: 91,
        background: T.cream,
        borderLeft: `1px solid ${T.border}`,
        boxShadow: open ? "-16px 0 56px rgba(0,0,0,0.07)" : "none",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), box-shadow 0.38s ease",
        overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}>

        {/* En-tête sticky */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "26px 28px 22px",
          borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, background: T.cream, zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SlidersHorizontal size={15} color={T.inkMid} />
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.ink }}>
              Filtres
            </h3>
            {hasActive && (
              <span style={{
                background: T.accent, color: "#fff",
                fontFamily: T.fontUI, fontSize: 9, fontWeight: 500,
                letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "3px 8px", borderRadius: 10,
              }}>
                actifs
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: `1px solid ${T.border}`,
              background: "none", cursor: "pointer", color: T.inkMid,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = T.borderHover;
              (e.currentTarget as HTMLElement).style.color = T.ink;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = T.border;
              (e.currentTarget as HTMLElement).style.color = T.inkMid;
            }}
            aria-label="Fermer les filtres"
          >
            <X size={14} />
          </button>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 36 }}>

          {/* Catégories */}
          <div>
            <p style={{
              fontFamily: T.fontUI, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: T.inkLight, marginBottom: 14,
            }}>
              Catégorie
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {categories.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategory(cat)}
                    style={{
                      fontFamily: T.fontUI, fontSize: 14,
                      fontWeight: active ? 500 : 400,
                      color: active ? T.accent : T.inkMid,
                      background: active ? T.accentSoft : "transparent",
                      border: "none",
                      borderLeft: `2px solid ${active ? T.accent : "transparent"}`,
                      padding: "10px 14px",
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.18s",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = T.parchment;
                        (e.currentTarget as HTMLElement).style.color = T.ink;
                        (e.currentTarget as HTMLElement).style.borderLeftColor = T.borderHover;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = T.inkMid;
                        (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                      }
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Prix */}
          <div>
            <p style={{
              fontFamily: T.fontUI, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: T.inkLight, marginBottom: 14,
            }}>
              Prix (DT)
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {([ ["Min", priceMin, onPriceMin], ["Max", priceMax, onPriceMax] ] as const).map(([label, val, setter]) => (
                <div key={label} style={{ flex: 1 }}>
                  <label style={{
                    fontFamily: T.fontUI, fontSize: 11,
                    color: T.inkLight, display: "block", marginBottom: 6,
                  }}>
                    {label}
                  </label>
                  <input
                    type="number"
                    placeholder="—"
                    value={val}
                    onChange={e => setter(e.target.value)}
                    style={{
                      fontFamily: T.fontUI, fontSize: 14, color: T.ink,
                      width: "100%", background: "#fff",
                      border: `1px solid ${T.border}`,
                      padding: "10px 12px", outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = T.accent)}
                    onBlur={e => (e.currentTarget.style.borderColor = T.border)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pied sticky — bouton reset */}
        {hasActive && (
          <div style={{
            padding: "20px 28px",
            borderTop: `1px solid ${T.border}`,
            position: "sticky", bottom: 0, background: T.cream,
          }}>
            <button
              onClick={onReset}
              style={{
                width: "100%",
                fontFamily: T.fontUI, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: T.accent, background: "none",
                border: `1px solid ${T.accent}`,
                padding: "13px 24px", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.accentSoft}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </>
  );
}

  /* ─────────────────────────────────────────────
    ACTIVE FILTER CHIPS
  ───────────────────────────────────────────── */
  interface ChipsProps {
    activeCategory: string;
    search: string;
    priceMin: string;
    priceMax: string;
    onCategory: (c: string) => void;
    onSearch: (v: string) => void;
    onPrices: () => void;
    onReset: () => void;
  }

  function ActiveFilterChips({ activeCategory, search, priceMin, priceMax, onCategory, onSearch, onPrices, onReset }: ChipsProps) {
    const chips = [
      activeCategory !== "Tous" && { label: activeCategory, onRemove: () => onCategory("Tous") },
      (priceMin || priceMax) && { label: `${priceMin || "0"} — ${priceMax || "∞"} DT`, onRemove: onPrices },
      search && { label: `« ${search} »`, onRemove: () => onSearch("") },
    ].filter(Boolean) as { label: string; onRemove: () => void }[];

    if (!chips.length) return null;

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, paddingTop: 4 }}>
        {chips.map(chip => (
          <span
            key={chip.label}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontFamily: T.fontUI, fontSize: 12, color: T.accent,
              background: T.accentSoft,
              border: `1px solid ${T.accent}22`,
              padding: "5px 12px",
            }}
          >
            {chip.label}
            <button onClick={chip.onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, display: "flex", padding: 0 }}>
              <X size={11} />
            </button>
          </span>
        ))}
        <button
          onClick={onReset}
          style={{
            fontFamily: T.fontUI, fontSize: 12, color: T.inkLight,
            background: "none", border: "none", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3, padding: 0,
          }}
        >
          Tout effacer
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    PAGINATION
  ───────────────────────────────────────────── */
  function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (n: number) => void }) {
    if (total <= 1) return null;

    const pages = Array.from({ length: total }, (_, i) => i + 1);
    const show = (n: number) => n === 1 || n === total || Math.abs(n - page) <= 1;
    const gap  = (n: number) => (n === 2 && page > 4) || (n === total - 1 && page < total - 3);

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Prev */}
          <button
            onClick={() => onChange(page - 1)} disabled={page === 1}
            style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: `1px solid ${T.border}`, cursor: page === 1 ? "default" : "pointer", color: T.inkMid, opacity: page === 1 ? 0.3 : 1, transition: "all 0.15s" }}
            aria-label="Page précédente"
          >
            <ChevronLeft size={15} />
          </button>

          {pages.map(n => {
            if (!show(n)) return null;
            if (gap(n)) return <span key={n} style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkLight, padding: "0 4px" }}>…</span>;
            const active = n === page;
            return (
              <button
                key={n}
                onClick={() => onChange(n)}
                style={{
                  width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.fontUI, fontSize: 13, fontWeight: active ? 500 : 400,
                  background: active ? T.ink : "none",
                  color: active ? "#fff" : T.inkMid,
                  border: `1px solid ${active ? T.ink : T.border}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {n}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => onChange(page + 1)} disabled={page === total}
            style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: `1px solid ${T.border}`, cursor: page === total ? "default" : "pointer", color: T.inkMid, opacity: page === total ? 0.3 : 1, transition: "all 0.15s" }}
            aria-label="Page suivante"
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <p style={{ fontFamily: T.fontUI, fontSize: 12, color: T.inkLight }}>
          Page {page} sur {total}
        </p>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    EMPTY STATE
  ───────────────────────────────────────────── */
  function EmptyState({ onReset }: { onReset: () => void }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px", gap: 20, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Search size={20} color={T.inkLight} />
        </div>
        <div>
          <p style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.ink, marginBottom: 8 }}>Aucun produit trouvé</p>
          <p style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkLight, fontWeight: 300 }}>Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
        <button
          onClick={onReset}
          style={{
            fontFamily: T.fontUI, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em",
            textTransform: "uppercase", color: T.accent, background: "none",
            border: `1px solid ${T.accent}`, padding: "10px 24px", cursor: "pointer",
            marginTop: 4,
          }}
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    DIVIDER
  ───────────────────────────────────────────── */
  function SectionDivider({ label }: { label: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "64px 0 48px" }}>
        <div style={{ flex: 1, height: 1, background: T.border }} />
        <p style={{ fontFamily: T.fontUI, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: T.inkLight, flexShrink: 0 }}>
          {label}
        </p>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>
    );
  }

  /* ─────────────────────────────────────────────
    ROOT — PublicProductsPage
  ───────────────────────────────────────────── */
  export function PublicProductsPage() {
    const [products, setProducts]       = useState<Product[]>([]);
    const [loading, setLoading]         = useState(true);
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [search, setSearch]           = useState("");
    const [sort, setSort]               = useState("default");
    const [page, setPage]               = useState(1);
    const [priceMin, setPriceMin]       = useState("");
    const [priceMax, setPriceMax]       = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Fetch
    useEffect(() => {
      (async () => {
        try {
          const data = await api.getProducts({});
          setProducts(data.filter((p: Product) => p.status === "active"));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      })();
    }, []);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [activeCategory, search, sort, priceMin, priceMax]);

    // Derived
    const categories = useMemo(() => [
      "Tous",
      ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c && c.trim() !== ""))),
    ], [products]);

    // Hero = first product with an image
    const heroProduct = useMemo(() =>
      products.find(p => p.images?.[0]?.url) ?? null
    , [products]);

    // Collection sections (use first 12 products each as demo;
    // in production replace with real tags/flags from your API)
    const bestSellers  = useMemo(() => products.slice(0, 12), [products]);
    const newArrivals  = useMemo(() => [...products].reverse().slice(0, 12), [products]);

    // Filtered list
    const filtered = useMemo(() => {
      let list = activeCategory === "Tous" ? products : products.filter(p => p.category === activeCategory);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q)
        );
      }
      if (priceMin !== "") list = list.filter(p => Number(p.price) >= Number(priceMin));
      if (priceMax !== "") list = list.filter(p => Number(p.price) <= Number(priceMax));
      switch (sort) {
        case "price_asc":  return [...list].sort((a, b) => Number(a.price) - Number(b.price));
        case "price_desc": return [...list].sort((a, b) => Number(b.price) - Number(a.price));
        case "name_asc":   return [...list].sort((a, b) => a.name.localeCompare(b.name));
        case "name_desc":  return [...list].sort((a, b) => b.name.localeCompare(a.name));
        default:           return list;
      }
    }, [products, activeCategory, search, sort, priceMin, priceMax]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
const collectionRef = useRef<HTMLDivElement>(null);
    const hasActiveFilters   = activeCategory !== "Tous" || !!search.trim() || !!priceMin || !!priceMax;
    const activeFilterCount  = [activeCategory !== "Tous", !!search.trim(), !!(priceMin || priceMax)].filter(Boolean).length;
    const resetFilters = () => {
      setActiveCategory("Tous"); setSearch(""); setPriceMin(""); setPriceMax(""); setSort("default");
    };
const goPage = (n: number) => {
  setPage(n);
  if (collectionRef.current) {
    const top = collectionRef.current.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }
};

    // Whether we're in a filtered/search state (show grid, hide collections)
    const isFiltered = hasActiveFilters || sort !== "default";

    return (
      <div style={{ minHeight: "100vh", background: T.cream, fontFamily: T.fontUI }}>
        <GlobalStyles />

        {/* ── HERO ── */}
        {!loading && !isFiltered && heroProduct && (
          <HeroFeature product={heroProduct} />
        )}

        {/* ── STICKY BAR ── */}
        <StickyBar
          search={search} onSearch={setSearch}
          sort={sort} onSort={setSort}
          filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen(v => !v)}
          activeFilterCount={activeFilterCount}
          resultCount={filtered.length}
          title={activeCategory === "Tous" ? "Notre collection" : activeCategory}
        />

        {/* ── FILTER DRAWER ── */}
       {/* ── FILTER DRAWER (portal fixe, hors flux) ── */}
<FilterDrawer
  open={filtersOpen}
  onClose={() => setFiltersOpen(false)}   // ← nouveau
  categories={categories}
  activeCategory={activeCategory} onCategory={setActiveCategory}
  priceMin={priceMin} priceMax={priceMax}
  onPriceMin={setPriceMin} onPriceMax={setPriceMax}
  onReset={resetFilters}
  hasActive={hasActiveFilters}
/>

        {/* ── MAIN CONTENT ── */}
     <div
  ref={collectionRef}  
  style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 96px" }}
>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div style={{ paddingTop: 24 }}>
              <ActiveFilterChips
                activeCategory={activeCategory} search={search}
                priceMin={priceMin} priceMax={priceMax}
                onCategory={setActiveCategory} onSearch={setSearch}
                onPrices={() => { setPriceMin(""); setPriceMax(""); }}
                onReset={resetFilters}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ paddingTop: 48 }}>
              <SkeletonGrid />
            </div>
          )}

          {/* Filtered / search results → straight grid */}
          {!loading && isFiltered && (
            <div style={{ paddingTop: hasActiveFilters ? 0 : 40 }}>
              {filtered.length === 0
                ? <EmptyState onReset={resetFilters} />
                : (
                  <>
                   <div ref={collectionRef}>
  <EditorialGrid products={paginated} />
  <Pagination page={page} total={totalPages} onChange={goPage} />
</div>
                  </>
                )
              }
            </div>
          )}

          {/* Default state → collections + grid */}
          {!loading && !isFiltered && (
            <>
              {/* Best Sellers */}
              {bestSellers.length > 0 && (
                <div style={{ paddingTop: 64 }}>
                  <CollectionSection
                    title="Meilleures ventes"
                    subtitle="Les préférés de nos clients"
                    products={bestSellers}
                  
                    onCta={() => setActiveCategory("Tous")}
                  />
                </div>
              )}

              {/* New Arrivals */}
              {newArrivals.length > 0 && (
                <CollectionSection
                  title="Nouveautés"
                  subtitle="Les dernières arrivées"
                  products={newArrivals}
                
                  onCta={() => setSort("default")}
                />
              )}

              {/* Category Sections */}
              {categories.filter(c => c !== "Tous").map(cat => {
                const catProducts = products.filter(p => p.category === cat);
                if (catProducts.length < 3) return null;
                return (
                  <CollectionSection
                    key={cat}
                    title={cat}
                    products={catProducts}
                    ctaLabel="Voir tout"
                    onCta={() => setActiveCategory(cat)}
                  />
                );
              })}

              {/* All products grid */}
             <div ref={collectionRef}>
  <SectionDivider label="Toute la collection" />
  <EditorialGrid products={paginated} />
  <Pagination page={page} total={totalPages} onChange={goPage} />
</div>
            </>
          )}
        </div>
      </div>
    );
  }