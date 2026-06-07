import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Download, ChevronRight } from "lucide-react";
import menuiserieCover from "../../assets/menuiserie.png";
import cuisineCover from "../../assets/cuisine.jpg";
import MetaeCover from "../../assets/metameca1.pdf.png";
import tablebasseCover from "../../assets/tablebasse.png";
import dressingCover from "../../assets/dressing.png";
/* ─────────────── Types ─────────────── */
interface CatalogItem {
  title: string;
  subtitle: string;
  desc: string;
  pdf: string;
  cover: string;
  year: string;
  category: string;
  tag?: string;
}

/* ─────────────── Data ─────────────── */
const catalogs: CatalogItem[] = [
   {
    title: "Meta Meca",
    subtitle: "Catalogue général",
    desc: "L'ensemble de nos savoir-faire réunis : structures, façades, mobilier industriel.",
    pdf: "/pdfs/meta.pdf",
    cover: MetaeCover,
    year: "2026",
    category: "Géneral",
    tag: "Signature",
  },
  {
    title: "Portes en acier",
    subtitle: "Menuiserie sur mesure",
    desc: "Collection complète de portes industrielles et résidentielles, détails de finition et spécifications techniques.",
    pdf: "/pdfs/menuiserie.pdf",
        cover: menuiserieCover,
    year: "2026",
    category: "Portes",
    tag: "New",
  },
  {
    title: "Cuisines Équipées",
    subtitle: "Design & solutions modernes",
    desc: "Architectures de cuisine contemporaines, matériaux nobles, configurations sur mesure.",
    pdf: "/pdfs/cuisine.pdf",
    cover: cuisineCover,
    year: "2026",
    category: "Cuisines",
  },
  {
    title: "Tables Basses",
    subtitle: "Mobilier salon design",
    desc: "Collection de tables basses modernes en bois, métal et verre pour salons élégants.",
    pdf: "/pdfs/table-basse.pdf",
     cover: tablebasseCover,
    year: "2026",
    category: "Furniture",
    tag: "Featured",
  },
  {
    title: "Dressing & Rangements",
    subtitle: "Organisation sur mesure",
    desc: "Solutions de dressings modernes et modulaires pour optimiser vos espaces avec style.",
    pdf: "/pdfs/dressing.pdf",
   cover: dressingCover,
    year: "2026",
    category: "Dressing",
  },
 
];

const filters = ["Tous", "Portes", "Cuisines", "Furniture", "Dressing", "Facades"];

/* ─────────────── Parallax image hook ─────────────── */
function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-[-10%] w-[120%] h-[120%]">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            if (t.parentElement) {
              t.parentElement.style.background =
                "linear-gradient(135deg, #1a1816 0%, #2d2a26 50%, #1a1816 100%)";
            }
          }}
        />
      </motion.div>
    </div>
  );
}

/* ─────────────── Catalog Card ─────────────── */
function CatalogCard({ item, index }: { item: CatalogItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-pointer"
      style={{ fontFamily: "inherit" }}
    >
      {/* Card shell */}
      <div className="relative overflow-hidden" style={{ borderRadius: "2px", aspectRatio: "3/4" }}>

        {/* Parallax image */}
        <ParallaxImage src={item.cover} alt={item.title} />

        {/* Base gradient */}
        <div
          className="absolute inset-0 z-10 transition-opacity duration-700"
          style={{
            background: "linear-gradient(to top, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.25) 55%, transparent 100%)",
          }}
        />

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 z-10"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: "rgba(10,9,8,0.35)" }}
        />

        {/* Tag pill */}
        {item.tag && (
          <div
            className="absolute top-5 left-5 z-20 px-3 py-1"
            style={{
              fontSize: "9px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#c9a96e",
              border: "1px solid rgba(201,169,110,0.4)",
              borderRadius: "1px",
              backdropFilter: "blur(8px)",
              background: "rgba(10,9,8,0.4)",
            }}
          >
            {item.tag}
          </div>
        )}

        {/* Year */}
        <div
          className="absolute top-5 right-5 z-20"
          style={{
            fontSize: "9px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {item.year}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-7">
          {/* Subtitle */}
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(201,169,110,0.75)",
              fontWeight: 500,
              marginBottom: "10px",
            }}
          >
            {item.subtitle}
          </p>

          {/* Title */}
          <h3
            style={{
              fontSize: "clamp(18px, 1.8vw, 24px)",
              fontWeight: 300,
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontStyle: "italic",
              lineHeight: 1.15,
              color: "#f0ece4",
              marginBottom: "14px",
              letterSpacing: "-0.01em",
            }}
          >
            {item.title}
          </h3>

          {/* Description — slides up on hover */}
          <motion.p
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : 10,
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              marginBottom: "20px",
            }}
          >
            {item.desc}
          </motion.p>

          {/* Actions — slide up on hover */}
          <motion.div
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : 8,
            }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="flex items-center gap-5"
          >
            <a
              href={item.pdf}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "#ffffff",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.25)",
                paddingBottom: "2px",
              }}
            >
              View Catalog <ArrowUpRight size={11} />
            </a>
            <a
              href={item.pdf}
              download
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "rgba(255,255,255,0.38)",
                textDecoration: "none",
              }}
            >
              <Download size={10} /> PDF
            </a>
          </motion.div>
        </div>

        {/* Hover border glow */}
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            border: "1px solid rgba(201,169,110,0.2)",
            borderRadius: "2px",
          }}
        />
      </div>

      {/* Category label below card */}
      <div className="mt-4 flex items-center justify-between">
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(26,24,22,0.35)",
            fontWeight: 500,
          }}
        >
          {item.category}
        </span>
        <motion.div
          animate={{ x: hovered ? 0 : -6, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={14} color="rgba(201,169,110,0.7)" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Featured Card (wide, 2-col span) ─────────────── */
function FeaturedCard({ item }: { item: CatalogItem }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer col-span-1 md:col-span-2"
    >
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: "2px", aspectRatio: "16/7" }}
      >
        <ParallaxImage src={item.cover} alt={item.title} />

        {/* Cinematic overlays */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "radial-gradient(ellipse at 65% 50%, transparent 20%, rgba(10,9,8,0.55) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-10 transition-opacity duration-700"
          style={{
            background: "linear-gradient(to right, rgba(10,9,8,0.88) 0%, rgba(10,9,8,0.1) 50%, transparent 100%)",
          }}
        />
        <motion.div
          className="absolute inset-0 z-10"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: "rgba(10,9,8,0.25)" }}
        />

        {/* Tag */}
        {item.tag && (
          <div
            className="absolute top-6 left-8 z-20 px-3 py-1"
            style={{
              fontSize: "9px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#c9a96e",
              border: "1px solid rgba(201,169,110,0.4)",
              borderRadius: "1px",
              backdropFilter: "blur(8px)",
              background: "rgba(10,9,8,0.4)",
            }}
          >
            {item.tag}
          </div>
        )}

        {/* Content */}
        <div className="absolute left-0 bottom-0 top-0 z-20 flex flex-col justify-end p-10 max-w-xl">
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(201,169,110,0.8)",
              fontWeight: 500,
              marginBottom: "14px",
            }}
          >
            {item.subtitle}
          </p>
          <h3
            style={{
              fontSize: "clamp(28px, 3.5vw, 52px)",
              fontWeight: 300,
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontStyle: "italic",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: "#f5f0e8",
              marginBottom: "16px",
            }}
          >
            {item.title}
          </h3>

          <motion.p
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75,
              marginBottom: "24px",
              maxWidth: "360px",
            }}
          >
            {item.desc}
          </motion.p>

          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="flex items-center gap-6"
          >
            <a
              href={item.pdf}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "#ffffff",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.25)",
                paddingBottom: "2px",
              }}
            >
              View Catalog <ArrowUpRight size={12} />
            </a>
            <a
              href={item.pdf}
              download
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Download size={11} /> PDF
            </a>
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ border: "1px solid rgba(201,169,110,0.18)", borderRadius: "2px" }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(26,24,22,0.35)",
          }}
        >
          {item.category} · Vol. {item.year}
        </span>
        <motion.div animate={{ x: hovered ? 0 : -6, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronRight size={14} color="rgba(201,169,110,0.7)" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Filter Bar ─────────────── */
function FilterBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (f: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: active === f ? 600 : 400,
            padding: "10px 20px",
            borderRadius: "1px",
            border: active === f ? "1px solid rgba(201,169,110,0.6)" : "1px solid rgba(26,24,22,0.12)",
            background: active === f ? "rgba(201,169,110,0.08)" : "transparent",
            color: active === f ? "#1a1816" : "rgba(26,24,22,0.45)",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (active !== f) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(26,24,22,0.3)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(26,24,22,0.7)";
            }
          }}
          onMouseLeave={(e) => {
            if (active !== f) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(26,24,22,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(26,24,22,0.45)";
            }
          }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

/* ─────────────── Scroll counter ─────────────── */
function CounterBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "rgba(201,169,110,0.8)",
        fontWeight: 500,
      }}
    >
      {count} {count === 1 ? "collection" : "collections"}
    </span>
  );
}

/* ─────────────── Main Catalog Component ─────────────── */
export function Catalog() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [filtered, setFiltered] = useState(catalogs);

  useEffect(() => {
    if (activeFilter === "All") {
      setFiltered(catalogs);
    } else {
      setFiltered(catalogs.filter((c) => c.category === activeFilter));
    }
  }, [activeFilter]);

  // Split: first featured item (if All selected), rest in grid
  const featuredItem = activeFilter === "All" ? filtered[0] : null;
  const gridItems = activeFilter === "All" ? filtered.slice(1) : filtered;

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <section
      id="catalogue"
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ─── Google Fonts import ─── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        `}</style>

        {/* ─── Hero Header ─── */}
        <div
          style={{
            borderBottom: "1px solid rgba(26,24,22,0.07)",
            padding: "80px 5vw 60px",
          }}
        >
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 32 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-8">
              <div style={{ height: "1px", width: "36px", background: "rgba(201,169,110,0.6)" }} />
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "#c9a96e",
                }}
              >
                Meta Meca Studio
              </span>
            </div>

            <div
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
              style={{ marginBottom: "52px" }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "clamp(42px, 7vw, 96px)",
                    fontWeight: 300,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: "italic",
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    color: "#1a1816",
                    margin: 0,
                  }}
                >
                  Nos
                  <br />
                  <span style={{ fontStyle: "normal", fontWeight: 300 }}>Catalogues</span>
                </h1>
              </div>

              <div style={{ maxWidth: "380px", paddingBottom: "8px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(26,24,22,0.45)",
                    lineHeight: 1.8,
                    margin: "0 0 20px",
                  }}
                >
                 Découvrez nos collections de portes, cuisines, meubles et

systèmes architecturaux — conçus pour ceux qui exigent
un design exceptionnel.
                </p>
                <CounterBadge count={filtered.length} />
              </div>
            </div>

            {/* Filter bar */}
            <FilterBar active={activeFilter} onChange={setActiveFilter} />
          </motion.div>
        </div>

        {/* ─── Grid ─── */}
        <div style={{ padding: "64px 5vw 96px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {filtered.length === 0 ? (
                <div
                  className="flex items-center justify-center"
                  style={{ minHeight: "320px" }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(26,24,22,0.3)",
                    }}
                  >
                   Aucune collection dans cette catégorie
                  </p>
                </div>
              ) : (
                <div>
                  {/* Featured wide card */}
                  {featuredItem && (
                    <div style={{ marginBottom: "10px" }}>
                      <FeaturedCard item={featuredItem} />
                    </div>
                  )}

                  {/* Regular grid */}
                  {gridItems.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                        gap: "10px",
                      }}
                    >
                      {gridItems.map((item, i) => (
                        <CatalogCard key={item.title} item={item} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Footer CTA ─── */}
        <div
          style={{
            background: "#1a1816",
            padding: "80px 5vw 96px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              height: "250px",
              background:
                "radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 0,
              left: "8%",
              right: "8%",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(201,169,110,0.18), transparent)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
            style={{ position: "relative" }}
          >
            <div style={{ maxWidth: "500px" }}>
              <p
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(201,169,110,0.6)",
                  fontWeight: 500,
                  marginBottom: "16px",
                }}
              >
                Édition collector
              </p>
              <h3
                style={{
                  fontSize: "clamp(24px, 3.5vw, 44px)",
                  fontWeight: 300,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#f0ece4",
                  margin: "0 0 16px",
                }}
              >
                Receive the complete printed collection
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.32)",
                  lineHeight: 1.8,
                }}
              >
                Tous les catalogues {catalogs.length} réunis dans un coffret collector Meta Meca signé

livraison sur demande.
              </p>
            </div>

            <a
              href="#contact"
              className="flex items-center gap-3 group"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "18px 40px",
                border: "1px solid rgba(201,169,110,0.3)",
                borderRadius: "1px",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "#ffffff",
                textDecoration: "none",
                transition: "all 0.35s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(201,169,110,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(201,169,110,0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(201,169,110,0.3)";
              }}
            >
              Request the Collection
              <ArrowUpRight size={13} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Catalog;