"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cx } from "@/lib/cx";
import type { ProductStat } from "@/types/analytics";

const PAGE_SIZE = 10;
const fmt = (n: number) => n.toLocaleString("en-IN");

/** Visits that viewed the product and tapped its WhatsApp button ÷ visits that viewed it. */
const conversion = (p: ProductStat) => (p.viewers ? p.converted / p.viewers : 0);

type SortKey = "name" | "views" | "viewers" | "whatsappClicks" | "conversion" | "enquiries";

const COLUMNS: { key: SortKey; label: string; hint?: string }[] = [
  { key: "name", label: "Product" },
  { key: "views", label: "Views", hint: "Every time the product page was opened" },
  { key: "viewers", label: "Seen by", hint: "Visits that opened the product at least once" },
  { key: "whatsappClicks", label: "WhatsApp", hint: "Taps on this product's WhatsApp button" },
  { key: "conversion", label: "Conversion" },
  { key: "enquiries", label: "Enquiries" },
];

export function ProductTable({ products, className }: { products: ProductStat[]; className?: string }) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "viewers", desc: true });
  const [page, setPage] = useState(0);
  const [hideUnseen, setHideUnseen] = useState(false);

  const value = (p: ProductStat) => (sort.key === "conversion" ? conversion(p) : sort.key === "name" ? 0 : p[sort.key]);
  const rows = products
    .filter((p) => !hideUnseen || p.views > 0)
    .sort((a, b) => {
      const diff = sort.key === "name" ? a.name.localeCompare(b.name) : value(a) - value(b);
      return (sort.desc ? -diff : diff) || b.viewers - a.viewers || a.name.localeCompare(b.name);
    });
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <section className={cx("border border-line bg-white", className)} aria-labelledby="products-heading">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-3">
        <h2 id="products-heading" className="text-xs font-bold uppercase tracking-widest text-muted">
          Product analytics
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hideUnseen}
            onChange={(e) => {
              setHideUnseen(e.target.checked);
              setPage(0);
            }}
            className="size-4 accent-ink"
          />
          Only products with views
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-y border-line bg-surface text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sort.key === c.key ? (sort.desc ? "descending" : "ascending") : "none"}
                  className={cx("px-4 py-2 font-bold", c.key !== "name" && "text-right")}
                >
                  <button
                    type="button"
                    title={c.hint}
                    onClick={() => {
                      setSort((s) => ({ key: c.key, desc: s.key === c.key ? !s.desc : c.key !== "name" }));
                      setPage(0);
                    }}
                    className="inline-flex items-center gap-1 uppercase hover:text-ink"
                  >
                    {c.label}
                    <span aria-hidden className={cx("text-[10px]", sort.key !== c.key && "invisible")}>
                      {sort.desc ? "▼" : "▲"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {visible.map((p) => (
              <tr key={p.id} className={cx(!p.active && "text-muted")}>
                <td className="px-4 py-2">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:underline">
                    <span className="relative aspect-3/4 w-9 shrink-0 overflow-hidden bg-surface">
                      {p.image && <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />}
                    </span>
                    <span className="font-semibold">
                      {p.name}
                      {!p.active && <span className="ml-1 text-xs font-normal">(inactive)</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2 text-right">{fmt(p.views)}</td>
                <td className="px-4 py-2 text-right">{fmt(p.viewers)}</td>
                <td className="px-4 py-2 text-right">{fmt(p.whatsappClicks)}</td>
                <td className="px-4 py-2 text-right font-semibold">{p.viewers ? `${(conversion(p) * 100).toFixed(1)}%` : "–"}</td>
                <td className="px-4 py-2 text-right">{fmt(p.enquiries)}</td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={COLUMNS.length} className="p-8 text-center text-muted">
                  {products.length ? "No product was viewed in this period." : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-xs text-muted">
        <p className="max-w-xl">
          <strong className="text-ink">Conversion</strong> = visits that viewed the product and tapped its WhatsApp button ÷ visits that viewed
          the product (&ldquo;Seen by&rdquo;). Several views or taps in one visit count once. WhatsApp taps on the floating button or other
          pages are not credited to a product.
        </p>
        {pages > 1 && (
          <nav aria-label="Product pages" className="flex items-center gap-2">
            <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="border border-line px-3 py-1.5 font-semibold text-ink disabled:opacity-40">
              Previous
            </button>
            <span>
              Page {current + 1} of {pages}
            </span>
            <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="border border-line px-3 py-1.5 font-semibold text-ink disabled:opacity-40">
              Next
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
