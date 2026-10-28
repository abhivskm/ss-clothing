/**
 * Data layer for the admin portal: reads every product (including inactive
 * ones) and writes products and categories. Never cached.
 *
 * Only Server Actions and admin pages call this, always after requireAdmin().
 */
import "server-only";
import { del } from "@vercel/blob";
import { rowToCategory, rowToProduct, sql } from "@/lib/db";
import type { Category, Product } from "@/types/product";

export type ProductInput = Omit<Product, "id" | "createdAt">;
export type CategoryInput = Omit<Category, "slug">;

// ---------- Products ----------

export async function listProducts(filter: { q?: string; category?: string; status?: string }): Promise<Product[]> {
  const rows = await sql`select * from products order by created_at desc`;
  const words = (filter.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return rows.map(rowToProduct).filter(
    (p) =>
      (!filter.category || p.category === filter.category) &&
      (filter.status !== "active" || p.active) &&
      (filter.status !== "inactive" || !p.active) &&
      words.every((w) => `${p.name} ${p.subcategory} ${p.slug}`.toLowerCase().includes(w))
  );
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const [row] = await sql`select * from products where id = ${id}`;
  return row ? rowToProduct(row) : undefined;
}

export async function isSlugTaken(slug: string, exceptId = "") {
  const [row] = await sql`select 1 from products where slug = ${slug} and id <> ${exceptId}`;
  return Boolean(row);
}

export async function createProduct(p: ProductInput): Promise<string> {
  const id = `ss-${crypto.randomUUID().slice(0, 8)}`;
  await sql`
    insert into products (id, slug, name, category, subcategory, description, price, mrp, fabric, fit,
                          sizes, colors, images, tags, in_stock, active)
    values (${id}, ${p.slug}, ${p.name}, ${p.category}, ${p.subcategory}, ${p.description}, ${p.price}, ${p.mrp ?? null},
            ${p.fabric}, ${p.fit}, ${JSON.stringify(p.sizes)}, ${JSON.stringify(p.colors)}, ${JSON.stringify(p.images)},
            ${JSON.stringify(p.tags)}, ${p.inStock}, ${p.active})`;
  return id;
}

/** Updates a product and deletes photos that were removed from it. */
export async function updateProduct(id: string, p: ProductInput) {
  const before = await getProductById(id);
  await sql`
    update products set
      slug = ${p.slug}, name = ${p.name}, category = ${p.category}, subcategory = ${p.subcategory},
      description = ${p.description}, price = ${p.price}, mrp = ${p.mrp ?? null}, fabric = ${p.fabric}, fit = ${p.fit},
      sizes = ${JSON.stringify(p.sizes)}, colors = ${JSON.stringify(p.colors)}, images = ${JSON.stringify(p.images)},
      tags = ${JSON.stringify(p.tags)}, in_stock = ${p.inStock}, active = ${p.active}, updated_at = now()
    where id = ${id}`;
  await deleteImages((before?.images ?? []).filter((url) => !p.images.includes(url)));
}

export async function setProductActive(id: string, active: boolean) {
  await sql`update products set active = ${active}, updated_at = now() where id = ${id}`;
}

export async function deleteProduct(id: string) {
  const [row] = await sql`delete from products where id = ${id} returning images`;
  if (row) await deleteImages(row.images as string[]);
}

/** Removes photos from Vercel Blob. Failures are ignored: a leftover file only costs storage. */
export async function deleteImages(urls: string[]) {
  const blobUrls = urls.filter(isBlobUrl);
  if (blobUrls.length) await del(blobUrls).catch((e) => console.error("Blob delete failed", e));
}

export const isBlobUrl = (url: string) => /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//.test(url);

// ---------- Categories ----------

export async function listCategories(): Promise<(Category & { count: number })[]> {
  const rows = await sql`
    select c.*, count(p.id)::int as count
    from categories c left join products p on p.category = c.slug
    group by c.slug order by c.sort_order, c.name`;
  return rows.map((r) => ({ ...rowToCategory(r), count: r.count as number }));
}

export async function isCategoryTaken(slug: string) {
  const [row] = await sql`select 1 from categories where slug = ${slug}`;
  return Boolean(row);
}

export async function createCategory(slug: string, c: CategoryInput) {
  await sql`insert into categories (slug, name, grp, description, sort_order)
            values (${slug}, ${c.name}, ${c.group}, ${c.description}, ${c.sortOrder})`;
}

export async function updateCategory(slug: string, c: CategoryInput) {
  await sql`update categories set name = ${c.name}, grp = ${c.group}, description = ${c.description},
            sort_order = ${c.sortOrder} where slug = ${slug}`;
}

/** Returns false (and deletes nothing) when products still use the category. */
export async function deleteCategory(slug: string): Promise<boolean> {
  const rows = await sql`delete from categories where slug = ${slug}
                         and not exists (select 1 from products where category = ${slug}) returning slug`;
  return rows.length > 0;
}
