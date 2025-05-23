import { compressedCocktails } from '@/data/cocktails.compressed';
import {
  Cocktail,
  CocktailPreview,
} from '@/types/cocktail';
import { slugify } from '@/lib/utils';
import { decompress } from '@/lib/decompress';

class StaticCocktailService {
  private static instance: StaticCocktailService;
  private static isInitialized = false;
  private cocktails: Cocktail[];
  private cocktailPreviews: CocktailPreview[] = [];

  // Cache for frequently accessed data
  private slugToCocktail: Map<string, Cocktail>;
  private flavorToCocktails: Map<string, Cocktail[]>;
  private ingredientToCocktails: Map<string, Cocktail[]>;
  private allFlavors: Set<string>;
  private allIngredients: Set<string>;

  private constructor() {
    if (StaticCocktailService.isInitialized) {
      console.warn(
        'StaticCocktailService is being instantiated multiple times!',
      );
    }

    // Initialize with decompressed data
    console.log(
      '🔄 Decompressing static cocktails data...',
    );
    this.cocktails = decompress(
      compressedCocktails,
    ) as Cocktail[];
    console.log(
      `✅ Decompressed ${this.cocktails.length} cocktails`,
    );

    this.slugToCocktail = new Map();
    this.flavorToCocktails = new Map();
    this.ingredientToCocktails = new Map();
    this.allFlavors = new Set();
    this.allIngredients = new Set();

    // Initialize caches
    this.initializeCaches();
    this.initializePreviewList();
    StaticCocktailService.isInitialized = true;
  }

  private initializeCaches(): void {
    // Build slug to cocktail map
    this.cocktails.forEach(cocktail => {
      this.slugToCocktail.set(cocktail.slug, cocktail);
    });

    // Build flavor descriptors set
    this.cocktails.forEach(cocktail => {
      cocktail.flavor_descriptors?.forEach(flavor => {
        this.allFlavors.add(slugify(flavor.en));
      });
    });

    // Build ingredients set
    this.cocktails.forEach(cocktail => {
      [
        ...(cocktail.base_spirits ?? []),
        ...(cocktail.liqueurs ?? []),
        ...(cocktail.ingredients ?? []),
      ].forEach(ingredient => {
        this.allIngredients.add(
          slugify(ingredient.name.en),
        );
      });
    });
  }

  private initializePreviewList() {
    this.cocktailPreviews = this.cocktails.map(
      cocktail => ({
        id: cocktail.id,
        slug: cocktail.slug,
        name: cocktail.name,
        categories: cocktail.categories,
        flavor_descriptors: cocktail.flavor_descriptors,
      }),
    );
  }

  public static getInstance(): StaticCocktailService {
    if (!StaticCocktailService.instance) {
      console.log(
        '🎯 Creating new StaticCocktailService instance',
      );
      StaticCocktailService.instance =
        new StaticCocktailService();
    }
    return StaticCocktailService.instance;
  }

  public getStaticCocktails(): CocktailPreview[] {
    return this.cocktailPreviews;
  }

  public getStaticCocktailsWithDetails(): Cocktail[] {
    return this.cocktails;
  }

  public getStaticCocktailBySlug(
    slug: string,
  ): Cocktail | undefined {
    return this.slugToCocktail.get(slug);
  }

  public getStaticCocktailById(
    id: string,
  ): Cocktail | undefined {
    return this.cocktails.find(
      cocktail => cocktail.id === id,
    );
  }

  public getStaticCocktailsByFlavor(
    flavorSlug: string,
  ): Cocktail[] {
    // Check cache first
    const cached = this.flavorToCocktails.get(flavorSlug);
    if (cached) return cached;

    // If not in cache, compute and cache
    const matchingCocktails = this.cocktails.filter(
      cocktail =>
        cocktail.flavor_descriptors.some(
          descriptor =>
            slugify(descriptor.en) === flavorSlug,
        ),
    );

    this.flavorToCocktails.set(
      flavorSlug,
      matchingCocktails,
    );
    return matchingCocktails;
  }

  public getStaticCocktailsByIngredient(
    ingredientSlug: string,
  ): Cocktail[] {
    // Check cache first
    const cached =
      this.ingredientToCocktails.get(ingredientSlug);
    if (cached) return cached;

    // If not in cache, compute and cache
    const matchingCocktails = this.cocktails.filter(
      cocktail => {
        const allIngredients = [
          ...(cocktail.base_spirits ?? []),
          ...(cocktail.liqueurs ?? []),
          ...(cocktail.ingredients ?? []),
        ];
        return allIngredients.some(
          ingredient =>
            slugify(ingredient.name.en) === ingredientSlug,
        );
      },
    );

    this.ingredientToCocktails.set(
      ingredientSlug,
      matchingCocktails,
    );
    return matchingCocktails;
  }

  public getStaticAllFlavors(): string[] {
    return Array.from(this.allFlavors);
  }

  public getStaticAllIngredients(): string[] {
    return Array.from(this.allIngredients);
  }

  public getStaticRecommendableCocktails(): Cocktail[] {
    return this.cocktails.filter(cocktail => {
      const profile = cocktail.flavor_profile;
      return (
        profile &&
        typeof profile.sweetness === 'number' &&
        typeof profile.sourness === 'number' &&
        typeof profile.body === 'number' &&
        typeof profile.complexity === 'number' &&
        typeof profile.booziness === 'number' &&
        typeof profile.bubbles === 'boolean'
      );
    });
  }

  // Method to clear caches if needed (e.g., for testing)
  public clearCaches(): void {
    this.flavorToCocktails.clear();
    this.ingredientToCocktails.clear();
  }
}

export const staticCocktailService =
  StaticCocktailService.getInstance();
