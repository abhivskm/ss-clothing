/**
 * Website analytics: recording visits/events and building the admin dashboard.
 * Tables: scripts/schema.sql (analytics_*). The browser side is components/analytics/Tracker.tsx.
 *
 * Definitions used on the dashboard:
 * - Visit (session): starts on the first page view and ends after 30 minutes without activity.
 * - Unique visitor: a browser, identified by a random ID kept in localStorage. "New" visitors
 *   were first seen in the selected range; the rest are returning.
 * - Live visitor: a visitor whose open, visible tab sent a heartbeat in the last ACTIVE_MINUTES.
 * - Product conversion rate: visits that viewed the product AND tapped its WhatsApp button,
 *   divided by visits that viewed the product. Repeated views or taps in one visit count once.
 *
 * All times are stored in UTC (database clock) and grouped into days in TIME_ZONE.
 */
import "server-only";
import { createHash } from "node:crypto";
import { sql } from "@/lib/db";
import {
  TRACK_EVENTS,
  type AnalyticsEventType,
  type Breakdown,
  type DateRange,
  type LiveData,
  type ProductStat,
  type RangeKey,
  type Report,
  type TrackPayload,
  type VisitsPoint,
} from "@/types/analytics";

function validTimeZone(tz: string | undefined) {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Days and hours on the dashboard follow this time zone (default: India). */
export const TIME_ZONE = validTimeZone(process.env.ANALYTICS_TIMEZONE) ? process.env.ANALYTICS_TIMEZONE! : "Asia/Kolkata";

/** A visitor counts as live while their tab sent a heartbeat within this many minutes (default 5). */
export const ACTIVE_MINUTES = Math.min(60, Math.max(1, Number(process.env.ANALYTICS_ACTIVE_MINUTES) || 5));

const MAX_RANGE_DAYS = 366;

/* ---------------------------------------------------------------- date ranges */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function todayInTimeZone() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isRealDate(date: string) {
  return DATE_RE.test(date) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
}

/** Turns ?range=7d or ?from=YYYY-MM-DD&to=YYYY-MM-DD into a safe date range. Unknown input → last 7 days. */
export function resolveRange(input: { range?: string; from?: string; to?: string }): DateRange {
  const today = todayInTimeZone();
  const key = input.range as RangeKey;
  if (key === "today") return { key, from: today, to: today };
  if (key === "30d") return { key, from: addDays(today, -29), to: today };
  if (key === "custom" && input.from && input.to && isRealDate(input.from) && isRealDate(input.to)) {
    let [from, to] = input.from <= input.to ? [input.from, input.to] : [input.to, input.from];
    if (to > today) to = today;
    if (from > to) from = to;
    if (addDays(from, MAX_RANGE_DAYS - 1) < to) from = addDays(to, -(MAX_RANGE_DAYS - 1));
    return { key, from, to };
  }
  return { key: "7d", from: addDays(today, -6), to: today };
}

/* ---------------------------------------------------------------- recording */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9-]{1,120}$/;
const MAX_EVENTS = 20;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const cleanPath = (v: unknown) => (typeof v === "string" && v.startsWith("/") && v.length <= 300 ? v : null);

/** Validates a tracking request body. Returns null when anything is malformed. */
export function parseTrackPayload(body: unknown): TrackPayload | null {
  if (!isObject(body)) return null;
  const { visitorId, sessionId, start, events } = body;
  if (typeof visitorId !== "string" || !UUID_RE.test(visitorId)) return null;
  if (typeof sessionId !== "string" || !UUID_RE.test(sessionId)) return null;
  if (!Array.isArray(events) || events.length > MAX_EVENTS) return null;

  const parsed: TrackPayload = { visitorId, sessionId, events: [] };
  if (start !== undefined) {
    if (!isObject(start)) return null;
    const landing = cleanPath(start.landing);
    if (!landing) return null;
    parsed.start = {
      landing,
      referrer: typeof start.referrer === "string" ? start.referrer.slice(0, 500) : undefined,
      utm: typeof start.utm === "string" && /^[\w.-]{1,40}$/.test(start.utm) ? start.utm.toLowerCase() : undefined,
    };
  }
  for (const e of events) {
    if (!isObject(e) || typeof e.id !== "string" || !UUID_RE.test(e.id)) return null;
    if (!TRACK_EVENTS.includes(e.type as TrackPayload["events"][number]["type"])) return null;
    const path = cleanPath(e.path);
    if (!path) return null;
    const product = typeof e.product === "string" && SLUG_RE.test(e.product) ? e.product : undefined;
    if (e.type === "product_view" && !product) return null;
    parsed.events.push({ id: e.id, type: e.type as TrackPayload["events"][number]["type"], path, product });
  }
  return parsed;
}

const KNOWN_SOURCES: [RegExp, string][] = [
  [/(^|\.)google\.|^com\.google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)instagram\.com$|^ig$/, "Instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$|^fb$/, "Facebook"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/^(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
];

/** Names where a visit came from: a ?utm_source tag first, then the referring website. */
function trafficSource(referrerHost: string | null, utm: string | undefined): string {
  if (utm) {
    const known = KNOWN_SOURCES.find(([, name]) => name.toLowerCase() === utm || name.toLowerCase().startsWith(`${utm} `));
    return known?.[1] ?? KNOWN_SOURCES.find(([re]) => re.test(utm))?.[1] ?? utm.charAt(0).toUpperCase() + utm.slice(1);
  }
  if (!referrerHost) return "Direct";
  return KNOWN_SOURCES.find(([re]) => re.test(referrerHost))?.[1] ?? referrerHost;
}

function referrerHostOf(referrer: string | undefined, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    return host && host !== ownHost?.replace(/^www\./, "") ? host.slice(0, 100) : null;
  } catch {
    return null;
  }
}

export type RequestInfo = {
  host: string | null;
  device: string;
  browser?: string;
  os?: string;
  country?: string;
};

/**
 * Stores one tracking request in a single database round trip:
 * marks the visitor and visit as seen (this is also the heartbeat) and adds any events.
 * Events are deduplicated by their ID; product events are linked by slug to the product's ID.
 */
export async function recordTrack(p: TrackPayload, info: RequestInfo) {
  const referrerHost = referrerHostOf(p.start?.referrer, info.host);
  const source = trafficSource(referrerHost, p.start?.utm);
  const landing = p.start?.landing ?? p.events.find((e) => e.type === "page_view")?.path ?? "/";

  await sql.transaction([
    sql`insert into analytics_visitors (id) values (${p.visitorId}::uuid)
        on conflict (id) do update set last_seen = now()`,
    sql`insert into analytics_sessions (id, visitor_id, landing_path, referrer_host, source, device, browser, os, country)
        values (${p.sessionId}::uuid, ${p.visitorId}::uuid, ${landing}, ${referrerHost}, ${source}, ${info.device},
                ${info.browser ?? null}, ${info.os ?? null}, ${info.country ?? null})
        on conflict (id) do update set last_seen = now()
        where analytics_sessions.visitor_id = excluded.visitor_id`,
    ...p.events.map(
      (e) => sql`insert into analytics_events (event_id, type, session_id, visitor_id, path, product_id)
        select ${e.id}::uuid, ${e.type}, ${p.sessionId}::uuid, ${p.visitorId}::uuid, ${e.path},
               (select id from products where slug = ${e.product ?? null})
        where ${e.type} <> 'product_view' or exists (select 1 from products where slug = ${e.product ?? null} and active)
        on conflict (event_id) do nothing`
    ),
  ]);
}

/**
 * Records a successful enquiry. Call this ONLY after the enquiry itself has been saved,
 * e.g. from the Server Action of an enquiry form. The site has no enquiry form yet, so
 * the dashboard shows 0 until one calls this.
 */
export async function recordEnquiry(opts: { eventId: string; sessionId?: string; visitorId?: string; path: string; productSlug?: string }) {
  const sessionId = opts.sessionId && UUID_RE.test(opts.sessionId) ? opts.sessionId : null;
  const visitorId = opts.visitorId && UUID_RE.test(opts.visitorId) ? opts.visitorId : null;
  await sql`insert into analytics_events (event_id, type, session_id, visitor_id, path, product_id)
    values (${opts.eventId}::uuid, 'enquiry', (select id from analytics_sessions where id = ${sessionId}::uuid),
            ${visitorId}::uuid, ${opts.path.slice(0, 300)}, (select id from products where slug = ${opts.productSlug ?? null}))
    on conflict (event_id) do nothing`;
}

/* ---------------------------------------------------------------- dashboard */

const n = (v: unknown) => Number(v ?? 0);

function dayLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

async function getVisits(range: DateRange, hourly: boolean): Promise<VisitsPoint[]> {
  const { from, to } = range;
  if (hourly) {
    const rows = await sql`
      with b as (select (${from}::date)::timestamp at time zone ${TIME_ZONE} as lo, (${from}::date + 1)::timestamp at time zone ${TIME_ZONE} as hi),
      s as (select extract(hour from started_at at time zone ${TIME_ZONE})::int as h, visitor_id
            from analytics_sessions, b where started_at >= b.lo and started_at < b.hi),
      pv as (select extract(hour from created_at at time zone ${TIME_ZONE})::int as h, count(*) as n
             from analytics_events, b where type = 'page_view' and created_at >= b.lo and created_at < b.hi group by 1)
      select g.h, coalesce(sv.visits, 0) as visits, coalesce(sv.visitors, 0) as visitors, coalesce(pv.n, 0) as page_views
      from generate_series(0, 23) as g(h)
      left join (select h, count(*) as visits, count(distinct visitor_id) as visitors from s group by h) sv on sv.h = g.h
      left join pv on pv.h = g.h
      order by g.h`;
    return rows.map((r) => {
      const h = n(r.h);
      return { label: `${String(h).padStart(2, "0")}:00`, date: from, visits: n(r.visits), visitors: n(r.visitors), pageViews: n(r.page_views) };
    });
  }
  const rows = await sql`
    with b as (select (${from}::date)::timestamp at time zone ${TIME_ZONE} as lo, (${to}::date + 1)::timestamp at time zone ${TIME_ZONE} as hi),
    s as (select (started_at at time zone ${TIME_ZONE})::date as d, visitor_id
          from analytics_sessions, b where started_at >= b.lo and started_at < b.hi),
    pv as (select (created_at at time zone ${TIME_ZONE})::date as d, count(*) as n
           from analytics_events, b where type = 'page_view' and created_at >= b.lo and created_at < b.hi group by 1)
    select to_char(g.d, 'YYYY-MM-DD') as date, coalesce(sv.visits, 0) as visits, coalesce(sv.visitors, 0) as visitors, coalesce(pv.n, 0) as page_views
    from (select generate_series(${from}::date, ${to}::date, interval '1 day')::date as d) g
    left join (select d, count(*) as visits, count(distinct visitor_id) as visitors from s group by d) sv on sv.d = g.d
    left join pv on pv.d = g.d
    order by g.d`;
  return rows.map((r) => ({ label: dayLabel(r.date as string), date: r.date as string, visits: n(r.visits), visitors: n(r.visitors), pageViews: n(r.page_views) }));
}

/** Everything the dashboard shows for a date range, calculated in the database. */
export async function getReport(range: DateRange): Promise<Report> {
  const { from, to } = range;
  const hourly = from === to;
  const bounds = sql`select (${from}::date)::timestamp at time zone ${TIME_ZONE} as lo, (${to}::date + 1)::timestamp at time zone ${TIME_ZONE} as hi`;

  const [[summary], visits, products, sources, devices] = await Promise.all([
    sql`
      with b as (${bounds}),
      s as (select visitor_id from analytics_sessions, b where started_at >= b.lo and started_at < b.hi),
      e as (select type, count(*) as n from analytics_events, b where created_at >= b.lo and created_at < b.hi group by type)
      select
        (select count(*) from s) as visits,
        (select count(distinct visitor_id) from s) as unique_visitors,
        (select count(*) from analytics_visitors, b where first_seen >= b.lo and first_seen < b.hi) as new_visitors,
        (select coalesce(sum(n), 0) from e where type = 'page_view') as page_views,
        (select coalesce(sum(n), 0) from e where type = 'whatsapp_click') as whatsapp_clicks,
        (select coalesce(sum(n), 0) from e where type = 'call_click') as call_clicks,
        (select coalesce(sum(n), 0) from e where type = 'enquiry') as enquiries`,
    getVisits(range, hourly),
    sql`
      with b as (${bounds}),
      per_visit as (
        select product_id, session_id,
               count(*) filter (where type = 'product_view') as v,
               count(*) filter (where type = 'whatsapp_click') as w,
               count(*) filter (where type = 'enquiry') as q
        from analytics_events, b
        where product_id is not null and created_at >= b.lo and created_at < b.hi
          and type in ('product_view', 'whatsapp_click', 'enquiry')
        group by product_id, session_id)
      select p.id, p.name, p.slug, p.active, p.images ->> 0 as image,
             coalesce(sum(pv.v), 0) as views,
             count(*) filter (where pv.v > 0) as viewers,
             coalesce(sum(pv.w), 0) as whatsapp_clicks,
             count(*) filter (where pv.v > 0 and pv.w > 0) as converted,
             coalesce(sum(pv.q), 0) as enquiries
      from products p left join per_visit pv on pv.product_id = p.id
      group by p.id
      order by viewers desc, views desc, p.name`,
    sql`with b as (${bounds})
        select source as name, count(*) as visits from analytics_sessions, b
        where started_at >= b.lo and started_at < b.hi group by source order by visits desc limit 8`,
    sql`with b as (${bounds})
        select device as name, count(*) as visits from analytics_sessions, b
        where started_at >= b.lo and started_at < b.hi group by device order by visits desc`,
  ]);

  const uniqueVisitors = n(summary.unique_visitors);
  const newVisitors = Math.min(n(summary.new_visitors), uniqueVisitors);
  const breakdown = (rows: Record<string, unknown>[]): Breakdown => rows.map((r) => ({ name: String(r.name), visits: n(r.visits) }));

  return {
    range,
    timeZone: TIME_ZONE,
    hourly,
    summary: {
      visits: n(summary.visits),
      uniqueVisitors,
      newVisitors,
      returningVisitors: uniqueVisitors - newVisitors,
      pageViews: n(summary.page_views),
      whatsappClicks: n(summary.whatsapp_clicks),
      callClicks: n(summary.call_clicks),
      enquiries: n(summary.enquiries),
    },
    visits,
    products: products.map(
      (r): ProductStat => ({
        id: r.id as string,
        name: r.name as string,
        slug: r.slug as string,
        image: (r.image as string | null) ?? undefined,
        active: r.active as boolean,
        views: n(r.views),
        viewers: n(r.viewers),
        whatsappClicks: n(r.whatsapp_clicks),
        converted: n(r.converted),
        enquiries: n(r.enquiries),
      })
    ),
    sources: breakdown(sources),
    devices: breakdown(devices),
  };
}

const visitorRef = (id: string) => createHash("sha256").update(id).digest("hex").slice(0, 6);

/** Live visitors, the pages they are on, and the latest events. Polled by the dashboard. */
export async function getLive(): Promise<LiveData> {
  const [[live], pages, events] = await Promise.all([
    sql`select count(distinct visitor_id) as n from analytics_sessions
        where last_seen > now() - make_interval(mins => ${ACTIVE_MINUTES}::int)`,
    sql`select path, count(distinct visitor_id) as visitors from (
          select distinct on (e.session_id) e.path, e.visitor_id
          from analytics_events e join analytics_sessions s on s.id = e.session_id
          where s.last_seen > now() - make_interval(mins => ${ACTIVE_MINUTES}::int)
            and e.type = 'page_view' and e.created_at > now() - interval '1 day'
          order by e.session_id, e.created_at desc) latest
        group by path order by visitors desc, path limit 8`,
    sql`select e.id, e.type, e.path, e.created_at, e.visitor_id, p.name as product_name, s.device
        from analytics_events e
        left join products p on p.id = e.product_id
        left join analytics_sessions s on s.id = e.session_id
        order by e.id desc limit 30`,
  ]);

  return {
    liveVisitors: n(live.n),
    activeMinutes: ACTIVE_MINUTES,
    pages: pages.map((r) => ({ path: r.path as string, visitors: n(r.visitors) })),
    events: events.map((r) => ({
      id: String(r.id),
      type: r.type as AnalyticsEventType,
      path: r.path as string,
      productName: (r.product_name as string | null) ?? undefined,
      at: (r.created_at as Date).toISOString(),
      visitor: r.visitor_id ? visitorRef(r.visitor_id as string) : undefined,
      device: (r.device as string | null) ?? undefined,
    })),
  };
}
