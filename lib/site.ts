/**
 * Store settings. Edit contact details, hours and links here; every page reads from this file.
 */

/** Public URL of the site. Set NEXT_PUBLIC_SITE_URL once you buy a domain. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const site = {
  name: "SS Clothing",
  fullName: "Shree Shyam Garments",
  tagline: "Gen Z men's wear in Bhopal",
  description:
    "SS Clothing (Shree Shyam Garments) brings new and trending men's wear to Karond Square, Bhopal. Oversized tees, shirts, baggy jeans, cargos, hoodies, co-ords and more. Enquire on WhatsApp.",
  phone: "9754883325",
  /** Country code + number, digits only. Used for wa.me links. */
  whatsapp: "919754883325",
  instagram: "ss_clothing2k25",
  address: {
    line1: "In front of Bandhan Shadi Hall",
    line2: "Karond Square",
    city: "Bhopal",
    state: "Madhya Pradesh",
    country: "IN",
  },
  mapQuery: "Bandhan Shadi Hall, Karond Square, Bhopal",
  /**
   * PLACEHOLDER: add real opening hours, e.g. [{ days: "Mon – Sun", time: "10:30 AM – 9:30 PM" }].
   * While empty, pages show "Call or WhatsApp us for store timings".
   */
  hours: [] as { days: string; time: string }[],
  announcement: ["New drops every week", "Visit us at Karond Square, Bhopal"],
} as const;

export const fullAddress = `${site.address.line1}, ${site.address.line2}, ${site.address.city}`;
