"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Lightbox } from "@/components/product/Lightbox";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";

/**
 * Product photos: swipeable large view (scroll-snap) with thumbnails.
 * Clicking the large image opens the zoom lightbox.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActive(clamped);
  };

  // Keep the active index in sync while the user swipes
  const onScroll = () => {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {/* Thumbnails */}
      <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:w-20 lg:shrink-0 lg:flex-col" aria-label="Product photos">
        {images.map((src, i) => (
          <li key={src} className="w-16 shrink-0 lg:w-full">
            <button
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={cx(
                "relative block aspect-3/4 w-full overflow-hidden bg-surface outline-offset-0 transition",
                i === active ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      {/* Large view */}
      <div className="relative flex-1">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex aspect-3/4 snap-x snap-mandatory overflow-x-auto bg-surface sm:mx-0"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setActive(i);
                setZoomOpen(true);
              }}
              className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
              aria-label={`Zoom photo ${i + 1} of ${images.length}`}
            >
              <Image
                src={src}
                alt={`${name}, photo ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollTo(active - 1)}
              disabled={active === 0}
              className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow disabled:opacity-0 lg:grid"
              aria-label="Previous photo"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(active + 1)}
              disabled={active === images.length - 1}
              className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow disabled:opacity-0 lg:grid"
              aria-label="Next photo"
            >
              <ChevronRight />
            </button>
            {/* Dots for phones */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
              {images.map((src, i) => (
                <span key={src} className={cx("h-1.5 rounded-full bg-white shadow transition-all", i === active ? "w-5" : "w-1.5 opacity-60")} />
              ))}
            </div>
          </>
        )}
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
          {active + 1} / {images.length}
        </span>
      </div>

      {zoomOpen && (
        <Lightbox
          images={images}
          alt={name}
          index={active}
          onIndex={(i) => {
            setActive(i);
            trackRef.current?.scrollTo({ left: i * (trackRef.current?.clientWidth ?? 0) });
          }}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
