import { useState, useEffect } from "react";
import { Navbar } from "../Navbar";
import { api } from "../../../utils/api";

const LAYOUT = { header: 88.5 };

/* ── Layout général — pages internes (produits, réservations…) ── */
export function Layout({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<string[]>([]);

const defaultCatalogs: CatalogData[] = [
  {
    title: "Portes en acier",
    subtitle: "Menuiserie sur mesure",
    desc: "Collection complète de portes industrielles et résidentielles...",
    pdf: "/pdfs/menuiserie.pdf",
    cover: "/covers/menuiserie.jpg",
    year: "2024",
  },
  {
    title: "Cuisines Équipées",
    subtitle: "Design & solutions modernes",
    desc: "Architectures de cuisine contemporaines...",
    pdf: "/pdfs/cuisine.pdf",
    cover: "/covers/cuisine.jpg",
    year: "2024",
  },
  {
    title: "Meta Meca",
    subtitle: "Catalogue général",
    desc: "L'ensemble de nos savoir-faire réunis...",
    pdf: "/pdfs/meta.pdf",
    cover: "/covers/meta.jpg",
    year: "2024",
  },
];
  useEffect(() => {
    api
      .getProducts()
      .then((data) => {
        const unique = [
          ...new Set(
            data
              .filter((p) => p.status === "active" && p.category)
              .map((p) => p.category as string)
          ),
        ];
        setCategories(unique);
      })
      .catch((err) => console.error("Erreur catégories:", err));
  }, []);

  const productCategories = categories.map((category) => ({
    label: category,
    desc: "Voir la collection",
    href: `/produits?category=${encodeURIComponent(category)}`,
  }));

  const catalogItems = defaultCatalogs.map((c) => ({
    label: c.title,
    sub: c.subtitle,
    href: c.pdf,
  }));

  return (
    <>
      <Navbar
        productCategories={productCategories}
        catalogItems={catalogItems}
        variant="solid"
      />
      <main className="bg-background" style={{ paddingTop: LAYOUT.header }}>
        {children}
      </main>
    </>
  );
}

/* ── HomePage — page d'accueil avec toutes les sections ── */
export function HomePage() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    api
      .getProducts()
      .then((data) => {
        const unique = [
          ...new Set(
            data
              .filter((p) => p.status === "active" && p.category)
              .map((p) => p.category as string)
          ),
        ];
        setCategories(unique);
      })
      .catch((err) => console.error("Erreur catégories:", err));
  }, []);

  const productCategories = categories.map((category) => ({
    label: category,
    desc: "Voir la collection",
    href: `/produits?category=${encodeURIComponent(category)}`,
  }));

  const catalogItems = defaultCatalogs.map((c) => ({
    label: c.title,
    sub: c.subtitle,
    href: c.pdf,
  }));

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar productCategories={productCategories} catalogItems={catalogItems} />
      <HeroSlider />
      <Services />
      <Process />
      <Portfolio />
      <Catalog />
      <Contact />
      <Footer />
    </main>
  );
}