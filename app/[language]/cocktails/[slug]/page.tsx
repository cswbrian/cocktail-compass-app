import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import Link from "next/link";
import FlavorRadar from "@/components/flavor-radar";
import { translations } from "@/translations";
import ReactMarkdown from "react-markdown";
import { FlavorDescriptor } from "@/components/flavor-descriptor";
import { Metadata } from "next";
import { ShareButton } from "@/components/share-button";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ExternalLink } from "@/components/external-link";
import { Search } from "lucide-react";
import { flavorColorMap } from "@/constants";
import { TwistButton } from "@/components/twist-button";
import { cocktailService } from "@/services/cocktail-service";

type Props = {
  params: Promise<{ language: string; slug: string }>;
};

export default async function CocktailPage({ params }: Props) {
  const { language, slug } = await params;

  if (!validLanguages.includes(language)) {
    return <div>Invalid language</div>;
  }

  const cocktail = cocktailService.getCocktailBySlug(slug);

  if (!cocktail) {
    return <div>Cocktail not found</div>;
  }

  const t = translations[language as keyof typeof translations];

  // Get the first flavor descriptor's color
  const color =
    cocktail.flavor_descriptors && cocktail.flavor_descriptors.length > 0
      ? flavorColorMap[cocktail.flavor_descriptors[0].en.toLowerCase()] ||
        "rgba(255, 185, 0, 0.5)"
      : "rgba(255, 185, 0, 0.5)";

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-4xl mb-2">{cocktail.name.en}</h1>
          {language === "zh" && (
            <div className="text-gray-400">{cocktail.name.zh}</div>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <BookmarkButton
              cocktailSlug={cocktail.slug}
              cocktailName={cocktail.name.en}
            />
            <ShareButton
              url={
                typeof window !== "undefined"
                  ? `${window.location.origin}/${language}/cocktails/${slug}`
                  : `/${language}/cocktails/${slug}`
              }
            />
          </div>
          <TwistButton 
            href={`/${language}/twist?cocktail=${cocktail.slug}`}
            cocktailName={cocktail.name.en}
          >
            {t.findTwists}
          </TwistButton>
        </div>
      </div>

      {cocktail.flavor_descriptors && (
        <div className="mb-6">
          <h2 className="font-bold mb-2">{t.flavorNotes}</h2>
          <div className="flex flex-wrap gap-2">
            {cocktail.flavor_descriptors.map((descriptor, i) => (
              <FlavorDescriptor
                key={i}
                descriptor={descriptor}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <FlavorRadar
          flavorProfile={cocktail.flavor_profile}
          t={t}
          color={color}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <h2 className="font-bold mb-2">{t.ingredients}</h2>
          <ul className="space-y-2">
            {cocktail.base_spirits.map((spirit, i) => (
              <li key={i} className="flex justify-between">
                <Link
                  href={`/${language}/ingredients/${slugify(spirit.name.en)}`}
                  className="hover:text-blue-400 transition-colors flex flex-wrap items-center gap-x-1"
                >
                  {getLocalizedText(spirit.name, language)}
                  <Search className="w-4 h-4 text-muted-foreground" />
                </Link>
                <span className="text-gray-400">
                  {spirit.amount} {getLocalizedText(spirit.unit, language)}
                </span>
              </li>
            ))}
            {cocktail.liqueurs.map((liqueur, i) => (
              <li key={i} className="flex justify-between">
                <Link
                  href={`/${language}/ingredients/${slugify(liqueur.name.en)}`}
                  className="hover:text-blue-400 transition-colors flex flex-wrap items-center gap-x-1"
                >
                  {getLocalizedText(liqueur.name, language)}
                  <Search className="w-4 h-4 text-muted-foreground" />
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
                  className="hover:text-blue-400 transition-colors flex flex-wrap items-center gap-x-1"
                >
                  {getLocalizedText(ingredient.name, language)}
                  <Search className="w-4 h-4 text-muted-foreground" />
                </Link>
                <span className="text-gray-400">
                  {ingredient.amount}{" "}
                  {getLocalizedText(ingredient.unit, language)}
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

        <ExternalLink message={t.feedbackMessage} />

        <div>
          <h2 className="font-bold mb-4">{t.instructions}</h2>
          <p className="text-gray-300">
            {cocktail.technique ? getLocalizedText(cocktail.technique, language) : ''}
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
  );
}

export async function generateStaticParams() {
  const cocktails = cocktailService.getAllCocktails();
  const params = [];

  for (const cocktail of cocktails) {
    const slug = slugify(cocktail.name.en);
    params.push({ language: "en", slug }, { language: "zh", slug });
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language, slug } = await params;
  const cocktail = cocktailService.getCocktailBySlug(slug);

  if (!cocktail) {
    return {
      title: translations[language as keyof typeof translations].appName,
    };
  }

  const description = cocktail.description 
    ? getLocalizedText(cocktail.description, language)
    : '';

  return {
    title: `${cocktail.name.en} | ${
      translations[language as keyof typeof translations].appName
    }`,
    description: `${translations[
      language as keyof typeof translations
    ].cocktailsWithFlavor.replace(
      "{flavor}",
      cocktail.flavor_descriptors?.[0]?.[
        language as keyof (typeof cocktail.flavor_descriptors)[0]
      ] || ""
    )} | ${description}`,
    openGraph: {
      title: `${cocktail.name.en} | ${
        translations[language as keyof typeof translations].appName
      }`,
      description: `${translations[
        language as keyof typeof translations
      ].cocktailsWithFlavor.replace(
        "{flavor}",
        cocktail.flavor_descriptors?.[0]?.[
          language as keyof (typeof cocktail.flavor_descriptors)[0]
        ] || ""
      )} | ${description}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${cocktail.name[language as keyof typeof cocktail.name]} - ${
        translations[language as keyof typeof translations].appName
      }`,
      description: `${translations[
        language as keyof typeof translations
      ].cocktailsWithFlavor.replace(
        "{flavor}",
        cocktail.flavor_descriptors?.[0]?.[
          language as keyof (typeof cocktail.flavor_descriptors)[0]
        ] || ""
      )} | ${description}`,
    },
  };
}
