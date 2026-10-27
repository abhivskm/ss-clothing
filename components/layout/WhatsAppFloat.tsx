import { WhatsAppIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/links";
import { site } from "@/lib/site";

/** Floating WhatsApp button, always visible in the bottom-right corner. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(`Hi ${site.name}! I have a question.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-ink shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
