import { Suspense } from 'react';
import { Loading } from "@/components/ui/loading";
import { HighlightsClient } from "@/components/journal/highlights-client";

export default async function HighlightsPage() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <HighlightsClient />
    </Suspense>
  );
} 

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}