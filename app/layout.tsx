import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/layout/Logo";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { getCategoriesWithCover } from "@/lib/products";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.fullName}, Bhopal`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["men's clothing Bhopal", "Karond Square", "oversized t-shirts", "baggy jeans", "cargo pants", "Gen Z fashion", site.fullName],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    title: `${site.name} | ${site.fullName}`,
    description: site.description,
    images: [{ url: "/images/banners/hero-denim.jpg", width: 1920, height: 1000, alt: `${site.name} new arrivals` }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategoriesWithCover();

  return (
    <html lang="en-IN" className={`${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
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
      </body>
    </html>
  );
}
