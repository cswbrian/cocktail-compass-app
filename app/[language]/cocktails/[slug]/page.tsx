import cocktails from "@/data/cocktails.json";
import { slugify, getLocalizedText, validLanguages } from "@/lib/utils";
import Link from "next/link";
import FlavorRadar from "@/components/flavor-radar";
import { translations } from "@/translations";
import ReactMarkdown from "react-markdown";
import { FlavorDescriptor } from "@/components/flavor-descriptor";
import { Metadata } from 'next';

type Props = {
  params: Promise<{ language: string; slug: string }>
}

// Update color mapping with all flavors
const flavorColorMap: { [key: string]: string } = {
  'bitter': 'rgba(139, 69, 19, 0.5)',      // Brown
  'salty': 'rgba(0, 191, 255, 0.5)',      // Light Blue
  'umami': 'rgba(255, 140, 0, 0.5)',      // Dark Orange
  'fruity': 'rgba(255, 99, 132, 0.5)',    // Pink
  'citrus': 'rgba(255, 215, 0, 0.5)',     // Gold
  'herbal': 'rgba(50, 205, 50, 0.5)',     // Lime Green
  'spicy': 'rgba(255, 69, 0, 0.5)',       // Red-Orange
  'floral': 'rgba(255, 20, 147, 0.5)',    // Deep Pink
  'tropical': 'rgba(0, 128, 0, 0.5)',     // Green
  'nutty': 'rgba(139, 69, 19, 0.5)',      // Brown
  'chocolate': 'rgba(210, 105, 30, 0.5)', // Chocolate
  'coffee': 'rgba(101, 67, 33, 0.5)',     // Coffee
  'vanilla': 'rgba(245, 222, 179, 0.5)',  // Vanilla
  'smoky': 'rgba(112, 128, 144, 0.5)',    // Slate Gray
  'earth': 'rgba(139, 69, 19, 0.5)',      // Sienna
  'savory': 'rgba(255, 140, 0, 0.5)',     // Dark Orange
  'creamy': 'rgba(255, 228, 196, 0.5)',   // Bisque
  'woody': 'rgba(101, 67, 33, 0.5)',      // Wood
  'grassy': 'rgba(34, 139, 34, 0.5)',     // Forest Green
  'yeasty': 'rgba(218, 165, 32, 0.5)'     // Goldenrod
};

export default async function CocktailPage({
  params,
}: Props) {
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

  // Get the first flavor descriptor's color
  const color = cocktail.flavor_descriptors && cocktail.flavor_descriptors.length > 0 
    ? flavorColorMap[cocktail.flavor_descriptors[0].en.toLowerCase()] || 'rgba(255, 185, 0, 0.5)' 
    : 'rgba(255, 185, 0, 0.5)';

  return (
    <div className="p-6">
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
        <FlavorRadar flavorProfile={cocktail.flavor_profile} t={t} color={color} />
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
                  href={`/${language}/ingredients/${slugify(liqueur.name.en)}`}
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

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { language, slug } =  await params;
  const cocktail = cocktails.find(
    (cocktail) => slugify(cocktail.name.en) === slug
  );

  if (!cocktail) {
    return {
      title: translations[language as keyof typeof translations].appName,
    };
  }


  return {
    title: `${cocktail.name.en} | ${translations[language as keyof typeof translations].appName}`,
    description: `${translations[language as keyof typeof translations].cocktailsWithFlavor.replace('{flavor}', cocktail.flavor_descriptors?.[0]?.[language as keyof typeof cocktail.flavor_descriptors[0]] || '')} | ${getLocalizedText(cocktail.description, language)}`,
    openGraph: {
      title: `${cocktail.name.en} | ${translations[language as keyof typeof translations].appName}`,
      description: `${translations[language as keyof typeof translations].cocktailsWithFlavor.replace('{flavor}', cocktail.flavor_descriptors?.[0]?.[language as keyof typeof cocktail.flavor_descriptors[0]] || '')} | ${getLocalizedText(cocktail.description, language)}`,
      // images: cocktail.image ? [{ url: cocktail.image }] : [{ url: defaultImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cocktail.name[language as keyof typeof cocktail.name]} - ${translations[language as keyof typeof translations].appName}`,
      description: `${translations[language as keyof typeof translations].cocktailsWithFlavor.replace('{flavor}', cocktail.flavor_descriptors?.[0]?.[language as keyof typeof cocktail.flavor_descriptors[0]] || '')} | ${getLocalizedText(cocktail.description, language)}`,
      // images: cocktail.image ? cocktail.image : defaultImage,
    },
  };
}
