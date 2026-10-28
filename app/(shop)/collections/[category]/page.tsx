import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollectionView } from "@/components/collection/CollectionView";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getAllProducts, getCategories, getCategory, getProductsByCategory } from "@/lib/products";
import { site } from "@/lib/site";

/** Prebuild /collections/all and one page per category. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return [{ category: "all" }, ...categories.map((c) => ({ category: c.slug }))];
}

export async function generateMetadata({ params }: PageProps<"/collections/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategory(category);
  const title = cat ? `Men's ${cat.name}` : "Shop All Men's Clothing";
  const description = cat
    ? `${cat.description} Shop men's ${cat.name.toLowerCase()} at ${site.name}, Karond Square, Bhopal.`
    : `Browse all new and trending men's wear at ${site.name}, Karond Square, Bhopal.`;
  return {
    title,
    description,
    alternates: { canonical: `/collections/${category}` },
    openGraph: { title: `${title} | ${site.name}`, description, url: `/collections/${category}` },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[category]">) {
  const { category } = await params;
  const cat = category === "all" ? undefined : await getCategory(category);
  if (category !== "all" && !cat) notFound();

  const [products, categories] = await Promise.all([cat ? getProductsByCategory(cat.slug) : getAllProducts(), getCategories()]);

  return (
    <Container className="py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap gap-1.5">
          <li><Link href="/" className="hover:text-ink hover:underline">Home</Link> /</li>
          <li>{cat ? <><Link href="/collections/all" className="hover:text-ink hover:underline">Shop</Link> /</> : <span aria-current="page">Shop</span>}</li>
          {cat && <li aria-current="page">{cat.name}</li>}
        </ol>
      </nav>
      <header className="mb-8 mt-3">
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{cat ? cat.name : "All Products"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {cat ? cat.description : "Every style in store right now: tees, shirts, denim, cargos, hoodies, co-ords and more."}
        </p>
      </header>

      {/*
        CollectionView reads filters from the URL, so it renders in the browser.
        The fallback is the full, server-rendered product grid: it shows instantly
        and keeps every product link crawlable for search engines.
      */}
      <Suspense fallback={<ProductGrid products={products} />}>
        <CollectionView products={products} categories={categories} currentCategory={category} />
      </Suspense>
    </Container>
  );
}
