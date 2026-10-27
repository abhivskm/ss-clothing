import Link from "next/link";
import { ShirtIcon, SparkleIcon, StoreIcon, TagIcon } from "@/components/ui/Icons";

const POINTS = [
  { icon: SparkleIcon, title: "Latest trends", text: "New drops every week, straight off the streets." },
  { icon: ShirtIcon, title: "Quality fabric", text: "Heavyweight cottons and denim that last." },
  { icon: TagIcon, title: "Affordable prices", text: "Real discounts on MRP, no gimmicks." },
  { icon: StoreIcon, title: "Visit our store", text: "Try it on at Karond Square, Bhopal.", href: "/about" },
];

/** "Why SS Clothing" value strip. */
export function WhyStrip() {
  return (
    <section aria-labelledby="why-heading" className="mx-auto max-w-[1600px] px-4 lg:px-6">
      <h2 id="why-heading" className="sr-only">
        Why SS Clothing
      </h2>
      <ul className="grid grid-cols-2 border border-line bg-surface lg:grid-cols-4">
        {POINTS.map(({ icon: Icon, title, text, href }) => {
          const body = (
            <>
              <Icon className="size-7 shrink-0 text-accent" />
              <span>
                <span className="block text-sm font-extrabold uppercase tracking-wide">{title}</span>
                <span className="mt-0.5 block text-xs text-muted sm:text-sm">{text}</span>
              </span>
            </>
          );
          return (
            <li key={title} className="border-line odd:border-r lg:border-r lg:last:border-r-0 [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0">
              {href ? (
                <Link href={href} className="flex h-full gap-3 p-5 hover:bg-white sm:p-7">
                  {body}
                </Link>
              ) : (
                <div className="flex h-full gap-3 p-5 sm:p-7">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
