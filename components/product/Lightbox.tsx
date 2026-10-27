"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, CloseIcon } from "@/components/ui/Icons";

/** Full-screen image viewer with keyboard (←, →, Esc) and swipe support. */
export function Lightbox({
  images,
  alt,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = (i: number) => onIndex((i + count) % count);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previous?.focus(); // return focus to the image that opened the lightbox
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % count);
      if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onIndex, onClose]);

  const btn = "absolute grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt}: photo ${index + 1} of ${count}`}
      className="fixed inset-0 z-[60] animate-fade-in bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div key={index} className="pointer-events-none absolute inset-4 animate-zoom-in sm:inset-16">
        <Image src={images[index]} alt={`${alt}, photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
      </div>
      <button ref={closeRef} type="button" onClick={onClose} className={`${btn} right-4 top-4`} aria-label="Close">
        <CloseIcon />
      </button>
      {count > 1 && (
        <>
          <button type="button" onClick={() => go(index - 1)} className={`${btn} left-3 top-1/2 -translate-y-1/2`} aria-label="Previous photo">
            <ChevronLeft className="size-6" />
          </button>
          <button type="button" onClick={() => go(index + 1)} className={`${btn} right-3 top-1/2 -translate-y-1/2`} aria-label="Next photo">
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
      <p className="absolute inset-x-0 bottom-5 text-center text-sm font-semibold text-white" aria-live="polite">
        {index + 1} / {count}
      </p>
    </div>
  );
}
