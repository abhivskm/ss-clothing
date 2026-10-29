"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { cx } from "@/lib/cx";

const LINKS = [
  { href: "/admin", label: "Products", match: (p: string) => p === "/admin" || p.startsWith("/admin/products") },
  { href: "/admin/categories", label: "Categories", match: (p: string) => p.startsWith("/admin/categories") },
  { href: "/admin/analytics", label: "Analytics", match: (p: string) => p.startsWith("/admin/analytics") },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-6 sm:px-4">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="" width={190} height={185} className="h-7 w-auto sm:h-8" />
          <span className="hidden text-sm font-extrabold uppercase tracking-wider sm:inline">Admin</span>
        </Link>
        <nav aria-label="Admin" className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.match(pathname) ? "page" : undefined}
              className={cx(
                "shrink-0 px-1 py-2 text-[13px] font-bold sm:px-3 sm:text-sm",
                l.match(pathname) ? "bg-ink text-white" : "text-muted hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3 text-sm">
          <Link href="/" target="_blank" className="hidden font-semibold text-muted hover:text-ink sm:inline">
            View site ↗
          </Link>
          <form action={logout}>
            <button className="border border-line bg-white px-2 py-1.5 text-[13px] font-semibold hover:border-ink sm:px-3 sm:text-sm">Log out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
