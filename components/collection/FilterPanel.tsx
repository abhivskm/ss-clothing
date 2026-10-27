"use client";

import Link from "next/link";
import { cx } from "@/lib/cx";
import { PRICE_RANGES } from "@/lib/format";
import type { Category } from "@/types/product";

export type FilterState = {
  sizes: string[];
  colors: string[];
  price: string;
};

/** Sidebar / drawer content with category, size, colour and price filters. */
export function FilterPanel({
  categories,
  currentCategory,
  keepQuery,
  sizeOptions,
  colorOptions,
  state,
  onToggle,
  onPrice,
}: {
  categories: Category[];
  currentCategory: string;
  /** Query string (filters/sort) to carry over when switching category */
  keepQuery: string;
  sizeOptions: string[];
  colorOptions: { name: string; hex: string }[];
  state: FilterState;
  onToggle: (key: "sizes" | "colors", value: string) => void;
  onPrice: (id: string) => void;
}) {
  // float + clear makes <legend> sit inside the padding like a normal heading
  const group = "border-b border-line py-5 [&>legend+*]:clear-both";
  const heading = "float-left mb-3 w-full text-xs font-bold uppercase tracking-widest";
  const catHref = (slug: string) => `/collections/${slug}${keepQuery ? `?${keepQuery}` : ""}`;

  return (
    <div>
      <fieldset className={group}>
        <legend className={heading}>Category</legend>
        <ul className="space-y-1.5 text-sm">
          {[{ slug: "all", name: "All products" }, ...categories].map((c) => (
            <li key={c.slug}>
              <Link
                href={catHref(c.slug)}
                aria-current={currentCategory === c.slug ? "page" : undefined}
                className={cx("block py-0.5 hover:text-accent", currentCategory === c.slug && "font-bold text-accent")}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className={group}>
        <legend className={heading}>Size</legend>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => {
            const on = state.sizes.includes(s);
            return (
              <label key={s} className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" checked={on} onChange={() => onToggle("sizes", s)} />
                <span
                  className={cx(
                    "inline-block min-w-11 border px-2.5 py-2 text-center text-xs font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent",
                    on ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  )}
                >
                  {s}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={group}>
        <legend className={heading}>Colour</legend>
        <ul className="max-h-60 space-y-1 overflow-y-auto pr-1">
          {colorOptions.map((c) => {
            const on = state.colors.includes(c.name);
            return (
              <li key={c.name}>
                <label className="flex cursor-pointer items-center gap-3 py-1 text-sm">
                  <input type="checkbox" className="peer sr-only" checked={on} onChange={() => onToggle("colors", c.name)} />
                  <span
                    className={cx(
                      "size-5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] peer-focus-visible:outline-2 peer-focus-visible:outline-accent",
                      on && "ring-2 ring-ink ring-offset-2"
                    )}
                    style={{ background: c.hex }}
                    aria-hidden
                  />
                  <span className={on ? "font-semibold" : undefined}>{c.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className={group}>
        <legend className={heading}>Price</legend>
        <div className="space-y-1.5 text-sm">
          {[{ id: "", label: "Any price" }, ...PRICE_RANGES].map((r) => (
            <label key={r.id} className="flex cursor-pointer items-center gap-3 py-0.5">
              <input type="radio" name="price" className="size-4 accent-ink" checked={state.price === r.id} onChange={() => onPrice(r.id)} />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
