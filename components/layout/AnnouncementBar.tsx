import { site } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:text-xs">
      {site.announcement.map((text, i) => (
        <span key={text} className={i > 0 ? "hidden sm:inline" : undefined}>
          {i > 0 && <span className="mx-3 text-white/40" aria-hidden>|</span>}
          {text}
        </span>
      ))}
    </div>
  );
}
