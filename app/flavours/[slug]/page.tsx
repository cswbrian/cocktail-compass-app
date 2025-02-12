import cocktails from "@/data/cocktails.json";
import { slugify } from "@/lib/utils";
import { CocktailCard } from "@/components/cocktail-card";
import { Cocktail } from "@/types/cocktail";

export default async function FlavorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find all cocktails that have this flavor descriptor
  const matchingCocktails = cocktails.filter(cocktail => 
    cocktail.flavor_descriptors.some(descriptor => slugify(descriptor) === slug)
  );

  if (matchingCocktails.length === 0) {
    return <div>No cocktails found with this flavor profile</div>;
  }

  // Get the flavor name from the first match
  const flavorName = matchingCocktails[0].flavor_descriptors.find(
    descriptor => slugify(descriptor) === slug
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-6">Cocktails with {flavorName} flavor</h1>
        
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
  // Get all unique flavor descriptors
  const allFlavors = new Set<string>();
  
  cocktails.forEach(cocktail => {
    cocktail.flavor_descriptors.forEach(flavor => {
      allFlavors.add(slugify(flavor));
    });
  });

  return Array.from(allFlavors).map(flavor => ({
    slug: flavor
  }));
} 