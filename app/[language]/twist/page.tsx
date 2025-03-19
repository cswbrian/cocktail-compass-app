import { Suspense } from 'react';
import { TwistFinder } from "@/components/twist-finder/twist-finder";
import cocktails from "@/data/cocktails.json";

export default function TwistPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto px-6 py-8">
        <TwistFinder cocktails={cocktails} />
      </div>
    </Suspense>
  );
}

export async function generateStaticParams() {
    return [
      { language: 'en' },
      { language: 'zh' }
    ];
  }