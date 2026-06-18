import { useState } from "react";
import { ArrowUpRight, Phone, MessageCircle, Mail, MapPin } from "lucide-react";

/* ─────────────────────────── Data ──────────────────────────── */
const nav = [
  ["Accueil",  "#accueil"],
  ["Services", "#services"],
  ["Process",  "#process"],
  ["Projets",  "#projets"],
  ["Contact",  "#contact"],
];

const contact = [
  { icon: Phone,         label: "Téléphone",  value: "94 703 066",          href: "tel:94703066" },
  { icon: MessageCircle, label: "WhatsApp",   value: "+216 94 703 066",     href: "https://wa.me/21694703066" },
  { icon: Mail,          label: "Email",      value: "contact@metameca.tn", href: "mailto:contact@metameca.tn" },
  { icon: MapPin,        label: "Atelier",    value: "Msaken, Sousse",      href: undefined },
];

const COLORS = {
  bg: "#ffffff",
  bgSoft: "#f8fafc",
  primary: "#4f46e5",
  primaryHover: "#3730a3",
  primaryMuted: "rgba(79,70,229,0.6)",
  primarySubtle: "rgba(79,70,229,0.12)",
  text: "#1e293b",
  textSoft: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderMuted: "rgba(79,70,229,0.12)",
};

/* ─────────────────────────── Animated nav link ─────────────── */
function NavLink({ label, href }: { label: string; href: string }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        textDecoration: "none",
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        fontWeight: 500,
        color: hov ? COLORS.primary : COLORS.textSoft,
        transition: "color 0.3s ease",
        padding: "10px 0",
        borderBottom: `1px solid ${COLORS.border}`,
        width: "100%",
      }}
    >
      <span style={{
        width: hov ? 18 : 0,
        height: 1.5,
        background: COLORS.primary,
        display: "inline-block",
        borderRadius: 1,
        transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)",
        flexShrink: 0,
      }} />
      {label}
    </a>
  );
}

/* ─────────────────────────── Contact row ───────────────────── */
function ContactRow({ icon: Icon, label, value, href }: {
  icon: typeof Phone; label: string; value: string; href?: string;
}) {
  const [hov, setHov] = useState(false);
  const Tag = href ? "a" : "div";
  return (
    <Tag
      {...(href ? { href, target: href.startsWith("http") ? "_blank" : undefined, rel: "noreferrer" } : {})}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 0",
        borderBottom: `1px solid ${COLORS.border}`,
        textDecoration: "none",
        cursor: href ? "pointer" : "default",
      }}
    >
      <Icon
        size={12}
        style={{
          color: hov ? COLORS.primary : COLORS.textMuted,
          transition: "color 0.3s ease",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{
          fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase",
          fontWeight: 700, color: COLORS.primary, opacity: 0.5,
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 400,
          fontFamily: "'Georgia', serif", fontStyle: "italic",
          color: hov ? COLORS.primary : COLORS.textSoft,
          letterSpacing: "0.01em",
          transition: "color 0.3s ease",
        }}>
          {value}
        </span>
      </div>
      {href && (
        <ArrowUpRight
          size={10}
          style={{
            marginLeft: "auto",
            color: COLORS.primary,
            opacity: hov ? 1 : 0,
            transform: hov ? "translate(0,0)" : "translate(4px,-4px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        />
      )}
    </Tag>
  );
}

/* ─────────────────────────── Footer ────────────────────────── */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      position: "relative",
      overflow: "hidden",
      background: COLORS.bg,
      color: COLORS.text,
    }}>
      <style>{`
        @media (max-width: 768px) {
          .footer-wrap { padding: 0 20px !important; }
          .footer-brand-row { padding: 48px 0 40px !important; }
          .footer-cols { grid-template-columns: 1fr !important; gap: 0 !important; padding: 40px 0 48px !important; }
          .footer-col-pad { padding-right: 0 !important; }
          .footer-divider-line { display: none !important; }
          .footer-col-spacing { margin-top: 36px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-cols { grid-template-columns: 1fr 2px 1fr !important; }
          .footer-divider-last { display: none !important; }
          .footer-col-3 { display: none !important; }
        }
      `}</style>

      {/* ── Dot texture ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, rgba(79,70,229,0.05) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }} />

      {/* ── Soft indigo glow ── */}
      <div style={{
        position: "absolute", top: "-10%", left: "30%",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(79,70,229,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* ── Ghost brand watermark ── */}
      <div style={{
        position: "absolute", bottom: -20, right: -10,
        fontSize: "clamp(80px, 14vw, 180px)",
        fontWeight: 700, fontFamily: "'Georgia', serif",
        color: "transparent",
        WebkitTextStroke: "1px rgba(79,70,229,0.06)",
        lineHeight: 1, userSelect: "none", pointerEvents: "none",
        letterSpacing: "-0.05em",
      }}>
        MM
      </div>

      {/* ════════════════════════════════════ */}
      {/*  MAIN BODY                          */}
      {/* ════════════════════════════════════ */}
      <div className="footer-wrap" style={{ maxWidth: "100%", margin: "0 auto", padding: "0 48px", position: "relative" }}>

        {/* ── Top divider ── */}
        <div style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${COLORS.border} 30%, ${COLORS.border} 70%, transparent)`,
        }} />

        {/* ── Hero brand statement ── */}
        <div className="footer-brand-row" style={{
          padding: "72px 0 64px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
        }}>
          {/* Oversized brand name */}
          <div>
            <p style={{
              fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.primary, opacity: 0.55,
              margin: "0 0 12px",
            }}>
              Depuis 2010 — Tunis, Tunisie
            </p>
            <h2 style={{
              fontSize: "clamp(36px, 6vw, 76px)",
              fontWeight: 300,
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: COLORS.text,
              margin: "0 0 4px",
            }}>
              Meta Meca
            </h2>
            <p style={{
              fontSize: "clamp(10px, 1.2vw, 14px)",
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              fontWeight: 400,
              color: COLORS.textMuted,
              margin: 0,
            }}>
              Industries
            </p>
          </div>

          {/* Statement */}
          <div style={{ maxWidth: 360, paddingBottom: 8 }}>
            <p style={{
              fontSize: 13, color: COLORS.textSoft,
              lineHeight: 1.8, fontWeight: 400,
              borderLeft: `2px solid ${COLORS.primary}`,
              opacity: 1,
              paddingLeft: 20, margin: "0 0 24px",
            }}>
              Spécialiste de la menuiserie sur mesure, de la fabrication métallique
              et du design intérieur en Tunisie.
            </p>
            <a
              href="#contact"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                fontWeight: 700, color: COLORS.primary,
                textDecoration: "none",
                borderBottom: `1px solid rgba(79,70,229,0.3)`,
                paddingBottom: 3,
                transition: "color 0.3s, border-color 0.3s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = COLORS.primaryHover;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(55,48,163,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = COLORS.primary;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(79,70,229,0.3)";
              }}
            >
              Démarrer un projet <ArrowUpRight size={11} />
            </a>
          </div>
        </div>

        {/* ── Navigation + Contact columns ── */}
        <div className="footer-cols" style={{
          display: "grid",
          gridTemplateColumns: "1fr 2px 1fr 2px 1fr",
          gap: 0,
          padding: "56px 0 64px",
          borderBottom: `1px solid ${COLORS.border}`,
        }}>

          {/* Navigation */}
          <div className="footer-col-pad" style={{ paddingRight: 48 }}>
            <p style={{
              fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.primary, opacity: 0.5,
              margin: "0 0 24px",
            }}>
              Navigation
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {nav.map(([label, href]) => (
                <NavLink key={label} label={label} href={href} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider-line" style={{ background: COLORS.border, margin: "0 40px" }} />

          {/* Contact */}
          <div className="footer-col-pad footer-col-spacing" style={{ paddingRight: 48 }}>
            <p style={{
              fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.primary, opacity: 0.5,
              margin: "0 0 24px",
            }}>
              Coordonnées
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {contact.map(c => (
                <ContactRow key={c.label} {...c} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider-line footer-divider-last" style={{ background: COLORS.border, margin: "0 40px" }} />

          {/* Savoir-faire */}
          <div className="footer-col-3 footer-col-spacing">
            <p style={{
              fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.primary, opacity: 0.5,
              margin: "0 0 24px",
            }}>
              Savoir-faire
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["Menuiserie sur mesure",   "#services"],
                ["Fabrication métallique",  "#services"],
                ["Design intérieur",        "#services"],
                ["Installation & finition", "#process"],
                ["Catalogue & devis",       "#catalogue"],
              ].map(([label, href]) => (
                <NavLink key={label} label={label} href={href} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom signature bar ── */}
        <div style={{
          padding: "28px 0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <p style={{
            fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
            color: COLORS.textMuted, margin: 0, fontWeight: 500,
          }}>
            © {year} Meta Meca Industries — Tous droits réservés
          </p>

          {/* Decorative tagline */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ height: 1.5, width: 24, background: COLORS.primary, borderRadius: 1, opacity: 0.3 }} />
            <span style={{
              fontSize: 7, letterSpacing: "0.35em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.primary, opacity: 0.4,
            }}>
              Design · Qualité · Sur mesure
            </span>
            <div style={{ height: 1.5, width: 24, background: COLORS.primary, borderRadius: 1, opacity: 0.3 }} />
          </div>
        </div>

      </div>
    </footer>
  );
} 