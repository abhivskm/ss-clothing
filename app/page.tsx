import { CategoryTiles } from "@/components/home/CategoryTiles";
import { HeroSlider } from "@/components/home/HeroSlider";
import { InstagramSection } from "@/components/home/InstagramSection";
import { WhyStrip } from "@/components/home/WhyStrip";
import { ProductRow } from "@/components/product/ProductRow";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllProducts, getBanners, getCategoriesWithCover, getProductsByTag } from "@/lib/products";

export default async function HomePage() {
  const [banners, categories, newArrivals, trending, all] = await Promise.all([
    getBanners(),
    getCategoriesWithCover(),
    getProductsByTag("new", 10),
    getProductsByTag("trending", 10),
    getAllProducts(),
  ]);

  // Placeholder Instagram tiles: a lifestyle shot from several products
  const instaImages = all.slice(0, 6).map((p) => p.images[p.images.length > 2 ? 2 : 0]);

  return (
    <>
      <Container className="pt-4 lg:pt-6">
        <HeroSlider banners={banners} />
      </Container>

      <section aria-labelledby="cat-heading" className="py-14">
        <Container>
          <SectionHeading id="cat-heading" title="Shop by Category" subtitle="A to Z men's wear, all under one roof" href="/collections/all" linkLabel="Shop all" />
          <Reveal>
            <CategoryTiles categories={categories} />
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="new-heading" className="pb-14">
        <Container>
          <SectionHeading id="new-heading" title="New Arrivals" subtitle="Fresh in store this week" href="/collections/all?tag=new" />
          <Reveal>
            <ProductRow products={newArrivals} label="New arrivals" />
          </Reveal>
        </Container>
      </section>

      <WhyStrip />

      <section aria-labelledby="trending-heading" className="py-14">
        <Container>
          <SectionHeading id="trending-heading" title="Trending Now" subtitle="What Bhopal is wearing right now" href="/collections/all?tag=trending" />
          <Reveal>
            <ProductRow products={trending} label="Trending now" />
          </Reveal>
        </Container>
      </section>

      <div className="border-t border-line">
        <InstagramSection images={instaImages} />
      </div>
    </>
  );
}
