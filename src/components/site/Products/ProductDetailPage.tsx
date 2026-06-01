/**
 * ProductDetailPage — Premium Immersive Redesign
 * + Auth-guarded reservation (useReservationGuard)
 *
 * Changes vs. original:
 *  1. Import useReservationGuard hook
 *  2. Replace direct setReserving(true) calls with handleReserve(product._id)
 *  3. ReservationModal is now only shown when the user IS logged in
 *     (the guard handles the unauthenticated redirect)
 *  4. ToastContainer added at root level (if not already in _app / layout)
 */

import {
  useState, useEffect, useCallback, useRef,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeft, ChevronRight, Heart, Share2, CheckCircle,
  X, AlertTriangle, DoorOpen, Footprints, Zap, MoveHorizontal,
  Truck, RotateCcw, ShieldCheck,
  Calendar, User, Mail, Phone, FileText,
} from "lucide-react";
import { api } from "../../../utils/api";
import ProductFamilySection from "./Productfamilysection";
import { useReservationGuard } from "./useReservationGuard"; // ← NEW

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
interface Product {
  _id: string; name: string; description?: string;
  price: number | string; stock?: number | string;
  category?: string; status: "active" | "inactive";
  images: { url: string }[]; slug?: string; family?: string;
}
interface ReservationForm {
  clientName: string; clientEmail: string; clientPhone: string;
  quantity: number; scheduledDate: string; notes: string;
}

/* ═══════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════ */
const T = {
  cream:        "#ffffff",
  parchment:    "#ffffff",
  border:       "#e8e3da",
  ink:          "#0d3875",
  inkMid:       "#4a4538",
  inkLight:     "#9e9587",
  accent:       "#0d3875",
  accentSoft:   "#e8eef8",
  success:      "#3a6b28",
  amber:        "#9e6b20",
  danger:       "#8f3333",
  fontDisplay:  "'Cormorant Garamond', Georgia, serif",
  fontUI:       "'DM Sans', 'Helvetica Neue', sans-serif",
};

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes pdpFadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pdpFadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pdpSlideUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pdpSpin     { to { transform:rotate(360deg); } }
  @keyframes lbFadeIn    { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }

  .pdp-reveal { opacity:0; transform:translateY(28px); transition: opacity 0.75s ease, transform 0.75s ease; }
  .pdp-reveal.visible { opacity:1; transform:translateY(0); }

  .pdp-hscroll::-webkit-scrollbar { display:none; }
  .pdp-hscroll { -ms-overflow-style:none; scrollbar-width:none; }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
`;

function GlobalStyles() {
  useEffect(() => {
    const id = "pdp-global";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL HOOK
═══════════════════════════════════════════ */
function useReveal<T extends HTMLElement = HTMLDivElement>(delay = 0) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => el.classList.add("visible"), delay); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmt = (n: number | string) => Number(n).toLocaleString("fr-TN", { minimumFractionDigits: 0 });

/* ═══════════════════════════════════════════
   HERO GALLERY
═══════════════════════════════════════════ */
interface HeroGalleryProps {
  images: { url: string }[];
  activeIdx: number;
  onThumbClick: (i: number) => void;
  onLightbox: (i: number) => void;
}

function HeroGallery({ images, activeIdx, onThumbClick, onLightbox }: HeroGalleryProps) {
  if (!images.length) return (
    <div style={{ width: "100%", height: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkLight }}>Aucune image</span>
    </div>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "80vh", overflow: "hidden", background: T.parchment }}>
      {images.map((img, i) => (
        <img
          key={img.url}
          src={img.url}
          alt=""
          onClick={() => onLightbox(i)}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "contain", objectPosition: "center",
            opacity: i === activeIdx ? 1 : 0,
            transform: i === activeIdx ? "scale(1)" : "scale(1.04)",
            transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)",
            cursor: "zoom-in",
          }}
        />
      ))}

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom, transparent 55%, rgba(10,8,4,0.45) 100%)",
      }} />

      <div style={{
        position: "absolute", top: 24, right: 24,
        fontFamily: T.fontUI, fontSize: 11, letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.6)",
        background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)",
        padding: "5px 12px",
      }}>
        {activeIdx + 1} / {images.length}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => onThumbClick((activeIdx - 1 + images.length) % images.length)}
            aria-label="Image précédente"
            style={arrowBtn("left")}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onThumbClick((activeIdx + 1) % images.length)}
            aria-label="Image suivante"
            style={arrowBtn("right")}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 6,
        }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onThumbClick(i)}
              style={{
                width: i === activeIdx ? 44 : 36,
                height: i === activeIdx ? 44 : 36,
                overflow: "hidden", padding: 0, cursor: "pointer",
                border: `2px solid ${i === activeIdx ? "#fff" : "rgba(255,255,255,0.3)"}`,
                opacity: i === activeIdx ? 1 : 0.55,
                transition: "all 0.3s ease",
                background: "none", flexShrink: 0,
              }}
            >
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function arrowBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [side]: 20,
    width: 44, height: 44, borderRadius: "50%",
    background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", transition: "background 0.2s",
  };
}

/* ═══════════════════════════════════════════
   FLOATING INFO OVERLAY
   onReserve now receives the guard handler
═══════════════════════════════════════════ */
interface FloatingInfoProps {
  product: Product;
  wishlist: boolean; onWishlist: () => void;
  copied: boolean;   onShare: () => void;
  onReserve: () => void; // ← called with guard logic from root
  outOfStock: boolean;
}

function FloatingInfo({ product: p, wishlist, onWishlist, copied, onShare, onReserve, outOfStock }: FloatingInfoProps) {
  const stockNum = Number(p.stock);
  const lowStock = !outOfStock && stockNum > 0 && stockNum < 5;

  return (
    <div style={{
      position: "absolute",
      right: 48,
      top: "50%",
      transform: "translateY(-50%)",
      width: "420px",
      background: "rgba(250,249,246,0.82)",
      backdropFilter: "blur(22px) saturate(1.6)",
      WebkitBackdropFilter: "blur(22px) saturate(1.6)",
      border: "1px solid rgba(232,227,218,0.6)",
      padding: "28px 32px",
      animation: "pdpFadeUp 1s 0.3s ease both",
      zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        {p.category && (
          <span style={{ fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: T.inkLight }}>
            {p.category}
          </span>
        )}
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <button onClick={onShare} style={iconBtn}>
            {copied ? <CheckCircle size={14} style={{ color: T.success }} /> : <Share2 size={14} />}
          </button>
          <button onClick={onWishlist} style={{ ...iconBtn, color: wishlist ? "#c0392b" : T.inkMid }}>
            <Heart size={14} fill={wishlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <h1 style={{
        fontFamily: T.fontDisplay, fontSize: "clamp(26px, 3.5vw, 42px)",
        fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.01em",
        color: T.ink, margin: "0 0 14px",
      }}>
        {p.name}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <span style={{
          fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 500,
          color: T.accent, letterSpacing: "-0.01em",
        }}>
          {fmt(p.price)} DT
        </span>
        {p.stock !== undefined && (
          <span style={{
            fontFamily: T.fontUI, fontSize: 11, fontWeight: 400,
            color: outOfStock ? T.danger : lowStock ? T.amber : T.success,
          }}>
            {outOfStock ? "Épuisé" : lowStock ? `${stockNum} restants` : "En stock"}
          </span>
        )}
      </div>

      {/* CTA — now calls onReserve which is the guarded handler */}
      <button
        onClick={onReserve}
        disabled={outOfStock}
        style={{
          width: "100%", padding: "15px 0",
          fontFamily: T.fontUI, fontSize: 12, fontWeight: 500,
          letterSpacing: "0.12em", textTransform: "uppercase",
          background: outOfStock ? T.parchment : T.ink,
          color: outOfStock ? T.inkLight : "#fff",
          border: "none", cursor: outOfStock ? "not-allowed" : "pointer",
          transition: "background 0.25s",
        }}
        onMouseEnter={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = T.accent; }}
        onMouseLeave={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = T.ink; }}
      >
        {outOfStock ? "Produit épuisé" : "Réserver ce produit"}
      </button>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
  background: "none", border: "none", cursor: "pointer", color: T.inkMid,
  transition: "color 0.2s",
};

/* ═══════════════════════════════════════════
   VARIANT STRIP
═══════════════════════════════════════════ */
interface VariantStripProps {
  variants: Product[];
  currentId: string;
  onSelect: (id: string) => void;
}

function VariantStrip({ variants, currentId, onSelect }: VariantStripProps) {
  if (variants.length <= 1) return null;
  const current = variants.find(v => v._id === currentId);

  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{
        fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.18em",
        textTransform: "uppercase", color: T.inkLight, marginBottom: 16,
      }}>
        Variante — <span style={{ color: T.ink, fontWeight: 500 }}>{current?.name}</span>
      </p>
      <div className="pdp-hscroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {variants.map(v => {
          const active = v._id === currentId;
          const thumb = v.images?.[0]?.url;
          return (
            <button
              key={v._id}
              onClick={() => onSelect(v._id)}
              title={v.name}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                background: "none", border: "none", cursor: "pointer", padding: 0,
                flexShrink: 0, width: 72,
              }}
            >
              <div style={{
                width: 72, height: 88, overflow: "hidden",
                border: `${active ? 2 : 1}px solid ${active ? T.ink : T.border}`,
                background: T.parchment,
                transition: "border-color 0.25s, border-width 0.25s",
                opacity: active ? 1 : 0.55,
              }}>
                {thumb
                  ? <img src={thumb} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: active ? "scale(1)" : "scale(1.04)", transition: "transform 0.35s" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: T.fontUI, fontSize: 9, color: T.inkLight, textAlign: "center", padding: 4 }}>{v.name.slice(0, 12)}</span>
                    </div>
                }
              </div>
              <span style={{
                fontFamily: T.fontUI, fontSize: 10, color: active ? T.ink : T.inkLight,
                fontWeight: active ? 500 : 400, textAlign: "center", lineHeight: 1.3,
                transition: "color 0.2s", maxWidth: 68,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {v.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STORY SECTION
═══════════════════════════════════════════ */
interface StorySectionProps {
  eyebrow: string;
  headline: string;
  body: string;
  imageUrl?: string;
  flip?: boolean;
  accent?: string;
}

function StorySection({ eyebrow, headline, body, imageUrl, flip = false, accent }: StorySectionProps) {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      className="pdp-reveal"
      style={{
        display: "grid",
        gridTemplateColumns: imageUrl ? (flip ? "1fr 1.1fr" : "1.1fr 1fr") : "1fr",
        gap: 0,
        minHeight: 480,
        overflow: "hidden",
        marginBottom: 2,
      }}
    >
      <div style={{
        order: flip ? 2 : 1,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "72px clamp(32px, 6vw, 80px)",
        background: T.cream,
      }}>
        <p style={{
          fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.2em",
          textTransform: "uppercase", color: accent ?? T.inkLight,
          marginBottom: 20,
        }}>
          {eyebrow}
        </p>
        <h2 style={{
          fontFamily: T.fontDisplay, fontSize: "clamp(30px, 3.8vw, 52px)",
          fontWeight: 400, lineHeight: 1.1, color: T.ink,
          marginBottom: 24, letterSpacing: "-0.01em",
          fontStyle: "italic",
        }}>
          {headline}
        </h2>
        <p style={{
          fontFamily: T.fontUI, fontSize: 15, fontWeight: 300,
          color: T.inkMid, lineHeight: 1.8, maxWidth: 460,
        }}>
          {body}
        </p>
      </div>

      {imageUrl && (
        <div style={{
          order: flip ? 1 : 2,
          position: "relative", overflow: "hidden",
          minHeight: 420, display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: 40, boxSizing: "border-box",
          background: "transparent",
        }}>
          <img
            src={imageUrl}
            alt=""
            style={{
              width: "85%", height: "85%",
              objectFit: "cover", borderRadius: 10,
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            }}
          />
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════
   SPECS SECTION
═══════════════════════════════════════════ */
interface SpecRow { label: string; value: string }
interface SpecsProps { rows: SpecRow[]; }

function SpecsSection({ rows }: SpecsProps) {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      className="pdp-reveal"
      style={{ background: T.parchment, padding: "80px clamp(24px, 8vw, 120px)", marginBottom: 2 }}
    >
      <p style={{ fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.inkLight, marginBottom: 16 }}>
        Dimensions & Spécifications
      </p>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, fontStyle: "italic", color: T.ink, marginBottom: 52, lineHeight: 1.1 }}>
        Conçu dans chaque détail
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ borderTop: `1px solid ${T.border}`, padding: "22px 0 22px 0", paddingRight: 32 }}>
            <p style={{ fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: T.inkLight, marginBottom: 8 }}>
              {label}
            </p>
            <p style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.ink, lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TRUST SECTION
═══════════════════════════════════════════ */
function TrustSection() {
  const ref = useReveal();
  const items = [
    { icon: Truck,       label: "Livraison",   sub: "48 – 72 heures",  detail: "Livré chez vous avec soin, dans les délais." },
    { icon: RotateCcw,   label: "Retours",     sub: "30 jours",        detail: "Retour simple, article dans son emballage d'origine." },
    { icon: ShieldCheck, label: "Garantie",    sub: "Qualité assurée", detail: "Chaque pièce est inspectée avant expédition." },
  ];
  return (
    <section
      ref={ref}
      className="pdp-reveal"
      style={{ background: T.ink, padding: "80px clamp(24px, 8vw, 120px)", marginBottom: 2 }}
    >
      <p style={{ fontFamily: T.fontUI, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
        Notre engagement
      </p>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, fontStyle: "italic", color: "#fff", marginBottom: 56, lineHeight: 1.1 }}>
        Livré avec intention
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48 }}>
        {items.map(({ icon: Icon, label, sub, detail }) => (
          <div key={label}>
            <Icon size={22} style={{ color: "rgba(255,255,255,0.4)", marginBottom: 20 }} />
            <p style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 400, color: "#fff", marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: T.fontUI, fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", marginBottom: 12 }}>{sub}</p>
            <p style={{ fontFamily: T.fontUI, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   STICKY RESERVE BAR (bottom)
═══════════════════════════════════════════ */
interface StickyBarProps {
  product: Product;
  qty: number;
  onQtyChange: (n: number) => void;
  onReserve: () => void; // ← guarded handler passed in
  outOfStock: boolean;
  visible: boolean;
}

function StickyReserveBar({ product: p, qty, onQtyChange, onReserve, outOfStock, visible }: StickyBarProps) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(250,249,246,0.92)",
      backdropFilter: "blur(20px) saturate(1.5)",
      WebkitBackdropFilter: "blur(20px) saturate(1.5)",
      borderTop: `1px solid ${T.border}`,
      transform: visible ? "translateY(0)" : "translateY(100%)",
      transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      padding: "14px 32px",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 400,
            color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {p.name}
          </h3>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 500, color: T.accent }}>
            {fmt(Number(p.price) * qty)} DT
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.border}` }}>
            <button
              onClick={() => onQtyChange(Math.max(1, qty - 1))}
              style={{ width: 36, height: 38, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</button>
            <span style={{ width: 36, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontUI, fontSize: 13, fontWeight: 500, color: T.ink, borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>
              {qty}
            </span>
            <button
              onClick={() => onQtyChange(qty + 1)}
              style={{ width: 36, height: 38, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</button>
          </div>

          <button
            onClick={onReserve}
            disabled={outOfStock}
            style={{
              padding: "12px 36px",
              fontFamily: T.fontUI, fontSize: 12, fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
              background: outOfStock ? T.parchment : T.ink,
              color: outOfStock ? T.inkLight : "#fff",
              border: "none", cursor: outOfStock ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = T.accent; }}
            onMouseLeave={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = T.ink; }}
          >
            {outOfStock ? "Épuisé" : "Réserver"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════ */
function Lightbox({ images, startIndex, onClose }: { images: { url: string }[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose, prev, next]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 10 }}>
        <X size={16} />
      </button>
      <span style={{ position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.4)", fontFamily: T.fontUI, fontSize: 12, letterSpacing: "0.1em" }}>
        {idx + 1} / {images.length}
      </span>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: "absolute", left: 20, ...lbArrow }}><ChevronLeft size={20} /></button>
      )}
      <img key={idx} src={images[idx].url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "80vw", maxHeight: "86vh", objectFit: "contain", animation: "lbFadeIn 0.2s ease" }} />
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: "absolute", right: 20, ...lbArrow }}><ChevronRight size={20} /></button>
      )}
      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {images.map((img, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }} style={{ width: 46, height: 46, overflow: "hidden", padding: 0, border: `2px solid ${i === idx ? "#fff" : "rgba(255,255,255,0.2)"}`, cursor: "pointer", opacity: i === idx ? 1 : 0.4, transition: "all 0.15s", background: "none" }}>
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
const lbArrow: React.CSSProperties = { width: 44, height: 44, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" };

/* ═══════════════════════════════════════════
   BULKY MODAL
═══════════════════════════════════════════ */
function BulkyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  const steps = [{ icon: DoorOpen, label: "Portes et ascenseurs" }, { icon: Footprints, label: "Escaliers" }, { icon: Zap, label: "Points d'accès" }, { icon: MoveHorizontal, label: "Couloirs" }];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <div style={{ width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", background: T.cream, animation: "pdpSlideUp .22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={14} style={{ color: T.amber }} />
            <span style={{ fontFamily: T.fontUI, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ink }}>Pièce volumineuse</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkLight }}><X size={16} /></button>
        </div>
        <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkMid, lineHeight: 1.75 }}>Ce produit est volumineux. Veuillez vérifier que le colis pourra accéder à votre espace.</p>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 20, rowGap: 8, fontSize: 13, border: `1px solid ${T.border}`, padding: "16px 20px" }}>
            <span style={{ color: T.inkLight, fontFamily: T.fontUI }}>Nombre de colis</span><span style={{ fontWeight: 500, color: T.ink, fontFamily: T.fontUI }}>2</span>
            <span style={{ color: T.inkLight, fontFamily: T.fontUI }}>Largeur minimale de porte</span><span style={{ fontWeight: 500, color: T.ink, fontFamily: T.fontUI }}>70 cm</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {steps.map(({ icon: Icon, label }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${T.border}`, padding: "12px 16px" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, fontFamily: T.fontUI }}>{i + 1}</div>
                <span style={{ fontFamily: T.fontUI, fontSize: 12, color: T.ink, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   RESERVATION MODAL
   NOTE: Only rendered when user IS authenticated
   (the guard in root page ensures this)
═══════════════════════════════════════════ */
function ReservationModal({ product: p, qty, onClose }: { product: Product; qty: number; onClose: () => void }) {
  const isLoggedIn = !!localStorage.getItem("mm_token");

  const [form, setForm] = useState<ReservationForm>({
    clientName: "", clientEmail: "", clientPhone: "",
    quantity: qty, scheduledDate: "", notes: "",  
  });
  const [loadingUser, setLoadingUser] = useState(isLoggedIn);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const total = Number(p.price) * form.quantity;

  // ── Pré-remplir avec les infos du compte connecté ──
  useEffect(() => {
    if (!isLoggedIn) return;
    api.meUser()
      .then(user => {
        setForm(f => ({
          ...f,
          clientName:  user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          clientEmail: user.email ?? "",
          clientPhone: user.phone ?? "",
        }));
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      await api.publicReservation({
        clientName:    form.clientName,
        clientEmail:   form.clientEmail,
        clientPhone:   form.clientPhone,
        productId:     p._id,
        quantity:      form.quantity,
        scheduledDate: form.scheduledDate || undefined,
        notes:         form.notes,
      });
      setSuccess(true);
    } catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#fff", border: `1px solid ${T.border}`,
    padding: "11px 14px", fontSize: 13, color: T.ink,
    outline: "none", fontFamily: T.fontUI, boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontFamily: T.fontUI, fontSize: 10, textTransform: "uppercase" as const,
    letterSpacing: "0.14em", color: T.inkLight,
    display: "flex", alignItems: "center", gap: 5,
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
    >
      <div style={{ width: "100%", maxWidth: 480, maxHeight: "94vh", overflowY: "auto", background: T.cream, animation: "pdpSlideUp .25s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.cream, zIndex: 1 }}>
          <div>
            <p style={{ fontFamily: T.fontUI, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 3px" }}>Réservation</p>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 400, color: T.ink, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{p.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkLight }}><X size={16} /></button>
        </div>

        {success ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "56px 28px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0faf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={28} style={{ color: T.success }} />
            </div>
            <div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.ink, marginBottom: 8 }}>Demande envoyée</h3>
              <p style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkMid, lineHeight: 1.75, margin: 0 }}>Notre équipe vous contactera sous 24h pour confirmer votre réservation.</p>
            </div>
            <button onClick={onClose} style={{ padding: "12px 36px", fontFamily: T.fontUI, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", background: T.ink, color: "#fff", border: "none", cursor: "pointer", marginTop: 8 }}>Fermer</button>
          </div>
        ) : loadingUser ? (
          // Petit spinner pendant qu'on charge les infos du compte
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 56 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${T.border}`, borderTopColor: T.inkMid, borderRadius: "50%", animation: "pdpSpin 0.8s linear infinite" }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* ── Bandeau compte connecté (remplace les 3 champs identité) ── */}
            {isLoggedIn ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: T.accentSoft, border: `1px solid ${T.accent}22`,
                padding: "12px 16px",
              }}>
                <User size={14} style={{ color: T.accent, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: T.fontUI, fontSize: 12, fontWeight: 500, color: T.ink, margin: 0 }}>
                    {form.clientName}
                  </p>
                  <p style={{ fontFamily: T.fontUI, fontSize: 11, color: T.inkLight, margin: "2px 0 0" }}>
                    {form.clientEmail}{form.clientPhone ? ` · ${form.clientPhone}` : ""}
                  </p>
                </div>
              </div>
            ) : (
              /* Champs identité uniquement pour les visiteurs non connectés */
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={lbl}><User size={10} /> Nom complet *</label>
                  <input style={inp} placeholder="Votre nom" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={lbl}><Mail size={10} /> Email *</label>
                    <input style={inp} type="email" placeholder="vous@email.com" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} required />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label style={lbl}><Phone size={10} /> Téléphone</label>
                    <input style={inp} type="tel" placeholder="+216 xx xxx xxx" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            {/* Quantité + Date — toujours visibles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={lbl}>Quantité</label>
                <input style={inp} type="number" min={1} max={Number(p.stock) || 999} value={form.quantity} onChange={e => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={lbl}><Calendar size={10} /> Date souhaitée</label>
                <input style={inp} type="date" min={new Date().toISOString().split("T")[0]} value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={lbl}><FileText size={10} /> Notes</label>
              <textarea style={{ ...inp, resize: "vertical" }} rows={3} placeholder="Demandes particulières…" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${T.border}`, padding: "16px 20px", background: "#fff" }}>
              <span style={{ fontFamily: T.fontUI, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.14em" }}>Total estimé</span>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 500, color: T.accent }}>{total.toLocaleString("fr-TN")} DT</span>
            </div>

            {error && <p style={{ fontFamily: T.fontUI, color: T.danger, fontSize: 12, textAlign: "center", margin: 0 }}>{error}</p>}

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px 0", fontFamily: T.fontUI, fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", background: T.ink, color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "opacity 0.2s" }}
            >
              {loading && <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "pdpSpin 0.7s linear infinite", display: "inline-block" }} />}
              {loading ? "Envoi en cours…" : "Confirmer la réservation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════ */
export default function ProductDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  // ── AUTH GUARD HOOK ─────────────────────
  const handleReserve = useReservationGuard(); // ← returns (productId) => void

  const [product, setProduct]         = useState<Product | null>(null);
  const [variants, setVariants]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeImg, setActiveImg]     = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  // reserving state is only reached when authenticated (guard redirects unauthenticated users)
  const [reserving, setReserving]     = useState(false);
  const [wishlist, setWishlist]       = useState(false);
  const [copied, setCopied]           = useState(false);
  const [qty, setQty]                 = useState(1);
  const [bulkyOpen, setBulkyOpen]     = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setLoading(true); setQty(1); setActiveImg(0);
    window.scrollTo({ top: 0 });
    (async () => {
      try {
        const all: Product[] = await api.getProducts({});
        const active = all.filter(p => p.status === "active");
        const found  = active.find(p => p._id === id);
        if (!found) { navigate("/produits", { replace: true }); return; }
        setProduct(found);
        setVariants(found.family ? active.filter(p => p.family === found.family) : [found]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleVariantSelect = (variantId: string) => {
    if (variantId !== id) navigate(`/produits/${variantId}`);
  };

  /**
   * onReservationClick — the single entry point for all "Réserver" buttons.
   * Delegates to the guard hook which handles auth check, toast, redirect.
   */
  const onReservationClick = () => {
    if (!product) return;
    const token = localStorage.getItem("mm_token");
    if (token) {
      // Authenticated: open the inline modal (existing behaviour)
      setReserving(true);
    } else {
      // Not authenticated: guard shows toast and redirects to /login
      handleReserve(product._id);
    }
  };

  /* ── Skeleton ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.parchment, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyles />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, border: `2px solid ${T.border}`, borderTopColor: T.inkMid, borderRadius: "50%", animation: "pdpSpin 0.8s linear infinite" }} />
        <p style={{ fontFamily: T.fontDisplay, fontSize: 16, fontStyle: "italic", color: T.inkLight }}>Chargement…</p>
      </div>
    </div>
  );

  if (!product) return null;

  const images     = product.images ?? [];
  const stockNum   = Number(product.stock);
  const outOfStock = product.stock !== undefined && stockNum === 0;
  const storyImg   = (i: number) => images[i]?.url;

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: T.fontUI }}>
      <GlobalStyles />

      {/* Toast container — renders notifications globally */}
      <ToastContainer />

      {/* ── BREADCRUMB ── */}
      <div style={{
        position: "absolute", top: 84, left: 0, right: 0, zIndex: 20,
        padding: "0 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          <Link to="/produits" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontFamily: T.fontUI }}>Produits</Link>
          <ChevronRight size={10} />
          {product.category && <><span style={{ fontFamily: T.fontUI }}>{product.category}</span><ChevronRight size={10} /></>}
          <span style={{ color: "rgba(255,255,255,0.85)", fontFamily: T.fontUI }}>{product.name}</span>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <div style={{ position: "relative", marginTop: 0 }}>
        <HeroGallery
          images={images}
          activeIdx={activeImg}
          onThumbClick={setActiveImg}
          onLightbox={setLightboxIdx}
        />
        {/* FloatingInfo receives the guarded handler */}
        <FloatingInfo
          product={product}
          wishlist={wishlist} onWishlist={() => setWishlist(w => !w)}
          copied={copied} onShare={handleShare}
          onReserve={onReservationClick}   // ← guarded
          outOfStock={outOfStock}
        />
      </div>

      {/* ══ VARIANTS + DESCRIPTION ══ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 32px 56px" }}>
        <VariantStrip
          variants={variants}
          currentId={product._id}
          onSelect={handleVariantSelect}
        />
        {product.description && (
          <p style={{
            fontFamily: T.fontDisplay, fontSize: "clamp(18px, 2.2vw, 26px)",
            fontWeight: 300, fontStyle: "italic",
            color: T.inkMid, lineHeight: 1.75, maxWidth: 720,
            animation: "pdpFadeUp 0.9s 0.15s ease both",
          }}>
            {product.description}
          </p>
        )}
      </div>

      {/* ══ STORY ══ */}
      <StorySection
        eyebrow="Vue d'ensemble"
        headline="Une présence qui transforme l'espace"
        body="Chaque ligne a été pensée pour s'intégrer naturellement dans votre intérieur. Une pièce qui raconte une histoire, celle d'un savoir-faire attentif aux détails qui font la différence."
        imageUrl={storyImg(1) ?? storyImg(0)}
        flip={false}
      />
      <StorySection
        eyebrow="Matériaux & Fabrication"
        headline="La matière comme philosophie"
        body="Sélectionnés pour leur durabilité et leur caractère, nos matériaux traversent le temps. Une finition soignée, un toucher qui rassure, une qualité qui se révèle au quotidien."
        imageUrl={storyImg(2) ?? storyImg(0)}
        flip={true}
        accent={T.accent}
      />

      {/* ══ SPECS ══ */}
      <SpecsSection rows={[
        { label: "Hauteur",    value: "30,0 cm" },
        { label: "Longueur",   value: "200,0 cm" },
        { label: "Profondeur", value: "40,0 cm" },
        { label: "Poids",      value: "54,2 kg" },
        { label: "Matière",    value: "Bois manufacturé" },
        { label: "Finition",   value: "Placage nitrocellulose" },
        { label: "Assemblage", value: "2 personnes · 30 min" },
        { label: "Colis",      value: "2 cartons" },
      ]} />

      <div style={{ background: T.parchment, padding: "0 clamp(24px, 8vw, 120px) 60px" }}>
        <button
          onClick={() => setBulkyOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: T.fontUI, fontSize: 12, color: T.amber,
            background: "none", border: `1px solid ${T.amber}55`,
            padding: "8px 16px", cursor: "pointer",
          }}
        >
          <AlertTriangle size={12} />
          Pièce volumineuse — voir les détails de livraison
        </button>
      </div>

      {/* ══ TRUST ══ */}
      <TrustSection />

      {/* ══ SHIPPING BAND ══ */}
      <div style={{ background: T.cream, padding: "48px clamp(24px, 8vw, 120px)", borderTop: `1px solid ${T.border}` }}>
        <p style={{ fontFamily: T.fontUI, fontSize: 13, color: T.inkMid, lineHeight: 1.7 }}>
          Commandez maintenant et recevez entre le{" "}
          <span style={{ color: T.ink, fontWeight: 500 }}>1er et le 8 juin</span>.{" "}
          Retours acceptés sous 30 jours, article non assemblé dans son emballage d'origine.
        </p>
      </div>

      {/* ══ FAMILY ══ */}
      {product.family && (
        <ProductFamilySection family={product.family} currentProductId={product._id} />
      )}

      {/* ══ STICKY BAR — receives guarded handler ══ */}
      <StickyReserveBar
        product={product}
        qty={qty}
        onQtyChange={setQty}
        onReserve={onReservationClick}   // ← guarded
        outOfStock={outOfStock}
        visible={stickyVisible}
      />

      <div style={{ height: 80 }} />

      {/* ══ MODALS ══ */}
      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
      {bulkyOpen && <BulkyModal onClose={() => setBulkyOpen(false)} />}
      {/* ReservationModal only mounts when user is authenticated */}
      {reserving && <ReservationModal product={product} qty={qty} onClose={() => setReserving(false)} />}
    </div>
  );
}