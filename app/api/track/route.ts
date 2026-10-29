/**
 * Receives page views, clicks and heartbeats from components/analytics/Tracker.tsx.
 * Ignores bots, other websites, and the shop owner while logged in to the admin.
 * Always answers 204 for ignored requests so nothing useful leaks to scripts probing it.
 */
import { userAgent, type NextRequest } from "next/server";
import { parseTrackPayload, recordTrack } from "@/lib/analytics";
import { isAdmin } from "@/lib/auth";

const MAX_BODY = 16 * 1024;

// Best-effort limit per IP address. Each server instance keeps its own counts in memory;
// IP addresses are never stored in the database.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  if (hits.size > 10_000) for (const [key, v] of hits) if (v.reset < now) hits.delete(key);
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  return ++entry.count > MAX_REQUESTS;
}

const noContent = () => new Response(null, { status: 204 });

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Only the site's own pages may send events
  const site = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  if (site ? site !== "same-origin" : origin !== null && hostOf(origin) !== request.nextUrl.host) {
    return new Response(null, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) return new Response(null, { status: 429 });

  const ua = userAgent(request);
  if (ua.isBot || (await isAdmin())) return noContent();

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return new Response(null, { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY) return new Response(null, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const payload = parseTrackPayload(body);
  if (!payload) return new Response(null, { status: 400 });

  const country = request.headers.get("x-vercel-ip-country");
  await recordTrack(payload, {
    host: request.nextUrl.hostname,
    device: ua.device.type === "mobile" || ua.device.type === "tablet" ? ua.device.type : "desktop",
    browser: ua.browser.name?.slice(0, 40),
    os: ua.os.name?.slice(0, 40),
    country: country && /^[A-Z]{2}$/.test(country) ? country : undefined,
  });
  return noContent();
}
