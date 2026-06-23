import { useState, useRef, useEffect } from "react";
import avatar from "../../assets/agent-avatar.png";

/* ─── Covers — ajuste les chemins si besoin ─── */
import menuiserieCover from "../../assets/menuiserie.png";
import cuisineCover    from "../../assets/cuisine.jpg";
import MetaeCover      from "../../assets/metameca1.pdf.png";

/* ─── Catalogue data (même structure que ta page Catalogues) ─── */
const CATALOGS = [
  {
    title:    "Portes en acier",
    subtitle: "Menuiserie sur mesure",
    desc:     "Collection complète de portes industrielles et résidentielles, détails de finition et spécifications techniques.",
    pdf:      "/pdfs/menuiserie.pdf",
    cover:    menuiserieCover,
    year:     "2024",
    keywords: ["porte", "portes", "acier", "menuiserie", "ferronnerie", "fer"],
  },
  {
    title:    "Cuisines Équipées",
    subtitle: "Design & solutions modernes",
    desc:     "Architectures de cuisine contemporaines, matériaux nobles, configurations sur mesure.",
    pdf:      "/pdfs/cuisine.pdf",
    cover:    cuisineCover,
    year:     "2024",
    keywords: ["cuisine", "cuisines", "équipée", "cuisson", "kitchen"],
  },
  {
    title:    "Meta Meca",
    subtitle: "Catalogue général",
    desc:     "L'ensemble de nos savoir-faire réunis : structures, façades, mobilier industriel.",
    pdf:      "/pdfs/meta.pdf",
    cover:    MetaeCover,
    year:     "2024",
    keywords: ["meta", "meca", "général", "catalogue", "global", "complet"],
  },
];

/* ─── Détecte quel(s) catalogue(s) afficher selon la question utilisateur ─── */
function detectCatalogs(text: string) {
  const lower = text.toLowerCase();
  return CATALOGS.filter((c) =>
    c.keywords.some((kw) => lower.includes(kw))
  );
}

/* ─── Types ─── */
type CatalogItem = typeof CATALOGS[number];
type Message = {
  role: "bot" | "user";
  text: string;
  catalogs?: CatalogItem[];
};

/* ─── Typing indicator ─── */
function TypingIndicator() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "9px 13px",
      background: "rgba(248,249,252,0.97)",
      border: "1px solid rgba(79,70,229,0.09)",
      borderRadius: "18px 18px 18px 4px",
      width: "fit-content",
    }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#4f46e5", display: "block", opacity: 0.75,
          animation: "mmBounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Carte catalogue dans le chat ─── */
function CatalogCard({ cat }: { cat: CatalogItem }) {
  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: "1px solid rgba(79,70,229,0.15)",
      background: "rgba(255,255,255,0.98)",
      boxShadow: "0 4px 18px rgba(79,70,229,0.10)",
      width: 230,
      animation: "mmFadeIn 0.3s ease",
    }}>
      {/* Miniature */}
      <div style={{ position: "relative", height: 120, overflow: "hidden", background: "#e8e8f0" }}>
        <img
          src={cat.cover}
          alt={cat.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(30,27,74,0.55) 0%, transparent 60%)",
        }} />
        <span style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(79,70,229,0.85)", backdropFilter: "blur(6px)",
          color: "white", fontSize: 10, fontWeight: 600,
          borderRadius: 6, padding: "2px 7px", letterSpacing: 0.5,
        }}>
          {cat.year}
        </span>
        <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}>{cat.title}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10.5 }}>{cat.subtitle}</div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ padding: "10px 12px 12px" }}>
        <p style={{ fontSize: 11.5, color: "#4b5563", lineHeight: 1.5, margin: "0 0 10px" }}>
          {cat.desc}
        </p>
        <a
          href={cat.pdf}
          download
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: "white", borderRadius: 9, padding: "7px 0",
            fontSize: 12, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 3px 10px rgba(79,70,229,0.3)",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 5px 16px rgba(79,70,229,0.45)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 3px 10px rgba(79,70,229,0.3)";
            (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Télécharger le PDF
        </a>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════ */
const SUGGESTIONS = ["Devis", "Services", "Contact", "Catalogue"];

export function AIAgent() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Salut 👋 Comment je peux t'aider ?" },
  ]);
  const [loading, setLoading]   = useState(false);
  const [input, setInput]       = useState("");
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function sendMessage(overrideText?: string) {
    const userMsg = (overrideText ?? input).trim();
    if (!userMsg) return;

    setShowChips(false);
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const base = import.meta.env.VITE_API_URL ;
      const res = await fetch(`${base}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      const replyText: string = data.reply ?? "Je suis désolé, une erreur s'est produite.";

      /* ── Détection catalogue dans la question de l'utilisateur ── */
      const matched = detectCatalogs(userMsg);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: replyText,
          catalogs: matched.length > 0 ? matched : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Erreur serveur 😢" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ════════════════ RENDER ════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');
        @keyframes mmBounce      { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes mmFadeSlideUp { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes mmFadeIn      { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mmPulseRing   { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }
        @keyframes mmGradBar     { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .mm-root * { font-family:'DM Sans',sans-serif !important; box-sizing:border-box; }
        .mm-fab:hover  { transform:scale(1.09) !important; }
        .mm-send:hover:not(:disabled) { box-shadow:0 5px 16px rgba(79,70,229,0.45) !important; transform:translateY(-1px) !important; }
        .mm-chip:hover { background:rgba(79,70,229,0.08) !important; border-color:rgba(79,70,229,0.4) !important; transform:translateY(-1px); }
        .mm-input:focus{ outline:none; border-color:rgba(79,70,229,0.45) !important; box-shadow:0 0 0 3px rgba(79,70,229,0.08) !important; }
        .mm-msgs::-webkit-scrollbar       { width:3px }
        .mm-msgs::-webkit-scrollbar-thumb { background:rgba(79,70,229,0.2); border-radius:4px }
      `}</style>

      <div className="mm-root">

        {/* ── FAB ── */}
        <div className="fixed bottom-6 right-28 z-[9999] flex flex-col items-end gap-2">
          {!open && (
            <div style={{
              background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)",
              border:"1px solid rgba(79,70,229,0.15)", borderRadius:20,
              padding:"7px 13px", fontSize:12.5, fontWeight:500, color:"#374151",
              boxShadow:"0 4px 18px rgba(0,0,0,0.08)",
              animation:"mmFadeIn 0.4s ease",
              display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
            }}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 5px #22c55e",display:"inline-block"}}/>
              Besoin d'aide ?
            </div>
          )}

          <div style={{ position:"relative" }}>
            {!open && (
              <span style={{
                position:"absolute", inset:0, borderRadius:"50%",
                background:"rgba(79,70,229,0.35)",
                animation:"mmPulseRing 2s ease-out infinite",
                pointerEvents:"none",
              }}/>
            )}
            <button
              className="mm-fab"
              onClick={() => setOpen((o) => !o)}
              style={{
                width:56, height:56, borderRadius:"50%", border:"none", cursor:"pointer",
                position:"relative", zIndex:1,
                background:"linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#3730a3 100%)",
                boxShadow:"0 6px 24px rgba(79,70,229,0.45)",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s",
                overflow:"hidden", padding:0,
              }}
            >
              {open
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <img src={avatar} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              }
            </button>
          </div>
        </div>

        {/* ── CHAT WINDOW ── */}
        {open && (
          <div
            className="fixed z-[9999]"
            style={{
              bottom:96, right:96,
              width:348,
              maxHeight:600, minHeight:420,
              background:"rgba(255,255,255,0.975)", backdropFilter:"blur(20px)",
              borderRadius:20,
              boxShadow:"0 24px 70px rgba(0,0,0,0.14),0 4px 18px rgba(79,70,229,0.12),inset 0 1px 0 rgba(255,255,255,0.85)",
              border:"1px solid rgba(79,70,229,0.11)",
              display:"flex", flexDirection:"column", overflow:"hidden",
              animation:"mmFadeSlideUp 0.32s cubic-bezier(.34,1.2,.64,1)",
            }}
          >
            {/* HEADER */}
            <div style={{
              background:"linear-gradient(135deg,#4f46e5 0%,#3730a3 100%)",
              padding:"13px 15px", display:"flex", alignItems:"center",
              gap:10, flexShrink:0,
            }}>
              <div style={{
                width:38, height:38, borderRadius:10,
                background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.22)",
                display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden", flexShrink:0,
              }}>
                <img src={avatar} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13.5,color:"white",letterSpacing:0.2}}>
                  Meta Meca AI Assistant
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 5px #4ade80"}}/>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Assistant en ligne</span>
                </div>
              </div>
              <div onClick={() => setOpen(false)} style={{
                width:28, height:28, borderRadius:7,
                background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
            </div>

            {/* BARRE DÉGRADÉE */}
            <div style={{
              height:2, flexShrink:0,
              background:"linear-gradient(90deg,#4f46e5,#818cf8,#c7d2fe,#818cf8,#4f46e5)",
              backgroundSize:"200% 100%", animation:"mmGradBar 3s linear infinite",
            }}/>

            {/* MESSAGES */}
            <div className="mm-msgs" style={{
              flex:1, overflowY:"auto", padding:"14px 12px",
              display:"flex", flexDirection:"column", gap:9,
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display:"flex", flexDirection:"column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  animation:"mmFadeIn 0.25s ease",
                }}>
                  <div style={{display:"flex", alignItems:"flex-end", gap:7, flexDirection: m.role === "user" ? "row-reverse" : "row"}}>
                    {m.role === "bot" && (
                      <div style={{width:26,height:26,borderRadius:7,flexShrink:0,overflow:"hidden",border:"1px solid rgba(79,70,229,0.2)"}}>
                        <img src={avatar} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>
                    )}
                    <div style={{
                      maxWidth:"82%", padding:"9px 13px",
                      fontSize:13.5, lineHeight:1.55,
                      ...(m.role === "user" ? {
                        background:"linear-gradient(135deg,#6366f1,#4f46e5)",
                        color:"white", borderRadius:"18px 18px 4px 18px",
                        boxShadow:"0 4px 14px rgba(79,70,229,0.28)",
                      } : {
                        background:"rgba(247,248,252,0.97)", color:"#1e1b4b",
                        border:"1px solid rgba(79,70,229,0.08)",
                        borderRadius:"18px 18px 18px 4px",
                        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                      }),
                    }}>
                      {m.text}
                    </div>
                  </div>

                  {/* ── CARTES CATALOGUES ── */}
                  {m.role === "bot" && m.catalogs && m.catalogs.length > 0 && (
                    <div style={{
                      paddingLeft:33, marginTop:6,
                      display:"flex", flexDirection:"column", gap:8,
                    }}>
                      {m.catalogs.map((cat) => (
                        <CatalogCard key={cat.pdf} cat={cat}/>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* TYPING */}
              {loading && (
                <div style={{display:"flex",alignItems:"flex-end",gap:7}}>
                  <div style={{width:26,height:26,borderRadius:7,flexShrink:0,overflow:"hidden",border:"1px solid rgba(79,70,229,0.2)"}}>
                    <img src={avatar} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <TypingIndicator/>
                </div>
              )}

              {/* CHIPS */}
              {showChips && messages.length <= 1 && !loading && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingLeft:33,animation:"mmFadeIn 0.4s ease"}}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="mm-chip" onClick={() => sendMessage(s)} style={{
                      background:"rgba(255,255,255,0.9)", color:"#4f46e5",
                      border:"1px solid rgba(79,70,229,0.2)", borderRadius:20,
                      padding:"5px 12px", fontSize:12, fontWeight:500, cursor:"pointer",
                      transition:"all 0.15s",
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef}/>
            </div>

            {/* INPUT */}
            <div style={{
              padding:"11px 12px",
              borderTop:"1px solid rgba(79,70,229,0.07)",
              background:"rgba(255,255,255,0.96)", flexShrink:0,
            }}>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <input
                  ref={inputRef}
                  className="mm-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Écris un message..."
                  disabled={loading}
                  style={{
                    flex:1, border:"1px solid rgba(79,70,229,0.15)",
                    borderRadius:11, padding:"9px 13px",
                    fontSize:13.5, color:"#1e1b4b",
                    background:"rgba(248,249,252,0.85)",
                    transition:"all 0.2s",
                  }}
                />
                <button
                  className="mm-send"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width:38, height:38, borderRadius:10, border:"none",
                    background: input.trim() && !loading
                      ? "linear-gradient(135deg,#6366f1,#4f46e5)"
                      : "rgba(79,70,229,0.12)",
                    cursor: input.trim() && !loading ? "pointer" : "default",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0,
                    boxShadow: input.trim() && !loading ? "0 3px 10px rgba(79,70,229,0.3)" : "none",
                    transition:"all 0.2s",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={input.trim() && !loading ? "white" : "rgba(79,70,229,0.4)"}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
              <div style={{textAlign:"center",marginTop:7,fontSize:10,color:"#9ca3af"}}>
                Propulsé par Meta Meca AI · Répond en &lt;24h
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}