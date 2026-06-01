import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState("");
  const [mounted,  setMounted]  = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  /* ── animated background canvas ── */
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
      for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      for (let i = 0; i < 18; i++) {
        const px = ((i * 137.5 + t * 0.3) % W + W) % W;
        const py = ((i * 97.3  + t * 0.18) % H + H) % H;
        const r  = 1.2 + Math.sin(t * 0.02 + i) * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37,99,235,${0.25 + Math.sin(t * 0.03 + i) * 0.15})`;
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(37,99,235,0.04)";
      ctx.lineWidth   = 1.5;
      for (let i = -3; i < 6; i++) {
        const off = (i * 280 + t * 0.6) % (W + H);
        ctx.beginPath(); ctx.moveTo(off, 0); ctx.lineTo(off - H, H); ctx.stroke();
      }

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  /* ── submit: role comes from the server, never from the UI ── */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const authUser = await login(email, password);
              // ← ajoute

    if (authUser.role === "superadmin") {
              // ← ajoute
      navigate("/admin", { replace: true });
    } else if (authUser.role === "client") {
         // ← ajoute
      navigate("/dashboard", { replace: true });
    } else {
      setError("Rôle non reconnu");
    }
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};

  /* ─── styles ─────────────────────────────────────────────────────────── */
  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#ffffff",
      display: "flex",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    },
    canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 },
    glow1:  { position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
    glow2:  { position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },

    left: { flex: "1 1 55%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", position: "relative", zIndex: 1 },
    right: { flex: "0 0 45%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", position: "relative", zIndex: 1, borderLeft: "1px solid rgba(37,99,235,0.12)", backdropFilter: "blur(2px)" },

    tagline: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.22)",
      borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600,
      color: "#2563eb", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 32,
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    },
    tagDot: { width: 6, height: 6, borderRadius: "50%", background: "#2563eb", boxShadow: "0 0 6px #2563eb" },

    brandName: {
      fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#0a0a0f",
      lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 8,
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
    },
    brandAccent: { background: "linear-gradient(90deg, #1d4ed8, #2563eb, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    brandSub: {
      fontSize: "clamp(13px, 1.4vw, 16px)", color: "#6b7280", fontWeight: 400,
      letterSpacing: 3, textTransform: "uppercase" as const, marginBottom: 48,
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
    },

    statsRow: {
      display: "flex", gap: 32, marginBottom: 56,
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
    },
    statItem:  { display: "flex", flexDirection: "column", gap: 4 },
    statNum:   { fontSize: 28, fontWeight: 800, color: "#2563eb", lineHeight: 1, fontVariantNumeric: "tabular-nums" },
    statLabel: { fontSize: 11, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: 1.5 },

    badge: {
      display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
      background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.14)",
      borderRadius: 12, maxWidth: 340,
      opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.4s",
    },
    badgeIcon:       { width: 36, height: 36, borderRadius: 8, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    badgeText:       { fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
    badgeTextStrong: { color: "#374151", fontWeight: 600, display: "block", marginBottom: 2 },

    panel: {
      width: "100%", maxWidth: 400,
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
      transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
    },
    panelHeader:  { marginBottom: 32 },
    panelEyebrow: { fontSize: 11, color: "#2563eb", fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase" as const, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
    eyebrowLine:  { flex: 1, height: 1, background: "linear-gradient(90deg, rgba(37,99,235,0.5), transparent)" },
    panelTitle:   { fontSize: 26, fontWeight: 700, color: "#0a0a0f", marginBottom: 6, letterSpacing: "-0.5px" },
    panelDesc:    { fontSize: 13.5, color: "#9ca3af" },

    hudBox: {
      position: "relative", padding: "32px",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(37,99,235,0.16)",
      borderRadius: 16, boxShadow: "0 0 40px rgba(37,99,235,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    cornerTL: { position: "absolute", top: -1, left: -1,   width: 18, height: 18, borderTop:    "2px solid #2563eb", borderLeft:  "2px solid #2563eb", borderRadius: "4px 0 0 0" },
    cornerTR: { position: "absolute", top: -1, right: -1,  width: 18, height: 18, borderTop:    "2px solid #2563eb", borderRight: "2px solid #2563eb", borderRadius: "0 4px 0 0" },
    cornerBL: { position: "absolute", bottom: -1, left: -1, width: 18, height: 18, borderBottom: "2px solid #2563eb", borderLeft:  "2px solid #2563eb", borderRadius: "0 0 0 4px" },
    cornerBR: { position: "absolute", bottom: -1, right: -1,width: 18, height: 18, borderBottom: "2px solid #2563eb", borderRight: "2px solid #2563eb", borderRadius: "0 0 4px 0" },

    form:    { display: "flex", flexDirection: "column", gap: 18 },
    field:   { display: "flex", flexDirection: "column", gap: 7 },
    label:   { fontSize: 11.5, color: "#6b7280", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" as const },
    divider: { height: 1, background: "rgba(37,99,235,0.07)", margin: "2px 0" },

    error: {
      display: "flex", alignItems: "center", gap: 8,
      background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)",
      color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 4,
    },
    registerRow: { marginTop: 20, textAlign: "center" as const, fontSize: 13, color: "#9ca3af" },
    footer: { marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: "#9ca3af" },
    footerDot: { width: 3, height: 3, borderRadius: "50%", background: "rgba(37,99,235,0.5)" },
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    background:  focused === field ? "rgba(37,99,235,0.05)" : "rgba(249,250,251,1)",
    border:      `1px solid ${focused === field ? "rgba(37,99,235,0.45)" : "rgba(209,213,219,1)"}`,
    borderRadius: 10,
    padding:     "13px 16px",
    color:       "#111827",
    fontSize:    14,
    outline:     "none",
    transition:  "border-color .2s, background .2s, box-shadow .2s",
    boxShadow:   focused === field ? "0 0 0 3px rgba(37,99,235,0.07)" : "none",
    fontFamily:  "inherit",
    width:       "100%",
    boxSizing:   "border-box" as const,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 4px 24px rgba(37,99,235,0.32); }
          50%      { box-shadow: 0 4px 40px rgba(37,99,235,0.52); }
        }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .mm-left  { display: none !important; }
          .mm-right { flex: 1 1 100% !important; border-left: none !important; padding: 32px 24px !important; }
        }
      `}</style>

      <div style={s.page}>
        <canvas ref={canvasRef} style={s.canvas} />
        <div style={s.glow1} />
        <div style={s.glow2} />

        {/* ── LEFT — brand ── */}
        <div className="mm-left" style={s.left}>
          <div style={s.tagline}>
            <span style={s.tagDot} />
            Système de gestion
          </div>
          <div style={s.brandName}>
            <span>Meta </span>
            <span style={s.brandAccent}>Meca</span>
          </div>
          <div style={s.brandSub}>Industries · Est. 2015</div>

          <div style={s.statsRow}>
            {[
              { num: "12+", label: "Années d'exp." },
              { num: "340", label: "Projets livrés" },
              { num: "98%", label: "Satisfaction" },
            ].map((st) => (
              <div key={st.label} style={s.statItem}>
                <span style={s.statNum}>{st.num}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          <div style={s.badge}>
            <div style={s.badgeIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div style={s.badgeText}>
              <span style={s.badgeTextStrong}>Panneau de contrôle industriel</span>
              Accès réservé au personnel autorisé
            </div>
          </div>
        </div>

        {/* ── RIGHT — login form ── */}
        <div className="mm-right" style={s.right}>
          <div style={s.panel}>

            <div style={s.panelHeader}>
              <div style={s.panelEyebrow}>
                <span style={s.eyebrowLine} />
              </div>
              <div style={s.panelTitle}>Connexion</div>
              <div style={s.panelDesc}>Identifiez-vous pour accéder à votre espace</div>
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
                <div style={s.field}>
                  <label style={s.label}>Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    style={inputStyle("email")}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div style={s.divider} />

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
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 8,
                    padding: "14px",
                    background: loading
                      ? "rgba(37,99,235,0.35)"
                      : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
                    border: "none", borderRadius: 10, color: "#ffffff",
                    fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    letterSpacing: 0.5, transition: "opacity .2s, transform .15s",
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
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      Accéder à mon espace
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div style={s.registerRow}>
                Pas encore de compte ?{" "}
                <a href="/register" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  Créer un compte client
                </a>
              </div>
            </div>

            <div style={s.footer}>
              <span>Meta Meca Industries</span>
              <span style={s.footerDot} />
              <span>Accès sécurisé</span>
              <span style={s.footerDot} />
              <span>v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}