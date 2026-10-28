import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-8 lg:py-10">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-9 w-56" />
      <Skeleton className="mb-8 mt-3 h-4 w-80 max-w-full" />
      <ProductGridSkeleton />
    </Container>
  );
}
