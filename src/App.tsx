import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { api } from "./utils/api";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AIAgent }     from "./components/site/AIAgent";
import { Catalog }     from "./components/site/Catalog";
import { Contact }     from "./components/site/Contact";
import { Footer }      from "./components/site/Footer";
import { HeroSlider }  from "./components/site/HeroSlider";
import { Navbar }      from "./components/site/Navbar";
import { Portfolio }   from "./components/site/Products/Portfolio";
import { Process }     from "./components/site/Process";
import { Services }    from "./components/site/Services";
import { WhatsAppFab } from "./components/site/WhatsAppFab";

import DashboardPage          from "./components/site/DashboardPage";
import LoginPage              from "./components/site/LoginPage";
import AdminLayout            from "./components/site/admin/AdminLayout";
import ProtectedRoute         from "./components/site/auth/ProtectedRoute";
import ClientsPage            from "./components/site/admin/ClientsPage";
import ReservationsPage       from "./components/site/admin/ReservationsPage";
import { PublicProductsPage } from "./components/site/Products/PublicProductsPage";
import ProductDetailPage      from "./components/site/Products/ProductDetailPage";
import { Layout }             from "./components/site/layouts/Layout";
import AdminProductsPage      from "./components/site/admin/product-admin";
import RegisterPage           from "./components/site/RegisterPage";
import ClientRoute            from "./components/site/auth/ClientRoute";
import MyReservationsPage     from "./components/site/client/MyReservationsPage";
import MyProjectsPage         from "./components/site/client/MyProjectsPage";

// ── Interfaces ───────────────────────────────────────────────────────────────

interface CatalogData {
  title: string;
  subtitle: string;
  desc: string;
  pdf: string;
  cover: string;
  year: string;
}

// ── Static catalog data ───────────────────────────────────────────────────────

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

// ── SitePage ──────────────────────────────────────────────────────────────────

function SitePage() {
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

// ── App (routing) ─────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global floating elements */}
        <AIAgent />
        <WhatsAppFab />

        <Routes>
          <Route path="/" element={<SitePage />} />

          <Route
            path="/my-reservations"
            element={
              <ClientRoute>
                <Layout>
                  <MyReservationsPage />
                </Layout>
              </ClientRoute>
            }
          />

          <Route
            path="/my-projects"
            element={
              <ClientRoute>
                <Layout>
                  <MyProjectsPage />
                </Layout>
              </ClientRoute>
            }
          />

          <Route path="/produits" element={<Layout><PublicProductsPage /></Layout>} />
          <Route path="/produits/:id" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/process" element={<Layout><Process /></Layout>} />
          <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}