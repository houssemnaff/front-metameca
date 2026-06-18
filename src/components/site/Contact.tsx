import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { Phone, MapPin, Mail, MessageCircle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { sendEmail } from "../../utils/sendemail";

/* ─────────────────────────── Validation ────────────────────── */
const schema = z.object({
  name:    z.string().trim().min(2, "Nom trop court").max(80),
  phone:   z.string().trim().min(6, "Téléphone invalide").max(30),
  message: z.string().trim().min(5, "Message trop court").max(1000),
});

const COLORS = {
  bg: "#ffffff",                        // white background
  bgSoft: "#f8fafc",                    // very light gray surface
  bgCard: "#f1f5f9",                    // card background
  primary: "#4f46e5",                   // indigo
  primaryLight: "#818cf8",              // light indigo
  primaryDark: "#3730a3",               // dark indigo
  accent: "#e0e7ff",                    // soft indigo accent
  text: "#1e293b",                      // dark slate
  textSoft: "#64748b",                  // medium slate
  textMuted: "#94a3b8",                 // muted slate
  border: "#e2e8f0",                    // light gray border
  borderStrong: "#818cf8",              // indigo border
  success: "#10b981",                   // emerald
  gold: "#6366f1",                      // indigo for accents (replaces gold)
  goldMuted: "rgba(99,102,241,0.5)",
  goldSubtle: "rgba(99,102,241,0.15)",
};

/* ─────────────────────────── Reveal hook ───────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
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

/* ─────────────────────────── Animated input ────────────────── */
function PremiumField({
  label, value, onChange, type = "text", placeholder, maxLength, error, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder: string; maxLength: number;
  error?: string; multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;

  const baseStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1.5px solid ${focused ? COLORS.primary : COLORS.border}`,
    outline: "none",
    padding: "22px 0 10px",
    fontSize: 14,
    fontWeight: 400,
    color: COLORS.text,
    letterSpacing: "0.01em",
    fontFamily: "inherit",
    resize: "none",
    transition: "border-color 0.35s ease",
    display: "block",
    lineHeight: 1.6,
  };

  return (
    <div style={{ position: "relative", paddingTop: 8 }}>
      {/* Floating label */}
      <label style={{
        position: "absolute",
        top: focused || hasVal ? 0 : 28,
        left: 0,
        fontSize: focused || hasVal ? 8 : 12,
        letterSpacing: focused || hasVal ? "0.22em" : "0.08em",
        textTransform: "uppercase",
        fontWeight: 600,
        color: focused ? COLORS.primary : COLORS.textMuted,
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {label}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          rows={4}
          placeholder={focused ? placeholder : ""}
          style={{ ...baseStyle, paddingTop: 24 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          placeholder={focused ? placeholder : ""}
          style={baseStyle}
        />
      )}

      {/* Focus glow line */}
      <div style={{
        position: "absolute",
        bottom: error ? 20 : 0,
        left: 0,
        height: 2,
        width: focused ? "100%" : "0%",
        background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})`,
        transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: "none",
        borderRadius: 2,
      }} />

      {error && (
        <p style={{
          fontSize: 10, color: "#ef4444",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginTop: 6, fontWeight: 500,
        }}>
          — {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── Contact info item ─────────────── */
function ContactLine({
  label, value, href, delay, vis,
}: {
  label: string; value: string; href?: string;
  delay: number; vis: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Tag = href ? "a" : "div";

  return (
    <div style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateX(0)" : "translateX(-16px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      <Tag
        {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "22px 0",
          borderBottom: `1px solid ${COLORS.border}`,
          textDecoration: "none",
          cursor: href ? "pointer" : "default",
          gap: 16,
        }}
      >
        <div>
          <p style={{
            fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
            fontWeight: 700, color: COLORS.gold, margin: "0 0 6px",
            opacity: 0.7,
          }}>
            {label}
          </p>
          <p style={{
            fontSize: 16, fontWeight: 400,
            color: hovered && href ? COLORS.primary : COLORS.text,
            letterSpacing: "-0.01em", margin: 0,
            transition: "color 0.3s ease",
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
          }}>
            {value}
          </p>
        </div>
        {href && (
          <div style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translate(0,0)" : "translate(4px,-4px)",
            transition: "all 0.3s ease",
            flexShrink: 0,
          }}>
            <ArrowUpRight size={14} style={{ color: COLORS.primary }} />
          </div>
        )}
      </Tag>
    </div>
  );
}

/* ─────────────────────────── Main component ────────────────── */
export function Contact() {
  const [form, setForm]     = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent]     = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [btnHovered, setBtnHovered] = useState(false);

  const { ref: leftRef,   vis: leftVis   } = useReveal(0.1);
  const { ref: rightRef,  vis: rightVis  } = useReveal(0.08);
  const { ref: headerRef, vis: headerVis } = useReveal(0.15);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    console.log("[Contact] Submit clicked", form);

    const r = schema.safeParse(form);
    if (!r.success) {
      console.warn("[Contact] Validation failed", r.error.issues);
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }

    setErrors({});

    try {
      setSending(true);
      console.log("[Contact] Calling sendEmail", r.data);
      await sendEmail(r.data);
      console.log("[Contact] Email sent successfully");
      setSent(true);
      setForm({ name: "", phone: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (error) {
      console.error("[Contact] sendEmail failed", error);
      setSubmitError("Une erreur est survenue pendant l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contact"
      style={{
        position: "relative",
        overflow: "hidden",
        background: COLORS.bg,
        padding: "0 0 0",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .contact-header-strip { padding: 32px 24px 28px !important; }
          .contact-split { grid-template-columns: 1fr !important; }
          .contact-left-panel { padding: 48px 24px 48px !important; border-right: none !important; border-bottom: 1px solid ${COLORS.border} !important; }
          .contact-right-panel { padding: 48px 24px 48px !important; }
          .contact-bottom-strip { padding: 16px 24px !important; }
        }
      `}</style>
      {/* Subtle dot texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }} />

      {/* Soft indigo glow — left */}
      <div style={{
        position: "absolute", top: "20%", left: "-5%",
        width: 500, height: 500,
        background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* ── Oversized section label ── */}
      <div style={{
        position: "absolute",
        top: 0, right: -20,
        fontSize: "clamp(80px, 12vw, 160px)",
        fontWeight: 700,
        fontFamily: "'Georgia', serif",
        color: "transparent",
        WebkitTextStroke: "1px rgba(99,102,241,0.06)",
        lineHeight: 1,
        userSelect: "none",
        pointerEvents: "none",
        letterSpacing: "-0.04em",
      }}>
        CONTACT
      </div>

      {/* ── Header strip ── */}
      <div
        ref={headerRef}
        className="contact-header-strip"
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "48px 60px 40px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          opacity: headerVis ? 1 : 0,
          transform: headerVis ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ height: 2, width: 40, background: COLORS.primary, borderRadius: 2, opacity: 0.5 }} />
            <span style={{
              fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.primary, opacity: 0.65,
            }}>
              Contact
            </span>
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4.5vw, 56px)",
            fontWeight: 300,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: COLORS.text,
            margin: 0,
          }}>
            Démarrons votre{" "}
            <span style={{ color: COLORS.primary, fontStyle: "normal", fontWeight: 500 }}>projet</span>
          </h2>
        </div>
        <p style={{
          fontSize: 12, color: COLORS.textSoft,
          lineHeight: 1.8, maxWidth: 280, margin: 0,
          letterSpacing: "0.02em", paddingBottom: 4,
        }}>
          Devis gratuit, étude personnalisée.<br />
          Réponse sous 24h.
        </p>
      </div>

      {/* ── Main split layout ── */}
      <div className="contact-split" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "62vh",
      }}>

        {/* ── LEFT: Company info ── */}
        <div
          ref={leftRef}
          className="contact-left-panel"
          style={{
            padding: "64px 60px 72px",
            borderRight: `1px solid ${COLORS.border}`,
            background: COLORS.bgSoft,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Brand line */}
          <div style={{
            opacity: leftVis ? 1 : 0,
            transform: leftVis ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <p style={{
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              fontWeight: 600, color: COLORS.textMuted, margin: "0 0 40px",
            }}>
              Meta Meca Industries — Tunis, TN
            </p>
          </div>

          {/* Contact lines */}
          <div style={{ flex: 1 }}>
            <ContactLine label="Téléphone"  value="94 703 066"          href="tel:94703066"               delay={80}  vis={leftVis} />
            <ContactLine label="WhatsApp"   value="+216 94 703 066"     href="https://wa.me/21694703066"  delay={160} vis={leftVis} />
            <ContactLine label="Email"      value="contact@metameca.tn" href="mailto:contact@metameca.tn" delay={240} vis={leftVis} />
            <ContactLine label="Atelier"    value="Msaken, Sousse"                                        delay={320} vis={leftVis} />
          </div>

          {/* Compact map */}
          <div style={{
            marginTop: 48,
            opacity: leftVis ? 1 : 0,
            transform: leftVis ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease 0.4s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s",
          }}>
            <p style={{
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.gold, margin: "0 0 12px", opacity: 0.55,
            }}>
              Localisation
            </p>
            <div style={{
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 1px 8px rgba(99,102,241,0.06)",
            }}>
              <iframe
                title="Localisation Meta Meca Industries"
                src="https://www.google.com/maps?q=Tunis,Tunisia&output=embed"
                style={{
                  width: "100%", height: 160,
                  border: "none", display: "block",
                  filter: "grayscale(0.15) brightness(1.0)",
                  transition: "filter 0.4s ease",
                }}
                loading="lazy"
                onMouseEnter={e => (e.currentTarget.style.filter = "grayscale(0) brightness(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "grayscale(0.15) brightness(1.0)")}
              />
              {/* Map overlay label */}
              <div style={{
                position: "absolute", bottom: 10, left: 12,
                fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                fontWeight: 700, color: COLORS.primary,
                background: "rgba(255,255,255,0.92)",
                padding: "3px 8px", borderRadius: 3,
                backdropFilter: "blur(4px)",
                border: `1px solid ${COLORS.accent}`,
              }}>
                Tunis, Tunisie
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div
          ref={rightRef}
          className="contact-right-panel"
          style={{
            padding: "64px 60px 72px",
            background: COLORS.bg,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* Soft glow behind form */}
          <div style={{
            position: "absolute", bottom: "10%", right: "5%",
            width: 320, height: 320,
            background: "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{
            opacity: rightVis ? 1 : 0,
            transform: rightVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.8s ease 0.1s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s",
          }}>
            <p style={{
              fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, color: COLORS.textMuted, margin: "0 0 48px",
            }}>
              Demande de devis
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              <PremiumField
                label="Nom complet"
                value={form.name}
                onChange={v => setForm({ ...form, name: v })}
                placeholder="Votre nom"
                maxLength={80}
                error={errors.name}
              />
              <PremiumField
                label="Téléphone"
                value={form.phone}
                onChange={v => setForm({ ...form, phone: v })}
                placeholder="+216 ..."
                maxLength={30}
                error={errors.phone}
              />
              <PremiumField
                label="Votre projet"
                value={form.message}
                onChange={v => setForm({ ...form, message: v })}
                placeholder="Décrivez votre projet..."
                maxLength={1000}
                error={errors.message}
                multiline
              />

              {/* Submit button */}
              <div style={{ marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={sending}
                  onMouseEnter={() => setBtnHovered(true)}
                  onMouseLeave={() => setBtnHovered(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "18px 40px",
                    background: sent
                      ? "rgba(16,185,129,0.08)"
                      : sending
                        ? "rgba(148,163,184,0.08)"
                      : btnHovered
                        ? COLORS.primary
                        : "transparent",
                    border: `1.5px solid ${sent
                      ? "rgba(16,185,129,0.5)"
                      : sending
                        ? COLORS.border
                      : btnHovered
                        ? COLORS.primary
                        : COLORS.border
                    }`,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    opacity: sending ? 0.8 : 1,
                    transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <span style={{
                    fontSize: 10, letterSpacing: "0.22em",
                    textTransform: "uppercase", fontWeight: 700,
                    color: sent
                      ? COLORS.success
                      : sending
                        ? COLORS.textMuted
                      : btnHovered
                        ? "#ffffff"
                        : COLORS.textSoft,
                    transition: "color 0.3s ease",
                  }}>
                    {sent ? "Email envoyé" : sending ? "Envoi en cours..." : "Envoyer la demande"}
                  </span>
                  <span style={{
                    transform: btnHovered && !sent && !sending ? "translate(3px,-3px)" : "translate(0,0)",
                    transition: "transform 0.35s ease",
                    display: "flex", alignItems: "center",
                  }}>
                    {sent
                      ? <CheckCircle2 size={14} style={{ color: COLORS.success }} />
                      : <ArrowUpRight size={14} style={{ color: btnHovered && !sending ? "#ffffff" : COLORS.textMuted }} />
                    }
                  </span>
                </button>

                <p style={{
                  fontSize: 10, color: COLORS.textMuted,
                  letterSpacing: "0.1em", marginTop: 14,
                }}>
                  Réponse sous 24h par email
                </p>
                {submitError && (
                  <p style={{
                    fontSize: 10,
                    color: "#ef4444",
                    letterSpacing: "0.08em",
                    marginTop: 8,
                  }}>
                    {submitError}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="contact-bottom-strip" style={{
        borderTop: `1px solid ${COLORS.border}`,
        padding: "20px 60px",
        background: COLORS.bgSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <p style={{
          fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
          color: COLORS.textMuted, margin: 0, fontWeight: 500,
        }}>
          © {new Date().getFullYear()} Meta Meca Industries
        </p>
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { icon: Phone, href: "tel:94703066" },
            { icon: MessageCircle, href: "https://wa.me/21694703066" },
            { icon: Mail, href: "mailto:contact@metameca.tn" },
            { icon: MapPin, href: "#" },
          ].map(({ icon: Icon, href }, i) => (
            <a
              key={i}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              style={{
                color: COLORS.textMuted,
                transition: "color 0.3s ease",
                display: "flex",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={e => (e.currentTarget.style.color = COLORS.textMuted)}
            >
              <Icon size={13} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}