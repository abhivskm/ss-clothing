import Link from "next/link";

/** Section title with an optional "View all" link on the right. */
export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  id,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-xl font-extrabold uppercase tracking-tight sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 border-b-2 border-ink pb-0.5 text-xs font-bold uppercase tracking-widest hover:border-accent hover:text-accent"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
