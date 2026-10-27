import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

/** Responsive product grid: 2 columns on phones, 3 on tablets, 4 on desktop. */
export function ProductGrid({ products, eagerCount = 4 }: { products: Product[]; eagerCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} eager={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
