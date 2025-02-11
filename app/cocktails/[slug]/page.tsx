import cocktails from "@/data/cocktails.json";
import { slugify } from "@/lib/utils";

export default async function CocktailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cocktail = cocktails.find(
    (cocktail) =>
      slugify(cocktail.name) === slug
  );

  if (!cocktail) {
    return <div>Cocktail not found</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-6">{cocktail.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-bold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {cocktail.baseSpirits.map((spirit, i) => (
                <li key={i} className="flex justify-between">
                  {spirit.name}
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
            <div className="mt-6">
              <h4 className="text-gray-400">Garnish: {cocktail.garnish}</h4>
            </div>
          )}

          <div>
            <h2 className="font-bold mb-4">Instructions</h2>
            <p className="text-gray-300">{cocktail.technique}</p>
          </div>
        </div>

        <div className="mt-8 text-sm">
          <h2 className="font-bold mb-4">Flavour Profile</h2>
          <div className="space-y-1">
            <p>Sweetness: {cocktail.flavor_profile.sweetness}</p>
            <p>Sourness: {cocktail.flavor_profile.sourness}</p>
            <p>Body: {cocktail.flavor_profile.body}</p>
            <p>Complexity: {cocktail.flavor_profile.complexity}</p>
            <p>Booziness: {cocktail.flavor_profile.booziness}</p>
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
