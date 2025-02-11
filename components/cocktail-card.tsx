"use client";

import { slugify } from "@/lib/utils";
import { Cocktail } from "@/types/cocktail";
import { useRouter } from "next/navigation";

interface CocktailCardProps {
  cocktail: Cocktail;
}

export function CocktailCard({ cocktail }: CocktailCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/cocktails/${slugify(cocktail.name)}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/cocktails/${slugify(cocktail.name)}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  return (
    <div 
      className="border rounded-3xl bg-neutral-900 p-6 cursor-pointer hover:bg-neutral-800 transition-colors"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="mb-4 text-2xl">{cocktail.name}</h3>
      </div>
      <ul className="mt-1">
        {[...cocktail.baseSpirits, ...cocktail.ingredients].map(
          (item, index) => (
            <li key={index} className="flex justify-between">
              {item.name}
              <span className="text-gray-400">
                {item.amount} {item.unit}
              </span>
            </li>
          )
        )}
      </ul>

      {cocktail.technique && (
        <div className="mt-4">
          <h4 className="text-gray-400">Preparation</h4>
          <p className="mt-1">{cocktail.technique}</p>
        </div>
      )}

      {cocktail.garnish && (
        <div className="mt-4">
          <h4 className="text-gray-400">Garnish</h4>
          <p className="mt-1">{cocktail.garnish}</p>
        </div>
      )}

      <div className="mt-4 text-sm">
        <p>Sweetness: {cocktail.flavor_profile.sweetness}</p>
        <p>Sourness: {cocktail.flavor_profile.sourness}</p>
        <p>Body: {cocktail.flavor_profile.body}</p>
        <p>Complexity: {cocktail.flavor_profile.complexity}</p>
        <p>Booziness: {cocktail.flavor_profile.booziness}</p>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        className="mt-4 w-full px-3 py-2 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-full"
      >
        Share
      </button>
    </div>
  );
} 