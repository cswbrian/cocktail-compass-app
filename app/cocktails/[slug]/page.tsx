import cocktails from "@/data/cocktails.json";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import FlavorRadar from "@/components/flavor-radar";

export default async function CocktailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cocktail = cocktails.find(
    (cocktail) => slugify(cocktail.name) === slug
  );

  if (!cocktail) {
    return <div>Cocktail not found</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-6">{cocktail.name}</h1>

        {cocktail.flavor_descriptors && (
          <div className="mb-6">
            <h2 className="font-bold mb-2">Flavor Notes</h2>
            <div className="flex flex-wrap gap-2">
              {cocktail.flavor_descriptors.map((descriptor, i) => (
                <Link
                  href={`/flavours/${slugify(descriptor)}`}
                  key={i}
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors"
                >
                  {descriptor}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <FlavorRadar flavorProfile={cocktail.flavor_profile} />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="font-bold mb-2">Ingredients</h2>
            <ul className="space-y-2">
              {cocktail.baseSpirits.map((spirit, i) => (
                <li key={i} className="flex justify-between">
                  <Link
                    href={`/ingredients/${slugify(spirit.name)}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {spirit.name}
                  </Link>
                  <span className="text-gray-400">
                    {spirit.amount} {spirit.unit}
                  </span>
                </li>
              ))}
              {cocktail.liqueurs.map((liqueur, i) => (
                <li key={i} className="flex justify-between">
                  {liqueur.name}
                  <span className="text-gray-400">
                    {liqueur.amount} {liqueur.unit}
                  </span>
                </li>
              ))}
              {cocktail.ingredients.map((ingredient, i) => (
                <li key={i} className="flex justify-between">
                  {ingredient.name}
                  <span className="text-gray-400">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {cocktail.garnish && (
            <h4 className="text-gray-400">Garnish: {cocktail.garnish}</h4>
          )}

          <div>
            <h2 className="font-bold mb-4">Instructions</h2>
            <p className="text-gray-300">{cocktail.technique}</p>
          </div>
        </div>

        {cocktail.description && (
          <p className="mt-8 text-gray-300">{cocktail.description}</p>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return cocktails.map((cocktail) => ({
    slug: slugify(cocktail.name),
  }));
}
