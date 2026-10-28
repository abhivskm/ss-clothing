"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { ChevronDown, InstagramIcon, MenuIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";
import { instagramUrl, whatsappLink } from "@/lib/links";
import { site } from "@/lib/site";
import type { Category, CategoryGroup } from "@/types/product";

export type NavCategory = Category & { cover?: string; count: number };

const GROUPS: CategoryGroup[] = ["Topwear", "Bottomwear", "More"];

export function Navbar({ categories, logo }: { categories: NavCategory[]; logo: React.ReactNode }) {
  const [openGroup, setOpenGroup] = useState<CategoryGroup | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mega menu with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenGroup(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inGroup = (g: CategoryGroup) => categories.filter((c) => c.group === g);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur" onMouseLeave={() => setOpenGroup(null)}>
        <div className="relative mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 lg:flex lg:h-[72px] lg:gap-8 lg:px-6">
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid size-10 place-items-center lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>

          {logo}

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden h-full lg:flex">
            <ul className="flex h-full items-stretch">
              {GROUPS.map((g) => (
                <li key={g} className="flex" onMouseEnter={() => setOpenGroup(g)}>
                  <button
                    type="button"
                    aria-expanded={openGroup === g}
                    aria-controls={`mega-${g}`}
                    onClick={() => setOpenGroup(openGroup === g ? null : g)}
                    className={cx(
                      "flex items-center gap-1 border-b-2 px-3.5 text-[13px] font-bold uppercase tracking-wider transition-colors",
                      openGroup === g ? "border-accent text-accent" : "border-transparent hover:text-accent"
                    )}
                  >
                    {g}
                    <ChevronDown className={cx("size-3.5 transition-transform", openGroup === g && "rotate-180")} />
                  </button>
                </li>
              ))}
              {[
                { href: "/collections/all?tag=new", label: "New Arrivals" },
                { href: "/collections/all", label: "Shop All" },
                { href: "/about", label: "Visit Store" },
              ].map((l) => (
                <li key={l.href} className="flex" onMouseEnter={() => setOpenGroup(null)}>
                  <Link
                    href={l.href}
                    className="flex items-center border-b-2 border-transparent px-3.5 text-[13px] font-bold uppercase tracking-wider hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1 lg:ml-auto">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-full hover:bg-surface"
              aria-label="Search products"
            >
              <SearchIcon />
            </button>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden size-10 place-items-center rounded-full hover:bg-surface sm:grid"
              aria-label={`Instagram @${site.instagram}`}
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappLink(`Hi ${site.name}! I want to know about your latest collection.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-10 place-items-center rounded-full bg-whatsapp text-ink hover:brightness-95"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        {/* Mega menu panels */}
        {GROUPS.map((g) => (
          <div
            key={g}
            id={`mega-${g}`}
            hidden={openGroup !== g}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-[0_16px_30px_-12px_rgba(0,0,0,0.15)] lg:block"
          >
            <div className="mx-auto flex max-w-[1600px] animate-fade-in gap-12 px-6 py-8">
              <div className="w-56 shrink-0">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">{g}</p>
                <ul className="space-y-2.5">
                  {inGroup(g).map((c) => (
                    <li key={c.slug}>
                      <Link href={`/collections/${c.slug}`} onClick={() => setOpenGroup(null)} className="text-[15px] hover:text-accent">
                        {c.name} <span className="text-xs text-muted">({c.count})</span>
                      </Link>
                    </li>
                  ))}
                  <li className="pt-2">
                    <Link href="/collections/all" onClick={() => setOpenGroup(null)} className="text-sm font-bold underline underline-offset-4">
                      Shop all
                    </Link>
                  </li>
                </ul>
              </div>
              <ul className="grid flex-1 grid-cols-5 gap-4">
                {inGroup(g)
                  .filter((c) => c.cover)
                  .slice(0, 5)
                  .map((c) => (
                    <li key={c.slug}>
                      <Link href={`/collections/${c.slug}`} onClick={() => setOpenGroup(null)} className="group block">
                        <div className="relative aspect-3/4 overflow-hidden bg-surface">
                          <Image src={c.cover!} alt="" fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <p className="mt-2 text-xs font-bold uppercase tracking-wider">{c.name}</p>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))}

      </header>

      {/* Outside <header>: its backdrop-blur would trap these fixed overlays inside the 64px bar */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} groups={GROUPS} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
