"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CloseIcon, UploadIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/cx";

const MAX_SIDE = 1600;

/** Shrinks a photo to max 1600px on its longest side and re-encodes it as JPEG. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read photo"))), "image/jpeg", 0.85)
  );
}

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await shrink(file), "photo.jpg");
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

/** Upload, reorder (drag or arrows) and remove product photos. The first photo is the main one. */
export function ImageManager({
  images,
  onChange,
  onBusy,
}: {
  images: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  /** Called with true while uploads are running, so the form can wait before saving */
  onBusy: (busy: boolean) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    onBusy(true);
    setUploading((n) => n + files.length);
    for (const file of Array.from(files)) {
      try {
        const url = await upload(file);
        // Functional update: the list may have been reordered while uploading
        onChange((current) => [...current, url]);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "Upload failed"}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    onBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((src, i) => (
          <li
            key={src}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className={cx("group relative aspect-3/4 cursor-grab overflow-hidden border bg-surface", i === 0 ? "border-ink" : "border-line", dragIndex === i && "opacity-40")}
          >
            <Image src={src} alt={`Photo ${i + 1}`} fill sizes="160px" className="object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Main</span>}
            <button
              type="button"
              onClick={() => onChange(images.filter((x) => x !== src))}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
            >
              <CloseIcon className="size-4" />
            </button>
            <div className="absolute inset-x-1 bottom-1 flex justify-between">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} className="grid size-7 place-items-center rounded-full bg-white/90 shadow disabled:invisible">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} aria-label={`Move photo ${i + 1} later`} className="grid size-7 place-items-center rounded-full bg-white/90 shadow disabled:invisible">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <li key={`up-${i}`} className="grid aspect-3/4 animate-pulse place-items-center border border-line bg-surface text-xs text-muted">
            Uploading…
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-3/4 w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-line bg-white text-sm font-semibold text-muted hover:border-ink hover:text-ink"
          >
            <UploadIcon />
            Add photos
          </button>
        </li>
      </ul>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      <p className="mt-2 text-xs text-muted">
        The first photo is the main one and the second shows on hover. Drag or use the arrows to reorder. Portrait (3:4) photos look best.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
