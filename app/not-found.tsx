import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SiteChrome>
      <Container className="flex flex-col items-center py-24 text-center">
        <p className="text-8xl font-black tracking-tighter text-accent">404</p>
        <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight">This page took the day off</h1>
        <p className="mt-2 max-w-md text-muted">The product may have sold out or the link might be wrong. Check out what&apos;s new instead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/collections/all?tag=new">Shop New Arrivals</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </SiteChrome>
  );
}
