import { Search, PenTool, CheckCircle2, Hammer, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  { icon: Search,       title: "Étude du besoin",      desc: "Nous écoutons, analysons et conseillons selon vos contraintes et ambitions." },
  { icon: PenTool,      title: "Conception 2D / 3D",   desc: "Nos designers modélisent votre projet avec précision avant toute fabrication." },
  { icon: CheckCircle2, title: "Validation du design",  desc: "Vous validez les plans, les matériaux et les finitions choisies ensemble." },
  { icon: Hammer,       title: "Fabrication",           desc: "Production en atelier alliant précision artisanale et excellence industrielle." },
  { icon: Truck,        title: "Installation finale",   desc: "Pose et livraison soignée, votre espace prêt à vivre dès le premier jour." },
];

/* ── Hook: IntersectionObserver reveal ── */
function useReveal(threshold = 0.15) {
  const ref  = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Single Step Block ── */
function StepBlock({
  step, index, total, visible,
}: {
  step: typeof steps[0]; index: number; total: number; visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = step.icon;
  const delay = index * 110;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        flex: "1 1 0",
        minWidth: 0,
        padding: "48px 28px 40px",
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? "translateY(-6px) scale(1.018)" : "translateY(0) scale(1)"
          : "translateY(32px)",
        transition: visible
          ? `opacity 0.65s ease ${delay}ms, transform ${hovered ? "0.28s" : "0.65s"} cubic-bezier(0.22,1,0.36,1) ${hovered ? "0ms" : delay + "ms"}`
          : "none",
        cursor: "default",
      }}
    >
      {/* Giant background number */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 12,
          left: 20,
          fontSize: "clamp(72px, 8vw, 110px)",
          fontWeight: 700,
          fontFamily: "'Georgia', serif",
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: "1px rgba(180,165,140,0.18)",
          userSelect: "none",
          pointerEvents: "none",
          transition: "opacity 0.3s",
          opacity: hovered ? 0.55 : 0.28,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Vertical connector line (except last on desktop) */}
      {index < total - 1 && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 1,
            height: "38%",
            background: "linear-gradient(to bottom, transparent, rgba(180,160,120,0.22), transparent)",
          }}
          className="hidden lg:block"
        />
      )}

      {/* Icon — minimal, no circle */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginBottom: 24,
          transition: "transform 0.3s ease",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.4}
          style={{
            color: hovered ? "#0d3875" : "#9a8a72",
            transition: "color 0.3s ease",
          }}
        />
      </div>

      {/* Step label */}
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 500,
          marginBottom: 14,
          position: "relative",
          zIndex: 1,
          color: "#0d3875",
          opacity: 0.85,
        }}
      >
        Étape {index + 1}
      </p>

      {/* Title */}
      <h3
        style={{
          fontSize: "clamp(15px, 1.5vw, 19px)",
          fontWeight: 400,
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontStyle: "italic",
          lineHeight: 1.25,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
          color: "inherit",
          letterSpacing: "-0.01em",
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.75,
          maxWidth: 200,
          position: "relative",
          zIndex: 1,
          color: "rgba(100,92,82,0.85)",
          fontWeight: 400,
        }}
      >
        {step.desc}
      </p>

      {/* Hover underline accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 28,
          right: 28,
          height: 1,
          background: "linear-gradient(to right, transparent, rgba(184,151,90,0.6), transparent)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

/* ── Main Section ── */
export function Process() {
  const { ref: sectionRef, visible } = useReveal(0.1);
  const { ref: headerRef, visible: headerVisible } = useReveal(0.2);

  return (
    <section
      id="process"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(56px, 8vw, 100px) 0 clamp(48px, 6vw, 80px)",
        background: "#ffffff",
      }}
    >
      {/* Background texture lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 79px,
              rgba(180,165,140,0.06) 79px,
              rgba(180,165,140,0.06) 80px
            )
          `,
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", margin: 0, padding: "0 24px" }}>
        {/* ── Header ── */}
        <div
          ref={headerRef}
          style={{
            marginBottom: 72,
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ height: 1, width: 40, background: "rgba(184,151,90,0.55)" }} />
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "#0d3875",
              }}
            >
              Notre process
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 58px)",
              fontWeight: 300,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#1c1a17",
              maxWidth: 560,
              margin: "0 0 20px",
            }}
          >
            De l'idée à{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400, color: "#0d3875" }}>
              la réalisation
            </em>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(80,72,60,0.75)",
              maxWidth: 440,
              fontWeight: 400,
            }}
          >
            Un processus éprouvé en cinq étapes pour garantir qualité et respect de vos exigences.
          </p>
        </div>

        {/* ── Timeline connector (desktop) ── */}
        <div
          style={{
            position: "relative",
          }}
        >
          {/* Horizontal ruling line behind steps */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 64,
              left: 28,
              right: 28,
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(184,151,90,0.2) 10%, rgba(184,151,90,0.2) 90%, transparent)",
              zIndex: 0,
            }}
          />

          {/* ── Steps row ── */}
          <div
            ref={sectionRef}
            style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 0,
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {steps.map((step, i) => (
              <StepBlock
                key={step.title}
                step={step}
                index={i}
                total={steps.length}
                visible={visible}
              />
            ))}
          </div>
        </div>

        {/* ── Footer caption ── */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid rgba(180,165,140,0.15)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease 0.6s",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(100,92,82,0.5)",
              fontWeight: 500,
            }}
          >
            Fabrication sur mesure — Délai moyen 4–8 semaines
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === 0 ? 20 : 5,
                  height: 1,
                  background: i === 0 ? "#0d3875" : "rgba(184,151,90,0.28)",
                  borderRadius: 1,
                  transition: "width 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}