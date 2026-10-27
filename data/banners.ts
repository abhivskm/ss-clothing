import type { Banner } from "@/types/product";

// Homepage hero slides. Replace the images in /public/images/banners with your own
// (1920x1000 works best) and edit the text below.
export const banners: Banner[] = [
  {
    id: "denim",
    eyebrow: "New drop",
    title: "Baggy is back",
    text: "Wide-leg denim, stacked hems and washes that go with everything.",
    cta: { label: "Shop New Arrivals", href: "/collections/all?tag=new" },
    image: "/images/banners/hero-denim.jpg",
    imageAlt: "Man in a yellow sweatshirt and baggy blue jeans against a brick wall",
  },
  {
    id: "oversized",
    eyebrow: "Oversized SZN",
    title: "Fits that feel like you",
    text: "Heavyweight tees and boxy hoodies, fresh in store every week.",
    cta: { label: "Shop Oversized Tees", href: "/collections/oversized-tees" },
    image: "/images/banners/hero-oversized.jpg",
    imageAlt: "Man in an oversized t-shirt looking down on a city street",
  },
  {
    id: "layers",
    eyebrow: "Layer up",
    title: "Jackets & hoodies",
    text: "Utility zips, denim truckers and fleece for cooler evenings.",
    cta: { label: "Shop Jackets", href: "/collections/jackets" },
    image: "/images/banners/hero-layers.jpg",
    imageAlt: "Man in a black zip-up jacket and sunglasses",
  },
];
