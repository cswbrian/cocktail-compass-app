import { Cocktail, RankedCocktail, CocktailPreview } from "@/types/cocktail";
import { slugify } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { staticCocktailService } from "./static-cocktail-service";
import { CACHE_KEYS } from "@/lib/swr-config";
import useSWR from "swr";

class CocktailService {
  private static instance: CocktailService;
  private static isInitialized = false;
  private customCocktails: Cocktail[] = [];
  private cocktails: Cocktail[] = [];
  private cocktailPreviews: CocktailPreview[] = [];
  
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
    
    this.slugToCocktail = new Map();
    this.flavorToCocktails = new Map();
    this.ingredientToCocktails = new Map();
    this.allFlavors = new Set();
    this.allIngredients = new Set();
    
    CocktailService.isInitialized = true;
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
      .from("cocktail_details")
      .select("*");

    if (error) {
      console.error("Error loading cocktails:", error);
      return;
    }

    // Get static cocktails and custom cocktails
    const staticCocktails = staticCocktailService.getStaticCocktailsWithDetails();
    this.customCocktails = data?.filter(cocktail => cocktail.is_custom) || [];
    this.cocktails = [...staticCocktails, ...this.customCocktails];
    
    // Update caches with all cocktails
    this.updateCaches();
  }

  private updateCaches(): void {
    // Update slug to cocktail map with all cocktails
    this.cocktails.forEach(cocktail => {
      this.slugToCocktail.set(cocktail.slug, cocktail);
    });

    // Update flavor descriptors set
    this.cocktails.forEach(cocktail => {
      cocktail.flavor_descriptors?.forEach(flavor => {
        this.allFlavors.add(slugify(flavor.en));
      });
    });

    // Update ingredients set
    this.cocktails.forEach(cocktail => {
      [
        ...(cocktail.base_spirits ?? []),
        ...(cocktail.liqueurs ?? []),
        ...(cocktail.ingredients ?? []),
      ].forEach(ingredient => {
        this.allIngredients.add(slugify(ingredient.name.en));
      });
    });

    // Update preview list
    this.initializePreviewList();
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

  public getCocktailPreviews(): CocktailPreview[] {
    return this.cocktailPreviews;
  }

  public getAllCocktails(): CocktailPreview[] {
    return this.cocktailPreviews;
  }

  public getAllCocktailsWithDetails(): Cocktail[] {
    return [...this.cocktails];
  }

  public async getCocktailBySlug(slug: string): Promise<Cocktail | undefined> {
    const { data, error } = await supabase
      .from("cocktail_details")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching cocktail by slug:", error);
      return undefined;
    }

    return this.mapSupabaseResponseToCocktail(data);
  }

  private mapSupabaseResponseToCocktail(data: any): Cocktail {
    const cocktailData = data.data || {};
    return {
      id: data.id,
      slug: data.slug,
      name: cocktailData.name || { en: '', zh: null },
      flavor_profile: cocktailData.flavor_profile || {
        body: 0,
        booziness: 0,
        bubbles: false,
        complexity: 0,
        sourness: 0,
        sweetness: 0
      },
      base_spirits: cocktailData.base_spirits || [],
      liqueurs: cocktailData.liqueurs || [],
      ingredients: cocktailData.ingredients || [],
      flavor_descriptors: cocktailData.flavor_descriptors || [],
      technique: cocktailData.technique,
      garnish: cocktailData.garnish,
      description: cocktailData.description,
      categories: cocktailData.categories || [],
      is_custom: data.is_custom || false
    };
  }

  public async getCocktailById(id: string): Promise<Cocktail | undefined> {
    const { data, error } = await supabase
      .from("cocktail_details")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching cocktail by id:", error);
      return undefined;
    }

    return this.mapSupabaseResponseToCocktail(data);
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

  public async getCocktailsByIngredientId(ingredientId: string): Promise<Cocktail[]> {
    // First get all cocktail IDs that use this ingredient
    const { data: cocktailIds, error: cocktailIdsError } = await supabase
      .from("cocktail_ingredients")
      .select("cocktail_id")
      .eq("ingredient_id", ingredientId);

    if (cocktailIdsError) {
      console.error("Error fetching cocktail IDs:", cocktailIdsError);
      return [];
    }

    if (!cocktailIds || cocktailIds.length === 0) {
      return [];
    }

    // Then get the full cocktail details for these IDs
    const { data, error } = await supabase
      .from("cocktail_details")
      .select("*")
      .in("id", cocktailIds.map(ci => ci.cocktail_id));

    if (error) {
      console.error("Error fetching cocktails by ingredient:", error);
      return [];
    }

    return data.map(this.mapSupabaseResponseToCocktail);
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

  public async getCocktailDetails(): Promise<Cocktail[] | null> {
    const { data, error } = await supabase
      .from("cocktail_details")
      .select("*");
    
    if (error) {
      console.error("Error fetching cocktail details:", error);
      return null;
    }
    
    return data;
  }
}

export const cocktailService = CocktailService.getInstance(); 