import { cx } from "@/lib/cx";

/**
 * Fades its children up as they scroll into view.
 * Pure CSS (scroll-driven animation, see `reveal` in globals.css): content is
 * always visible, and browsers without support simply skip the animation.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("reveal", className)}>{children}</div>;
}
