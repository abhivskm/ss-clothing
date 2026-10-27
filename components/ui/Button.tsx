import Link from "next/link";
import { cx } from "@/lib/cx";

type Variant = "dark" | "outline" | "accent" | "whatsapp" | "light";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-white border-ink hover:bg-neutral-800",
  outline: "bg-white text-ink border-ink hover:bg-ink hover:text-white",
  accent: "bg-accent text-white border-accent hover:bg-accent-dark",
  // Black text on WhatsApp green keeps AA contrast (white text does not)
  whatsapp: "bg-whatsapp text-ink border-whatsapp hover:brightness-95",
  light: "bg-white text-ink border-white hover:bg-neutral-100",
};

export const buttonClass = (variant: Variant = "dark", className?: string) =>
  cx(
    "inline-flex items-center justify-center gap-2 border px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors",
    variants[variant],
    className
  );

/** A link styled as a button. External links open in a new tab. */
export function ButtonLink({
  href,
  variant = "dark",
  className,
  children,
  external,
  label,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
  /** Accessible name, for icon-only buttons */
  label?: string;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={buttonClass(variant, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={label} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
