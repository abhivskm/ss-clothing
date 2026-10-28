import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { removeProduct } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { TrashIcon } from "@/components/ui/Icons";
import { getProductById, listCategories } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit product" };

// Reads the login cookie on every request (see app/admin/(panel)/layout.tsx)
export const instant = false;

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← All products
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black uppercase tracking-tight">Edit product</h1>
        {product.active && (
          <Link href={`/product/${product.slug}`} target="_blank" className="text-sm font-semibold text-accent hover:underline">
            View on website ↗
          </Link>
        )}
      </div>
      <ProductForm product={product} categories={categories} />
      <div className="mt-10 border border-red-200 bg-white p-5">
        <h2 className="font-bold">Delete product</h2>
        <p className="mt-1 text-sm text-muted">
          Removes the product and its photos permanently. To hide it for a while instead, switch it to inactive.
        </p>
        <ConfirmButton
          action={removeProduct.bind(null, product.id)}
          message={`Delete "${product.name}" and its photos permanently?`}
          className="mt-4 inline-flex items-center gap-2 border border-red-700 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-60"
        >
          <TrashIcon /> Delete product
        </ConfirmButton>
      </div>
    </>
  );
}
