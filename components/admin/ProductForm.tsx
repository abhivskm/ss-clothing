"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { ImageManager } from "@/components/admin/ImageManager";
import { PlusIcon, TrashIcon } from "@/components/ui/Icons";
import { SIZE_OPTIONS, discountPercent, slugify } from "@/lib/format";
import { PRODUCT_TAGS, type Category, type Product, type ProductColor } from "@/types/product";

const field = "mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm focus:border-ink";
const label = "text-sm font-semibold";
const TAG_LABELS = { new: "New arrival", trending: "Trending", bestseller: "Bestseller" };

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, formAction, saving] = useActionState(saveProduct, undefined);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [mrp, setMrp] = useState(product?.mrp ? String(product.mrp) : "");
  const [images, setImages] = useState(product?.images ?? []);
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [uploading, setUploading] = useState(false);

  const extraSizes = (product?.sizes ?? []).filter((s) => !SIZE_OPTIONS.includes(s));
  const off = discountPercent({ price: Number(price), mrp: Number(mrp) || undefined });
  const updateColor = (i: number, patch: Partial<ProductColor>) => setColors(colors.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <form
      // Submit manually so the form keeps its values when the server reports an error
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="grid gap-6 lg:grid-cols-[1fr_380px]"
    >
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="colors" value={JSON.stringify(colors.filter((c) => c.name.trim()))} />

      <div className="space-y-6">
        <fieldset className="space-y-4 border border-line bg-white p-5">
          <legend className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Basics</legend>
          <label className="block">
            <span className={label}>Product name *</span>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              className={field}
            />
          </label>
          <label className="block">
            <span className={label}>Web address (slug)</span>
            <div className="mt-1 flex items-center border border-line bg-white text-sm focus-within:border-ink">
              <span className="pl-3 text-muted">/product/</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                className="min-w-0 flex-1 py-2.5 pr-3 outline-none"
              />
            </div>
            {product && <span className="mt-1 block text-xs text-muted">Changing this breaks links people have already shared.</span>}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Category *</span>
              <select name="category" required defaultValue={product?.category ?? ""} className={field}>
                <option value="" disabled>
                  Choose…
                </option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>Type (shown under the name)</span>
              <input name="subcategory" defaultValue={product?.subcategory} placeholder="e.g. Cuban Collar Shirt" className={field} />
            </label>
          </div>
          <label className="block">
            <span className={label}>Description</span>
            <textarea name="description" rows={4} defaultValue={product?.description} className={field} />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
          <legend className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Price</legend>
          <label className="block">
            <span className={label}>Selling price (₹) *</span>
            <input name="price" required inputMode="numeric" pattern="\d+" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className={label}>MRP (₹), optional</span>
            <input name="mrp" inputMode="numeric" pattern="\d*" value={mrp} onChange={(e) => setMrp(e.target.value)} className={field} />
            <span className="mt-1 block text-xs text-muted">{off ? `Shows ${off}% off on the website.` : "Leave empty for no discount."}</span>
          </label>
        </fieldset>

        <fieldset className="space-y-4 border border-line bg-white p-5">
          <legend className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Sizes and colours</legend>
          <div>
            <p className={label}>Sizes *</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="checkbox" name="sizes" value={s} defaultChecked={product?.sizes.includes(s)} className="peer sr-only" />
                  <span className="inline-block min-w-11 border border-line px-3 py-2 text-center text-sm font-semibold peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                    {s}
                  </span>
                </label>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="text-xs text-muted">Other sizes, separated by commas</span>
              <input name="extraSizes" defaultValue={extraSizes.join(", ")} placeholder="e.g. 42, 44" className={field} />
            </label>
          </div>
          <div>
            <p className={label}>Colours</p>
            <ul className="mt-2 space-y-2">
              {colors.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input type="color" value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })} aria-label={`Colour ${i + 1} swatch`} className="h-10 w-12 cursor-pointer border border-line bg-white p-1" />
                  <input value={c.name} onChange={(e) => updateColor(i, { name: e.target.value })} placeholder="Colour name, e.g. Navy" aria-label={`Colour ${i + 1} name`} className="min-w-0 flex-1 border border-line px-3 py-2 text-sm" />
                  <button type="button" onClick={() => setColors(colors.filter((_, j) => j !== i))} aria-label={`Remove colour ${i + 1}`} className="grid size-10 place-items-center border border-line hover:border-ink">
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setColors([...colors, { name: "", hex: "#1a1a1a" }])} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
              <PlusIcon className="size-4" /> Add colour
            </button>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
          <legend className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Details</legend>
          <label className="block">
            <span className={label}>Fabric</span>
            <input name="fabric" defaultValue={product?.fabric} placeholder="e.g. 100% cotton, 240 GSM" className={field} />
          </label>
          <label className="block">
            <span className={label}>Fit</span>
            <input name="fit" defaultValue={product?.fit} placeholder="e.g. Oversized fit" className={field} />
          </label>
        </fieldset>
      </div>

      <div className="space-y-6">
        <fieldset className="border border-line bg-white p-5">
          <legend className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Photos *</legend>
          <ImageManager images={images} onChange={setImages} onBusy={setUploading} />
        </fieldset>

        <fieldset className="space-y-3 border border-line bg-white p-5">
          <legend className="px-1 text-xs font-bold uppercase tracking-widest text-muted">Status</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="mt-0.5 size-5 accent-ink" />
            <span>
              <span className="block text-sm font-semibold">Active</span>
              <span className="text-xs text-muted">Show this product on the website.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} className="mt-0.5 size-5 accent-ink" />
            <span>
              <span className="block text-sm font-semibold">In stock</span>
              <span className="text-xs text-muted">When off, the product shows as &quot;Sold out&quot;.</span>
            </span>
          </label>
          <div>
            <p className="text-sm font-semibold">Labels</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {PRODUCT_TAGS.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="tags" value={t} defaultChecked={product?.tags.includes(t)} className="size-4 accent-ink" />
                  {TAG_LABELS[t]}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">&quot;New arrival&quot; and &quot;Trending&quot; products appear in the homepage rows.</p>
          </div>
        </fieldset>

        <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-line bg-surface/95 px-4 py-4 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
          {state?.error && (
            <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <button disabled={saving || uploading} className="flex-1 bg-ink py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60">
              {uploading ? "Uploading photos…" : saving ? "Saving…" : product ? "Save changes" : "Add product"}
            </button>
            <Link href="/admin" className="border border-line bg-white px-5 py-3 text-sm font-semibold hover:border-ink">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
