/** Live visitors and the latest events (admin only). The dashboard polls this every few seconds. */
import { getLive } from "@/lib/analytics";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  return Response.json(await getLive(), { headers: { "Cache-Control": "no-store" } });
}
