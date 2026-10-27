import { cx } from "@/lib/cx";
import { discountPercent, formatPrice } from "@/lib/format";

/** Selling price, MRP strikethrough and discount %. */
export function Price({ price, mrp, size = "sm" }: { price: number; mrp?: number; size?: "sm" | "lg" }) {
  const off = discountPercent({ price, mrp });
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={cx("font-bold", size === "lg" ? "text-2xl" : "text-sm")}>{formatPrice(price)}</span>
      {off > 0 && mrp && (
        <>
          <span className={cx("text-muted line-through", size === "lg" ? "text-base" : "text-xs")}>
            <span className="sr-only">MRP </span>
            {formatPrice(mrp)}
          </span>
          <span className={cx("font-bold text-accent", size === "lg" ? "text-base" : "text-xs")}>{off}% off</span>
        </>
      )}
    </p>
  );
}
