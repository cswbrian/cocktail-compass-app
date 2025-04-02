import { compressedCocktails } from "@/data/cocktails.compressed";
import { Cocktail } from "@/types/cocktail";
import { slugify } from "@/lib/utils";
import { decompress } from "@/lib/decompress";

class CocktailService {
  private static instance: CocktailService;
  private static isInitialized = false;
  private cocktails: Cocktail[];
  
  // Cache for frequently accessed data
  private slugToCocktail: Map<string, Cocktail>;
  private flavorToCocktails: Map<string, Cocktail[]>;
  private ingredientToCocktails: Map<string, Cocktail[]>;
  private allFlavors: Set<string>;
  private allIngredients: Set<string>;

  private constructor() {
    if (CocktailService.isInitialized) {
      console.warn('CocktailService is being instantiated multiple times!');
    }
    
    // Initialize with decompressed data
    console.log('🔄 Decompressing cocktails data...');
    this.cocktails = decompress(compressedCocktails) as Cocktail[];
    console.log(`✅ Decompressed ${this.cocktails.length} cocktails`);
    
    this.slugToCocktail = new Map();
    this.flavorToCocktails = new Map();
    this.ingredientToCocktails = new Map();
    this.allFlavors = new Set();
    this.allIngredients = new Set();
    
    // Initialize caches
    this.initializeCaches();
    CocktailService.isInitialized = true;
  }

  private initializeCaches() {
    // Build slug to cocktail map
    this.cocktails.forEach(cocktail => {
      this.slugToCocktail.set(slugify(cocktail.name.en), cocktail);
    });

    // Build flavor descriptors set
    this.cocktails.forEach(cocktail => {
      cocktail.flavor_descriptors.forEach(flavor => {
        this.allFlavors.add(slugify(flavor.en));
      });
    });

    // Build ingredients set
    this.cocktails.forEach(cocktail => {
      [
        ...cocktail.base_spirits,
        ...cocktail.liqueurs,
        ...cocktail.ingredients,
      ].forEach(ingredient => {
        this.allIngredients.add(slugify(ingredient.name.en));
      });
    });
  }

  public static getInstance(): CocktailService {
    if (!CocktailService.instance) {
      console.log('🎯 Creating new CocktailService instance');
      CocktailService.instance = new CocktailService();
    }
    return CocktailService.instance;
  }

  public getAllCocktails(): Cocktail[] {
    return this.cocktails;
  }

  public getCocktailBySlug(slug: string): Cocktail | undefined {
    return this.slugToCocktail.get(slug);
  }

  public getCocktailsByFlavor(flavorSlug: string): Cocktail[] {
    // Check cache first
    const cached = this.flavorToCocktails.get(flavorSlug);
    if (cached) return cached;

    // If not in cache, compute and cache
    const matchingCocktails = this.cocktails.filter(cocktail =>
      cocktail.flavor_descriptors.some(
        descriptor => slugify(descriptor.en) === flavorSlug
      )
    );
    
    this.flavorToCocktails.set(flavorSlug, matchingCocktails);
    return matchingCocktails;
  }

  public getCocktailsByIngredient(ingredientSlug: string): Cocktail[] {
    // Check cache first
    const cached = this.ingredientToCocktails.get(ingredientSlug);
    if (cached) return cached;

    // If not in cache, compute and cache
    const matchingCocktails = this.cocktails.filter(cocktail => {
      const allIngredients = [
        ...cocktail.base_spirits,
        ...cocktail.liqueurs,
        ...cocktail.ingredients,
      ];
      return allIngredients.some(
        ingredient => slugify(ingredient.name.en) === ingredientSlug
      );
    });
    
    this.ingredientToCocktails.set(ingredientSlug, matchingCocktails);
    return matchingCocktails;
  }

  // Utility methods for static generation
  public getAllFlavors(): string[] {
    return Array.from(this.allFlavors);
  }

  public getAllIngredients(): string[] {
    return Array.from(this.allIngredients);
  }

  // Method to clear caches if needed (e.g., for testing)
  public clearCaches(): void {
    this.flavorToCocktails.clear();
    this.ingredientToCocktails.clear();
  }
}

export const cocktailService = CocktailService.getInstance(); 