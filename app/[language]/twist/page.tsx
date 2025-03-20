import { Suspense } from 'react';
import { TwistFinder } from "@/components/twist-finder/twist-finder";
import { WandSparkles } from 'lucide-react';
import cocktails from "@/data/cocktails.json";

export default function TwistPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary">
          <WandSparkles className="w-8 h-8 animate-pulse" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    }>
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