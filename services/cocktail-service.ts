import { compressedCocktails } from "@/data/cocktails.compressed";
import { Cocktail, RankedCocktail, CocktailPreview } from "@/types/cocktail";
import { slugify } from "@/lib/utils";
import { decompress } from "@/lib/decompress";
import { supabase } from "@/lib/supabase";

class CocktailService {
  private static instance: CocktailService;
  private static isInitialized = false;
  private cocktails: Cocktail[];
  private cocktailPreviews: CocktailPreview[] = [];
  private customCocktails: Cocktail[] = [];
  
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
    this.initializePreviewList();
    CocktailService.isInitialized = true;
  }

  private initializeCaches(): void {
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

  private initializePreviewList() {
    this.cocktailPreviews = this.cocktails.map(cocktail => ({
      id: cocktail.id,
      slug: cocktail.slug,
      name: cocktail.name,
      categories: cocktail.categories,
      flavor_descriptors: cocktail.flavor_descriptors
    }));
  }

  public static getInstance(): CocktailService {
    if (!CocktailService.instance) {
      console.log('🎯 Creating new CocktailService instance');
      CocktailService.instance = new CocktailService();
    }
    return CocktailService.instance;
  }

  public async initialize(): Promise<void> {
    await this.loadAllCocktails();
  }

  private async loadAllCocktails(): Promise<void> {
    const { data, error } = await supabase
      .from("cocktails")
      .select("*");

    if (error) {
      console.error("Error loading cocktails:", error);
      return;
    }

    // Separate standard and custom cocktails
    this.customCocktails = data?.filter(cocktail => cocktail.is_custom) || [];
    this.cocktails = [...this.cocktails, ...this.customCocktails];
    
    // Update caches with all cocktails
    this.updateCaches();
  }

  private updateCaches(): void {
    // Update slug to cocktail map with all cocktails
    this.cocktails.forEach(cocktail => {
      this.slugToCocktail.set(slugify(cocktail.name.en), cocktail);
    });

    // Update flavor descriptors set
    this.cocktails.forEach(cocktail => {
      cocktail.flavor_descriptors.forEach(flavor => {
        this.allFlavors.add(slugify(flavor.en));
      });
    });

    // Update ingredients set
    this.cocktails.forEach(cocktail => {
      [
        ...cocktail.base_spirits,
        ...cocktail.liqueurs,
        ...cocktail.ingredients,
      ].forEach(ingredient => {
        this.allIngredients.add(slugify(ingredient.name.en));
      });
    });

    // Update preview list
    this.initializePreviewList();
  }

  public getAllCocktails(): CocktailPreview[] {
    return this.cocktailPreviews;
  }

  public getAllCocktailsWithDetails(): Cocktail[] {
    return [...this.cocktails, ...this.customCocktails];
  }

  public getCocktailBySlug(slug: string): Cocktail | undefined {
    return this.slugToCocktail.get(slug);
  }

  public getCocktailById(id: string): Cocktail | undefined {
    return this.cocktails.find(cocktail => cocktail.id === id);
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

  public getCocktailsByMood(category: 'Strong & Spirit-Focused' | 'Sweet & Tart' | 'Tall & Bubbly' | 'Rich & Creamy', spirit?: string, preference?: string): RankedCocktail[] {
    console.log(`🔍 Searching for cocktails with category: ${category}${spirit ? ` and spirit: ${spirit}` : ''}${preference ? ` and preference: ${preference}` : ''}`);
    
    // First filter: Match by category
    let filteredCocktails = this.cocktails.filter(cocktail => 
      cocktail.categories.includes(category)
    );
    console.log(`📊 Found ${filteredCocktails.length} cocktails matching category`);

    // Second filter: Match by selected spirit if provided
    if (spirit) {
      filteredCocktails = filteredCocktails.filter(cocktail =>
        cocktail.base_spirits.some(
          baseSpirit => slugify(baseSpirit.name.en) === spirit
        )
      );
      console.log(`📊 After spirit filter: ${filteredCocktails.length} cocktails remaining`);
    }

    // Third filter: Match by preference if provided and category is Sweet & Tart
    if (preference && category === 'Sweet & Tart') {
      filteredCocktails = filteredCocktails.filter(cocktail => {
        const flavorProfile = cocktail.flavor_profile;
        if (!flavorProfile) return false;
        
        const sweetness = flavorProfile.sweetness;
        const sourness = flavorProfile.sourness;
        
        switch (preference) {
          case 'More Sweet':
            return sweetness > sourness;
          case 'More Tart':
            return sourness > sweetness;
          case 'Balanced':
            return Math.abs(sweetness - sourness) <= 1;
          default:
            return true;
        }
      });
      console.log(`📊 After preference filter: ${filteredCocktails.length} cocktails remaining`);
    }

    // Fourth step: Randomly select one cocktail if any are available
    if (filteredCocktails.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredCocktails.length);
      const selectedCocktail = filteredCocktails[randomIndex];
      console.log(`🎲 Randomly selected: ${selectedCocktail.name.en}`);
      return [{
        ...selectedCocktail,
        distance: 0
      }];
    }

    console.log('❌ No cocktails found matching the criteria');
    return [];
  }

  // Utility methods for static generation
  public getAllFlavors(): string[] {
    return Array.from(this.allFlavors);
  }

  public getAllIngredients(): string[] {
    return Array.from(this.allIngredients);
  }

  public getRecommendableCocktails(): Cocktail[] {
    return this.cocktails.filter(cocktail => {
      // Filter out custom cocktails
      if (cocktail.is_custom) return false;

      // Check flavor profile
      const profile = cocktail.flavor_profile;
      return profile && 
        typeof profile.sweetness === 'number' &&
        typeof profile.sourness === 'number' &&
        typeof profile.body === 'number' &&
        typeof profile.complexity === 'number' &&
        typeof profile.booziness === 'number' &&
        typeof profile.bubbles === 'boolean';
    });
  }

  // Method to clear caches if needed (e.g., for testing)
  public clearCaches(): void {
    this.flavorToCocktails.clear();
    this.ingredientToCocktails.clear();
  }
}

export const cocktailService = CocktailService.getInstance(); 