import { AdminNav } from "@/components/admin/AdminNav";

// Admin pages read the login cookie on every request, so they always render on the server.
// Each admin page repeats this, because it only covers navigations coming from outside /admin.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-8">{children}</main>
    </>
  );
}
