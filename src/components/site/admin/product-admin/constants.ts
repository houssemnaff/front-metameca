import type { ProductForm } from "./types";

export const defaultCategories = [
  "Vitrine",
  "Table basse",
  "TV Stand",

];

export const categoryPrefixes: Record<string, string> = {
  "Vitrine":    "VIT",
  "Table basse":    "TB",
  "TV Stand":  "TV",
  
};

export const generateRef = (category?: string): string => {
  const prefix = categoryPrefixes[category || ""] || "GEN";
  const unique = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${unique}-${rand}`;
};

export const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  reference: "",
  status: "active",
  isCustomCategory: false,
  images: [],
  imagesNew: [],
  family: "", // 👈 add this
};