"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FilterPanel, type FilterState } from "@/components/collection/FilterPanel";
import { SORT_OPTIONS, SortSelect, type SortId } from "@/components/collection/SortSelect";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CloseIcon, FilterIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";
import { compareSizes, PRICE_RANGES } from "@/lib/format";
import { matchesQuery, toWords } from "@/lib/search";
import type { Category, Product } from "@/types/product";

const TAG_LABELS: Record<string, string> = { new: "New arrivals", trending: "Trending", bestseller: "Bestsellers" };
const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/**
 * Filters and sorts the products in the browser. All state lives in the URL
 * (?size=M,L&color=Black&price=700-999&sort=price-asc&q=cargo&tag=new) so filtered views can be shared.
 */
export function CollectionView({
  products,
  categories,
  currentCategory,
}: {
  products: Product[];
  categories: Category[];
  currentCategory: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const sortParam = params.get("sort");
  const sort: SortId = SORT_OPTIONS.some((o) => o.id === sortParam) ? (sortParam as SortId) : "newest";
  const state: FilterState = { sizes: list(params.get("size")), colors: list(params.get("color")), price: params.get("price") ?? "" };

  /** Updates one or more URL params without scrolling the page. */
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggle = (key: "sizes" | "colors", value: string) => {
    const current = state[key];
    const nextValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key === "sizes" ? "size" : "color"]: nextValues.join(",") || null });
  };

  // Options come from the products in this collection
  const sizeOptions = useMemo(() => [...new Set(products.flatMap((p) => p.sizes))].sort(compareSizes), [products]);
  const colorOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => !map.has(c.name) && map.set(c.name, c.hex)));
    return [...map].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const results = filterAndSort();

  function filterAndSort() {
    const words = toWords(q);
    const range = PRICE_RANGES.find((r) => r.id === state.price);
    const filtered = products.filter(
      (p) =>
        (!words.length || matchesQuery(p, words)) &&
        (!tag || p.tags.includes(tag as Product["tags"][number])) &&
        (!state.sizes.length || state.sizes.some((s) => p.sizes.includes(s))) &&
        (!state.colors.length || p.colors.some((c) => state.colors.includes(c.name))) &&
        (!range || (p.price >= range.min && p.price <= range.max))
    );
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }

  // Active filter chips (each removes itself)
  const chips: { label: string; remove: () => void }[] = [
    ...(q ? [{ label: `“${q}”`, remove: () => update({ q: null }) }] : []),
    ...(tag ? [{ label: TAG_LABELS[tag] ?? tag, remove: () => update({ tag: null }) }] : []),
    ...state.sizes.map((s) => ({ label: `Size ${s}`, remove: () => toggle("sizes", s) })),
    ...state.colors.map((c) => ({ label: c, remove: () => toggle("colors", c) })),
    ...(state.price ? [{ label: PRICE_RANGES.find((r) => r.id === state.price)?.label ?? state.price, remove: () => update({ price: null }) }] : []),
  ];
  const clearAll = () => router.replace(pathname, { scroll: false });

  // Keep filters (but not the search/tag) when switching category
  const keepQuery = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    next.delete("q");
    return next.toString();
  }, [params]);

  // Lock scroll while the mobile filter drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const panel = (
    <FilterPanel
      categories={categories}
      currentCategory={currentCategory}
      keepQuery={keepQuery}
      sizeOptions={sizeOptions}
      colorOptions={colorOptions}
      state={state}
      onToggle={toggle}
      onPrice={(id) => update({ price: id || null })}
    />
  );

  return (
    <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="text-xs font-bold uppercase tracking-widest">Filters</p>
            {chips.length > 0 && (
              <button type="button" onClick={clearAll} className="text-xs font-bold uppercase tracking-wider text-accent">
                Clear all
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 border border-ink px-4 py-2.5 text-sm font-bold uppercase tracking-wider lg:hidden"
          >
            <FilterIcon /> Filters{chips.length > 0 && ` (${chips.length})`}
          </button>
          <p className="hidden text-sm text-muted lg:block" aria-live="polite">
            {results.length} product{results.length === 1 ? "" : "s"}
          </p>
          <SortSelect value={sort} onChange={(v) => update({ sort: v === "newest" ? null : v })} />
        </div>

        {chips.length > 0 && (
          <ul className="mb-5 flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.label}>
                <button
                  type="button"
                  onClick={c.remove}
                  className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:border-ink"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label} <CloseIcon className="size-3.5" />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="px-2 py-1.5 text-xs font-bold underline underline-offset-4">
                Clear all
              </button>
            </li>
          </ul>
        )}

        <p className="mb-4 text-sm text-muted lg:hidden" aria-live="polite">
          {results.length} product{results.length === 1 ? "" : "s"}
        </p>

        {results.length ? (
          <ProductGrid products={results} />
        ) : (
          <div className="bg-surface px-6 py-16 text-center">
            <p className="text-lg font-bold">No products match these filters</p>
            <p className="mt-1 text-sm text-muted">Try removing a filter or searching for something else.</p>
            <button type="button" onClick={clearAll} className="mt-5 bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wider text-white">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      <div className={cx("fixed inset-0 z-50 lg:hidden", !drawerOpen && "pointer-events-none")} aria-hidden={!drawerOpen}>
        <div className={cx("absolute inset-0 bg-black/40 transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")} onClick={() => setDrawerOpen(false)} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          inert={!drawerOpen}
          className={cx(
            "absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="text-sm font-extrabold uppercase tracking-widest">Filters</p>
            <button type="button" onClick={() => setDrawerOpen(false)} className="grid size-10 place-items-center" aria-label="Close filters">
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5">{panel}</div>
          <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
            <button type="button" onClick={clearAll} className="border border-ink py-3 text-sm font-bold uppercase tracking-wider">
              Clear
            </button>
            <button type="button" onClick={() => setDrawerOpen(false)} className="bg-ink py-3 text-sm font-bold uppercase tracking-wider text-white">
              Show {results.length}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
