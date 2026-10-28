import type { Metadata } from "next";
import Link from "next/link";
import { removeCategory, saveCategory } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { TrashIcon } from "@/components/ui/Icons";
import { listCategories } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_GROUPS, type Category } from "@/types/product";

export const metadata: Metadata = { title: "Categories" };

// Reads the login cookie on every request (see app/admin/(panel)/layout.tsx)
export const instant = false;

const input = "w-full border border-line bg-white px-3 py-2 text-sm focus:border-ink";
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function CategoryFields({ category, nextOrder }: { category?: Category; nextOrder: number }) {
  return (
    <>
      <label className="block sm:col-span-2">
        <span className="text-xs font-semibold text-muted">Name</span>
        <input name="name" required defaultValue={category?.name} placeholder="e.g. Polo T-Shirts" className={input} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">Menu group</span>
        <select name="group" defaultValue={category?.group ?? "Topwear"} className={input}>
          {CATEGORY_GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">Order</span>
        <input name="sortOrder" inputMode="numeric" pattern="\d+" defaultValue={category?.sortOrder ?? nextOrder} className={input} />
      </label>
      <label className="block sm:col-span-4">
        <span className="text-xs font-semibold text-muted">Description (shown on the category page)</span>
        <input name="description" defaultValue={category?.description} className={input} />
      </label>
    </>
  );
}

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const [params, categories] = await Promise.all([searchParams, listCategories()]);
  const message = first(params.msg);
  const error = first(params.error);
  const nextOrder = Math.max(0, ...categories.map((c) => c.sortOrder)) + 10;

  return (
    <>
      <h1 className="text-2xl font-black uppercase tracking-tight">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        Categories appear in the website menu under their group, sorted by &quot;Order&quot; (lowest first). Categories with no active products are hidden from the menu.
      </p>

      {(message || error) && (
        <p role={error ? "alert" : "status"} className={error ? "mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" : "mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800"}>
          {error || message}
        </p>
      )}

      <section aria-labelledby="add-heading" className="mt-6 border border-line bg-white p-5">
        <h2 id="add-heading" className="font-bold">Add a category</h2>
        <form action={saveCategory} className="mt-3 grid gap-3 sm:grid-cols-4">
          <CategoryFields nextOrder={nextOrder} />
          <div className="sm:col-span-4">
            <button className="bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-dark">Add category</button>
          </div>
        </form>
      </section>

      <ul className="mt-6 space-y-3">
        {categories.map((c) => (
          <li key={c.slug} className="border border-line bg-white p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">
                {c.name} <span className="text-sm font-normal text-muted">/collections/{c.slug}</span>
              </h2>
              <Link href={`/admin?category=${c.slug}`} className="text-sm font-semibold text-accent hover:underline">
                {c.count} product{c.count === 1 ? "" : "s"}
              </Link>
            </div>
            <form action={saveCategory} className="grid gap-3 sm:grid-cols-4">
              <input type="hidden" name="existingSlug" value={c.slug} />
              <CategoryFields category={c} nextOrder={nextOrder} />
              <div className="flex flex-wrap items-center gap-3 sm:col-span-4">
                <button className="bg-ink px-5 py-2 text-sm font-bold text-white">Save</button>
                {c.count === 0 ? (
                  <ConfirmButton
                    action={removeCategory.bind(null, c.slug)}
                    message={`Delete the category "${c.name}"?`}
                    className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-red-700 hover:underline"
                  >
                    <TrashIcon /> Delete
                  </ConfirmButton>
                ) : (
                  <span className="text-xs text-muted">To delete, first move or delete its products.</span>
                )}
              </div>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
