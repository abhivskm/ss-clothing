import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { discountPercent } from "@/lib/format";
import type { Product } from "@/types/product";

/**
 * Reusable product card. The whole card links to the product page.
 * On devices with hover, the second photo fades in and the size list slides up.
 */
export function ProductCard({
  product,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  eager = false,
}: {
  product: Product;
  /** `sizes` hint for next/image so phones download small images */
  sizes?: string;
  /** Load immediately (use for cards visible on first screen) */
  eager?: boolean;
}) {
  const { slug, name, subcategory, images, tags, price, mrp, inStock } = product;
  const off = discountPercent(product);
  const hoverImage = images[1];

  return (
    <article className="group relative">
      <Link href={`/product/${slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-surface">
          <Image
            src={images[0]}
            alt={name}
            fill
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            className={`object-cover transition-all duration-500 ${hoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"}`}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {tags.includes("new") && <Badge kind="new" />}
            {tags.includes("trending") && <Badge kind="trending" />}
            {tags.includes("bestseller") && <Badge kind="bestseller" />}
          </div>
          {off > 0 && (
            <Badge kind="discount" className="absolute right-2 top-2">
              {off}% off
            </Badge>
          )}
          {!inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-white/90 py-2 text-center text-xs font-bold uppercase tracking-widest">
              Sold out
            </div>
          )}

          {/* Size preview, slides up on hover (desktop) */}
          {inStock && (
            <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-white/95 px-3 py-2.5 transition-transform duration-300 group-hover:translate-y-0 [@media(hover:hover)]:block">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Sizes</p>
              <p className="flex flex-wrap gap-1">
                {product.sizes.map((s) => (
                  <span key={s} className="border border-line px-1.5 py-0.5 text-[11px] font-semibold">
                    {s}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        <div className="pt-3">
          <h3 className="truncate text-sm font-semibold">{name}</h3>
          <p className="truncate text-xs text-muted">{subcategory}</p>
          <div className="mt-1.5">
            <Price price={price} mrp={mrp} />
          </div>
          <p className="mt-1 truncate text-[11px] text-muted [@media(hover:hover)]:hidden">{product.sizes.join(" · ")}</p>
        </div>
      </Link>
    </article>
  );
}
