import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function getLocalizedText(field: string | Record<string, string>, language: string) {
  if (typeof field === 'string') return field;
  return field?.[language] || field?.en || '';
}

export const validLanguages = ['en', 'zh'];