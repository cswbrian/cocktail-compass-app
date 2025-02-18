import cocktails from "@/data/cocktails.json";
import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import { CocktailCard } from "@/components/cocktail-card";
import { Cocktail } from "@/types/cocktail";
import Link from "next/link";
import { translations } from "@/translations/index";
export default async function IngredientPage({
  params,
}: {
  params: Promise<{ language: string; slug: string }>;
}) {
  const { language, slug } = await params;
  const t = translations[language as keyof typeof translations];

  if (!validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  const matchingCocktails = cocktails.filter((cocktail) => {
    const allIngredients = [
      ...cocktail.base_spirits,
      ...cocktail.liqueurs,
      ...cocktail.ingredients,
    ];
    return allIngredients.some(
      (ingredient) => slugify(ingredient.name.en) === slug
    );
  });

  if (matchingCocktails.length === 0) {
    return <div>No cocktails found with this ingredient</div>;
  }

  const ingredient = [
    ...matchingCocktails[0].base_spirits,
    ...matchingCocktails[0].liqueurs,
    ...matchingCocktails[0].ingredients,
  ].find((ingredient) => slugify(ingredient.name.en) === slug);

  if (!ingredient) {
    return <div>No ingredient found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl mb-6">
        {t.cocktailsWithIngredient.replace(
          "{ingredient}",
          getLocalizedText(ingredient.name, language)
        )}
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {matchingCocktails.map((cocktail) => (
          <Link
            key={cocktail.name.en}
            href={`/${language}/cocktails/${slugify(cocktail.name.en)}`}
          >
            <CocktailCard cocktail={cocktail as Cocktail} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const allIngredients = new Set<string>();

  cocktails.forEach((cocktail) => {
    const ingredients = [
      ...cocktail.base_spirits,
      ...cocktail.liqueurs,
      ...cocktail.ingredients,
    ];
    ingredients.forEach((ingredient) => {
      allIngredients.add(slugify(ingredient.name.en));
    });
  });

  return Array.from(allIngredients).flatMap((slug) => [
    { language: "en", slug },
    { language: "zh", slug },
  ]);
}
