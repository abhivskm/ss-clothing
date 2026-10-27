import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/Icons";
import { instagramUrl } from "@/lib/links";
import { site } from "@/lib/site";

/**
 * Instagram call-to-action with placeholder tiles (no Instagram API).
 * The tiles use product photos; swap `images` for real post screenshots if you like.
 */
export function InstagramSection({ images }: { images: string[] }) {
  return (
    <section aria-labelledby="insta-heading" className="py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Follow the drops</p>
          <h2 id="insta-heading" className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Find us on Instagram
          </h2>
          <p className="mt-3 max-w-sm text-muted">
            New arrivals land on our Instagram first. Follow us for fits, restocks and store updates.
          </p>
          <ButtonLink href={instagramUrl} external variant="dark" className="mt-6">
            <InstagramIcon /> Follow on Instagram
          </ButtonLink>
        </div>
        <ul className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {images.slice(0, 6).map((src) => (
            <li key={src}>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View @${site.instagram} on Instagram`}
                className="group relative block aspect-square overflow-hidden bg-surface"
              >
                <Image src={src} alt="" fill sizes="(max-width: 1024px) 33vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <InstagramIcon className="size-7" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
