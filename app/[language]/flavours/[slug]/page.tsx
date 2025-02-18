import cocktails from "@/data/cocktails.json";
import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import { CocktailCard } from "@/components/cocktail-card";
import { Cocktail } from "@/types/cocktail";
import Link from "next/link";
import { translations } from "@/translations/index";

export default async function FlavorsPage({ 
  params 
}: { 
  params: Promise<{ language: string; slug: string }> 
}) {
  const { language, slug } = await params;
  const t = translations[language as keyof typeof translations];
  
  if (!validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  const matchingCocktails = cocktails.filter(cocktail => 
    cocktail.flavor_descriptors.some(descriptor => slugify(descriptor.en) === slug)
  );

  if (matchingCocktails.length === 0) {
    return <div>No cocktails found with this flavor profile</div>;
  }

  const flavorName = matchingCocktails[0].flavor_descriptors.find(
    descriptor => slugify(descriptor.en) === slug
  );

  if (!flavorName) {
    return <div>No flavor name found</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-6">
          {t.cocktailsWithFlavor.replace(
            '{flavor}', 
            getLocalizedText(flavorName, language)
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
    </div>
  );
}

export async function generateStaticParams() {
  const allFlavors = new Set<string>();
  
  cocktails.forEach(cocktail => {
    cocktail.flavor_descriptors.forEach(flavor => {
      allFlavors.add(slugify(flavor.en));
    });
  });

  return Array.from(allFlavors).flatMap(flavor => [
    { language: 'en', slug: flavor },
    { language: 'zh', slug: flavor }
  ]);
} 