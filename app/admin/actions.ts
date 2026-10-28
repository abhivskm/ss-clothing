"use server";

/**
 * Server Actions for the admin portal. Every action checks the login first,
 * validates its input on the server, then clears the shop cache so the change
 * is visible on the site immediately.
 */
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "@/lib/admin-products";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/db";
import { compareSizes, slugify } from "@/lib/format";
import { CATEGORY_GROUPS, PRODUCT_TAGS, type CategoryGroup, type ProductColor, type ProductTag } from "@/types/product";

export type FormState = { error?: string } | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const whole = (value: string) => (/^\d+$/.test(value) ? Number(value) : NaN);

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ---------- Login ----------

export async function login(_: FormState, form: FormData): Promise<FormState> {
  if (!checkPassword(String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // slows down password guessing
    return { error: "Wrong password. Please try again." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Products ----------

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = text(form, "id");
  const name = text(form, "name");
  const slug = slugify(text(form, "slug") || name);
  const category = text(form, "category");
  const price = whole(text(form, "price"));
  const mrpText = text(form, "mrp");
  const mrp = mrpText ? whole(mrpText) : undefined;

  const extraSizes = text(form, "extraSizes").split(",").map((s) => s.trim()).filter(Boolean);
  const sizes = [...new Set([...form.getAll("sizes").map(String), ...extraSizes])].sort(compareSizes);
  const colors = parseJson<ProductColor[]>(text(form, "colors"), [])
    .map((c) => ({ name: String(c.name ?? "").trim(), hex: String(c.hex ?? "") }))
    .filter((c) => c.name && /^#[0-9a-f]{6}$/i.test(c.hex));
  const images = parseJson<string[]>(text(form, "images"), []).filter(
    (url) => typeof url === "string" && (db.isBlobUrl(url) || url.startsWith("/images/"))
  );
  const tags = form.getAll("tags").map(String).filter((t): t is ProductTag => PRODUCT_TAGS.includes(t as ProductTag));

  if (!name) return { error: "Enter a product name." };
  if (!slug) return { error: "The web address (slug) needs at least one letter or number." };
  if (!(await db.isCategoryTaken(category))) return { error: "Choose a category." };
  if (!Number.isInteger(price) || price <= 0) return { error: "Enter the price as a whole number of rupees, e.g. 799." };
  if (mrp !== undefined && (!Number.isInteger(mrp) || mrp < price))
    return { error: "MRP must be a whole number and not lower than the price (leave it empty for no discount)." };
  if (!sizes.length) return { error: "Tick at least one size." };
  if (!images.length) return { error: "Add at least one photo." };
  if (await db.isSlugTaken(slug, id)) return { error: `Another product already uses the web address "${slug}". Change the slug.` };

  const input: db.ProductInput = {
    name,
    slug,
    category,
    subcategory: text(form, "subcategory"),
    description: text(form, "description"),
    price,
    mrp,
    fabric: text(form, "fabric"),
    fit: text(form, "fit"),
    sizes,
    colors,
    images,
    tags,
    inStock: form.get("inStock") === "on",
    active: form.get("active") === "on",
  };

  if (id) await db.updateProduct(id, input);
  else await db.createProduct(input);

  updateTag(CATALOG_TAG);
  redirect(`/admin?saved=${encodeURIComponent(name)}`);
}

export async function setActive(id: string, active: boolean) {
  await requireAdmin();
  await db.setProductActive(id, active);
  updateTag(CATALOG_TAG);
  refresh();
}

export async function removeProduct(id: string) {
  await requireAdmin();
  await db.deleteProduct(id);
  updateTag(CATALOG_TAG);
  redirect("/admin?deleted=1");
}

// ---------- Categories ----------

const categoriesPage = (message: string, isError = false) =>
  redirect(`/admin/categories?${isError ? "error" : "msg"}=${encodeURIComponent(message)}`);

export async function saveCategory(form: FormData) {
  await requireAdmin();

  const existingSlug = text(form, "existingSlug");
  const name = text(form, "name");
  const group = text(form, "group") as CategoryGroup;
  const sortOrder = whole(text(form, "sortOrder") || "0");
  const input: db.CategoryInput = { name, group, description: text(form, "description"), sortOrder };

  if (!name) categoriesPage("Enter a category name.", true);
  if (!CATEGORY_GROUPS.includes(group)) categoriesPage("Choose a menu group.", true);
  if (!Number.isInteger(sortOrder)) categoriesPage("Order must be a whole number.", true);

  if (existingSlug) {
    await db.updateCategory(existingSlug, input);
  } else {
    const slug = slugify(text(form, "slug") || name);
    if (!slug) categoriesPage("The category name needs at least one letter or number.", true);
    if (slug === "all" || (await db.isCategoryTaken(slug))) categoriesPage(`A category with the address "${slug}" already exists.`, true);
    await db.createCategory(slug, input);
  }

  updateTag(CATALOG_TAG);
  categoriesPage(existingSlug ? `Saved "${name}".` : `Added "${name}".`);
}

export async function removeCategory(slug: string) {
  await requireAdmin();
  const deleted = await db.deleteCategory(slug);
  if (!deleted) categoriesPage("This category still has products. Move or delete them first.", true);
  updateTag(CATALOG_TAG);
  categoriesPage("Category deleted.");
}
