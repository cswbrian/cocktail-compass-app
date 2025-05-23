import useSWR from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';
import { cocktailService } from '@/services/cocktail-service';

export function useCocktailDetails() {
  const { data, error, mutate } = useSWR(
    CACHE_KEYS.COCKTAIL_DETAILS,
    () => cocktailService.getCocktailDetails(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  return {
    cocktailDetails: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
