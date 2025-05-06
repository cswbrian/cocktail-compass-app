import { Suspense } from 'react';
import { cocktailService } from "@/services/cocktail-service";
import { Loading } from "@/components/ui/loading";
import { SearchClient } from "@/components/search/search-client";

export default async function SearchPage() {
  await cocktailService.initialize();
  const cocktails = cocktailService.getAllCocktails();

  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <div className="px-6">
        <SearchClient cocktails={cocktails} />
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