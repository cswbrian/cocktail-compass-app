import { Suspense } from 'react';
import useSWR from 'swr';
import { Loading } from '@/components/ui/loading';
import { SearchContainer } from '@/components/search/SearchContainer';
import { CACHE_KEYS, fetchers } from '@/lib/swr-config';

export default function SearchPage() {
  const { data: cocktailList } = useSWR(
    CACHE_KEYS.COCKTAIL_LIST,
    fetchers.getCocktailList,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
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
