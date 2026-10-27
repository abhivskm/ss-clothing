"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

/** Horizontal, swipeable list with prev/next arrows on desktop. */
export function RowScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: "smooth" });

  const arrow =
    "absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md transition hover:bg-ink hover:text-white lg:grid";

  return (
    <div className="relative">
      <button type="button" onClick={() => scroll(-1)} className={`${arrow} -left-4`} aria-label={`Scroll ${label} left`}>
        <ChevronLeft />
      </button>
      <ul ref={ref} aria-label={label} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-5 lg:scroll-px-0 lg:px-0">
        {children}
      </ul>
      <button type="button" onClick={() => scroll(1)} className={`${arrow} -right-4`} aria-label={`Scroll ${label} right`}>
        <ChevronRight />
      </button>
    </div>
  );
}
