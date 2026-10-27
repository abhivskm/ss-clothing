import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ className = "h-11 w-auto sm:h-12" }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className="inline-flex shrink-0">
      <Image src="/logo.png" alt={`${site.name} logo`} width={190} height={185} className={className} preload />
    </Link>
  );
}
