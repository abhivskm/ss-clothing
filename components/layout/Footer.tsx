import Image from "next/image";
import Link from "next/link";
import { ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { instagramUrl, mapsUrl, phoneUrl, whatsappLink } from "@/lib/links";
import { fullAddress, site } from "@/lib/site";
import type { Category } from "@/types/product";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-6">
        <div>
          <Image src="/logo.png" alt={`${site.name} logo`} width={190} height={185} className="h-16 w-auto invert" />
          <p className="mt-4 max-w-xs text-sm text-neutral-300">
            {site.fullName}: new and trending men&apos;s wear in Bhopal. Fresh drops every week.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-neutral-600 hover:border-white">
              <InstagramIcon />
            </a>
            <a href={whatsappLink(`Hi ${site.name}!`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full border border-neutral-600 hover:border-white">
              <WhatsAppIcon />
            </a>
            <a href={phoneUrl} aria-label="Call the store" className="grid size-10 place-items-center rounded-full border border-neutral-600 hover:border-white">
              <PhoneIcon />
            </a>
          </div>
        </div>

        <nav aria-label="Shop categories">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Shop</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-200 sm:grid-cols-1">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="hover:text-white hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Quick links">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Quick links</h2>
          <ul className="space-y-2 text-sm text-neutral-200">
            <li><Link href="/collections/all?tag=new" className="hover:text-white hover:underline">New Arrivals</Link></li>
            <li><Link href="/collections/all?tag=trending" className="hover:text-white hover:underline">Trending</Link></li>
            <li><Link href="/collections/all" className="hover:text-white hover:underline">Shop All</Link></li>
            <li><Link href="/about" className="hover:text-white hover:underline">About &amp; Visit Us</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Visit us</h2>
          <ul className="space-y-3 text-sm text-neutral-200">
            <li className="flex gap-3">
              <MapPinIcon className="mt-0.5 size-5 shrink-0" />
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                {fullAddress}
              </a>
            </li>
            <li className="flex gap-3">
              <ClockIcon className="mt-0.5 size-5 shrink-0" />
              <span>
                {site.hours.length
                  ? site.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")
                  : "Call or WhatsApp us for store timings"}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 px-4 py-5 text-center text-xs text-neutral-400">
        © {site.fullName} · {site.name}. Since 2025.
      </div>
    </footer>
  );
}
