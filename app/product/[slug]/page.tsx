import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductOptions } from "@/components/product/ProductOptions";
import { ProductRow } from "@/components/product/ProductRow";
import { StoreBlock } from "@/components/product/StoreBlock";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Price } from "@/components/ui/Price";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/format";
import { getAllProducts, getCategory, getProductBySlug, getRelatedProducts } from "@/lib/products";
import { site, siteUrl } from "@/lib/site";

/** Prebuild every product page at build time. */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = `${product.name} at ${formatPrice(product.price)}. ${product.description} Available at ${site.name}, Karond Square, Bhopal.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description,
      url: `/product/${slug}`,
      images: product.images.slice(0, 2).map((url) => ({ url, width: 900, height: 1200, alt: product.name })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([getCategory(product.category), getRelatedProducts(product)]);
  const pageUrl = `${siteUrl}/product/${product.slug}`;

  // Structured data so Google can show price and availability in search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => `${siteUrl}${src}`),
    sku: product.id,
    category: category?.name,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: site.fullName },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Container className="py-6 lg:py-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href="/" className="hover:text-ink hover:underline">Home</Link> /</li>
            {category && (
              <li><Link href={`/collections/${category.slug}`} className="hover:text-ink hover:underline">{category.name}</Link> /</li>
            )}
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <Badge key={t} kind={t} className={t === "bestseller" ? "border border-line" : undefined} />
              ))}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {product.subcategory}
              {category && <> · {category.name}</>}
            </p>

            <div className="my-5 border-y border-line py-4">
              <Price price={product.price} mrp={product.mrp} size="lg" />
              <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
            </div>

            <ProductOptions product={product} pageUrl={pageUrl} />

            <div className="mt-8 space-y-5">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest">Product details</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{product.description}</p>
              </div>
              <dl className="grid grid-cols-2 border border-line text-sm">
                <div className="border-b border-r border-line p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted">Fabric</dt>
                  <dd className="mt-0.5 font-semibold">{product.fabric}</dd>
                </div>
                <div className="border-b border-line p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted">Fit</dt>
                  <dd className="mt-0.5 font-semibold">{product.fit}</dd>
                </div>
                <div className="border-r border-line p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted">Sizes</dt>
                  <dd className="mt-0.5 font-semibold">{product.sizes.join(", ")}</dd>
                </div>
                <div className="p-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted">Colours</dt>
                  <dd className="mt-0.5 font-semibold">{product.colors.map((c) => c.name).join(", ")}</dd>
                </div>
              </dl>
              <StoreBlock />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="py-12">
          <Container>
            <SectionHeading id="related-heading" title="You may also like" href={`/collections/${product.category}`} />
            <ProductRow products={related} label="Related products" />
          </Container>
        </section>
      )}
    </>
  );
}
