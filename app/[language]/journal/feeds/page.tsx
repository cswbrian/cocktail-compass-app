import { Suspense } from 'react';
import { Loading } from "@/components/ui/loading";
import { FeedsClient } from "@/components/journal/feeds-client";

export default async function FeedsPage() {

  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <FeedsClient />
    </Suspense>
  );
} 


export async function generateStaticParams() {
    return [
      { language: 'en' },
      { language: 'zh' }
    ];
  }