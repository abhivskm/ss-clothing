# SS Clothing: Shree Shyam Garments

Product showcase website for **SS Clothing**, a men's wear store at Karond Square, Bhopal.
Customers browse products and enquire on **WhatsApp** or **Instagram DM**. There is no cart, no payment and no login.

Built with Next.js 16 (App Router), TypeScript and Tailwind CSS 4.

---

## Setup and run

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run start      # serve the production build
npm run lint
```

## Folder structure

```
app/                      Pages (App Router)
  page.tsx                Home
  collections/[category]/ /collections/all and /collections/<category>
  product/[slug]/         Product detail page
  about/                  About & Visit Us
  sitemap.ts, robots.ts   SEO
components/
  layout/                 Announcement bar, navbar + mega menu, mobile menu, search, footer
  home/                   Hero slider, category tiles, "Why SS Clothing", Instagram section
  product/                Product card, grid, row, gallery, lightbox, options, enquiry buttons
  collection/             Filters, sort, collection view
  ui/                     Buttons, badges, price, skeletons, icons
lib/
  products.ts             DATA LAYER: the only code that reads product data
  site.ts                 Store settings: phone, WhatsApp, Instagram, address, hours
  links.ts                WhatsApp / Instagram / Maps link builders + enquiry message
  format.ts, search.ts    Price formatting, size sorting, search matching
types/product.ts          Product, Category and Banner types
data/                     products.ts, categories.ts, banners.ts (sample content)
public/images/            products/<slug>/1.jpg..5.jpg, banners/
```

## Everyday edits

| What | Where |
|---|---|
| Phone, WhatsApp, Instagram, address | `lib/site.ts` |
| **Store hours** (currently a placeholder) | `lib/site.ts`, set `hours: [{ days: "Mon – Sun", time: "10:30 AM – 9:30 PM" }]` |
| Announcement bar text | `lib/site.ts`, `announcement` |
| Hero banner slides | `data/banners.ts` + images in `public/images/banners/` (1920×1000) |
| About page story | `app/about/page.tsx` (marked PLACEHOLDER) |
| Colours and font | `app/globals.css` (`@theme` block) |
| Logo | `public/logo.png` |

### Add a product (until the admin portal exists)

1. Create a folder `public/images/products/<slug>/` (for example `black-cargo-pants`) and add 4–5 photos named `1.jpg`, `2.jpg`, … .
   Portrait 3:4 photos work best (for example 1200×1600). Photo 1 is the main image, and photo 2 shows when hovering over the card.
2. Open `data/products.ts`, copy an existing product and change the fields:
   - `id`: unique, for example `"ss-022"`
   - `slug`: same as the folder name, lowercase-with-dashes
   - `category`: one of the slugs in `data/categories.ts`
   - `price`, and optionally `mrp` (the discount % is calculated automatically)
   - `sizes`, `colors` (name + hex colour), `fabric`, `fit`, `description`
   - `tags`: any of `"new"`, `"trending"`, `"bestseller"` (these drive the homepage rows and badges)
   - `inStock`: `false` shows "Sold out"
   - `createdAt`: date like `"2026-11-01"` (used for "Newest" sorting)
   - `images: photos("<slug>", 5)` (the number of photos in the folder)
3. To remove a product, delete its entry and its image folder.

### Replace the demo photos

All photos in `public/images` are **free Unsplash demo photos**. Replace them with real store photos before launch:
keep the same file names (`1.jpg`, `2.jpg`, …) and the site picks them up with no code changes.
After replacing images in development, delete `.next/dev/cache/images` if old versions still show.

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. Import it on [vercel.com](https://vercel.com) and deploy. No settings are needed.
3. Until you buy a domain, the site uses the Vercel URL automatically for SEO and WhatsApp links.
4. After buying a domain, add it in Vercel → Domains and set the environment variable
   `NEXT_PUBLIC_SITE_URL=https://www.your-domain.com` (see `.env.example`), then redeploy.

---

## Architecture

### Data layer

All product data goes through **`lib/products.ts`**:

```ts
getAllProducts()            getProductBySlug(slug)      getProductsByCategory(category)
getProductsByTag(tag)       searchProducts(query)       getRelatedProducts(product)
getCategories()             getCategory(slug)           getCategoriesWithCover()
getBanners()
```

- No page or component imports `data/` directly. They only call these functions.
- Every function is `async`, so swapping the source for a database changes **only this file**.
- Types live in `types/product.ts`. A database and the admin portal should use the same shapes.
- Client Components never import `lib/products.ts`, which keeps the data out of the browser bundle.
  The collection page fetches on the server and passes products down. Search matching (`lib/search.ts`) has no data imports.

### Migrating to a database (Firebase / MongoDB Atlas + Cloudinary)

1. Create a `products` collection with documents shaped like `Product` (plus `categories` and `banners` if you want them editable).
2. Rewrite the functions in `lib/products.ts` to query the database. For example, with MongoDB:
   ```ts
   import { cacheLife, cacheTag } from "next/cache";

   export async function getAllProducts(): Promise<Product[]> {
     "use cache";
     cacheLife("hours");
     cacheTag("products");
     return db.collection<Product>("products").find().sort({ createdAt: -1 }).toArray();
   }
   ```
   `"use cache"` keeps pages fast (this project has Cache Components enabled), and `cacheTag` lets the admin refresh pages instantly after an edit.
3. Upload product photos to **Cloudinary** and store the image URLs in `images[]`. Allow the host in `next.config.ts`
   (`images.remotePatterns`, already stubbed in a comment).
4. Store credentials in environment variables (`MONGODB_URI`, `CLOUDINARY_*`), never in code.
5. For products added after a deploy, `generateStaticParams` in `app/product/[slug]/page.tsx` prebuilds the
   known ones and new slugs render on first visit.

### Where the admin portal plugs in

```
app/admin/                     ← new, protected route group (add authentication, e.g. Auth.js or Firebase Auth)
  page.tsx                     product list with edit/delete
  products/new/page.tsx        create form (with image upload to Cloudinary)
  products/[id]/page.tsx       edit form
lib/products.ts                ← add createProduct / updateProduct / deleteProduct next to the readers
app/admin/actions.ts           ← Server Actions that call those functions, then updateTag("products")
```

- The public UI does not change: it keeps calling the same read functions.
- `robots.ts` already disallows `/admin`.
- Validate form input on the server (for example with zod) against the `Product` type.

## Placeholders to replace before launch

- [ ] Product photos (Unsplash demo photos in `public/images/products/`)
- [ ] Product data: names, prices, sizes, colours (`data/products.ts`)
- [ ] Banner photos and text (`public/images/banners/`, `data/banners.ts`)
- [ ] Store hours (`lib/site.ts`)
- [ ] About page story (`app/about/page.tsx`)
- [ ] `NEXT_PUBLIC_SITE_URL` once a domain is bought
