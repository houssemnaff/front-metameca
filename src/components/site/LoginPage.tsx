import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type LoginLocationState = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const location = useLocation();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const state = location.state as LoginLocationState | null;
    if (!state) return;

    if (state.email) setEmail(state.email);
    if (state.password) setPassword(state.password);

    window.history.replaceState({}, document.title);
  }, [location.state]);

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

  /* Tailwind classes replace inline styles. Use `mounted` and `focused` for minor dynamic states. */
  const pageClass = "min-h-screen bg-white relative overflow-hidden font-sans flex";
  const leftClass = `hidden md:flex flex-1 flex-col justify-center px-16 py-20 relative z-10 gap-8`;
  const rightClass = `flex-1 md:flex-[0_0_45%] flex items-center justify-center p-10 relative z-10 border-l border-blue-100 bg-white/60`;
  const taglineClass = `inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-1 text-xs font-semibold text-blue-600 uppercase transition-all ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`;
  const brandNameClass = `text-[clamp(36px,4vw,56px)] font-extrabold leading-tight ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;
  const brandAccentClass = `bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 bg-clip-text text-transparent`;
  const brandSubClass = `uppercase text-sm tracking-widest text-gray-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;
  const statsRowClass = `flex gap-8 mb-14 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;
  const badgeClass = `flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg max-w-[20rem]`;
  const panelClass = `w-full max-w-md ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`;
  const formClass = `flex flex-col gap-4`;
  const fieldClass = `flex flex-col gap-2`;
  const labelClass = `text-xs font-semibold text-gray-500 uppercase tracking-wider`;
  const dividerClass = `h-px bg-blue-50 my-1`;
  const errorClass = `flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm`;
  const registerRowClass = `mt-4 text-center text-sm text-gray-500`;
  const footerClass = `mt-6 flex items-center justify-center gap-3 text-sm text-gray-400`;
  const inputBase = `rounded-lg px-4 py-3 text-gray-900 text-sm w-full transition-shadow transition-colors outline-none`;
  const inputFocused = `ring-2 ring-blue-100 bg-blue-50 border-blue-200`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes btnPulse { 0%,100%{ box-shadow: 0 8px 30px rgba(37,99,235,0.18)} 50%{ box-shadow: 0 8px 50px rgba(37,99,235,0.26)} }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
      `}</style>

      <div className={pageClass}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        <div className="absolute -top-20 -left-10 w-2/3 h-2/3 rounded-full bg-gradient-radial from-blue-100/30 to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-1/2 h-1/2 rounded-full bg-gradient-radial from-indigo-100/20 to-transparent pointer-events-none" />

        <div className={leftClass + " mm-left"}>
          <div className={taglineClass}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-md" />
            Système de gestion
          </div>
          <div className={brandNameClass}>
            <span>Meta </span>
            <span className={brandAccentClass}>Meca</span>
          </div>
          <div className={brandSubClass}>Industries · Est. 2015</div>

          <div className={statsRowClass}>
            {[{ num: "12+", label: "Années d'exp." }, { num: "340", label: "Projets livrés" }, { num: "98%", label: "Satisfaction" }].map((st) => (
              <div key={st.label} className="flex flex-col gap-1">
                <span className="text-2xl font-extrabold text-blue-600 tabular-nums">{st.num}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">{st.label}</span>
              </div>
            ))}
          </div>

          <div className={badgeClass}>
            <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div className="text-sm text-gray-500">
              <span className="block font-semibold text-gray-700">Panneau de contrôle industriel</span>
              Accès réservé au personnel autorisé
            </div>
          </div>
        </div>

        <div className={rightClass + " mm-right"}>
          <div className={panelClass}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-px bg-linear-to-r from-blue-300/60 to-transparent" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-sm text-gray-500">Identifiez-vous pour accéder à votre espace</p>
            </div>

            <div className="relative p-6 bg-white border border-blue-50 rounded-2xl shadow-sm">
              {error && (
                <div className={errorClass}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={formClass}>
                <div className={fieldClass}>
                  <label className={labelClass}>Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    className={`${inputBase} ${focused === "email" ? inputFocused : "bg-gray-50 border border-gray-200"}`}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className={dividerClass} />

                <div className={fieldClass}>
                  <label className={labelClass}>Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused("password")}
                        onBlur={() => setFocused("")}
                        className={`${inputBase} pr-12 ${focused === "password" ? inputFocused : "bg-gray-50 border border-gray-200"}`}
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7a11.07 11.07 0 0 1 2.36-4.11" />
                            <path d="M1 1l22 22" />
                            <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white rounded-lg ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 hover:opacity-90"}`}
                  style={{ animation: loading ? "none" : "btnPulse 2.5s ease-in-out infinite" }}
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

              <div className={registerRowClass}>
                Pas encore de compte ? {" "}
                <Link to="/register" className="text-blue-600 font-semibold">Créer un compte client</Link>
              </div>
            </div>

            <div className={footerClass}>
              <span>Meta Meca Industries</span>
              <span className="w-1 h-1 rounded-full bg-blue-200" />
              <span>Accès sécurisé</span>
              <span className="w-1 h-1 rounded-full bg-blue-200" />
              <span>v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}