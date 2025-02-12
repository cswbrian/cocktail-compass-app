import cocktails from "@/data/cocktails.json";
import { slugify } from "@/lib/utils";
import { CocktailCard } from "@/components/cocktail-card";
import { Cocktail } from "@/types/cocktail";

export default async function IngredientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find all cocktails that contain this ingredient
  const matchingCocktails = cocktails.filter(cocktail => {
    const allIngredients = [
      ...cocktail.baseSpirits,
      ...cocktail.liqueurs,
      ...cocktail.ingredients
    ];
    return allIngredients.some(ingredient => slugify(ingredient.name) === slug);
  });

  if (matchingCocktails.length === 0) {
    return <div>No cocktails found with this ingredient</div>;
  }

  // Get the ingredient name from the first match
  const ingredientName = [
    ...matchingCocktails[0].baseSpirits,
    ...matchingCocktails[0].liqueurs,
    ...matchingCocktails[0].ingredients
  ].find(ingredient => slugify(ingredient.name) === slug)?.name;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-6">Cocktails with {ingredientName}</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {matchingCocktails.map((cocktail) => (
            <CocktailCard key={cocktail.name} cocktail={cocktail as Cocktail} />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // Get all unique ingredients
  const allIngredients = new Set<string>();
  
  cocktails.forEach(cocktail => {
    const ingredients = [
      ...cocktail.baseSpirits,
      ...cocktail.liqueurs,
      ...cocktail.ingredients
    ];
    ingredients.forEach(ingredient => {
      allIngredients.add(slugify(ingredient.name));
    });
  });

  return Array.from(allIngredients).map(slug => ({
    slug,
  }));
} 