import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { instagramUrl, mapsEmbedUrl, mapsUrl, phoneUrl, whatsappLink } from "@/lib/links";
import { fullAddress, site, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & Visit Us",
  description: `The story of ${site.name} (${site.fullName}) and how to find our store at Karond Square, Bhopal.`,
  alternates: { canonical: "/about" },
};

// Local business structured data for Google Maps / search
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: site.name,
  alternateName: site.fullName,
  url: siteUrl,
  telephone: `+91${site.phone}`,
  image: `${siteUrl}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    addressCountry: site.address.country,
  },
  sameAs: [instagramUrl],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Story */}
      <section className="border-b border-line bg-surface">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our story</p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
              Bhopal&apos;s spot for fresh fits
            </h1>
            {/* PLACEHOLDER story: edit to match the real history of the store */}
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-neutral-700">
              <p>
                {site.name} is the street-style side of <strong>{site.fullName}</strong>, a men&apos;s wear store at Karond Square, Bhopal. We
                started in 2025 with one goal: bring the fits Gen Z actually wants to wear, without big-city prices.
              </p>
              <p>
                From oversized tees and Cuban shirts to baggy denim, cargos, co-ords and accessories, we stock men&apos;s wear from A to Z,
                with new drops every week.
              </p>
              <p>Walk in to try things on, or message us on WhatsApp and we&apos;ll check your size before you visit.</p>
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden bg-white">
            <Image
              src="/images/banners/hero-oversized.jpg"
              alt="Customer wearing an oversized tee from SS Clothing"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Visit us */}
      <section aria-labelledby="visit-heading">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="visit-heading" className="text-2xl font-extrabold uppercase tracking-tight">
              Visit the store
            </h2>
            <ul className="mt-6 space-y-5">
              <li className="flex gap-4">
                <MapPinIcon className="mt-0.5 size-6 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Address</p>
                  <p className="mt-1">{fullAddress}, {site.address.state}</p>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-accent underline underline-offset-2">
                    Get directions on Google Maps
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <ClockIcon className="mt-0.5 size-6 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Store hours</p>
                  {site.hours.length ? (
                    <ul className="mt-1">
                      {site.hours.map((h) => (
                        <li key={h.days}>
                          {h.days}: {h.time}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1">Call or WhatsApp us for store timings</p>
                  )}
                </div>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={whatsappLink(`Hi ${site.name}! I'd like to visit the store.`)} external variant="whatsapp">
                <WhatsAppIcon /> WhatsApp us
              </ButtonLink>
              <ButtonLink href={instagramUrl} external variant="outline" label="Instagram">
                <InstagramIcon />
              </ButtonLink>
              <a href={phoneUrl} aria-label="Call the store" className={buttonClass("outline")}>
                <PhoneIcon />
              </a>
            </div>
          </div>
          <div className="min-h-80 overflow-hidden border border-line bg-surface">
            <iframe
              src={mapsEmbedUrl}
              title={`Map showing ${site.name} at ${fullAddress}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-80 w-full"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
