import { Suspense } from 'react';
import { Loading } from "@/components/ui/loading";
import { FeedsContainer } from "@/components/feeds/FeedsContainer";

export default function FeedsPage() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <FeedsContainer />
    </Suspense>
  );
} 