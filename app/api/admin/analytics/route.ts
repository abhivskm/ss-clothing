/**
 * Dashboard report for a date range (admin only).
 * GET /api/admin/analytics?range=today|7d|30d  or  ?range=custom&from=YYYY-MM-DD&to=YYYY-MM-DD
 */
import type { NextRequest } from "next/server";
import { getReport, resolveRange } from "@/lib/analytics";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const range = resolveRange({ range: params.get("range") ?? undefined, from: params.get("from") ?? undefined, to: params.get("to") ?? undefined });
  return Response.json(await getReport(range), { headers: { "Cache-Control": "no-store" } });
}
