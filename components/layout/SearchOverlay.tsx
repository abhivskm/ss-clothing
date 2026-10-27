"use client";

import Form from "next/form";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";

const POPULAR = ["Oversized tee", "Baggy jeans", "Cargo", "Linen shirt", "Hoodie", "Co-ord"];

/** Search panel. Submitting goes to /collections/all?q=... where results are filtered. */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <div className="relative animate-fade-in bg-white px-4 pb-8 pt-5 shadow-xl sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Form action="/collections/all" onSubmit={onClose} className="flex items-center gap-3 border-b-2 border-ink pb-3">
            <SearchIcon className="size-6 shrink-0" />
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="site-search"
              name="q"
              type="search"
              placeholder="Search shirts, jeans, oversized…"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
            />
            <button type="button" onClick={onClose} className="grid size-10 place-items-center" aria-label="Close search">
              <CloseIcon />
            </button>
          </Form>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted">Popular searches</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR.map((term) => (
              <li key={term}>
                <Link
                  href={`/collections/all?q=${encodeURIComponent(term)}`}
                  onClick={onClose}
                  className="inline-block rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
