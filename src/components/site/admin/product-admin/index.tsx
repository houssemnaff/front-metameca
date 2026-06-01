import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search, X, Package } from "lucide-react";
import { styles } from "./styles";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductCard } from "./components/ProductCard";
import type { Product, ProductForm } from "./types";
import { api } from "../../../../utils/api";
import { defaultCategories, emptyForm, generateRef } from "./constants";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { ProductFormModal } from "./components/ProductFormModal";


export default function AdminProductsPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [search, setSearch]             = useState<string>("");
  const [showModal, setShowModal]       = useState<boolean>(false);
  const [form, setForm]                 = useState<ProductForm>(emptyForm);
  const [editId, setEditId]             = useState<string | null>(null);
  const [loading, setLoading]           = useState<boolean>(false);
  const [delConfirm, setDelConfirm]     = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string>("all");
const [stockFilter, setStockFilter] = useState<"all" | "out">("all");
const categories = ["all", ...new Set(products.map(p => p.category))];
  /* ── Data ── */
  const load = async () => {
    const data = await api.getProducts(search ? { search } : {});
    setProducts(data);
  };

  useEffect(() => { load(); }, [search]);

  /* ── Modal helpers ── */
  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    const isDefault = defaultCategories.includes(p.category || "");
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      reference: p.reference ?? "",
      status: p.status,
      images: p.images ?? [],
      imagesNew: [],
      isCustomCategory: !isDefault,
    });
    setEditId(p._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  };

  /* ── Form field helpers ── */
  const handleFormChange = (partial: Partial<ProductForm>) =>
    setForm(f => ({ ...f, ...partial }));

  const handleCategorySelect = (value: string) => {
    if (value === "custom") {
      setForm(f => ({ ...f, category: "", reference: "", isCustomCategory: true }));
    } else {
      setForm(f => ({ ...f, category: value, reference: generateRef(value), isCustomCategory: false }));
    }
  };

  const handleCustomCategoryChange = (value: string) =>
    setForm(f => ({ ...f, category: value }));

  /* ── Save ── */
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
     const fd = new FormData();
    try {
         
      const finalReference =
        form.reference?.trim() ||
        (form.isCustomCategory ? "" : generateRef(form.category));

     
      fd.append("name",        form.name);
      fd.append("reference",   finalReference);
      fd.append("description", form.description ?? "");
      fd.append("price",       String(form.price));
      fd.append("stock",       String(form.stock ?? ""));
      fd.append("category",    form.category ?? "");
      fd.append("status",      form.status);
      form.imagesNew.forEach(file => fd.append("images", file));

      const token = localStorage.getItem("admin_token");
      const url = editId
        ? `http://localhost:4000/api/products/${editId}`
        : `http://localhost:4000/api/products`;

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

  /* ── Delete ── */
  const handleDelete = async (_id: string) => {
    await api.deleteProduct(_id);
    setDelConfirm(null);
    setDetailProduct(null);
    load();
  };

  /* ── Derived ── */
  const selectValue = form.isCustomCategory ? "custom" : (form.category || "");

  /* ── Render ── */
  return (
    <div style={{ animation: "fadeIn .3s ease" }}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Produits</h1>
         <p style={styles.sub}>
  {products.filter(p =>
    (selectedCategory === "all" || p.category === selectedCategory) &&
    (stockFilter === "all" || p.stock === 0)
  ).length} produit(s)
</p>
        </div>
        <button style={styles.addBtn} onClick={openAdd}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <Search size={16} style={{ color: "var(--text3)" }} />
        <input
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button style={styles.clearBtn} onClick={() => setSearch("")}>
            <X size={14} />
          </button>
        )}
      </div>
{/* Filters */}
<div style={{ display: "flex", gap: 12, margin: "10px 0 20px" }}>

  {/* CATEGORY */}
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    style={{ padding: 6, borderRadius: 6 }}
  >
    {categories.map((c) => (
      <option key={c} value={c}>
        {c}
      </option>
    ))}
  </select>

  {/* STOCK FILTER */}
  <select
    value={stockFilter}
    onChange={(e) => setStockFilter(e.target.value as any)}
    style={{ padding: 6, borderRadius: 6 }}
  >
    <option value="all">All stock</option>
    <option value="out">Stock = 0</option>
  </select>

</div>
      {/* Product grid */}
      <div style={styles.grid}>
        {products
  .filter((p) => {
    const categoryMatch =
      selectedCategory === "all" || p.category === selectedCategory;

    const stockMatch =
      stockFilter === "all" || p.stock === 0;

    return categoryMatch && stockMatch;
  })
  .map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onClick={() => setDetailProduct(p)}
            onEdit={() => openEdit(p)}
            onDelete={() => setDelConfirm(p._id)}
          />
        ))}
        {products.length === 0 && (
          <div style={styles.empty}>
            <Package size={40} color="var(--text3)" />
            <p>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onEdit={(p) => { setDetailProduct(null); openEdit(p); }}
          onDelete={(id) => setDelConfirm(id)}
        />
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <ProductFormModal
          editId={editId}
          form={form}
          loading={loading}
          selectValue={selectValue}
          onClose={closeModal}
          onSubmit={handleSave}
          onCategorySelect={handleCategorySelect}
          onCustomCategoryChange={handleCustomCategoryChange}
          onFormChange={handleFormChange}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(delConfirm)}
          onCancel={() => setDelConfirm(null)}
        />
      )}
    </div>
  );
}