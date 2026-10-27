import Image from "next/image";
import Link from "next/link";
import type { NavCategory } from "@/components/layout/Navbar";

/** Image tiles linking to each category collection. */
export function CategoryTiles({ categories }: { categories: NavCategory[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      {categories
        .filter((c) => c.cover)
        .map((c) => (
          <li key={c.slug}>
            <Link href={`/collections/${c.slug}`} className="group relative block aspect-4/5 overflow-hidden bg-surface">
              <Image
                src={c.cover!}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-white">
                <span className="block text-sm font-extrabold uppercase tracking-wider">{c.name}</span>
                <span className="text-xs text-white/80">
                  {c.count} style{c.count === 1 ? "" : "s"}
                </span>
              </span>
            </Link>
          </li>
        ))}
    </ul>
  );
}
