import cocktails from "@/data/cocktails.json";
import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import Link from "next/link";
import FlavorRadar from "@/components/flavor-radar";
import { translations } from "@/translations";
import ReactMarkdown from "react-markdown";

export default async function CocktailPage({
  params,
}: {
  params: Promise<{ language: string; slug: string }>;
}) {
  const { language, slug } = await params;

  if (!validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  const cocktail = cocktails.find(
    (cocktail) => slugify(cocktail.name.en) === slug
  );

  if (!cocktail) {
    return <div>Cocktail not found</div>;
  }

  const t = translations[language as keyof typeof translations];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl mb-2">{cocktail.name.en}</h1>
          {language === "zh" && (
            <div className="text-gray-400 text-xs">{cocktail.name.zh}</div>
          )}
        </div>

        {cocktail.flavor_descriptors && (
          <div className="mb-6">
            <h2 className="font-bold mb-2">{t.flavorNotes}</h2>
            <div className="flex flex-wrap gap-2">
              {cocktail.flavor_descriptors.map((descriptor, i) => (
                <Link
                  href={`/${language}/flavours/${slugify(descriptor.en)}`}
                  key={i}
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors"
                >
                  {getLocalizedText(descriptor, language)}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <FlavorRadar flavorProfile={cocktail.flavor_profile} t={t} />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="font-bold mb-2">{t.ingredients}</h2>
            <ul className="space-y-2">
              {cocktail.base_spirits.map((spirit, i) => (
                <li key={i} className="flex justify-between">
                  <Link
                    href={`/${language}/ingredients/${slugify(spirit.name.en)}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {getLocalizedText(spirit.name, language)}
                  </Link>
                  <span className="text-gray-400">
                    {spirit.amount} {getLocalizedText(spirit.unit, language)}
                  </span>
                </li>
              ))}
              {cocktail.liqueurs.map((liqueur, i) => (
                <li key={i} className="flex justify-between">
                  <Link
                    href={`/${language}/ingredients/${slugify(
                      liqueur.name.en
                    )}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {getLocalizedText(liqueur.name, language)}
                  </Link>
                  <span className="text-gray-400">
                    {liqueur.amount} {getLocalizedText(liqueur.unit, language)}
                  </span>
                </li>
              ))}
              {cocktail.ingredients.map((ingredient, i) => (
                <li key={i} className="flex justify-between">
                  <Link
                    href={`/${language}/ingredients/${slugify(
                      ingredient.name.en
                    )}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {getLocalizedText(ingredient.name, language)}
                  </Link>
                  <span className="text-gray-400">
                    {ingredient.amount} {getLocalizedText(ingredient.unit, language)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {cocktail.garnish && (
            <div>
              <h4 className="text-gray-400">{t.garnish}</h4>
              <p className="text-gray-300">
                {getLocalizedText(cocktail.garnish, language)}
              </p>
            </div>
          )}

          <div>
            <h2 className="font-bold mb-4">{t.instructions}</h2>
            <p className="text-gray-300">
              {getLocalizedText(cocktail.technique, language)}
            </p>
          </div>
        </div>

        {cocktail.description && (
          <div className="mt-8 text-gray-300 prose prose-invert">
            <ReactMarkdown>
              {getLocalizedText(cocktail.description, language)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const params = [];

  for (const cocktail of cocktails) {
    const slug = slugify(cocktail.name.en);
    params.push({ language: "en", slug }, { language: "zh", slug });
  }

  return params;
}
