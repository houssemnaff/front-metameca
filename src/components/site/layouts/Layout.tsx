import { useState, useEffect } from "react";
import { Navbar } from "../Navbar";
import { HeroSlider } from "../HeroSlider";
import { Services } from "../Services";
import { Process } from "../Process";
import { Portfolio } from "../Products/Portfolio";
import { Catalog } from "../Catalog";
import { Contact } from "../Contact";
import { Footer } from "../Footer";
import { api } from "../../../utils/api";

const LAYOUT = { header: 88.5 };

type CatalogData = {
  title: string;
  subtitle: string;
  desc: string;
  pdf: string;
  cover: string;
  year: string;
};

const defaultCatalogs: CatalogData[] = [
  {
    title: "Portes en acier",
    subtitle: "Menuiserie sur mesure",
    desc: "Collection de portes métalliques et blindées pour intérieur et extérieur, alliant sécurité et design moderne.",
    pdf: "/pdfs/menuiserie.pdf",
    cover: "/covers/menuiserie.jpg",
    year: "2024",
  },
  {
    title: "Cuisines Équipées",
    subtitle: "Design & solutions modernes",
    desc: "Cuisines contemporaines sur mesure avec optimisation de l’espace et matériaux premium.",
    pdf: "/pdfs/cuisine.pdf",
    cover: "/covers/cuisine.jpg",
    year: "2024",
  },
  {
    title: "Tables Basses",
    subtitle: "Salon & mobilier design",
    desc: "Collection de tables basses modernes en bois, métal et verre pour salons élégants et minimalistes.",
    pdf: "/pdfs/tablebasse.pdf",
    cover: "/covers/tablebasse.png",
    year: "2024",
  },
  {
    title: "Dressing & Rangements",
    subtitle: "Organisation sur mesure",
    desc: "Solutions de dressings modernes et modulaires pour optimiser vos espaces avec style et fonctionnalité.",
    pdf: "/pdfs/dressing.pdf",
    cover: "/covers/dressing.jpg",
    year: "2024",
  },
  {
    title: "Meta Meca",
    subtitle: "Catalogue général",
    desc: "L’ensemble de nos savoir-faire réunis : menuiserie, mobilier et solutions sur mesure.",
    pdf: "/pdfs/meta.pdf",
    cover: "/covers/meta.jpg",
    year: "2024",
  },
];

/* ── Layout général — pages internes (produits, réservations…) ── */
export function Layout({ children }: { children: React.ReactNode }) {
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