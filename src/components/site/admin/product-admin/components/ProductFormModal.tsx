import type { FormEvent } from "react";
import { Plus, Tag, ChevronDown } from "lucide-react";
import type { ProductForm, ProductStatus } from "../types";
import { styles, inp } from "../styles";
import { Modal, Field, Row } from "./ui";

interface ProductFormModalProps {
  editId: string | null;
  form: ProductForm;
  loading: boolean;
  selectValue: string;
  availableCategories: string[];  // 👈 ajouté
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCategorySelect: (value: string) => void;
  onCustomCategoryChange: (value: string) => void;
  onFormChange: (partial: Partial<ProductForm>) => void;
}

export function ProductFormModal({
  editId,
  form,
  loading,
  selectValue,
  availableCategories,  // 👈 ajouté
  onClose,
  onSubmit,
  onCategorySelect,
  onCustomCategoryChange,
  onFormChange,
}: ProductFormModalProps) {
  return (
    <Modal title={editId ? "Modifier le produit" : "Nouveau produit"} onClose={onClose}>
      <form onSubmit={onSubmit} style={styles.form}>

        {/* Name + Reference */}
        <Row>
          <Field label="Nom *">
            <input
              style={inp}
              value={form.name}
              onChange={e => onFormChange({ name: e.target.value })}
              required
            />
          </Field>

          <Field label="Référence produit">
            {!form.isCustomCategory ? (
              <input
                style={{ ...inp, background: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
                value={form.reference}
                readOnly
                title="Référence générée automatiquement"
              />
            ) : (
              <input
                style={inp}
                value={form.reference ?? ""}
                onChange={e => onFormChange({ reference: e.target.value })}
                placeholder="ex: REF-000123"
              />
            )}
          </Field>
        </Row>

        {/* Category */}
        <Field label="Catégorie">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Tag
                size={16}
                style={{
                  position: "absolute", left: 10, top: "50%",
                  transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none",
                }}
              />
              <select
                value={selectValue}
                onChange={(e) => onCategorySelect(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px 10px 36px",
                  borderRadius: 10, border: "1px solid #e5e7eb",
                  background: "#fff", fontSize: 14, outline: "none",
                  cursor: "pointer", appearance: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid #111")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid #e5e7eb")}
              >
                <option value="">-- Choisir une catégorie --</option>
                {availableCategories.map((cat) => (  // 👈 remplacé defaultCategories
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">＋ Autre catégorie</option>
              </select>
              <ChevronDown
                size={16}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none",
                }}
              />
            </div>

            {form.isCustomCategory && (
              <input
                placeholder="Écrire une nouvelle catégorie..."
                value={form.category}
                onChange={(e) => onCustomCategoryChange(e.target.value)}
                style={{
                  padding: "10px 12px", borderRadius: 10,
                  border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid #111")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid #e5e7eb")}
              />
            )}
          </div>
        </Field>

        {/* Famille */}
        <Field label="Famille *">
          <input
            style={inp}
            value={form.family}
            onChange={e => onFormChange({ family: e.target.value })}
            placeholder="ex: Électronique"
            required
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            style={{ ...inp, height: 80, resize: "vertical" }}
            value={form.description ?? ""}
            onChange={e => onFormChange({ description: e.target.value })}
          />
        </Field>

        {/* Price + Stock */}
        <Row>
          <Field label="Prix (DT) *">
            <input
              style={inp}
              type="number"
              min="0"
              value={form.price}
              onChange={e => onFormChange({ price: e.target.value })}
              required
            />
          </Field>
          <Field label="Stock">
            <input
              style={inp}
              type="number"
              min="0"
              value={form.stock ?? ""}
              onChange={e => onFormChange({ stock: e.target.value })}
            />
          </Field>
        </Row>

        {/* Images */}
        <Field label="Images du produit">
          <label style={{
            width: 80, height: 80, border: "2px dashed #d1d5db", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: "#f9fafb",
          }}>
            <Plus size={18} />
            <input
              type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                onFormChange({ imagesNew: [...form.imagesNew, ...files] });
              }}
            />
          </label>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {form.imagesNew.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={URL.createObjectURL(img)}
                  style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...form.imagesNew];
                    updated.splice(i, 1);
                    onFormChange({ imagesNew: updated });
                  }}
                  style={{
                    position: "absolute", top: -6, right: -6, background: "red", color: "white",
                    border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer",
                  }}
                >×</button>
              </div>
            ))}
          </div>

          {editId && form.images?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {form.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              ))}
            </div>
          )}
        </Field>

        {/* Status */}
        <Field label="Statut">
          <select
            style={inp}
            value={form.status}
            onChange={e => onFormChange({ status: e.target.value as ProductStatus })}
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </Field>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" style={styles.cancelBtn} onClick={onClose}>Annuler</button>
          <button type="submit" style={styles.saveBtn} disabled={loading}>
            {loading ? "..." : editId ? "Modifier" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}