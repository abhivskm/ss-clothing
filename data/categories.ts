import type { Category } from "@/types/product";

// Order here is the order shown in menus and category tiles.
export const categories: Category[] = [
  { slug: "t-shirts", name: "T-Shirts", group: "Topwear", description: "Everyday crew necks and polos in soft cotton." },
  { slug: "oversized-tees", name: "Oversized Tees", group: "Topwear", description: "Boxy, drop-shoulder tees with bold graphics." },
  { slug: "shirts", name: "Shirts", group: "Topwear", description: "Cuban collars, linen blends and checks for every plan." },
  { slug: "hoodies", name: "Hoodies", group: "Topwear", description: "Fleece hoodies and zip-ups for cooler evenings." },
  { slug: "jackets", name: "Jackets", group: "Topwear", description: "Denim truckers and utility layers." },
  { slug: "jeans", name: "Jeans", group: "Bottomwear", description: "Baggy, straight and slim fits in fresh washes." },
  { slug: "cargos", name: "Cargos", group: "Bottomwear", description: "Utility cargos with room to move." },
  { slug: "trousers", name: "Trousers", group: "Bottomwear", description: "Korean-fit and pleated trousers for a clean look." },
  { slug: "joggers", name: "Joggers", group: "Bottomwear", description: "Comfy joggers for college, gym and chill days." },
  { slug: "shorts", name: "Shorts", group: "Bottomwear", description: "Easy shorts for hot Bhopal afternoons." },
  { slug: "co-ords", name: "Co-ords", group: "More", description: "Matching sets that do the styling for you." },
  { slug: "accessories", name: "Accessories", group: "More", description: "Caps, sunglasses and finishing touches." },
];
