import { useState } from "react";
import { Pencil, Trash2, Package } from "lucide-react";
import type { Product } from "../types";
import { styles } from "../styles";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// ─── Stock helpers ────────────────────────────────────────────────────────────

function getStockMeta(stock: number): {
  label: string | null;
  color: string;
  bg: string;
  badge: string | null;
  badgeBg: string;
  badgeColor: string;
} {
  if (stock === 0) {
    return {
      label: "Out of stock",
      color: "#dc2626",
      bg: "#fef2f2",
      badge: "Out of stock",
      badgeBg: "#fef2f2",
      badgeColor: "#dc2626",
    };
  }
  if (stock < 5) {
    return {
      label: `${stock} left`,
      color: "#ea580c",
      bg: "#fff7ed",
      badge: "Low stock",
      badgeBg: "#fff7ed",
      badgeColor: "#ea580c",
    };
  }
  return {
    label: `${stock} in stock`,
    color: "#16a34a",
    bg: "#f0fdf4",
    badge: null,
    badgeBg: "",
    badgeColor: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductCard({ product: p, onClick, onEdit, onDelete }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const stock = getStockMeta(Number(p.stock));

  // ── Card container ──────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    ...styles.card,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    boxShadow: hovered
      ? "0 12px 32px -4px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)"
      : "0 1px 4px rgba(0,0,0,0.05)",
    transform: hovered ? "translateY(-3px)" : "translateY(0)",
    transition: "box-shadow 0.22s ease, transform 0.22s ease",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    position: "relative",
  };

  // ── Image section ───────────────────────────────────────────────────────────
  const imgWrapStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: "4/3",
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderBottom: "1px solid #f3f4f6",
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: imgError ? "none" : "block",
    transition: "transform 0.35s ease",
    transform: hovered ? "scale(1.04)" : "scale(1)",
  };

  // ── Status dot (active / inactive) ─────────────────────────────────────────
  const statusDotStyle: React.CSSProperties = {
    position: "absolute",
    top: 10,
    left: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 99,
    padding: "3px 9px 3px 6px",
    fontSize: 11,
    fontWeight: 600,
    color: p.status === "active" ? "#15803d" : "#6b7280",
    letterSpacing: 0.2,
  };

  const dotDotStyle: React.CSSProperties = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: p.status === "active" ? "#16a34a" : "#9ca3af",
    flexShrink: 0,
  };

  // ── Stock warning badge (top-right) ─────────────────────────────────────────
  const stockBadgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 10,
    right: 10,
    background: stock.badgeBg,
    color: stock.badgeColor,
    border: `1px solid ${stock.badgeColor}30`,
    borderRadius: 99,
    padding: "3px 9px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.2,
    backdropFilter: "blur(6px)",
  };

  // ── Body ────────────────────────────────────────────────────────────────────
  const bodyStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: "14px 16px 14px",
    gap: 0,
  };

  // ── Category badge ──────────────────────────────────────────────────────────
  const categoryBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignSelf: "flex-start",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
  };

  // ── Name ────────────────────────────────────────────────────────────────────
  const nameStyle: React.CSSProperties = {
    ...styles.cardName,
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.3,
    margin: 0,
    marginBottom: 3,
  };

  // ── Reference ───────────────────────────────────────────────────────────────
  const refStyle: React.CSSProperties = {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 500,
    letterSpacing: 0.3,
    marginBottom: 7,
    fontFamily: "monospace",
  };

  // ── Description ─────────────────────────────────────────────────────────────
  const descStyle: React.CSSProperties = {
    ...styles.cardDesc,
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 1.55,
    margin: 0,
    marginBottom: 14,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    flex: 1,
  };

  // ── Footer ──────────────────────────────────────────────────────────────────
  const footerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 12,
    marginTop: "auto",
  };

  // ── Price ───────────────────────────────────────────────────────────────────
  const priceStyle: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: -0.3,
    lineHeight: 1,
    marginBottom: 4,
  };

  // ── Stock indicator ─────────────────────────────────────────────────────────
  const stockRowStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: stock.bg,
    color: stock.color,
    borderRadius: 6,
    padding: "2px 7px",
    fontSize: 11,
    fontWeight: 600,
  };

  // ── Action buttons ──────────────────────────────────────────────────────────
  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: 6,
  };

  const editBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s, color 0.15s",
    outline: "none",
  };

  const deleteBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #fee2e2",
    background: "#fff5f5",
    color: "#dc2626",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
    outline: "none",
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image section ───────────────────────────────────────────────── */}
      <div style={imgWrapStyle}>
        {p.images?.[0] && !imgError ? (
          <img
            src={p.images[0].url}
            alt={p.name}
            style={imgStyle}
            onError={() => setImgError(true)}
          />
        ) : (
          <Package size={36} color="#cbd5e1" strokeWidth={1.5} />
        )}

        {/* Status pill — top left */}
        <div style={statusDotStyle}>
          <span style={dotDotStyle} />
          {p.status === "active" ? "Active" : "Inactive"}
        </div>

        {/* Stock warning pill — top right */}
        {stock.badge && (
          <div style={stockBadgeStyle}>
            {stock.badge}
          </div>
        )}
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div style={bodyStyle}>
        {/* Category badge */}
        <span style={categoryBadgeStyle}>{p.category}</span>

        {/* Name */}
        <h3 style={nameStyle}>{p.name}</h3>

        {/* Reference */}
        <div style={refStyle}>#{p.reference || "—"}</div>

        {/* Description */}
        <p style={descStyle}>{p.description}</p>

        {/* Footer: price + stock + actions */}
        <div style={footerStyle}>
          <div>
            <div style={priceStyle}>{Number(p.price).toLocaleString()} DT</div>
            <div style={stockRowStyle}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: stock.color,
                display: "inline-block",
                flexShrink: 0,
              }} />
              {Number(p.stock) === 0 ? "Out of stock" : `${p.stock} in stock`}
            </div>
          </div>

          <div style={actionsStyle}>
            <button
              style={editBtnStyle}
              title="Edit product"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Pencil size={14} />
            </button>
            <button
              style={deleteBtnStyle}
              title="Delete product"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}