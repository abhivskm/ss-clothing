/**
 * Core data types. The database rows (lib/db.ts) are mapped to these shapes,
 * and the admin portal reads and writes them, so the UI never has to change.
 */

export type ProductTag = "new" | "trending" | "bestseller";

/** URL-safe category id, e.g. "oversized-tees". Categories are managed in the admin. */
export type CategorySlug = string;

/** Top-level grouping used by the navbar mega menu. */
export const CATEGORY_GROUPS = ["Topwear", "Bottomwear", "More"] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const PRODUCT_TAGS: ProductTag[] = ["new", "trending", "bestseller"];

export interface Category {
  slug: CategorySlug;
  name: string;
  group: CategoryGroup;
  description: string;
  /** Position in menus and category tiles (lowest first) */
  sortOrder: number;
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
  /** Image URLs (Vercel Blob). The first is the main image, the second shows on hover. */
  images: string[];
  tags: ProductTag[];
  inStock: boolean;
  /** Inactive products are hidden from the shop but kept in the admin */
  active: boolean;
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
