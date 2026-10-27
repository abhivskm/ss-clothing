/**
 * Core data types. The future admin portal and any database (Firebase / MongoDB)
 * should read and write these exact shapes so the UI never has to change.
 */

export type ProductTag = "new" | "trending" | "bestseller";

export type CategorySlug =
  | "t-shirts"
  | "oversized-tees"
  | "shirts"
  | "hoodies"
  | "jackets"
  | "jeans"
  | "cargos"
  | "trousers"
  | "joggers"
  | "shorts"
  | "co-ords"
  | "accessories";

/** Top-level grouping used by the navbar mega menu. */
export type CategoryGroup = "Topwear" | "Bottomwear" | "More";

export interface Category {
  slug: CategorySlug;
  name: string;
  group: CategoryGroup;
  description: string;
}

export interface ProductColor {
  name: string;
  /** CSS colour used for the swatch, e.g. "#1b2a4e" */
  hex: string;
}

export interface Product {
  id: string;
  /** URL-safe unique name, used in /product/[slug] */
  slug: string;
  name: string;
  category: CategorySlug;
  /** Free text shown under the name, e.g. "Cuban Collar Shirt" */
  subcategory: string;
  description: string;
  /** Selling price in rupees */
  price: number;
  /** Original price in rupees. When higher than price, a discount % is shown. */
  mrp?: number;
  fabric: string;
  fit: string;
  sizes: string[];
  colors: ProductColor[];
  /** 4-5 image URLs. The first is the main image, the second shows on hover. */
  images: string[];
  tags: ProductTag[];
  inStock: boolean;
  /** ISO date string, used for "Newest" sorting */
  createdAt: string;
}

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  image: string;
  imageAlt: string;
}
