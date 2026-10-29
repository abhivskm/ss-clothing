"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LiveActivity, NowViewing } from "@/components/admin/analytics/LiveActivity";
import { ProductTable } from "@/components/admin/analytics/ProductTable";
import { VisitsChart } from "@/components/admin/analytics/VisitsChart";
import { ActivityIcon, EyeIcon, MailIcon, PhoneIcon, UsersIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";
import type { Breakdown, LiveData, RangeKey, Report } from "@/types/analytics";

const LIVE_POLL_MS = 5_000;
const REPORT_POLL_MS = 60_000;

const RANGES: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
];

const fmt = (n: number) => n.toLocaleString("en-IN");

function dateLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

class SessionExpired extends Error {}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal });
  if (res.status === 401) throw new SessionExpired();
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

function rangeQuery(key: RangeKey, from: string, to: string) {
  const q = new URLSearchParams({ range: key });
  if (key === "custom") {
    q.set("from", from);
    q.set("to", to);
  }
  return q.toString();
}

/** Repeats `fn` every `ms` while the tab is visible, and once right away when it becomes visible again. */
function useVisibleInterval(fn: () => void, ms: number, enabled = true) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!enabled) return;
    const tick = () => document.visibilityState === "visible" && ref.current();
    const timer = setInterval(tick, ms);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [ms, enabled]);
}

export function AnalyticsDashboard({ initialReport, initialLive, today }: { initialReport: Report; initialLive: LiveData; today: string }) {
  const [report, setReport] = useState(initialReport);
  const [live, setLive] = useState(initialLive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveError, setLiveError] = useState(false);
  const [expired, setExpired] = useState(false);
  const [custom, setCustom] = useState({ from: initialReport.range.from, to: initialReport.range.to });
  const [showCustom, setShowCustom] = useState(initialReport.range.key === "custom");
  const request = useRef<AbortController | null>(null);

  const load = useCallback(async (query: string, silent = false) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    if (!silent) setLoading(true);
    try {
      const next = await getJson<Report>(`/api/admin/analytics?${query}`, controller.signal);
      setReport(next);
      setError("");
      if (!silent) window.history.replaceState(null, "", `?${query}`);
    } catch (e) {
      if (controller.signal.aborted) return;
      if (e instanceof SessionExpired) setExpired(true);
      else if (!silent) setError("Could not load the report. Check your connection and try again.");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  }, []);

  const { range } = report;
  const currentQuery = rangeQuery(range.key, range.from, range.to);

  // Live visitors and activity: every 5 s
  useVisibleInterval(async () => {
    try {
      setLive(await getJson<LiveData>("/api/admin/analytics/live"));
      setLiveError(false);
    } catch (e) {
      if (e instanceof SessionExpired) setExpired(true);
      else setLiveError(true);
    }
  }, LIVE_POLL_MS, !expired);

  // Ranges that include today keep filling up: refresh them quietly every minute
  useVisibleInterval(() => {
    if (!request.current) load(currentQuery, true);
  }, REPORT_POLL_MS, !expired && range.to === today);

  const s = report.summary;
  const cards = [
    {
      label: "Live visitors",
      value: live.liveVisitors,
      sub: liveError ? "Updates paused, retrying…" : `Active in the last ${live.activeMinutes} min`,
      icon: <ActivityIcon />,
      live: true,
    },
    { label: "Total visits", value: s.visits, sub: `${fmt(s.pageViews)} page views`, icon: <EyeIcon /> },
    { label: "Unique visitors", value: s.uniqueVisitors, sub: `${fmt(s.newVisitors)} new · ${fmt(s.returningVisitors)} returning`, icon: <UsersIcon /> },
    { label: "WhatsApp clicks", value: s.whatsappClicks, sub: "Taps on any WhatsApp button", icon: <WhatsAppIcon /> },
    { label: "Call clicks", value: s.callClicks, sub: "Taps on phone links", icon: <PhoneIcon /> },
    { label: "Enquiries", value: s.enquiries, sub: "Needs an enquiry form on the site", icon: <MailIcon /> },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            {dateLabel(range.from)}
            {range.from !== range.to && <> – {dateLabel(range.to)}</>} · times in {report.timeZone === "Asia/Kolkata" ? "India (IST)" : report.timeZone}
          </p>
        </div>
      </div>

      {expired && (
        <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Your login has expired. <a href="/admin/login" className="underline">Log in again</a> to keep the dashboard updating.
        </p>
      )}

      {/* Date filter */}
      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            aria-pressed={range.key === r.key && !showCustom}
            onClick={() => {
              setShowCustom(false);
              load(rangeQuery(r.key, "", ""));
            }}
            className={cx(
              "border px-3 py-2 text-sm font-bold",
              range.key === r.key && !showCustom ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink hover:text-ink"
            )}
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={showCustom}
          aria-expanded={showCustom}
          onClick={() => setShowCustom(true)}
          className={cx("border px-3 py-2 text-sm font-bold", showCustom ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink hover:text-ink")}
        >
          Custom
        </button>
        {loading && <span className="text-sm text-muted" role="status">Loading…</span>}
      </div>
      {showCustom && (
        <form
          className="mt-2 flex flex-wrap items-end gap-2 border border-line bg-white p-3"
          onSubmit={(e) => {
            e.preventDefault();
            load(rangeQuery("custom", custom.from, custom.to));
          }}
        >
          <label className="text-xs font-semibold text-muted">
            From
            <input type="date" required max={custom.to || today} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="mt-1 block border border-line px-2 py-1.5 text-sm text-ink" />
          </label>
          <label className="text-xs font-semibold text-muted">
            To
            <input type="date" required min={custom.from} max={today} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="mt-1 block border border-line px-2 py-1.5 text-sm text-ink" />
          </label>
          <button className="bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-dark">Apply</button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 flex flex-wrap items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
          <button type="button" onClick={() => load(currentQuery)} className="underline">
            Try again
          </button>
        </p>
      )}

      <div className={cx("transition-opacity", loading && "opacity-60")}>
        {/* Metric cards */}
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {cards.map((c) => (
            <li key={c.label} className={cx("border bg-white p-4", c.live ? "border-accent/40" : "border-line")}>
              <div className="flex items-center justify-between gap-2 text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">{c.label}</span>
                <span className="shrink-0 [&_svg]:size-4">{c.icon}</span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-3xl font-extrabold">
                {c.live && (
                  <span className="relative flex size-2.5" aria-hidden>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-green-600" />
                  </span>
                )}
                {fmt(c.value)}
              </p>
              <p className="mt-1 text-xs text-muted">{c.sub}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <VisitsChart points={report.visits} hourly={report.hourly} className="lg:col-span-2" />
          <LiveActivity events={live.events} timeZone={report.timeZone} paused={liveError || expired} />
        </div>

        <ProductTable products={report.products} className="mt-5" />

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <NowViewing pages={live.pages} liveVisitors={live.liveVisitors} />
          <BreakdownCard title="Traffic sources" rows={report.sources} total={s.visits} />
          <BreakdownCard title="Devices" rows={report.devices} total={s.visits} capitalize />
        </div>
      </div>
    </>
  );
}

function BreakdownCard({ title, rows, total, capitalize }: { title: string; rows: Breakdown; total: number; capitalize?: boolean }) {
  return (
    <section className="border border-line bg-white p-4" aria-label={title}>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted">{title}</h2>
      {rows.length ? (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => {
            const pct = total ? Math.round((r.visits / total) * 100) : 0;
            return (
              <li key={r.name} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className={cx("truncate font-semibold", capitalize && "capitalize")}>{r.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {fmt(r.visits)} · {pct}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-accent/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No visits in this period yet.</p>
      )}
    </section>
  );
}
