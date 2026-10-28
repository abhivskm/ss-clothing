/**
 * Uploads one product photo to Vercel Blob and returns its URL.
 * The admin form shrinks photos in the browser first (max 1600px JPEG),
 * so requests stay well under Vercel's 4.5 MB request limit.
 */
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No photo received." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Use a JPG, PNG or WebP photo." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Photo is too large (max 4 MB)." }, { status: 400 });

  const blob = await put(`products/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
    cacheControlMaxAge: 60 * 60 * 24 * 365, // file names are unique, so cache for a year
  });
  return Response.json({ url: blob.url });
}
