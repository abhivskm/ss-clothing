import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="h-[60svh] max-h-[680px] w-full" />
      <Container className="py-14">
        <Skeleton className="mb-6 h-7 w-56" />
        <ProductGridSkeleton count={4} />
      </Container>
    </>
  );
}
