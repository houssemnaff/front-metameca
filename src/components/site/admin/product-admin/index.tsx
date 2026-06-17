import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search, X, Package, Filter } from "lucide-react";
import { styles } from "./styles";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductCard } from "./components/ProductCard";
import type { Product, ProductForm } from "./types";
import { api } from "../../../../utils/api";
import { defaultCategories, emptyForm, generateRef } from "./constants";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { ProductFormModal } from "./components/ProductFormModal";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export default function AdminProductsPage() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [search, setSearch]               = useState<string>("");
  const [showModal, setShowModal]         = useState<boolean>(false);
  const [form, setForm]                   = useState<ProductForm>(emptyForm);
  const [editId, setEditId]               = useState<string | null>(null);
  const [loading, setLoading]             = useState<boolean>(false);
  const [delConfirm, setDelConfirm]       = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter]     = useState<"all" | "out">("all");
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters]     = useState(false);

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];
  const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const allCategories = [...new Set([...productCategories, ...defaultCategories])];

  const load = async () => {
    const data = await api.getProducts(search ? { search } : {});
    setProducts(data as unknown as Product[]);
  };

  useEffect(() => { load(); }, [search]);

  const filtered = products.filter(p =>
    (selectedCategory === "all" || p.category === selectedCategory) &&
    (stockFilter === "all" || Number(p.stock) === 0) &&
    (statusFilter === "all" || p.status === statusFilter)
  );

  /* ── Modal helpers ── */
  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };

  const openEdit = (p: Product) => {
    const isDefault = defaultCategories.includes(p.category || "");
    setForm({
      name: p.name, description: p.description, price: p.price, stock: p.stock,
      category: p.category, reference: p.reference ?? "", status: p.status,
      images: p.images ?? [], imagesNew: [], isCustomCategory: !isDefault, family: p.family ?? "",
    });
    setEditId(p._id ?? null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditId(null); };

  const handleFormChange = (partial: Partial<ProductForm>) => setForm(f => ({ ...f, ...partial }));

  const handleCategorySelect = (value: string) => {
    if (value === "custom") {
      setForm(f => ({ ...f, category: "", reference: "", isCustomCategory: true }));
    } else {
      setForm(f => ({ ...f, category: value, reference: generateRef(value), isCustomCategory: false }));
    }
  };

  const handleCustomCategoryChange = (value: string) => setForm(f => ({ ...f, category: value }));

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    try {
      const finalReference = form.reference?.trim() || (form.isCustomCategory ? "" : generateRef(form.category));
      fd.append("name",        form.name);
      fd.append("reference",   finalReference);
      fd.append("description", form.description ?? "");
      fd.append("price",       String(form.price));
      fd.append("stock",       String(form.stock ?? ""));
      fd.append("category",    form.category ?? "");
      fd.append("status",      form.status);
      fd.append("family",      form.family);
      form.imagesNew.forEach(file => fd.append("images", file));

      const token = localStorage.getItem("mm_token");
      const url = editId ? `${BASE}/products/${editId}` : `${BASE}/products`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      closeModal();
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    await api.deleteProduct(_id);
    setDelConfirm(null);
    setDetailProduct(null);
    load();
  };

  const selectValue = form.isCustomCategory ? "custom" : (form.category || "");

  /* ── Stats ── */
  const activeCount   = products.filter(p => p.status === "active").length;
  const outOfStock    = products.filter(p => Number(p.stock) === 0).length;
  const lowStock      = products.filter(p => Number(p.stock) > 0 && Number(p.stock) < 5).length;

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", animation: "fadeIn .3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .add-btn:hover  { opacity:.88; transform: translateY(-1px); }
        .filter-select  { appearance:none; background:#fff; border:1px solid #e8edf4; border-radius:9px;
                          padding:9px 36px 9px 14px; font-size:13px; color:#475569; font-weight:500;
                          cursor:pointer; outline:none; font-family:'Inter',sans-serif;
                          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                          background-repeat:no-repeat; background-position: right 10px center;
                          transition: border-color .15s; }
        .filter-select:hover { border-color:#6366f1; }
        .filter-select:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
        .action-btn:hover { background:#f1f5f9 !important; }
        .clear-search:hover { color:#0f172a; }
        .toggle-filter:hover { background:#f1f5f9 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <p style={S.headerSub}>Catalogue</p>
          <h1 style={S.headerTitle}>Produits</h1>
        </div>
        <button className="add-btn" style={styles.addBtn} onClick={openAdd}>
          <Plus size={16} strokeWidth={2.5} />
          Nouveau produit
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div style={S.statsBar}>
        {[
          { label: "Total",        value: products.length,  color: "#6366f1", bg: "#eef2ff" },
          { label: "Actifs",       value: activeCount,      color: "#10b981", bg: "#d1fae5" },
          { label: "Rupture",      value: outOfStock,       color: "#ef4444", bg: "#fee2e2" },
          { label: "Stock faible", value: lowStock,         color: "#f59e0b", bg: "#fef3c7" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={S.statItem}>
            <div style={{ ...S.statBadge, background: bg, color }}>{value}</div>
            <span style={S.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={S.toolbar}>
        {/* Search */}
        <div style={styles.searchWrap}>
          <Search size={15} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="Rechercher un produit…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" style={styles.clearBtn} onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          className="toggle-filter"
          onClick={() => setShowFilters(f => !f)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: showFilters ? "#eef2ff" : "#fff",
            border: `1px solid ${showFilters ? "#c7d2fe" : "#e8edf4"}`,
            color: showFilters ? "#6366f1" : "#64748b",
            borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all .15s",
          }}
        >
          <Filter size={14} />
          Filtres
          {(selectedCategory !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
            <span style={{ width: 7, height: 7, background: "#6366f1", borderRadius: "50%", display: "inline-block" }} />
          )}
        </button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
            {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div style={S.filterPanel}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <label style={S.filterLabel}>Catégorie</label>
            <select className="filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="all">Toutes les catégories</option>
              {categories.filter(c => c !== "all").map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={S.filterLabel}>Stock</label>
            <select className="filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value as "all" | "out")}>
              <option value="all">Tout le stock</option>
              <option value="out">Rupture de stock</option>
            </select>

            <label style={S.filterLabel}>Statut</label>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as "all" | "active" | "inactive")}>
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            {(selectedCategory !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => { setSelectedCategory("all"); setStockFilter("all"); setStatusFilter("all"); }}
                style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <div style={styles.grid}>
        {filtered.map(p => (
          <ProductCard
            key={p._id}
            product={p}
            onClick={() => setDetailProduct(p)}
            onEdit={() => openEdit(p)}
            onDelete={() => setDelConfirm(p._id ?? null)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={styles.empty}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={28} color="#cbd5e1" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#475569", fontSize: 15 }}>Aucun produit trouvé</p>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>Essayez d'ajuster vos filtres ou d'ajouter un produit.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onEdit={p => { setDetailProduct(null); openEdit(p); }}
          onDelete={id => setDelConfirm(id)}
        />
      )}
      {showModal && (
        <ProductFormModal
          editId={editId} form={form} loading={loading} selectValue={selectValue}
          availableCategories={allCategories} onClose={closeModal} onSubmit={handleSave}
          onCategorySelect={handleCategorySelect} onCustomCategoryChange={handleCustomCategoryChange}
          onFormChange={handleFormChange}
        />
      )}
      {delConfirm && (
        <DeleteConfirmModal onConfirm={() => handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />
      )}
    </div>
  );
}

/* ── Page-level styles ── */
const S: Record<string, React.CSSProperties> = {
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22,
  },
  headerSub: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#6366f1", margin: "0 0 3px",
  },
  headerTitle: {
    fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.4px",
  },
  statsBar: {
    display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap",
  },
  statItem: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #e8edf4", borderRadius: 10,
    padding: "8px 14px", boxShadow: "0 1px 3px rgba(0,0,0,.04)",
  },
  statBadge: {
    fontSize: 14, fontWeight: 800, borderRadius: 7, padding: "2px 9px", minWidth: 28, textAlign: "center",
  },
  statLabel: {
    fontSize: 12, color: "#64748b", fontWeight: 500,
  },
  toolbar: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap",
  },
  filterPanel: {
    background: "#fff", border: "1px solid #e8edf4", borderRadius: 12,
    padding: "14px 18px", marginBottom: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
  },
  filterLabel: {
    fontSize: 12, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" as const,
  },
};
