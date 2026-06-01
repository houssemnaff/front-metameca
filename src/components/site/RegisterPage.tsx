import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [company,   setCompany]   = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [focused,   setFocused]   = useState("");
  const [mounted,   setMounted]   = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
 const { register } = useAuth(); // no more `as any`
  const navigate      = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  /* ── animated grid canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const draw = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(37,99,235,0.07)";
      ctx.lineWidth   = 1;
      const step = 48;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      for (let i = 0; i < 18; i++) {
        const px = ((i * 137.5 + t * 0.3) % W + W) % W;
        const py = ((i * 97.3  + t * 0.18) % H + H) % H;
        const r  = 1.2 + Math.sin(t * 0.02 + i) * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37,99,235,${0.22 + Math.sin(t * 0.03 + i) * 0.12})`;
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(37,99,235,0.04)";
      ctx.lineWidth   = 1.5;
      for (let i = -3; i < 6; i++) {
        const off = (i * 280 + t * 0.6) % (W + H);
        ctx.beginPath();
        ctx.moveTo(off, 0);
        ctx.lineTo(off - H, H);
        ctx.stroke();
      }

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      await register({ firstName, lastName, company, phone, email, password, role: "client" });
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── password strength ─── */
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Faible", "Moyen", "Fort", "Très fort"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"][strength];

  /* ─────────── STYLES ─────────── */
  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#ffffff",
      display: "flex",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    },
    canvas: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 0,
    },
    glow1: {
      position: "absolute",
      top: "-20%",
      left: "-10%",
      width: "60%",
      height: "60%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0,
    },
    glow2: {
      position: "absolute",
      bottom: "-20%",
      right: "-10%",
      width: "50%",
      height: "50%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0,
    },
    left: {
      flex: "1 1 50%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "60px 64px",
      position: "relative",
      zIndex: 1,
    },
    right: {
      flex: "0 0 50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 48px",
      position: "relative",
      zIndex: 1,
      borderLeft: "1px solid rgba(37,99,235,0.12)",
      background: "rgba(255,255,255,0.01)",
      backdropFilter: "blur(2px)",
      overflowY: "auto",
    },
    tagline: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 6,
      padding: "5px 12px",
      fontSize: 11,
      fontWeight: 600,
      color: "#2563eb",
      letterSpacing: 2,
      textTransform: "uppercase" as const,
      marginBottom: 32,
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },
    tagDot: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#2563eb",
      boxShadow: "0 0 6px #2563eb",
    },
    brandName: {
      fontSize: "clamp(32px, 3.5vw, 50px)",
      fontWeight: 800,
      color: "#0a0a0f",
      lineHeight: 1.1,
      letterSpacing: "-1px",
      marginBottom: 8,
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
    },
    brandAccent: {
      background: "linear-gradient(90deg, #1d4ed8, #2563eb, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    brandSub: {
      fontSize: "clamp(12px, 1.3vw, 15px)",
      color: "#6b7280",
      fontWeight: 400,
      letterSpacing: 3,
      textTransform: "uppercase" as const,
      marginBottom: 40,
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
    },
    /* benefits list */
    benefits: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
    },
    benefit: {
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "14px 18px",
      background: "rgba(37,99,235,0.04)",
      border: "1px solid rgba(37,99,235,0.10)",
      borderRadius: 12,
    },
    benefitIcon: {
      width: 34,
      height: 34,
      borderRadius: 8,
      background: "rgba(37,99,235,0.10)",
      border: "1px solid rgba(37,99,235,0.20)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    benefitTitle: { fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 },
    benefitDesc:  { fontSize: 12, color: "#9ca3af", lineHeight: 1.5 },

    /* form panel */
    panel: {
      width: "100%",
      maxWidth: 420,
      padding: "8px 0",
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
      transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
    },
    panelHeader: { marginBottom: 24 },
    panelEyebrow: {
      fontSize: 11,
      color: "#2563eb",
      fontWeight: 600,
      letterSpacing: 2.5,
      textTransform: "uppercase" as const,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    eyebrowLine: {
      flex: 1,
      height: 1,
      background: "linear-gradient(90deg, rgba(37,99,235,0.5), transparent)",
    },
    panelTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: "#0a0a0f",
      marginBottom: 6,
      letterSpacing: "-0.5px",
    },
    panelDesc: { fontSize: 13.5, color: "#9ca3af" },

    hudBox: {
      position: "relative",
      padding: "28px 32px 32px",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(37,99,235,0.15)",
      borderRadius: 16,
      boxShadow: "0 0 40px rgba(37,99,235,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    cornerTL: { position: "absolute", top: -1, left: -1, width: 18, height: 18, borderTop: "2px solid #2563eb", borderLeft: "2px solid #2563eb", borderRadius: "4px 0 0 0" },
    cornerTR: { position: "absolute", top: -1, right: -1, width: 18, height: 18, borderTop: "2px solid #2563eb", borderRight: "2px solid #2563eb", borderRadius: "0 4px 0 0" },
    cornerBL: { position: "absolute", bottom: -1, left: -1, width: 18, height: 18, borderBottom: "2px solid #2563eb", borderLeft: "2px solid #2563eb", borderRadius: "0 0 0 4px" },
    cornerBR: { position: "absolute", bottom: -1, right: -1, width: 18, height: 18, borderBottom: "2px solid #2563eb", borderRight: "2px solid #2563eb", borderRadius: "0 0 4px 0" },

    form:  { display: "flex", flexDirection: "column", gap: 14 },
    row:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: {
      fontSize: 11,
      color: "#6b7280",
      fontWeight: 600,
      letterSpacing: 1.5,
      textTransform: "uppercase" as const,
    },
    divider: { height: 1, background: "rgba(37,99,235,0.07)", margin: "4px 0" },
    error: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(239,68,68,0.07)",
      border: "1px solid rgba(239,68,68,0.22)",
      color: "#dc2626",
      padding: "10px 14px",
      borderRadius: 10,
      fontSize: 13,
      marginBottom: 4,
    },
    loginRow: {
      marginTop: 18,
      textAlign: "center" as const,
      fontSize: 13,
      color: "#9ca3af",
    },
    footer: {
      marginTop: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      fontSize: 11,
      color: "#9ca3af",
    },
    footerDot: {
      width: 3,
      height: 3,
      borderRadius: "50%",
      background: "rgba(37,99,235,0.5)",
    },
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    background: focused === field ? "rgba(37,99,235,0.05)" : "rgba(249,250,251,1)",
    border: `1px solid ${focused === field ? "rgba(37,99,235,0.45)" : "rgba(209,213,219,1)"}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: "#111827",
    fontSize: 13.5,
    outline: "none",
    transition: "border-color .2s, background .2s, box-shadow .2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(37,99,235,0.07)" : "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box" as const,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 4px 24px rgba(37,99,235,0.30); }
          50%      { box-shadow: 0 4px 40px rgba(37,99,235,0.50); }
        }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .mm-left  { display: none !important; }
          .mm-right { flex: 1 1 100% !important; border-left: none !important; padding: 32px 20px !important; }
          .mm-row   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={s.page}>
        <canvas ref={canvasRef} style={s.canvas} />
        <div style={s.glow1} />
        <div style={s.glow2} />

        {/* ── LEFT — BRAND ── */}
        <div className="mm-left" style={s.left}>
          <div style={s.tagline}>
            <span style={s.tagDot} />
            Nouveau compte
          </div>

          <div style={s.brandName}>
            <span>Rejoignez </span>
            <span style={s.brandAccent}>Meta Meca</span>
          </div>
          <div style={s.brandSub}>Industries · Portail Client</div>

          <div style={s.benefits}>
            {[
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                ),
                title: "Suivi de commandes en temps réel",
                desc: "Consultez l'état de vos commandes et devis à tout moment.",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ),
                title: "Communication directe",
                desc: "Échangez avec notre équipe technique en toute simplicité.",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: "Espace sécurisé",
                desc: "Vos données et documents sont protégés et accessibles uniquement par vous.",
              },
            ].map((b) => (
              <div key={b.title} style={s.benefit}>
                <div style={s.benefitIcon}>{b.icon}</div>
                <div>
                  <div style={s.benefitTitle}>{b.title}</div>
                  <div style={s.benefitDesc}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — REGISTER PANEL ── */}
        <div className="mm-right" style={s.right}>
          <div style={s.panel}>

            <div style={s.panelHeader}>
              <div style={s.panelEyebrow}>
                <span style={s.eyebrowLine} />
              </div>
              <div style={s.panelTitle}>Créer un compte</div>
              <div style={s.panelDesc}>Remplissez le formulaire pour accéder au portail client</div>
            </div>

            <div style={s.hudBox}>
              <div style={s.cornerTL} /><div style={s.cornerTR} />
              <div style={s.cornerBL} /><div style={s.cornerBR} />

              {error && (
                <div style={s.error}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={s.form}>
                {/* Name row */}
                <div className="mm-row" style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Prénom</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFocused("firstName")}
                      onBlur={() => setFocused("")}
                      style={inputStyle("firstName")}
                      placeholder="seif"
                      required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Nom</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocused("lastName")}
                      onBlur={() => setFocused("")}
                      style={inputStyle("lastName")}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>

                {/* Company + Phone */}
                <div className="mm-row" style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Entreprise</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      onFocus={() => setFocused("company")}
                      onBlur={() => setFocused("")}
                      style={inputStyle("company")}
                      placeholder="Acme SARL"
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Téléphone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocused("phone")}
                      onBlur={() => setFocused("")}
                      style={inputStyle("phone")}
                      placeholder="+216 000 000 000"
                    />
                  </div>
                </div>

                <div style={s.divider} />

                <div style={s.field}>
                  <label style={s.label}>Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    style={inputStyle("email")}
                    placeholder="se.dupont@example.com"
                    required
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    style={inputStyle("password")}
                    placeholder="••••••••••"
                    required
                  />
                  {/* strength bar */}
                  {password && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            style={{
                              flex: 1,
                              height: 3,
                              borderRadius: 2,
                              background: n <= strength ? strengthColor : "rgba(209,213,219,1)",
                              transition: "background .3s",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600, marginTop: 3, display: "block" }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div style={s.field}>
                  <label style={s.label}>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setFocused("confirm")}
                    onBlur={() => setFocused("")}
                    style={{
                      ...inputStyle("confirm"),
                      border: confirm && confirm !== password
                        ? "1px solid rgba(239,68,68,0.6)"
                        : inputStyle("confirm").border,
                    }}
                    placeholder="••••••••••"
                    required
                  />
                  {confirm && confirm !== password && (
                    <span style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>
                      Les mots de passe ne correspondent pas
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 6,
                    padding: "14px",
                    background: loading
                      ? "rgba(37,99,235,0.35)"
                      : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
                    border: "none",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    letterSpacing: 0.5,
                    transition: "opacity .2s, transform .15s",
                    animation: loading ? "none" : "btnPulse 2.5s ease-in-out infinite",
                    transform: "translateY(0)",
                  }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                >
                  {loading ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spinSlow 1s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Création du compte...
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div style={s.loginRow}>
                Déjà inscrit ?{" "}
                <Link to="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  Se connecter
                </Link>
              </div>
            </div>

            <div style={s.footer}>
              <span>Meta Meca Industries</span>
              <span style={s.footerDot} />
              <span>Portail Client</span>
              <span style={s.footerDot} />
              <span>v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}