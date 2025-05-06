import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import { CocktailCard } from "@/components/cocktail-card";
import { Cocktail } from "@/types/cocktail";
import Link from "next/link";
import { translations } from "@/translations/index";
import { Metadata } from "next";
import { ExternalLink } from "@/components/external-link";
import { cocktailService } from "@/services/cocktail-service";

type Props = {
  params: Promise<{ language: string; slug: string }>;
};

export default async function IngredientPage({ params }: Props) {
  const { language, slug } = await params;
  const t = translations[language as keyof typeof translations];

  if (!validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  const matchingCocktails = cocktailService.getCocktailsByIngredient(slug);

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

      <ExternalLink message={t.feedbackMessage} />

      <div className="mt-8 grid grid-cols-1 gap-4">
        {matchingCocktails.map((cocktail) => (
          <Link
            key={cocktail.name.en}
            href={`/${language}/cocktails/${cocktail.slug}`}
          >
            <CocktailCard cocktail={cocktail as Cocktail} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const allIngredients = cocktailService.getAllIngredients();
  return allIngredients.flatMap((ingredient: string) => [
    { language: "en", slug: ingredient },
    { language: "zh", slug: ingredient },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language, slug } = await params;
  const t = translations[language as keyof typeof translations];

  const matchingCocktails = cocktailService.getCocktailsByIngredient(slug);
  const ingredient =
    matchingCocktails.length > 0
      ? [
          ...matchingCocktails[0].base_spirits,
          ...matchingCocktails[0].liqueurs,
          ...matchingCocktails[0].ingredients,
        ].find((ingredient) => slugify(ingredient.name.en) === slug)
      : null;

  if (!ingredient) {
    return {
      title: t.appName,
    };
  }

  return {
    title: `${t.cocktailsWithIngredient.replace(
      "{ingredient}",
      getLocalizedText(ingredient.name, language)
    )} | ${t.appName}`,
    description: `${t.cocktailsWithIngredient.replace(
      "{ingredient}",
      getLocalizedText(ingredient.name, language)
    )} | ${t.appName}`,
    openGraph: {
      title: `${t.cocktailsWithIngredient.replace(
        "{ingredient}",
        getLocalizedText(ingredient.name, language)
      )} | ${t.appName}`,
      description: `${t.cocktailsWithIngredient.replace(
        "{ingredient}",
        getLocalizedText(ingredient.name, language)
      )} | ${t.appName}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${t.cocktailsWithIngredient.replace(
        "{ingredient}",
        getLocalizedText(ingredient.name, language)
      )} | ${t.appName}`,
      description: `${t.cocktailsWithIngredient.replace(
        "{ingredient}",
        getLocalizedText(ingredient.name, language)
      )} | ${t.appName}`,
    },
  };
}
