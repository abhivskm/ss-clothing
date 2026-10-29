import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { getLive, getReport, resolveRange, todayInTimeZone } from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Analytics" };

// Reads the login cookie on every request (see app/admin/(panel)/layout.tsx)
export const instant = false;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  await requireAdmin();
  const params = await searchParams;
  const range = resolveRange({ range: first(params.range), from: first(params.from), to: first(params.to) });
  const [report, live] = await Promise.all([getReport(range), getLive()]);

  return <AnalyticsDashboard initialReport={report} initialLive={live} today={todayInTimeZone()} />;
}
