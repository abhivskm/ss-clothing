import type { Product } from "@/types/product";

/** 1199 -> "₹1,199" */
export const formatPrice = (n: number) => "₹" + n.toLocaleString("en-IN");

/** Whole-number discount %, or 0 when there is no higher MRP. */
export const discountPercent = (p: Pick<Product, "price" | "mrp">) =>
  p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

/** Sorts letter sizes first (S..XXL), then waist sizes numerically, then anything else. */
export const compareSizes = (a: string, b: string) => {
  const rank = (s: string) => (SIZE_ORDER.includes(s) ? SIZE_ORDER.indexOf(s) : 100 + (Number(s) || 900));
  return rank(a) - rank(b) || a.localeCompare(b);
};

/** Size tick boxes offered in the admin product form. */
export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38", "40", "Free Size"];

/** "Oversized Tees & More!" -> "oversized-tees-more" */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Price ranges used by the collection filter. `max` is inclusive. */
export const PRICE_RANGES = [
  { id: "under-700", label: "Under ₹700", min: 0, max: 699 },
  { id: "700-999", label: "₹700 – ₹999", min: 700, max: 999 },
  { id: "1000-1499", label: "₹1,000 – ₹1,499", min: 1000, max: 1499 },
  { id: "1500-plus", label: "₹1,500 & above", min: 1500, max: Infinity },
] as const;
