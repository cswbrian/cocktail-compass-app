"use client";

import { Link } from "react-router-dom";
import { slugify } from "@/lib/utils";

export const flavorClasses = {
  Bitter: "bg-teal-700 hover:bg-teal-600 text-teal-50 border border-teal-700",
  Salty: "bg-blue-600 hover:bg-blue-500 text-blue-50 border border-blue-600",
  Umami: "bg-orange-600 hover:bg-orange-500 text-orange-50 border border-orange-600",
  Fruity: "bg-orange-500 hover:bg-orange-400 text-orange-50 border border-orange-500",
  Citrus: "bg-yellow-400 hover:bg-yellow-300 text-yellow-900 border border-yellow-400",
  Herbal: "bg-green-600 hover:bg-green-500 text-green-50 border border-green-600",
  Spicy: "bg-red-600 hover:bg-red-500 text-red-50 border border-red-600",
  Floral: "bg-purple-500 hover:bg-purple-400 text-purple-50 border border-purple-500",
  Tropical: "bg-green-700 hover:bg-green-600 text-white border border-green-700",
  Nutty: "bg-amber-800 hover:bg-amber-700 text-amber-50 border border-amber-800",
  Chocolate: "bg-amber-900 hover:bg-amber-800 text-amber-50 border border-amber-900",
  Coffee: "bg-red-900 hover:bg-red-800 text-red-50 border border-red-900",
  Vanilla: "bg-yellow-100 hover:bg-yellow-50 text-yellow-900 border border-yellow-100",
  Smoky: "bg-gray-600 hover:bg-gray-500 text-gray-50 border border-gray-600",
  Earth: "bg-stone-600 hover:bg-stone-500 text-stone-50 border border-stone-600",
  Savory: "bg-orange-700 hover:bg-orange-600 text-orange-50 border border-orange-700",
  Creamy: "bg-yellow-100 hover:bg-yellow-50 text-yellow-900 border border-yellow-100",
  Woody: "bg-amber-900 hover:bg-amber-800 text-amber-50 border border-amber-900",
  Grassy: "bg-lime-500 hover:bg-lime-400 text-lime-50 border border-lime-500",
  Yeasty: "bg-yellow-200 hover:bg-yellow-100 text-yellow-900 border border-yellow-200",
};

interface FlavorDescriptorProps {
  descriptor: {
    en: string;
    zh: string;
  };
  language: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function FlavorDescriptor({ descriptor, language, onClick }: FlavorDescriptorProps) {
  const flavorClass = flavorClasses[descriptor.en as keyof typeof flavorClasses] || "bg-gray-700 text-gray-100";
  
  return (
    <Link
      to={`/${language}/flavours/${slugify(descriptor.en)}`}
      className={`px-3 py-1 rounded-full text-sm hover:opacity-80 transition-colors ${flavorClass}`}
      onClick={onClick}
    >
      {descriptor[language as keyof typeof descriptor]}
    </Link>
  );
} 