"use client";

import Link from "next/link";
import { slugify } from "@/lib/utils";

const flavorClasses = {
  Bitter: "bg-teal-700 text-teal-50",
  Salty: "bg-blue-600 text-blue-50",
  Umami: "bg-orange-600 text-orange-50",
  Fruity: "bg-orange-500 text-orange-50",
  Citrus: "bg-yellow-400 text-yellow-900",
  Herbal: "bg-green-600 text-green-50",
  Spicy: "bg-red-600 text-red-50",
  Floral: "bg-purple-500 text-purple-50",
  Tropical: "bg-green-700 text-white",
  Nutty: "bg-amber-800 text-amber-50",
  Chocolate: "bg-amber-900 text-amber-50",
  Coffee: "bg-red-900 text-red-50",
  Vanilla: "bg-yellow-100 text-yellow-900",
  Smoky: "bg-gray-600 text-gray-50",
  Earth: "bg-stone-600 text-stone-50",
  Savory: "bg-orange-700 text-orange-50",
  Creamy: "bg-yellow-100 text-yellow-900",
  Woody: "bg-amber-900 text-amber-50",
  Grassy: "bg-lime-500 text-lime-50",
  Yeasty: "bg-yellow-200 text-yellow-900",
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
      href={`/${language}/flavours/${slugify(descriptor.en)}`}
      className={`px-3 py-1 rounded-full text-sm hover:opacity-80 transition-colors ${flavorClass}`}
      onClick={onClick}
    >
      {descriptor[language as keyof typeof descriptor]}
    </Link>
  );
} 