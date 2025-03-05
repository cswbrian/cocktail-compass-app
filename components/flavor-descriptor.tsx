"use client";

import Link from "next/link";
import { slugify } from "@/lib/utils";

export const flavorClasses = {
  Bitter: "bg-teal-700 text-teal-50 border border-teal-700",
  Salty: "bg-blue-600 text-blue-50 border border-blue-600",
  Umami: "bg-orange-600 text-orange-50 border border-orange-600",
  Fruity: "bg-orange-500 text-orange-50 border border-orange-500",
  Citrus: "bg-yellow-400 text-yellow-900 border border-yellow-400",
  Herbal: "bg-green-600 text-green-50 border border-green-600",
  Spicy: "bg-red-600 text-red-50 border border-red-600",
  Floral: "bg-purple-500 text-purple-50 border border-purple-500",
  Tropical: "bg-green-700 text-white border border-green-700",
  Nutty: "bg-amber-800 text-amber-50 border border-amber-800",
  Chocolate: "bg-amber-900 text-amber-50 border border-amber-900",
  Coffee: "bg-red-900 text-red-50 border border-red-900",
  Vanilla: "bg-yellow-100 text-yellow-900 border border-yellow-100",
  Smoky: "bg-gray-600 text-gray-50 border border-gray-600",
  Earth: "bg-stone-600 text-stone-50 border border-stone-600",
  Savory: "bg-orange-700 text-orange-50 border border-orange-700",
  Creamy: "bg-yellow-100 text-yellow-900 border border-yellow-100",
  Woody: "bg-amber-900 text-amber-50 border border-amber-900",
  Grassy: "bg-lime-500 text-lime-50 border border-lime-500",
  Yeasty: "bg-yellow-200 text-yellow-900 border border-yellow-200",
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