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

### Analytics

**Analytics** in the admin shows real visits to the website (nothing is estimated or sample data):

| Item | Meaning |
|---|---|
| **Live visitors** | People with the website open on screen in the last 5 minutes. Updates every 5 seconds. |
| **Total visits** | Visits in the chosen period. A visit ends after 30 minutes without activity. |
| **Unique visitors** | Different browsers/phones. "New" = first seen in this period, the rest are returning. |
| **WhatsApp / Call clicks** | Taps on any WhatsApp button or phone link. |
| **Enquiries** | Stays 0 until an enquiry form is added to the website (see Architecture → Analytics). |
| **Product analytics** | Views, visits that saw the product ("Seen by"), WhatsApp taps on that product's button, and conversion. |

**Conversion** = visits that viewed the product *and* tapped its WhatsApp button ÷ visits that viewed the product.
Several views or taps in the same visit count once.

Use **Today / Last 7 days / Last 30 days / Custom** to change the period. "Today" shows visits per hour.
Your own visits are not counted while you are logged in to the admin on that browser.

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
    (panel)/analytics/      Analytics dashboard
  api/admin/upload/         Photo upload to Vercel Blob
  api/admin/analytics/      Dashboard report + live data (admin only)
  api/track/                Receives page views, clicks and heartbeats from the website
  not-found.tsx, sitemap.ts, robots.ts
components/
  layout/                   Announcement bar, navbar + mega menu, mobile menu, search, footer
  home/, product/, collection/, ui/   Shop components
  admin/                    Admin nav, login form, product form, photo manager, analytics/ dashboard
  analytics/Tracker.tsx     Visit and click tracking on the public website
lib/
  products.ts               SHOP DATA LAYER: cached reads for the public site (active products only)
  admin-products.ts         ADMIN DATA LAYER: all products, writes, photo deletion
  db.ts                     Neon connection + row → type mapping
  auth.ts                   Admin password check and signed session cookie
  analytics.ts              Analytics: validation, recording, reports and live data
  site.ts                   Store settings: phone, WhatsApp, Instagram, address, hours
  links.ts, format.ts, search.ts
types/product.ts            Product, Category and Banner types
types/analytics.ts          Analytics event and report types
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

### Analytics

- **Browser** (`components/analytics/Tracker.tsx`, mounted in the shop layout only): keeps a random visitor ID and
  a visit ID (30-minute inactivity timeout, shared by all tabs) in `localStorage`. It sends a page view on every route
  change, a product view on `/product/<slug>`, and WhatsApp / call / Instagram link taps caught anywhere on the page.
  Taps inside an element with `data-product="<slug>"` (the product page's enquiry buttons) are credited to that product.
  Visible tabs send a heartbeat every 30 s. Events are batched, sent with `sendBeacon` when the page closes, and retried
  after network errors. Nothing is sent when the browser has Global Privacy Control or Do Not Track switched on.
- **Server** (`app/api/track` → `lib/analytics.ts`): only accepts same-origin requests, validates every field, limits
  requests per IP (in memory, best effort), ignores bots and logged-in admins, and writes everything in one transaction.
  Timestamps come from the database clock. Each event has a browser-made ID with a unique index, so a retried request is
  never counted twice; double taps within 2 s are ignored in the browser. Enquiries cannot be sent from the browser.
- **Stored data** (tables `analytics_visitors`, `analytics_sessions`, `analytics_events` in `scripts/schema.sql`):
  random IDs, page path (no query string), product, referring website (host only), traffic source, device type,
  browser and OS name, and country (from Vercel). No IP addresses, user-agent strings, names or phone numbers.
- **Dashboard**: all numbers are calculated in Postgres, grouped into days in `ANALYTICS_TIMEZONE` (default
  `Asia/Kolkata`). The page polls `/api/admin/analytics/live` every 5 s (paused while the tab is hidden) and refreshes
  the report every minute when the period includes today. Both APIs return 401 without the admin login.
  A live visitor is one whose visit had a heartbeat within `ANALYTICS_ACTIVE_MINUTES` (default 5); closed or
  background tabs drop out after that.
- **Enquiries**: when an enquiry form is added, call `recordEnquiry()` from `lib/analytics.ts` in its Server Action
  *after* the enquiry is saved. The Enquiries card and product column then count it.

## Placeholders to replace before launch

- [ ] Product photos and details: replace the demo products in the admin
- [ ] Banner photos and text (`public/images/banners/`, `data/banners.ts`)
- [ ] Store hours (`lib/site.ts`)
- [ ] About page story (`app/(shop)/about/page.tsx`)
- [ ] `NEXT_PUBLIC_SITE_URL` once a domain is bought
