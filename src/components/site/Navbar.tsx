import { Heart, ShoppingBag, ChevronDown, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, type JSX } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/meta-logo.png";
import { useAuth } from "../../context/AuthContext";
import AccountDropdown from "./client/AccountDropdown";

// ── Types ─────────────────────────────────────────────────────────────────────

type NavLink = {
  href: string;
  label: string;
  hasDropdown?: boolean;
};

type ProductCategory = { label: string; desc: string; href: string; tag?: string };
type CatalogItem     = { label: string; sub: string; href: string };
type DropdownState   = "products" | "catalogue" | null;

type NavbarProps = {
  variant?: "auto" | "transparent" | "solid";
  productCategories?: ProductCategory[];
  catalogItems?: CatalogItem[];
};

// ── Static fallback data ──────────────────────────────────────────────────────

const links: NavLink[] = [
  { href: "/",         label: "Accueil"   },
  { href: "/#process", label: "Process"   },
  { href: "/#catalog", label: "Catalogue", hasDropdown: true },
  { href: "/produits", label: "Produits",  hasDropdown: true },
  { href: "/#contact", label: "Contact"   },
];

const defaultProductCategories: ProductCategory[] = [
  { label: "Structures Métalliques",       desc: "Charpentes, portiques, halls industriels", href: "/produits?category=Structures+M%C3%A9talliques", tag: "Populaire" },
  { label: "Pièces Industrielles",         desc: "Usinage, tournage, fraisage de précision", href: "/produits?category=Pi%C3%A8ces+Industrielles" },
  { label: "Fabrication Sur Mesure",       desc: "Projets spéciaux et prototypage",          href: "/produits?category=Fabrication+Sur+Mesure", tag: "Nouveau" },
  { label: "Accessoires et Quincaillerie", desc: "Visserie, boulonnerie, fixations",         href: "/produits?category=Accessoires+et+Quincaillerie" },
];

const defaultCatalogItems: CatalogItem[] = [
  { label: "Catalogue 2024",    sub: "Édition complète",   href: "#cat-2024"   },
  { label: "Fiches Techniques", sub: "Spécifications",     href: "#fiches"     },
  { label: "Projets Réalisés",  sub: "Références clients", href: "#references" },
  { label: "Téléchargements",   sub: "PDF et plans CAD",   href: "#downloads"  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Navbar({
  variant = "auto",
  productCategories: customProducts = [],
  catalogItems: customCatalogs = [],
}: NavbarProps): JSX.Element {
  const products = customProducts.length > 0 ? customProducts : defaultProductCategories;
  const catalogs = customCatalogs.length > 0 ? customCatalogs : defaultCatalogItems;

  const [scrolled, setScrolled]               = useState<boolean>(false);
  const [mobileOpen, setMobileOpen]           = useState<boolean>(false);
  const [cartCount]                           = useState<number>(1);
  const [activeDropdown, setActiveDropdown]   = useState<DropdownState>(null);
  const [hoveredCategory, setHoveredCategory] = useState<number>(0);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user } = useAuth();
  const isClient = user?.role === "client";

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isTransparent: boolean =
    variant === "transparent" ? true
    : variant === "solid"     ? false
    : !scrolled && !mobileOpen && activeDropdown === null;

  const textColor  = isTransparent ? "text-white"  : "text-[#1a1a1a]";
  const dividerCol = isTransparent ? "bg-white/20" : "bg-[#e0e0e0]";

  const handleMouseEnter = (label: string): void => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if      (label === "Produits")  setActiveDropdown("products");
    else if (label === "Catalogue") setActiveDropdown("catalogue");
    else                            setActiveDropdown(null);
  };

  const handleMouseLeave = (): void => {
    leaveTimerRef.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const handleDropdownMouseEnter = (): void => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  };

  return (
    <>
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <header
        id="site-header"
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/97 backdrop-blur-md shadow-[0_1px_0_0_#ebebeb]"
        }`}
      >
        <nav className="relative">
          <div className="flex items-center justify-between px-6 md:px-10 lg:px-14 h-[68px] md:h-[76px]">

            {/* ── Logo ── */}
            <Link to="/" title="Meta Meca" className="shrink-0 flex items-center">
              <img
                src={logo}
                alt="Meta Meca"
                className={`h-7 md:h-8 w-auto object-contain transition-all duration-300 ${
                  isTransparent ? "brightness-0 invert" : "brightness-0"
                }`}
              />
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-0">
              {links.map((link, i) => {
                const isActive =
                  (link.label === "Produits"  && activeDropdown === "products") ||
                  (link.label === "Catalogue" && activeDropdown === "catalogue");

                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to={link.href}
                      className={`group relative inline-flex items-center gap-1 px-5 lg:px-6 py-2 font-['Cormorant_Garamond',serif] text-[13px] lg:text-[14px] tracking-[0.18em] uppercase transition-colors duration-300 ${textColor} ${isActive ? "opacity-60" : ""}`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {link.label}
                      {link.hasDropdown === true && (
                        <ChevronDown
                          size={11}
                          strokeWidth={1.8}
                          className={`transition-transform duration-300 ${isActive ? "rotate-180 opacity-60" : "rotate-0 opacity-40"}`}
                        />
                      )}
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-px transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isActive ? "w-[calc(100%-2rem)]" : "w-0 group-hover:w-[calc(100%-2.5rem)]"
                        } ${isTransparent ? "bg-white/70" : "bg-[#1a1a1a]"}`}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-0.5 md:gap-1">
              <div className="relative">
                <AccountDropdown textColor={textColor} />
                {isClient && (
                  <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-emerald-400 border border-white shadow-sm pointer-events-none" />
                )}
              </div>

              <button type="button" aria-label="Favoris" className={`group p-2.5 transition-colors duration-200 ${textColor} hover:opacity-60`}>
                <Heart size={18} strokeWidth={1.4} />
              </button>

              <button type="button" aria-label="Panier" className={`relative group p-2.5 transition-colors duration-200 ${textColor} hover:opacity-60`}>
                <ShoppingBag size={18} strokeWidth={1.4} />
                {cartCount > 0 && (
                  <span className={`absolute top-1.5 right-1.5 w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-semibold leading-none transition-colors duration-300 ${
                    isTransparent ? "bg-white text-[#1a1a1a]" : "bg-[#1a1a1a] text-white"
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>

              <div className={`hidden lg:block w-px h-[18px] mx-3 ${dividerCol} transition-colors duration-300`} />

              <a
                href="tel:94703066"
                className={`hidden lg:flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase font-semibold font-['Cormorant_Garamond',serif] border transition-all duration-300 ${
                  isTransparent
                    ? "border-white/50 text-white hover:bg-white hover:text-[#1a1a1a]"
                    : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                94 703 066
              </a>

              <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setMobileOpen((p) => !p)}
                className={`md:hidden p-2.5 ml-1 transition-colors duration-200 ${textColor} hover:opacity-60`}
              >
                {mobileOpen ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {!isTransparent && <div className="absolute bottom-0 inset-x-0 h-px bg-[#ebebeb]" />}
        </nav>

        {/* ── Products dropdown ─────────────────────────────────────────────── */}
        <div
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`hidden md:block absolute top-full left-0 right-0 bg-white border-t border-[#eaeaea] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] origin-top overflow-hidden transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeDropdown === "products"
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{ transitionDuration: "350ms" }}
        >
          <div className="max-w-screen-xl mx-auto px-14 py-10 grid grid-cols-[1fr_1.6fr] gap-12">
            <div className="flex flex-col gap-0 border-r border-[#f0f0f0] pr-12">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] mb-6 font-['Cormorant_Garamond',serif]">
                Nos Catégories
              </p>
              {products.map((cat, i) => (
                <Link
                  key={cat.href}
                  to={cat.href}
                  onMouseEnter={() => setHoveredCategory(i)}
                  onClick={() => setActiveDropdown(null)}
                  className={`group flex items-start justify-between py-4 border-b border-[#f5f5f5] last:border-0 transition-all duration-200 ${
                    hoveredCategory === i ? "pl-1" : "pl-0"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`font-['Cormorant_Garamond',serif] text-[15px] tracking-[0.06em] transition-colors duration-200 ${
                        hoveredCategory === i ? "text-[#1a1a1a]" : "text-[#555]"
                      }`}>
                        {cat.label}
                      </span>
                      {cat.tag && (
                        <span className="text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 bg-[#f5f0eb] text-[#8a6f5c]">
                          {cat.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#aaa] mt-0.5 tracking-[0.04em]">{cat.desc}</p>
                  </div>
                  <ArrowRight
                    size={13}
                    strokeWidth={1.4}
                    className={`shrink-0 mt-1 text-[#ccc] transition-all duration-300 ${
                      hoveredCategory === i ? "translate-x-0 opacity-100 text-[#1a1a1a]" : "-translate-x-2 opacity-0"
                    }`}
                  />
                </Link>
              ))}
            </div>

            <div className="flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] mb-6 font-['Cormorant_Garamond',serif]">
                En Vedette
              </p>
              <div key={hoveredCategory} className="flex-1 flex flex-col justify-between" style={{ animation: "fadeSlideIn 0.3s ease-out" }}>
                <div className="bg-[#f8f7f5] aspect-[16/6] flex items-center justify-center mb-6 overflow-hidden">
                  <div className="text-center">
                    <p className="font-['Cormorant_Garamond',serif] text-[28px] text-[#ccc] tracking-[0.1em]">
                      {products[hoveredCategory]?.label}
                    </p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#bbb] mt-2">
                      {products[hoveredCategory]?.desc}
                    </p>
                  </div>
                </div>
                <Link
                  to={products[hoveredCategory]?.href || "/produits"}
                  onClick={() => setActiveDropdown(null)}
                  className="self-start text-[10px] tracking-[0.25em] uppercase font-semibold text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:opacity-50 transition-opacity duration-200 font-['Cormorant_Garamond',serif]"
                >
                  Découvrir →
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f0f0f0] px-14 py-4 flex items-center justify-between bg-[#fafafa]">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#bbb]">
              Fabrication métallique industrielle et sur mesure
            </p>
            <Link
              to="/produits"
              onClick={() => setActiveDropdown(null)}
              className="text-[10px] tracking-[0.22em] uppercase text-[#888] hover:text-[#1a1a1a] transition-colors duration-200"
            >
              Voir tout →
            </Link>
          </div>
        </div>

        {/* ── Catalogue dropdown ────────────────────────────────────────────── */}
        <div
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`hidden md:block absolute top-full left-0 right-0 bg-white border-t border-[#eaeaea] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.07)] origin-top overflow-hidden transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeDropdown === "catalogue"
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{ transitionDuration: "320ms" }}
        >
          <div className="max-w-screen-xl mx-auto px-14 py-8">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#aaa] mb-6 font-['Cormorant_Garamond',serif]">
              Documentation et Références
            </p>
            <div className="grid grid-cols-4 gap-0">
              {catalogs.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveDropdown(null)}
                  className="group flex flex-col gap-2 px-6 py-5 border-l border-[#f0f0f0] first:border-l-0 hover:bg-[#fafafa] transition-colors duration-200"
                  style={{
                    animation:
                      activeDropdown === "catalogue"
                        ? `fadeSlideIn 0.35s ease-out ${i * 50}ms both`
                        : "none",
                  }}
                >
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#ccc]">0{i + 1}</span>
                  <span className="font-['Cormorant_Garamond',serif] text-[16px] tracking-[0.05em] text-[#1a1a1a] group-hover:translate-x-0.5 transition-transform duration-200">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-[#aaa] tracking-[0.03em]">{item.sub}</span>
                  <ArrowRight
                    size={12}
                    strokeWidth={1.4}
                    className="text-[#ccc] group-hover:text-[#1a1a1a] group-hover:translate-x-1 transition-all duration-300 mt-1"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay ──────────────────────────────────────────────────── */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-40 w-[85vw] max-w-[340px] bg-white flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-7 pt-8 pb-6 border-b border-[#ebebeb]">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src={logo} alt="Meta Meca" className="h-6 w-auto object-contain brightness-0" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="p-1 text-[#1a1a1a] hover:opacity-60 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
              <line x1="3" y1="3" x2="15" y2="15" /><line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-7 pt-8 flex flex-col gap-0 overflow-y-auto">
          {links.map((link, i) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="group flex items-center justify-between py-5 border-b border-[#f0f0f0] last:border-0 font-['Cormorant_Garamond',serif] text-[22px] tracking-[0.06em] font-light text-[#1a1a1a] hover:text-[#555]"
              style={{
                opacity:    mobileOpen ? 1 : 0,
                transform:  mobileOpen ? "translateX(0)" : "translateX(-12px)",
                transition: `opacity 0.4s ease ${i * 40 + 80}ms, transform 0.4s ease ${i * 40 + 80}ms, color 0.2s`,
              }}
            >
              <span>{link.label}</span>
              <span className="text-[#ccc] text-[13px] tracking-[0.1em] font-['Cormorant_Garamond',serif]">0{i + 1}</span>
            </Link>
          ))}

          <div className="mt-4 pt-6 border-t border-[#f5f5f5]">
            <p className="text-[9px] tracking-[0.28em] uppercase text-[#bbb] mb-4">Catégories</p>
            {products.map((cat) => (
              <Link
                key={cat.href}
                to={cat.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 border-b border-[#f8f8f8] last:border-0"
              >
                <span className="text-[14px] font-['Cormorant_Garamond',serif] text-[#444] tracking-[0.05em]">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="px-7 pb-10 pt-6 border-t border-[#ebebeb]">
          <a
            href="tel:94703066"
            className="flex items-center justify-center gap-2 w-full py-4 text-[10px] tracking-[0.22em] uppercase font-semibold bg-[#1a1a1a] text-white transition-opacity duration-200 hover:opacity-80"
          >
            94 703 066
          </a>
          <p className="mt-4 text-[10px] tracking-[0.16em] uppercase text-[#aaa] text-center">
            Lun – Sam · 9h – 18h
          </p>
        </div>
      </div>
    </>
  );
}