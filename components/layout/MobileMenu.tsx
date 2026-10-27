"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { NavCategory } from "@/components/layout/Navbar";
import { CloseIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";
import { instagramUrl, whatsappLink } from "@/lib/links";
import { site } from "@/lib/site";
import type { CategoryGroup } from "@/types/product";

/** Slide-in navigation drawer for phones. */
export function MobileMenu({
  open,
  onClose,
  categories,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
  groups: CategoryGroup[];
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll, move focus into the drawer and close on Escape
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const linkClass = "flex items-center justify-between border-b border-line px-5 py-4 text-sm font-bold uppercase tracking-wider";

  return (
    <div className={cx("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div className={cx("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <nav
        aria-label="Mobile"
        inert={!open}
        className={cx(
          "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="text-sm font-extrabold uppercase tracking-widest">Menu</span>
          <button ref={closeRef} type="button" onClick={onClose} className="grid size-10 place-items-center" aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <Link href="/collections/all?tag=new" onClick={onClose} className={linkClass}>
          New Arrivals
        </Link>
        {groups.map((g) => (
          <details key={g} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold uppercase tracking-wider [&::-webkit-details-marker]:hidden">
              {g}
              <span className="text-xl leading-none transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <ul className="bg-surface pb-2">
              {categories
                .filter((c) => c.group === g)
                .map((c) => (
                  <li key={c.slug}>
                    <Link href={`/collections/${c.slug}`} onClick={onClose} className="block px-8 py-2.5 text-[15px]">
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </details>
        ))}
        <Link href="/collections/all" onClick={onClose} className={linkClass}>
          Shop All
        </Link>
        <Link href="/about" onClick={onClose} className={linkClass}>
          About &amp; Visit Store
        </Link>

        <div className="mt-auto space-y-3 bg-surface p-5">
          <a
            href={whatsappLink(`Hi ${site.name}!`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-whatsapp py-3 text-sm font-bold uppercase tracking-wider text-ink"
          >
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex items-center justify-center gap-2 border border-ink py-3 text-sm font-bold"
          >
            <InstagramIcon />
          </a>
        </div>
      </nav>
    </div>
  );
}
