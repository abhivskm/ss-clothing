"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";
import type { Banner } from "@/types/product";

const INTERVAL = 6000;

/** Full-width hero with 1-3 slides. Auto-advances, pauses on hover/focus, swipeable on touch. */
export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = banners.length;

  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, count, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-[72svh] max-h-[680px] min-h-[440px] overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i !== index}
          inert={i !== index}
          className={cx("absolute inset-0 transition-opacity duration-700", i === index ? "opacity-100" : "opacity-0")}
        >
          <Image
            src={b.image}
            alt={b.imageAlt}
            fill
            sizes="100vw"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            className="object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent sm:bg-linear-to-r sm:from-black/70 sm:via-black/30" />
          <div className="relative flex h-full flex-col justify-end px-5 pb-16 sm:justify-center sm:px-10 sm:pb-0 lg:px-14">
            <div className={cx("max-w-xl", i === index && "animate-fade-up")}>
              <p className="mb-3 inline-block border border-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">{b.eyebrow}</p>
              {i === 0 ? (
                <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">{b.title}</h1>
              ) : (
                <h2 className="text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">{b.title}</h2>
              )}
              <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">{b.text}</p>
              <Link
                href={b.cta.href}
                className="mt-7 inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-accent hover:text-white"
              >
                {b.cta.label} <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {count > 1 && (
        <div className="absolute bottom-5 right-4 flex items-center gap-3 sm:right-6 lg:right-8">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid size-10 place-items-center rounded-full border border-white/60 hover:bg-white hover:text-ink">
            <ChevronLeft />
          </button>
          <div className="flex gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cx("h-1.5 rounded-full bg-white transition-all", i === index ? "w-7" : "w-1.5 opacity-50")}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid size-10 place-items-center rounded-full border border-white/60 hover:bg-white hover:text-ink">
            <ChevronRight />
          </button>
        </div>
      )}
    </section>
  );
}
