"use client";

import { useState } from "react";
import { EnquiryButtons } from "@/components/product/EnquiryButtons";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

/** Colour + size pickers, stock status and the enquiry buttons. */
export function ProductOptions({ product, pageUrl }: { product: Product; pageUrl: string }) {
  const { colors, sizes, inStock } = product;
  const [color, setColor] = useState(colors.length === 1 ? colors[0].name : undefined);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : undefined);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 flex w-full justify-between text-xs font-bold uppercase tracking-widest">
          Colour <span className="font-medium normal-case tracking-normal text-muted">{color ?? "Select a colour"}</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <label key={c.name} className="cursor-pointer" title={c.name}>
              <input type="radio" name="color" value={c.name} checked={color === c.name} onChange={() => setColor(c.name)} className="peer sr-only" />
              <span className="sr-only">{c.name}</span>
              <span
                aria-hidden
                className={cx(
                  "block size-9 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent",
                  color === c.name && "ring-2 ring-ink ring-offset-2"
                )}
                style={{ background: c.hex }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 flex w-full justify-between text-xs font-bold uppercase tracking-widest">
          Size <span className="font-medium normal-case tracking-normal text-muted">{size ?? "Select a size"}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="peer sr-only" />
              <span
                className={cx(
                  "inline-block min-w-14 border px-3 py-3 text-center text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent",
                  size === s ? "border-ink bg-ink text-white" : "border-neutral-300 hover:border-ink"
                )}
              >
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className={cx("flex items-center gap-2 text-sm font-semibold", inStock ? "text-green-700" : "text-red-700")}>
        <span className={cx("size-2 rounded-full", inStock ? "bg-green-600" : "bg-red-600")} aria-hidden />
        {inStock ? "In stock at our store" : "Currently sold out. Message us to check restock dates."}
      </p>

      {!size && sizes.length > 1 && <p className="-mt-3 text-sm text-muted">Pick your size so we can check stock for you.</p>}

      <EnquiryButtons slug={product.slug} name={product.name} price={formatPrice(product.price)} size={size} color={color} fallbackUrl={pageUrl} />
    </div>
  );
}
