import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

/** Shared by the shop (app/(shop)/layout.tsx adds its navbar and footer) and the admin portal. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
