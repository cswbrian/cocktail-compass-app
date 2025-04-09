import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase();
}

export function slugify(text: string) {
  return normalizeText(text)
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function getLocalizedText(field: string | Record<string, string>, language: string) {
  if (typeof field === 'string') return field;
  return field?.[language] || field?.en || '';
}

export const validLanguages = ['en', 'zh'];