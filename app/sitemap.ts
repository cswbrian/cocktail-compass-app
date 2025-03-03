import { MetadataRoute } from 'next'
import cocktails from "@/data/cocktails.json"
import { slugify } from "@/lib/utils"

export const dynamic = "force-static";

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all unique flavors
  const allFlavors = new Set<string>()
  cocktails.forEach((cocktail) => {
    cocktail.flavor_descriptors.forEach((flavor) => {
      allFlavors.add(slugify(flavor.en))
    })
  })

  // Get all unique ingredients
  const allIngredients = new Set<string>()
  cocktails.forEach((cocktail) => {
    [
      ...cocktail.base_spirits,
      ...cocktail.liqueurs,
      ...cocktail.ingredients,
    ].forEach((ingredient) => {
      allIngredients.add(slugify(ingredient.name.en))
    })
  })

  const baseUrl = 'https://cocktails.monsoonclub.co'

  return [
    // Home pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFreq,
      priority: 1,
      alternates: {
        languages: {
          'en': `${baseUrl}/en`,
          'zh': `${baseUrl}/zh`,
        },
      },
    },

    // Individual cocktail pages
    ...cocktails.flatMap((cocktail) => {
      const cocktailSlug = slugify(cocktail.name.en)
      return [
        {
          url: `${baseUrl}/en/cocktails/${cocktailSlug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as ChangeFreq,
          priority: 0.8,
          alternates: {
            languages: {
              'en': `${baseUrl}/en/cocktails/${cocktailSlug}`,
              'zh': `${baseUrl}/zh/cocktails/${cocktailSlug}`,
            },
          },
        },
        {
          url: `${baseUrl}/zh/cocktails/${cocktailSlug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as ChangeFreq,
          priority: 0.8,
          alternates: {
            languages: {
              'en': `${baseUrl}/en/cocktails/${cocktailSlug}`,
              'zh': `${baseUrl}/zh/cocktails/${cocktailSlug}`,
            },
          },
        },
      ]
    }),

    // Flavor pages
    ...Array.from(allFlavors).flatMap((flavorSlug) => [
      {
        url: `${baseUrl}/en/flavours/${flavorSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.7,
        alternates: {
          languages: {
            'en': `${baseUrl}/en/flavours/${flavorSlug}`,
            'zh': `${baseUrl}/zh/flavours/${flavorSlug}`,
          },
        },
      },
      {
        url: `${baseUrl}/zh/flavours/${flavorSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.7,
        alternates: {
          languages: {
            'en': `${baseUrl}/en/flavours/${flavorSlug}`,
            'zh': `${baseUrl}/zh/flavours/${flavorSlug}`,
          },
        },
      },
    ]),

    // Ingredient pages
    ...Array.from(allIngredients).flatMap((ingredientSlug) => [
      {
        url: `${baseUrl}/en/ingredients/${ingredientSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.7,
        alternates: {
          languages: {
            'en': `${baseUrl}/en/ingredients/${ingredientSlug}`,
            'zh': `${baseUrl}/zh/ingredients/${ingredientSlug}`,
          },
        },
      },
      {
        url: `${baseUrl}/zh/ingredients/${ingredientSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as ChangeFreq,
        priority: 0.7,
        alternates: {
          languages: {
            'en': `${baseUrl}/en/ingredients/${ingredientSlug}`,
            'zh': `${baseUrl}/zh/ingredients/${ingredientSlug}`,
          },
        },
      },
    ]),
  ]
} 