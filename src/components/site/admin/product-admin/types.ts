import type { ProductImage } from "../../../../types";


export type ProductStatus = "active" | "inactive";

// types.ts
export interface Product {
  name: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  reference: string;
  status: ProductStatus;
  isCustomCategory: boolean;
  images: { url: string; public_id?: string }[];
  imagesNew: File[];
  family: string; // 👈 add this
}

export type ProductForm = Omit<Product, "_id"> & {
  imagesNew: File[];
  isCustomCategory: boolean;
};