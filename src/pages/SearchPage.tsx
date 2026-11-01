import { Suspense } from 'react';
import useSWR from 'swr';
import { Loading } from '@/components/ui/loading';
import { SearchContainer } from '@/components/search/SearchContainer';
import { staticCocktailService } from '@/services/static-cocktail-service';

export default function SearchPage() {
  const { data: cocktailList } = useSWR(
    'static-cocktail-list',
    () => staticCocktailService.getStaticCocktails(),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  // Map the cocktail list to the required format
  const cocktails = cocktailList?.map(cocktail => ({
    id: cocktail.id,
    slug: cocktail.slug,
    name: {
      en: cocktail.name.en,
      zh: cocktail.name.zh || '', // Provide empty string as fallback
    },
    categories: [], // These fields are not available in the list view
    flavor_descriptors: [], // These fields are not available in the list view
  })) || [];

  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <div className="px-6">
        <SearchContainer cocktails={cocktails} />
      </div>
    </Suspense>
  );
}
