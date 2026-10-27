import { cx } from "@/lib/cx";
import type { ProductTag } from "@/types/product";

const styles: Record<ProductTag | "sold-out" | "discount", string> = {
  new: "bg-accent text-white",
  trending: "bg-ink text-white",
  bestseller: "bg-white text-ink",
  "sold-out": "bg-neutral-200 text-ink",
  discount: "bg-white text-ink",
};

const labels: Record<ProductTag, string> = { new: "New", trending: "Trending", bestseller: "Bestseller" };

export function Badge({ kind, children, className }: { kind: keyof typeof styles; children?: React.ReactNode; className?: string }) {
  return (
    <span className={cx("inline-block px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wider", styles[kind], className)}>
      {children ?? labels[kind as ProductTag]}
    </span>
  );
}
