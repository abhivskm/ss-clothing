"use client";

export const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export function SortSelect({ value, onChange }: { value: SortId; onChange: (v: SortId) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortId)}
        aria-label="Sort products"
        className="border border-line bg-white px-3 py-2.5 text-sm font-semibold"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
