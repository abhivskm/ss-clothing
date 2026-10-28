/**
 * Database connection (Neon Postgres, added through the Vercel dashboard).
 * Only lib/products.ts and lib/admin-products.ts use this file.
 * Table definitions: scripts/schema.sql.
 */
import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Category, CategoryGroup, Product, ProductColor, ProductTag } from "@/types/product";

export const sql = neon(process.env.DATABASE_URL!);

/** Cache tag for everything the shop reads. Admin changes call updateTag(CATALOG_TAG). */
export const CATALOG_TAG = "catalog";

export type Row = Record<string, unknown>;

export function rowToProduct(r: Row): Product {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    category: r.category as string,
    subcategory: r.subcategory as string,
    description: r.description as string,
    price: r.price as number,
    mrp: (r.mrp as number | null) ?? undefined,
    fabric: r.fabric as string,
    fit: r.fit as string,
    sizes: r.sizes as string[],
    colors: r.colors as ProductColor[],
    images: r.images as string[],
    tags: r.tags as ProductTag[],
    inStock: r.in_stock as boolean,
    active: r.active as boolean,
    createdAt: (r.created_at as Date).toISOString(),
  };
}

export function rowToCategory(r: Row): Category {
  return {
    slug: r.slug as string,
    name: r.name as string,
    group: r.grp as CategoryGroup,
    description: r.description as string,
    sortOrder: r.sort_order as number,
  };
}
