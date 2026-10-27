/**
 * Data layer: the ONLY place that knows where products come from.
 *
 * Today it reads the local files in /data. To move to a database
 * (Firebase / MongoDB Atlas), rewrite the bodies of these functions and keep
 * their signatures. Every function is async on purpose, so callers already
 * `await` and nothing in /app or /components needs to change.
 *
 * The future admin portal will add write functions here as well
 * (createProduct, updateProduct, deleteProduct). See README > Architecture.
 */
import { banners } from "@/data/banners";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { matchesQuery, toWords } from "@/lib/search";
import type { Banner, Category, CategorySlug, Product, ProductTag } from "@/types/product";

const byNewest = (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt);

export async function getAllProducts(): Promise<Product[]> {
  return [...products].sort(byNewest);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  return products.filter((p) => p.category === category).sort(byNewest);
}

export async function getProductsByTag(tag: ProductTag, limit?: number): Promise<Product[]> {
  const list = products.filter((p) => p.tags.includes(tag)).sort(byNewest);
  return limit ? list.slice(0, limit) : list;
}

/** Case-insensitive search across name, category, subcategory, fabric, fit and colours. */
export async function searchProducts(query: string): Promise<Product[]> {
  const words = toWords(query);
  if (!words.length) return getAllProducts();
  return products.filter((p) => matchesQuery(p, words)).sort(byNewest);
}

/** Same category first, then same group (Topwear/Bottomwear), then the rest. */
export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const group = (slug: CategorySlug) => categories.find((c) => c.slug === slug)?.group;
  const score = (p: Product) => (p.category === product.category ? 2 : group(p.category) === group(product.category) ? 1 : 0);
  return products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => score(b) - score(a) || byNewest(a, b))
    .slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((c) => c.slug === slug);
}

/** Categories with a cover image taken from their newest product (for tiles and menus). */
export async function getCategoriesWithCover(): Promise<(Category & { cover?: string; count: number })[]> {
  return categories.map((c) => {
    const items = products.filter((p) => p.category === c.slug).sort(byNewest);
    return { ...c, cover: items[0]?.images[0], count: items.length };
  });
}

export async function getBanners(): Promise<Banner[]> {
  return banners;
}
