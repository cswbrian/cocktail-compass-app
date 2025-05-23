import { Suspense } from 'react';
import { useCocktailDetails } from '@/hooks/useCocktailDetails';
import { Loading } from '@/components/ui/loading';
import { SearchContainer } from '@/components/search/SearchContainer';

export default function SearchPage() {
  const { cocktailDetails, isLoading } =
    useCocktailDetails();

  // Combine static and custom cocktails
  const cocktails = [
    ...(cocktailDetails?.map(cocktail => ({
      id: cocktail.id,
      slug: cocktail.slug,
      name: cocktail.name,
      categories: cocktail.categories,
      flavor_descriptors: cocktail.flavor_descriptors,
    })) || []),
  ];

  return (
    <Suspense fallback={<Loading fullScreen size="lg" />}>
      <div className="px-6">
        <SearchContainer cocktails={cocktails} />
      </div>
    </Suspense>
  );
}
