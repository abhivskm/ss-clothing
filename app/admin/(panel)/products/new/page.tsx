import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { listCategories } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Add product" };

// Reads the login cookie on every request (see app/admin/(panel)/layout.tsx)
export const instant = false;

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <>
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← All products
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-black uppercase tracking-tight">Add product</h1>
      <ProductForm categories={categories} />
    </>
  );
}
