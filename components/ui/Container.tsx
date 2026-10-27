import { cx } from "@/lib/cx";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-[1600px] px-4 lg:px-6", className)}>{children}</div>;
}
