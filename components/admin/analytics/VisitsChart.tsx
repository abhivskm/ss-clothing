"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import type { VisitsPoint } from "@/types/analytics";

const HEIGHT = 240;
const M = { top: 20, right: 8, bottom: 26, left: 34 };
const ACCENT = "#2b4bff";
const ACCENT_DARK = "#1d35d6";
const GRID = "#e6e6e6";

const fmt = (n: number) => n.toLocaleString("en-IN");

/** Round axis ticks: 0 and three or four steps of 1, 2 or 5 × 10ⁿ. */
function niceTicks(max: number) {
  if (max <= 4) return [0, 1, 2, 3, 4];
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

const compact = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(n));

/** Column with a 4px rounded top, square on the baseline. */
function columnPath(x: number, y: number, w: number, base: number) {
  const r = Math.min(4, w / 2, base - y);
  return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${base}Z`;
}

function longLabel(p: VisitsPoint, hourly: boolean) {
  if (hourly) {
    const h = Number(p.label.slice(0, 2));
    return `${p.label} – ${String((h + 1) % 24).padStart(2, "0")}:00`;
  }
  return new Date(`${p.date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

/** Visits per day (or per hour for a single day), with tooltips, keyboard support and a table view. */
export function VisitsChart({ points, hourly, className }: { points: VisitsPoint[]; hourly: boolean; className?: string }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [view]);

  const total = points.reduce((sum, p) => sum + p.visits, 0);
  const max = Math.max(0, ...points.map((p) => p.visits));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = HEIGHT - M.top - M.bottom;
  const band = points.length ? plotW / points.length : 0;
  const barW = Math.max(2, Math.min(24, band - 2));
  const y = (v: number) => M.top + plotH - (v / top) * plotH;
  const labelEvery = Math.max(1, Math.ceil((hourly ? 40 : 46) / Math.max(band, 1)));
  const peak = max > 0 ? points.findIndex((p) => p.visits === max) : -1;
  const shown = active !== null ? points[active] : null;

  const title = hourly ? "Visits per hour" : "Visits per day";

  return (
    <section className={cx("border border-line bg-white p-4", className)} aria-labelledby="visits-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="visits-heading" className="text-xs font-bold uppercase tracking-widest text-muted">
            {title}
          </h2>
          <p className="mt-0.5 text-sm">
            <span className="font-bold">{fmt(total)}</span> <span className="text-muted">visits in this period</span>
          </p>
        </div>
        <div className="flex border border-line text-xs font-bold" role="group" aria-label="Show as">
          {(["chart", "table"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cx("px-3 py-1.5 capitalize", view === v ? "bg-ink text-white" : "text-muted hover:text-ink")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "chart" ? (
        <div ref={wrap} className="relative mt-3" style={{ height: HEIGHT }}>
          {width > 0 && (
            <svg
              width={width}
              height={HEIGHT}
              tabIndex={0}
              role="img"
              aria-label={`${title}: ${fmt(total)} visits. Use the arrow keys to read each ${hourly ? "hour" : "day"}, or switch to the table.`}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive((a) => a ?? points.length - 1)}
              onBlur={() => setActive(null)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                setActive((a) => Math.min(points.length - 1, Math.max(0, (a ?? points.length - 1) + (e.key === "ArrowLeft" ? -1 : 1))));
              }}
              className="block outline-none focus-visible:outline-2 focus-visible:outline-accent"
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
                  <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                    {compact(t)}
                  </text>
                </g>
              ))}
              {points.map((p, i) => {
                const cx0 = M.left + band * i + band / 2;
                const isActive = active === i;
                return (
                  <g key={p.label + p.date}>
                    {p.visits > 0 && <path d={columnPath(cx0 - barW / 2, y(p.visits), barW, y(0))} fill={isActive ? ACCENT_DARK : ACCENT} />}
                    {i === peak && (
                      <text x={cx0} y={y(p.visits) - 6} textAnchor="middle" className="fill-ink text-[11px] font-semibold tabular-nums">
                        {fmt(p.visits)}
                      </text>
                    )}
                    {i % labelEvery === 0 && (
                      <text x={cx0} y={HEIGHT - 8} textAnchor="middle" className="fill-muted text-[11px]">
                        {p.label}
                      </text>
                    )}
                    {/* Hit area: the whole column of the band, not just the painted bar */}
                    <rect x={M.left + band * i} y={M.top} width={band} height={plotH} fill="transparent" onPointerEnter={() => setActive(i)} />
                  </g>
                );
              })}
            </svg>
          )}

          {total === 0 && (
            <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-muted">No visits recorded in this period yet.</p>
          )}

          {shown && active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 border border-line bg-white px-3 py-2 text-xs shadow-md"
              style={{ left: Math.min(Math.max(M.left + band * active + band / 2, 70), width - 70) }}
            >
              <p className="text-base font-bold tabular-nums">{fmt(shown.visits)} visits</p>
              <p className="text-muted">{longLabel(shown, hourly)}</p>
              <p className="mt-1 text-muted tabular-nums">
                {fmt(shown.visitors)} visitors · {fmt(shown.pageViews)} page views
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 max-h-[240px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 font-bold">{hourly ? "Hour" : "Date"}</th>
                <th className="py-2 text-right font-bold">Visits</th>
                <th className="py-2 text-right font-bold">Visitors</th>
                <th className="py-2 text-right font-bold">Page views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {points.map((p) => (
                <tr key={p.label + p.date}>
                  <td className="py-1.5">{longLabel(p, hourly)}</td>
                  <td className="py-1.5 text-right font-semibold">{fmt(p.visits)}</td>
                  <td className="py-1.5 text-right">{fmt(p.visitors)}</td>
                  <td className="py-1.5 text-right">{fmt(p.pageViews)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
