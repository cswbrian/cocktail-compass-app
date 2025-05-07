import { Suspense } from 'react';
import { Loading } from "@/components/ui/loading";
import { JournalClient } from "@/components/journal/journal-client";

export default async function JournalPage() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <JournalClient />
    </Suspense>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 