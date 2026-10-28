# SS Clothing: Shree Shyam Garments

Product showcase website for **SS Clothing**, a men's wear store at Karond Square, Bhopal.
Customers browse products and enquire on **WhatsApp** or **Instagram DM**. There is no cart, no payment and no customer login.
The shop owner manages products, photos and categories in the **admin portal** at `/admin`.

Built with Next.js 16 (App Router), TypeScript and Tailwind CSS 4, on Vercel with a Neon Postgres database and Vercel Blob for photos.

- Live site: https://ss-clothing.vercel.app
- Admin: https://ss-clothing.vercel.app/admin

---

## Admin portal (for the shop owner)

Log in at **`/admin`** with the admin password. You stay logged in for 7 days on that device.

| Task | How |
|---|---|
| **Add a product** | Products → **Add product**. Fill in the name, category, price, sizes, then **Add photos**. Click **Add product**. |
| **Edit a product** | Click the product name or **Edit**, change anything, **Save changes**. |
| **Hide / show a product** | Use the **Active** switch in the products list. Inactive products disappear from the website but stay in the admin. |
| **Mark sold out** | Edit the product and untick **In stock**. It stays on the site with a "Sold out" label. |
| **Delete a product** | Edit the product → **Delete product** at the bottom. This also deletes its photos and cannot be undone. |
| **Photos** | **Add photos** accepts several at once (from phone or computer). The first photo is the main one; drag or use the arrows to reorder; ✕ removes a photo. Portrait (3:4) photos look best. |
| **Homepage rows** | Tick **New arrival** or **Trending** on a product to show it in those homepage rows. |
| **Categories** | Categories → add, rename, change menu group (Topwear / Bottomwear / More) or order. A category can only be deleted when it has no products. Categories without active products are hidden from the menu. |

Changes appear on the website immediately. No redeploy is needed.

---

## Setup and run (developers)

Requires Node.js 20 or newer and the Vercel CLI (`npm i -g vercel`).

```bash
npm install
vercel link             # once: connect this folder to the ss-clothing Vercel project
vercel env pull .env.local   # download database, Blob and admin settings
npm run dev             # http://localhost:3000
npm run build           # production build (also type-checks)
npm run lint
npm run db:setup        # create the database tables (safe to re-run)
```

`.env.local` holds secrets and is ignored by git. See `.env.example` for the list of settings.

## Folder structure

```
app/
  layout.tsx                Root layout (fonts, SEO defaults), shared by shop and admin
  (shop)/                   Public website: layout with navbar/footer, home, collections, product, about
  admin/                    Admin portal
    login/                  Password page
    (panel)/                Products list, product add/edit, categories
    actions.ts              Server Actions: login, save/delete products and categories
  api/admin/upload/         Photo upload to Vercel Blob
  not-found.tsx, sitemap.ts, robots.ts
components/
  layout/                   Announcement bar, navbar + mega menu, mobile menu, search, footer
  home/, product/, collection/, ui/   Shop components
  admin/                    Admin nav, login form, product form, photo manager
lib/
  products.ts               SHOP DATA LAYER: cached reads for the public site (active products only)
  admin-products.ts         ADMIN DATA LAYER: all products, writes, photo deletion
  db.ts                     Neon connection + row → type mapping
  auth.ts                   Admin password check and signed session cookie
  site.ts                   Store settings: phone, WhatsApp, Instagram, address, hours
  links.ts, format.ts, search.ts
types/product.ts            Product, Category and Banner types
data/banners.ts             Homepage hero slides (still edited in code)
scripts/schema.sql          Database tables
public/images/banners/      Hero slide photos
```

## Everyday edits in code

| What | Where |
|---|---|
| Phone, WhatsApp, Instagram, address | `lib/site.ts` |
| **Store hours** (currently a placeholder) | `lib/site.ts`, set `hours: [{ days: "Mon – Sun", time: "10:30 AM – 9:30 PM" }]` |
| Announcement bar text | `lib/site.ts`, `announcement` |
| Hero banner slides | `data/banners.ts` + images in `public/images/banners/` (1920×1000) |
| About page story | `app/(shop)/about/page.tsx` (marked PLACEHOLDER) |
| Colours and font | `app/globals.css` (`@theme` block) |
| Logo | `public/logo.png` |
| Change the admin password | Vercel → Project → Settings → Environment Variables → `ADMIN_PASSWORD`, then redeploy |

## Deploying

Pushing to the `main` branch on GitHub deploys automatically to Vercel.

After buying a domain, add it in Vercel → Domains and set the environment variable
`NEXT_PUBLIC_SITE_URL=https://www.your-domain.com`, then redeploy.

---

## Architecture

### Data

- **Neon Postgres** (added through the Vercel Marketplace) stores `categories` and `products`
  (see `scripts/schema.sql`). Sizes, colours, photos and tags are `jsonb` arrays.
- **Vercel Blob** (public store, Mumbai region) stores product photos. The database keeps their URLs.
- All Neon and Blob settings come from environment variables that Vercel manages.

### Two data layers

- **`lib/products.ts`** is the only code the public site uses. It loads the whole catalogue in one
  cached function (`"use cache"` + `cacheTag("catalog")` + `cacheLife("hours")`) and filters in memory,
  so shop pages are prerendered and fast. It never returns inactive products.
- **`lib/admin-products.ts`** is used only by the admin. It reads everything (including inactive products),
  writes to the database, and deletes photos from Blob when they are removed from a product.
- No page or component queries the database directly, and Client Components never import either file.

### How an admin change reaches the site

1. A form in `/admin` calls a Server Action in `app/admin/actions.ts`.
2. The action checks the login (`requireAdmin()`), validates the input on the server, and writes through `lib/admin-products.ts`.
3. It calls `updateTag("catalog")`, which expires the shop cache. The next visitor gets fresh pages.
   New product pages render on their first visit and are cached after that.

### Login and security

- One password (`ADMIN_PASSWORD`). After login, an `httpOnly` cookie holds an expiry time signed with
  `SESSION_SECRET` (HMAC-SHA256), valid for 7 days.
- Every admin page, every Server Action and the upload route check the cookie on the server.
  Wrong passwords are slowed down to make guessing harder.
- `/admin` is excluded in `robots.ts` and marked `noindex`.

### Photo uploads

The browser shrinks each photo (max 1600px, JPEG) before uploading it to `/api/admin/upload`, which stores it in
Blob with a random file name. This keeps uploads small (Vercel limits requests to 4.5 MB) and the site fast.
Photos uploaded in a form that is then closed without saving stay in Blob unused. They only cost storage
and can be removed from the Blob dashboard.

## Placeholders to replace before launch

- [ ] Product photos and details: replace the demo products in the admin
- [ ] Banner photos and text (`public/images/banners/`, `data/banners.ts`)
- [ ] Store hours (`lib/site.ts`)
- [ ] About page story (`app/(shop)/about/page.tsx`)
- [ ] `NEXT_PUBLIC_SITE_URL` once a domain is bought
