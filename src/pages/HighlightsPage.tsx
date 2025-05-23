import { Suspense } from 'react';
import { Loading } from '@/components/ui/loading';
import { HighlightsContainer } from '@/components/journal/HighlightsContainer';

export default function HighlightsPage() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <HighlightsContainer />
    </Suspense>
  );
}
