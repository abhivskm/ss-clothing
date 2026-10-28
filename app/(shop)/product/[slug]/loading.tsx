import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-6 lg:py-8" >
      <Skeleton className="mb-5 h-3 w-48" />
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14" role="status" aria-label="Loading product">
        <div className="flex flex-col-reverse gap-3 lg:flex-row">
          <div className="flex gap-2 lg:w-20 lg:flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-3/4 w-16 lg:w-full" />
            ))}
          </div>
          <Skeleton className="aspect-3/4 flex-1" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </Container>
  );
}
