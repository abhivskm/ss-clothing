"use client";

import { buttonClass } from "@/components/ui/Button";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { instagramDmUrl, productEnquiryMessage, whatsappLink } from "@/lib/links";

/**
 * "Enquire on WhatsApp" + "DM on Instagram".
 * The WhatsApp message includes the product, selected size/colour and the page URL.
 * data-product credits taps to this product in the analytics (components/analytics/Tracker.tsx).
 */
export function EnquiryButtons({
  slug,
  name,
  price,
  size,
  color,
  fallbackUrl,
}: {
  slug: string;
  name: string;
  price: string;
  size?: string;
  color?: string;
  /** Used for the initial link; replaced by the real page URL when clicked */
  fallbackUrl: string;
}) {
  const href = (url: string) => whatsappLink(productEnquiryMessage({ name, price, size, color, url }));

  return (
    <div data-product={slug} className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
      <a
        href={href(fallbackUrl)}
        onClick={(e) => (e.currentTarget.href = href(window.location.href))}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass("whatsapp", "w-full py-4")}
      >
        <WhatsAppIcon /> Enquire on WhatsApp
      </a>
      <a href={instagramDmUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "w-full py-4")}>
        <InstagramIcon /> DM on Instagram
      </a>
    </div>
  );
}
