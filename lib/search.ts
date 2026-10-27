import type { Product } from "@/types/product";

/**
 * Pure search matcher, safe to use in Client Components
 * (it does not import the product data).
 */
export function matchesQuery(p: Product, words: string[]): boolean {
  const haystack = [p.name, p.category, p.subcategory, p.fabric, p.fit, ...p.colors.map((c) => c.name)]
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}

export const toWords = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean);
