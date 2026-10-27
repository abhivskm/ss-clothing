import { ProductCard } from "@/components/product/ProductCard";
import { RowScroller } from "@/components/product/RowScroller";
import type { Product } from "@/types/product";

/** A horizontal row of product cards (swipe on mobile, arrows on desktop). */
export function ProductRow({ products, label }: { products: Product[]; label: string }) {
  return (
    <RowScroller label={label}>
      {products.map((p) => (
        <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc((100%-60px)/4)]">
          <ProductCard product={p} sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 25vw" />
        </li>
      ))}
    </RowScroller>
  );
}
