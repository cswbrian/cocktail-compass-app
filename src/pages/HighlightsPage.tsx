import { Suspense } from 'react';
import { Loading } from "@/components/ui/loading";
import { HighlightsClient } from "@/components/journal/highlights-client";

export default function HighlightsPage() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <HighlightsClient />
    </Suspense>
  );
} 