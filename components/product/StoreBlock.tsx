import { ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { instagramUrl, mapsUrl, phoneUrl, whatsappLink } from "@/lib/links";
import { fullAddress, site } from "@/lib/site";

const iconLink = "grid size-10 place-items-center rounded-full border border-line bg-white hover:border-ink";

/** "Visit our store" box shown on product pages. */
export function StoreBlock() {
  return (
    <section aria-labelledby="store-heading" className="bg-surface p-5">
      <h2 id="store-heading" className="text-xs font-bold uppercase tracking-widest">
        Visit our store
      </h2>
      <p className="mt-1 text-sm text-muted">Try it on before you buy.</p>
      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex gap-3">
          <MapPinIcon className="mt-0.5 size-5 shrink-0 text-accent" />
          <span>
            {fullAddress}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold text-accent underline underline-offset-2">
              Open in Google Maps
            </a>
          </span>
        </li>
        <li className="flex gap-3">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-accent" />
          <span>{site.hours.length ? site.hours.map((h) => `${h.days}: ${h.time}`).join(" · ") : "Call or WhatsApp us for store timings"}</span>
        </li>
      </ul>
      <div className="mt-4 flex gap-2">
        <a href={phoneUrl} aria-label="Call the store" className={iconLink}>
          <PhoneIcon />
        </a>
        <a href={whatsappLink(`Hi ${site.name}!`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={iconLink}>
          <WhatsAppIcon />
        </a>
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={iconLink}>
          <InstagramIcon />
        </a>
      </div>
    </section>
  );
}
