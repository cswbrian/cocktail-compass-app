import { useParams } from 'react-router-dom';
import { slugify, validLanguages } from '@/lib/utils';
import { CocktailCard } from '@/components/cocktail-card';
import { Cocktail } from '@/types/cocktail';
import { Link } from 'react-router-dom';
import { translations } from '@/translations/index';
import { ExternalLink } from '@/components/external-link';
// Explorer-only: local static data instead of Supabase
// import { cocktailService } from '@/services/cocktail-service';
import { staticCocktailService } from '@/services/static-cocktail-service';
// import {
//   ingredientService,
//   Ingredient,
//   IngredientType,
// } from '@/services/ingredient-service';
import { useEffect, useState } from 'react';

type IngredientType = 'base_spirit' | 'liqueur' | 'ingredient';

type LocalIngredient = {
  slug: string;
  type: IngredientType;
  nameEn: string;
  nameZh: string;
};

async function resolveIngredientFromStatic(
  slug: string,
): Promise<{
  ingredient: LocalIngredient;
  cocktails: Cocktail[];
} | null> {
  const cocktails =
    await staticCocktailService.getStaticCocktailsByIngredient(
      slug,
    );
  if (cocktails.length === 0) return null;

  for (const cocktail of cocktails) {
    const groups: [IngredientType, Cocktail['base_spirits']][] = [
      ['base_spirit', cocktail.base_spirits ?? []],
      ['liqueur', cocktail.liqueurs ?? []],
      ['ingredient', cocktail.ingredients ?? []],
    ];
    for (const [type, list] of groups) {
      const match = list.find(
        ing => slugify(ing.name.en) === slug,
      );
      if (match) {
        return {
          ingredient: {
            slug,
            type,
            nameEn: match.name.en,
            nameZh: match.name.zh,
          },
          cocktails,
        };
      }
    }
  }

  return null;
}

export default function IngredientDetailPage() {
  const { language, slug } = useParams();
  const t =
    translations[language as keyof typeof translations];
  const [ingredient, setIngredient] =
    useState<LocalIngredient | null>(null);
  const [matchingCocktails, setMatchingCocktails] =
    useState<Cocktail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!language || !slug) return;

      setIsLoading(true);
      try {
        // Explorer-only: was ingredientService + cocktailService (Supabase)
        const resolved =
          await resolveIngredientFromStatic(slug);
        if (resolved) {
          setIngredient(resolved.ingredient);
          setMatchingCocktails(resolved.cocktails);
        } else {
          setIngredient(null);
          setMatchingCocktails([]);
        }
      } catch (error) {
        console.error(
          'Error loading ingredient data:',
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [language, slug]);

  if (!language || !validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!ingredient) {
    return <div className="p-6">No ingredient found</div>;
  }

  const getIngredientTypeLabel = (type: IngredientType) => {
    switch (type) {
      case 'base_spirit':
        return t.baseSpirit;
      case 'liqueur':
        return t.liqueur;
      case 'ingredient':
        return t.ingredient;
      default:
        return type;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">
          {language === 'en'
            ? ingredient.nameEn
            : ingredient.nameZh}
        </h1>
        <p className="text-gray-600">
          {getIngredientTypeLabel(ingredient.type)}
        </p>
      </div>

      <h2 className="text-2xl mb-4">
        {t.cocktailsWithIngredient.replace(
          '{ingredient}',
          language === 'en'
            ? ingredient.nameEn
            : ingredient.nameZh,
        )}
      </h2>

      <ExternalLink message={t.feedbackMessage} />

      {matchingCocktails.length === 0 ? (
        <div className="mt-8 text-gray-600">
          {t.noCocktailsFound}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4">
          {matchingCocktails.map(cocktail => (
            <Link
              key={cocktail.slug}
              to={`/${language}/cocktails/${cocktail.slug}`}
            >
              <CocktailCard
                cocktail={cocktail as Cocktail}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
