import { useState, type SyntheticEvent } from "react";
import { X, Tag, Layers, Pencil, Trash2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../types";
import { mStyles, dStyles } from "../styles";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailModal({ product: p, onClose, onEdit, onDelete }: ProductDetailModalProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = p.images ?? [];
  const hasMultiple = images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(i => (i + 1) % images.length);
  };

  return (
    <div style={mStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={dStyles.modal}>

        {/* ── Image panel ── */}
        <div style={dStyles.imgPanel}>
          {images.length > 0 ? (
            <>
              <img
                src={images[imgIndex].url}
                alt={p.name}
                style={dStyles.mainImg}
                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {hasMultiple && (
                <>
                  <button style={{ ...dStyles.navBtn, left: 10 }} onClick={prev}>
                    <ChevronLeft size={16} />
                  </button>
                  <button style={{ ...dStyles.navBtn, right: 10 }} onClick={next}>
                    <ChevronRight size={16} />
                  </button>
                  <div style={dStyles.dots}>
                    {images.map((_, i) => (
                      <button
                        key={i}
                        style={{ ...dStyles.dot, background: i === imgIndex ? "#1a1a18" : "#d1d5db" }}
                        onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={dStyles.noImg}><Package size={48} color="#d1d5db" /></div>
          )}

          {images.length > 1 && (
            <div style={dStyles.thumbRow}>
              {images.map((img, i) => (
                <button
                  key={i}
                  style={{ ...dStyles.thumb, outline: i === imgIndex ? "2px solid #1a1a18" : "none" }}
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                >
                  <img src={img.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div style={dStyles.infoPanel}>
          <div style={dStyles.infoHeader}>
            <div style={{ flex: 1 }}>
              {p.category && (
                <div style={dStyles.categoryBadge}><Tag size={11} />{p.category}</div>
              )}
              <h2 style={dStyles.productName}>{p.name}</h2>
              {p.reference && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontFamily: "monospace" }}>
                  REF: {p.reference}
                </div>
              )}
            </div>
            <button style={mStyles.closeBtn} onClick={onClose}><X size={18} /></button>
          </div>

          {/* Status */}
          <div style={dStyles.statusRow}>
            <span style={{
              ...dStyles.statusBadge,
              background: p.status === "active" ? "#dcfce7" : "#f3f4f6",
              color: p.status === "active" ? "#15803d" : "#6b7280",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: p.status === "active" ? "#16a34a" : "#9ca3af", marginRight: 6,
              }} />
              {p.status === "active" ? "Actif" : "Inactif"}
            </span>
          </div>

          {/* Price + Stock */}
          <div style={dStyles.metricsRow}>
            <div style={dStyles.metricBox}>
              <div style={dStyles.metricLabel}>Prix</div>
              <div style={dStyles.metricValue}>{Number(p.price).toLocaleString()} DT</div>
            </div>
            <div style={dStyles.metricBox}>
              <div style={dStyles.metricLabel}>Stock</div>
              <div style={{
                ...dStyles.metricValue,
                color: Number(p.stock) === 0 ? "#ef4444" : Number(p.stock) < 10 ? "#f59e0b" : "#111827",
              }}>
                {p.stock ?? "—"}
                {Number(p.stock) === 0 && <span style={dStyles.outOfStock}> Épuisé</span>}
              </div>
            </div>
          </div>

          {/* Description */}
          {p.description && (
            <div style={dStyles.descSection}>
              <div style={dStyles.sectionLabel}>
                <Layers size={13} style={{ marginRight: 5 }} />Description
              </div>
              <p style={dStyles.descText}>{p.description}</p>
            </div>
          )}

          {/* Actions */}
          <div style={dStyles.actionRow}>
            <button style={dStyles.editBtn} onClick={() => onEdit(p)}>
              <Pencil size={14} /> Modifier
            </button>
            <button style={dStyles.delBtn} onClick={() => onDelete(p._id ?? "")}>
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}