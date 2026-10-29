import { Suspense } from "react";
import { Tracker } from "@/components/analytics/Tracker";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { getCategoriesWithCover } from "@/lib/products";

/** Shop navigation, footer, WhatsApp button and visit tracking around every public page. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesWithCover();

  return (
    <>
      <a href="#main" className="sr-only z-50 bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar categories={categories} logo={<Logo />} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <WhatsAppFloat />
      {/* Reads the URL, which new product pages only know at request time */}
      <Suspense fallback={null}>
        <Tracker />
      </Suspense>
    </>
  );
}
