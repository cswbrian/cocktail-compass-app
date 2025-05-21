import { Suspense } from 'react';
import { cocktailService } from "@/services/cocktail-service";
import { Loading } from "@/components/ui/loading";
import { SearchContainer } from "@/components/search/SearchContainer";

export default function SearchPage() {
  const cocktails = cocktailService.getAllCocktails();

  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <div className="px-6">
        <SearchContainer cocktails={cocktails} />
      </div>
    </Suspense>
  );
} 