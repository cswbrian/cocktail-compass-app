"use client";

import { slugify } from "@/lib/utils";
import { Cocktail } from "@/types/cocktail";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    } catch (err) {
      console.error(err);
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
      {cocktail.flavor_descriptors && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {cocktail.flavor_descriptors.map((descriptor, i) => (
              <Link 
                href={`/flavours/${slugify(descriptor)}`}
                key={i}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {descriptor}
              </Link>
            ))}
          </div>
        </div>
      )}
      <ul className="mt-1">
        {[...cocktail.baseSpirits, ...cocktail.liqueurs, ...cocktail.ingredients].map(
          (item, index) => (
            <li key={index} className="flex justify-between">
              <Link 
                href={`/ingredients/${slugify(item.name)}`}
                className="hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {item.name}
              </Link>
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