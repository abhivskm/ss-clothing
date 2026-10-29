"use client";

import { useEffect, useState } from "react";
import { EyeIcon, InstagramIcon, MailIcon, PhoneIcon, ShirtIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";
import { EVENT_LABELS, type AnalyticsEventType, type LiveData, type LiveEvent } from "@/types/analytics";

const ICONS: Record<AnalyticsEventType, React.ReactNode> = {
  page_view: <EyeIcon className="size-4" />,
  product_view: <ShirtIcon className="size-4" />,
  whatsapp_click: <WhatsAppIcon className="size-4" />,
  call_click: <PhoneIcon className="size-4" />,
  instagram_click: <InstagramIcon className="size-4" />,
  enquiry: <MailIcon className="size-4" />,
};

const HIGHLIGHT: Partial<Record<AnalyticsEventType, string>> = {
  whatsapp_click: "bg-green-50 text-green-800",
  call_click: "bg-accent/10 text-accent-dark",
  enquiry: "bg-amber-50 text-amber-800",
};

function ago(iso: string, now: number) {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86_400)} d ago`;
}

/** Wall-clock "now", ticking every few seconds. Null until mounted, so server and browser render the same. */
function useNow(ms = 5_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const first = setTimeout(update, 0);
    const timer = setInterval(update, ms);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [ms]);
  return now;
}

function describe(e: LiveEvent) {
  if (e.productName) return e.productName;
  if (e.type === "product_view") return "Removed product";
  return e.path === "/" ? "Home page" : e.path;
}

export function LiveActivity({ events, timeZone, paused }: { events: LiveEvent[]; timeZone: string; paused: boolean }) {
  const now = useNow();

  return (
    <section className="flex max-h-[360px] flex-col border border-line bg-white lg:max-h-none" aria-labelledby="activity-heading">
      <div className="flex items-center justify-between gap-2 p-4 pb-2">
        <h2 id="activity-heading" className="text-xs font-bold uppercase tracking-widest text-muted">
          Live activity
        </h2>
        <span className={cx("flex items-center gap-1.5 text-xs font-semibold", paused ? "text-red-700" : "text-green-700")}>
          <span className={cx("size-2 rounded-full", paused ? "bg-red-600" : "bg-green-600")} aria-hidden />
          {paused ? "Paused" : "Updating"}
        </span>
      </div>
      {events.length ? (
        <ol className="min-h-0 flex-1 divide-y divide-line overflow-y-auto lg:max-h-[262px]" aria-live="polite" aria-relevant="additions">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
              <span className={cx("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full", HIGHLIGHT[e.type] ?? "bg-surface text-muted")}>{ICONS[e.type]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate">
                  <span className="font-semibold">{EVENT_LABELS[e.type]}</span> <span className="text-muted">·</span> {describe(e)}
                </p>
                <p className="text-xs text-muted">
                  <time dateTime={e.at} title={new Date(e.at).toLocaleString("en-IN", { timeZone })}>
                    {now ? ago(e.at, now) : new Date(e.at).toLocaleTimeString("en-IN", { timeZone, hour: "2-digit", minute: "2-digit" })}
                  </time>
                  {e.visitor && <> · Visitor #{e.visitor}</>}
                  {e.device && <span className="capitalize"> · {e.device}</span>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 pb-6 pt-2 text-sm text-muted">No activity recorded yet. Visits to the website will show here within seconds.</p>
      )}
    </section>
  );
}

export function NowViewing({ pages, liveVisitors }: { pages: LiveData["pages"]; liveVisitors: number }) {
  return (
    <section className="border border-line bg-white p-4" aria-labelledby="now-heading">
      <h2 id="now-heading" className="text-xs font-bold uppercase tracking-widest text-muted">
        Live visitors are on
      </h2>
      {liveVisitors && pages.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {pages.map((p) => (
            <li key={p.path} className="flex justify-between gap-2">
              <span className="truncate font-semibold">{p.path === "/" ? "Home page" : p.path}</span>
              <span className="shrink-0 tabular-nums text-muted">{p.visitors}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Nobody is on the website right now.</p>
      )}
    </section>
  );
}
