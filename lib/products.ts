/**
 * Data layer for the shop: the ONLY place the public site reads products from.
 *
 * Reads the Neon database once and caches the result ("use cache"). The admin
 * portal clears that cache with updateTag(CATALOG_TAG) after every change, so
 * edits show on the site immediately. Inactive products are never returned here.
 *
 * Admin reads and writes live in lib/admin-products.ts.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { banners } from "@/data/banners";
import { CATALOG_TAG, rowToCategory, rowToProduct, sql } from "@/lib/db";
import { matchesQuery, toWords } from "@/lib/search";
import type { Banner, Category, CategorySlug, Product, ProductTag } from "@/types/product";

async function getCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const [productRows, categoryRows] = await Promise.all([
    sql`select * from products where active order by created_at desc`,
    sql`select * from categories order by sort_order, name`,
  ]);
  return { products: productRows.map(rowToProduct), categories: categoryRows.map(rowToCategory) };
}

export async function getAllProducts(): Promise<Product[]> {
  return (await getCatalog()).products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.category === category);
}

export async function getProductsByTag(tag: ProductTag, limit?: number): Promise<Product[]> {
  const list = (await getAllProducts()).filter((p) => p.tags.includes(tag));
  return limit ? list.slice(0, limit) : list;
}

/** Case-insensitive search across name, category, subcategory, fabric, fit and colours. */
export async function searchProducts(query: string): Promise<Product[]> {
  const words = toWords(query);
  const products = await getAllProducts();
  return words.length ? products.filter((p) => matchesQuery(p, words)) : products;
}

/** Same category first, then same group (Topwear/Bottomwear), then the rest. */
export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const { products, categories } = await getCatalog();
  const group = (slug: CategorySlug) => categories.find((c) => c.slug === slug)?.group;
  const score = (p: Product) => (p.category === product.category ? 2 : group(p.category) === group(product.category) ? 1 : 0);
  // Array.sort is stable, so products with the same score stay newest first
  return products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  return (await getCatalog()).categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

/**
 * Categories that have at least one active product, with a cover image taken
 * from their newest product (for the menu and category tiles).
 */
export async function getCategoriesWithCover(): Promise<(Category & { cover?: string; count: number })[]> {
  const { products, categories } = await getCatalog();
  return categories
    .map((c) => {
      const items = products.filter((p) => p.category === c.slug);
      return { ...c, cover: items[0]?.images[0], count: items.length };
    })
    .filter((c) => c.count > 0);
}

export async function getBanners(): Promise<Banner[]> {
  return banners;
}
