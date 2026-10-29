"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { TrackEventType, TrackPayload } from "@/types/analytics";

/**
 * Anonymous website analytics for the shop (dashboard: /admin/analytics, server: lib/analytics.ts).
 *
 * - Visitor: a random ID in localStorage. Visit: a random ID that expires after 30 minutes
 *   without a page view or click; all tabs share it, so several tabs are one visit.
 * - Page views are sent on every route change; /product/<slug> also sends a product view.
 * - WhatsApp, call and Instagram link taps are caught for the whole page. A tap inside an
 *   element with data-product="<slug>" is credited to that product.
 * - While a tab is visible it sends a heartbeat every 30 s, which keeps the visitor "live".
 * - Every event carries a random ID, so retries after a failed request are never counted twice.
 * - Nothing is sent when the browser asks not to be tracked (Global Privacy Control / Do Not Track).
 */

type QueuedEvent = TrackPayload["events"][number] & { sessionId: string };

const VISITOR_KEY = "ss_vid";
const SESSION_KEY = "ss_visit";
const ENDPOINT = "/api/track";
const SESSION_TIMEOUT = 30 * 60_000;
const HEARTBEAT_MS = 30_000;
const FLUSH_DELAY = 1_000;
const MAX_QUEUE = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fallbacks for browsers where localStorage is blocked (counts become per page load)
const memory: { visitor?: string; session?: { id: string; last: number } } = {};
let queue: QueuedEvent[] = [];
/** Landing page and referrer of a new visit, sent with its first successful request */
let pendingStart: { sessionId: string; start: NonNullable<TrackPayload["start"]> } | undefined;
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let lastPage = { path: "", at: 0 };
let lastTap = { key: "", at: 0 };

function uuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the in-memory fallback is used
  }
}

function optedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

function visitorId() {
  let id = read(VISITOR_KEY) ?? memory.visitor;
  if (!id || !UUID_RE.test(id)) {
    id = uuid();
    write(VISITOR_KEY, id);
  }
  memory.visitor = id;
  return id;
}

/**
 * The current visit. Page views and clicks (`activity`) keep it going or start a new one;
 * heartbeats only read it, so a forgotten open tab does not stretch a visit forever.
 */
function sessionId(activity: boolean): string | null {
  const now = Date.now();
  let s = memory.session;
  try {
    const stored = JSON.parse(read(SESSION_KEY) ?? "null");
    if (stored && typeof stored.id === "string" && UUID_RE.test(stored.id) && typeof stored.last === "number") s = stored;
  } catch {
    // Corrupt value: treated as no visit
  }
  if (!s || now - s.last > SESSION_TIMEOUT) {
    if (!activity) return null;
    s = { id: uuid(), last: now };
    const utm = new URLSearchParams(location.search).get("utm_source") ?? undefined;
    pendingStart = { sessionId: s.id, start: { landing: location.pathname, referrer: document.referrer || undefined, utm } };
  }
  if (activity) s = { id: s.id, last: now };
  memory.session = s;
  write(SESSION_KEY, JSON.stringify(s));
  return s.id;
}

function send(sid: string, events: QueuedEvent[], beacon: boolean) {
  const payload: TrackPayload = {
    visitorId: visitorId(),
    sessionId: sid,
    events: events.map(({ id, type, path, product }) => ({ id, type, path, product })),
  };
  const start = pendingStart?.sessionId === sid ? pendingStart : undefined;
  if (start) payload.start = start.start;
  const body = JSON.stringify(payload);

  // When the page is closing, a beacon is the only request the browser is sure to deliver
  if (beacon && navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) {
    if (pendingStart === start) pendingStart = undefined;
    return;
  }
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } })
    .then((res) => {
      if (res.status === 429 || res.status >= 500) throw new Error(String(res.status));
      if (pendingStart === start) pendingStart = undefined;
    })
    .catch(() => {
      // Keep the events for the next request; their IDs stop them being counted twice
      queue = [...events, ...queue].slice(0, MAX_QUEUE);
    });
}

function flush(beacon = false) {
  clearTimeout(flushTimer);
  while (queue.length) {
    const sid = queue[0].sessionId;
    const batch = queue.filter((e) => e.sessionId === sid).slice(0, 20);
    queue = queue.filter((e) => !batch.includes(e));
    send(sid, batch, beacon);
  }
}

function track(type: TrackEventType, product?: string) {
  const sid = sessionId(true);
  if (!sid) return;
  queue.push({ id: uuid(), type, path: location.pathname, product, sessionId: sid });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, FLUSH_DELAY);
}

function heartbeat() {
  if (document.visibilityState !== "visible") return;
  if (queue.length) return flush();
  const sid = sessionId(false);
  if (sid) send(sid, [], false);
}

function linkType(href: string): TrackEventType | null {
  if (href.startsWith("tel:")) return "call_click";
  if (/^whatsapp:|^https?:\/\/(wa\.me|api\.whatsapp\.com|(web\.)?whatsapp\.com)\//i.test(href)) return "whatsapp_click";
  if (/^https?:\/\/(www\.)?(instagram\.com|ig\.me)\//i.test(href)) return "instagram_click";
  return null;
}

function onTap(e: MouseEvent) {
  const link = (e.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return;
  const type = linkType(link.href);
  if (!type) return;
  const product = link.closest("[data-product]")?.getAttribute("data-product") ?? undefined;
  // Ignore double taps on the same button
  const key = `${type}:${product ?? ""}`;
  if (lastTap.key === key && Date.now() - lastTap.at < 2_000) return;
  lastTap = { key, at: Date.now() };
  track(type, product);
  flush(true); // the tap may open WhatsApp or the dialer and leave the page
}

export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (optedOut()) return;
    const onVisibility = () => (document.visibilityState === "visible" ? heartbeat() : flush(true));
    const onPageHide = () => flush(true);
    const timer = setInterval(heartbeat, HEARTBEAT_MS);
    document.addEventListener("click", onTap, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearInterval(timer);
      document.removeEventListener("click", onTap, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  useEffect(() => {
    if (optedOut()) return;
    // React runs effects twice in development; count one view per route change
    if (lastPage.path === pathname && Date.now() - lastPage.at < 1_000) return;
    lastPage = { path: pathname, at: Date.now() };
    track("page_view");
    const product = pathname.match(/^\/product\/([a-z0-9-]+)\/?$/)?.[1];
    if (product) track("product_view", product);
  }, [pathname]);

  return null;
}
