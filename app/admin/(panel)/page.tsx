import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { setActive } from "@/app/admin/actions";
import { PlusIcon } from "@/components/ui/Icons";
import { listCategories, listProducts } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

// Reads the login cookie on every request (see app/admin/(panel)/layout.tsx)
export const instant = false;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProductsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const params = await searchParams;
  const filter = { q: first(params.q), category: first(params.category), status: first(params.status) };
  const [products, categories] = await Promise.all([listProducts(filter), listCategories()]);
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const saved = first(params.saved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black uppercase tracking-tight">Products</h1>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-dark">
          <PlusIcon /> Add product
        </Link>
      </div>

      {(saved || params.deleted) && (
        <p role="status" className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {saved ? `Saved "${saved}". The website is updated.` : "Product deleted."}
        </p>
      )}

      <form className="mt-5 flex flex-wrap gap-2" role="search">
        <input
          name="q"
          defaultValue={filter.q}
          placeholder="Search products"
          aria-label="Search products"
          className="min-w-0 flex-1 basis-48 border border-line bg-white px-3 py-2 text-sm"
        />
        <select name="category" defaultValue={filter.category} aria-label="Category" className="border border-line bg-white px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={filter.status} aria-label="Status" className="border border-line bg-white px-3 py-2 text-sm">
          <option value="">Active + inactive</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <button className="bg-ink px-4 py-2 text-sm font-bold text-white">Filter</button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {products.length} product{products.length === 1 ? "" : "s"}. Inactive products are hidden from the website.
      </p>

      <ul className="mt-3 divide-y divide-line border border-line bg-white">
        {products.map((p) => (
          <li key={p.id} className={cx("flex items-center gap-3 p-3 sm:gap-4", !p.active && "bg-neutral-50")}>
            <Link href={`/admin/products/${p.id}`} className="relative aspect-3/4 w-14 shrink-0 overflow-hidden bg-surface sm:w-16">
              {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className={cx("object-cover", !p.active && "opacity-50")} />}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/products/${p.id}`} className="font-bold hover:underline">
                {p.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">
                {categoryName(p.category)} · {formatPrice(p.price)}
                {!p.inStock && <span className="font-semibold text-red-700"> · Sold out</span>}
              </p>
            </div>
            <form action={setActive.bind(null, p.id, !p.active)}>
              <button
                role="switch"
                aria-checked={p.active}
                aria-label={`${p.name}: ${p.active ? "active, click to hide from website" : "inactive, click to show on website"}`}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
              >
                <span className={cx("relative h-6 w-11 rounded-full transition-colors", p.active ? "bg-green-600" : "bg-neutral-300")}>
                  <span className={cx("absolute top-1 size-4 rounded-full bg-white transition-all", p.active ? "left-6" : "left-1")} />
                </span>
                <span className={cx("hidden w-14 text-left sm:inline", p.active ? "text-green-700" : "text-muted")}>
                  {p.active ? "Active" : "Inactive"}
                </span>
              </button>
            </form>
            <Link href={`/admin/products/${p.id}`} className="hidden border border-line px-3 py-1.5 text-sm font-semibold hover:border-ink sm:inline-block">
              Edit
            </Link>
          </li>
        ))}
        {!products.length && <li className="p-8 text-center text-muted">No products found.</li>}
      </ul>
    </>
  );
}
