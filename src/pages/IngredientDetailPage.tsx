import { useParams } from "react-router-dom";
import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import { CocktailCard } from "@/components/cocktail-card";
import { Cocktail } from "@/types/cocktail";
import { Link } from "react-router-dom";
import { translations } from "@/translations/index";
import { ExternalLink } from "@/components/external-link";
import { cocktailService } from "@/services/cocktail-service";
import { ingredientService, Ingredient, IngredientType } from "@/services/ingredient-service";
import { useEffect, useState } from "react";

export default function IngredientDetailPage() {
  const { language, slug } = useParams();
  const t = translations[language as keyof typeof translations];
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [matchingCocktails, setMatchingCocktails] = useState<Cocktail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!language || !slug) return;
      
      setIsLoading(true);
      try {
        // Get ingredient details
        const ingredients = await ingredientService.getIngredientsBySlug(slug);
        if (ingredients.length > 0) {
          setIngredient(ingredients[0]);
          // Get matching cocktails
          const cocktails = await cocktailService.getCocktailsByIngredientId(ingredients[0].id);
          setMatchingCocktails(cocktails);
        }
      } catch (error) {
        console.error('Error loading ingredient data:', error);
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
          {language === "en" ? ingredient.nameEn : ingredient.nameZh}
        </h1>
        <p className="text-gray-600">
          {getIngredientTypeLabel(ingredient.type)}
        </p>
      </div>

      <h2 className="text-2xl mb-4">
        {t.cocktailsWithIngredient.replace(
          "{ingredient}",
          language === "en" ? ingredient.nameEn : ingredient.nameZh
        )}
      </h2>

      <ExternalLink message={t.feedbackMessage} />

      {matchingCocktails.length === 0 ? (
        <div className="mt-8 text-gray-600">
          {t.noCocktailsFound}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4">
          {matchingCocktails.map((cocktail) => (
            <Link
              key={cocktail.slug}
              to={`/${language}/cocktails/${cocktail.slug}`}
            >
              <CocktailCard cocktail={cocktail as Cocktail} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 