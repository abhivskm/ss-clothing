import { site } from "@/lib/site";

/** Opens a WhatsApp chat with the store, optionally with a pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const instagramUrl = `https://instagram.com/${site.instagram}`;

/** Opens a DM thread with the store on Instagram (falls back to the profile on web). */
export const instagramDmUrl = `https://ig.me/m/${site.instagram}`;

export const phoneUrl = `tel:+91${site.phone}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;

/** The message sent when a customer taps "Enquire on WhatsApp" on a product. */
export function productEnquiryMessage(opts: { name: string; price: string; size?: string; color?: string; url: string }) {
  return [
    `Hi ${site.name}! I'm interested in this product:`,
    `*${opts.name}* (${opts.price})`,
    `Size: ${opts.size ?? "Not selected yet"}`,
    opts.color ? `Colour: ${opts.color}` : "",
    "Is it available?",
    opts.url,
  ]
    .filter(Boolean)
    .join("\n");
}
