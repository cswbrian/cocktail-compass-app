import {
  Cocktail,
  CocktailPreview,
} from '@/types/cocktail';
import { slugify } from '@/lib/utils';
import { decompress } from '@/lib/decompress';

class StaticCocktailService {
  private static instance: StaticCocktailService;
  private cocktails: Cocktail[] = [];
  private cocktailPreviews: CocktailPreview[] = [];
  private recommendableCocktails: Cocktail[] | null = null;
  private initPromise: Promise<void> | null = null;
  private ready = false;

  // Cache for frequently accessed data
  private slugToCocktail = new Map<string, Cocktail>();
  private flavorToCocktails = new Map<string, Cocktail[]>();
  private ingredientToCocktails = new Map<
    string,
    Cocktail[]
  >();
  private allFlavors = new Set<string>();
  private allIngredients = new Set<string>();

  private constructor() {}

  private ensureInit(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      console.log(
        '🔄 Decompressing static cocktails data...',
      );
      // Lazy chunk: keep compressed catalog out of the initial bundle
      const { compressedCocktails } = await import(
        '@/data/cocktails.compressed'
      );
      this.cocktails = decompress(
        compressedCocktails,
      ) as Cocktail[];
      console.log(
        `✅ Decompressed ${this.cocktails.length} cocktails`,
      );

      this.initializeCaches();
      this.initializePreviewList();
      this.ready = true;
    })();

    return this.initPromise;
  }

  private initializeCaches(): void {
    this.slugToCocktail.clear();
    this.allFlavors.clear();
    this.allIngredients.clear();

    for (const cocktail of this.cocktails) {
      this.slugToCocktail.set(cocktail.slug, cocktail);

      cocktail.flavor_descriptors?.forEach(flavor => {
        this.allFlavors.add(slugify(flavor.en));
      });

      [
        ...(cocktail.base_spirits ?? []),
        ...(cocktail.liqueurs ?? []),
        ...(cocktail.ingredients ?? []),
      ].forEach(ingredient => {
        this.allIngredients.add(
          slugify(ingredient.name.en),
        );
      });
    }
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
      StaticCocktailService.instance =
        new StaticCocktailService();
    }
    return StaticCocktailService.instance;
  }

  public async getStaticCocktails(): Promise<
    CocktailPreview[]
  > {
    await this.ensureInit();
    return this.cocktailPreviews;
  }

  public async getStaticCocktailsWithDetails(): Promise<
    Cocktail[]
  > {
    await this.ensureInit();
    return this.cocktails;
  }

  public async getStaticCocktailBySlug(
    slug: string,
  ): Promise<Cocktail | undefined> {
    await this.ensureInit();
    return this.slugToCocktail.get(slug);
  }

  public async getStaticCocktailById(
    id: string,
  ): Promise<Cocktail | undefined> {
    await this.ensureInit();
    return this.cocktails.find(
      cocktail => cocktail.id === id,
    );
  }

  public async getStaticCocktailsByFlavor(
    flavorSlug: string,
  ): Promise<Cocktail[]> {
    await this.ensureInit();
    const cached = this.flavorToCocktails.get(flavorSlug);
    if (cached) return cached;

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

  public async getStaticCocktailsByIngredient(
    ingredientSlug: string,
  ): Promise<Cocktail[]> {
    await this.ensureInit();
    const cached =
      this.ingredientToCocktails.get(ingredientSlug);
    if (cached) return cached;

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

  public async getStaticAllFlavors(): Promise<string[]> {
    await this.ensureInit();
    return Array.from(this.allFlavors);
  }

  public async getStaticAllIngredients(): Promise<
    string[]
  > {
    await this.ensureInit();
    return Array.from(this.allIngredients);
  }

  public async getStaticRecommendableCocktails(): Promise<
    Cocktail[]
  > {
    await this.ensureInit();
    if (this.recommendableCocktails) {
      return this.recommendableCocktails;
    }

    this.recommendableCocktails = this.cocktails.filter(
      cocktail => {
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
      },
    );
    return this.recommendableCocktails;
  }

  public clearCaches(): void {
    this.flavorToCocktails.clear();
    this.ingredientToCocktails.clear();
    this.recommendableCocktails = null;
  }
}

// Lightweight singleton — decompress deferred until first read
export const staticCocktailService =
  StaticCocktailService.getInstance();
