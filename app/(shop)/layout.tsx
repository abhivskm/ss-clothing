import { SiteChrome } from "@/components/layout/SiteChrome";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}
