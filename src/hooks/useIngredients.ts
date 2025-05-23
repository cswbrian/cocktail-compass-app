import useSWR from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';
import {
  Ingredient,
  IngredientType,
} from '@/services/ingredient-service';
import { ingredientService } from '@/services/ingredient-service';

// Add INGREDIENTS to CACHE_KEYS
const CACHE_KEY = 'ingredients';

export function useIngredients() {
  const { data, error, mutate } = useSWR(
    CACHE_KEY,
    () => ingredientService.getAllIngredients(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  const getIngredientsByType = (type: IngredientType) => {
    return (
      data?.filter(
        (ingredient: Ingredient) =>
          ingredient.type === type,
      ) || []
    );
  };

  return {
    ingredients: data,
    baseSpirits: getIngredientsByType('base_spirit'),
    liqueurs: getIngredientsByType('liqueur'),
    otherIngredients: getIngredientsByType('ingredient'),
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
