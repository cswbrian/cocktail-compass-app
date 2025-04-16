import { Suspense } from 'react';
import { TwistFinder } from "@/components/twist-finder/twist-finder";
import { cocktailService } from "@/services/cocktail-service";
import { Loading } from "@/components/ui/loading";

export default function TwistPage() {
  const cocktails = cocktailService.getAllCocktails();

  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <div className="px-6 py-8">
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