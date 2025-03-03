'use client'

import { createContext, useContext, useState, useCallback } from 'react';
import { Cocktail, RankedCocktail } from '@/types/cocktail';
import cocktailsData from "@/data/cocktails.json";
import { useLanguage } from "@/context/LanguageContext";

type CocktailContextType = {
  // State
  sweetness: number;
  setSweetness: (value: number) => void;
  sourness: number;
  setSourness: (value: number) => void;
  body: number;
  setBody: (value: number) => void;
  complexity: number;
  setComplexity: (value: number) => void;
  booziness: number;
  setBooziness: (value: number) => void;
  bubbles: boolean;
  setBubbles: (value: boolean) => void;
  selectedFlavors: string[];
  results: RankedCocktail[];
  noSweetness: boolean;
  setNoSweetness: (value: boolean) => void;
  noSourness: boolean;
  setNoSourness: (value: boolean) => void;
  noBody: boolean;
  setNoBody: (value: boolean) => void;
  noComplexity: boolean;
  setNoComplexity: (value: boolean) => void;
  noBooziness: boolean;
  setNoBooziness: (value: boolean) => void;
  selectedBaseSpirits: string[];
  setSelectedBaseSpirits: (value: string[]) => void;
  selectedIngredients: string[];
  setSelectedIngredients: (value: string[]) => void;
  selectedLiqueurs: string[];
  setSelectedLiqueurs: (value: string[]) => void;
  currentStep: number;
  
  // Methods
  handleFlavorSelect: (flavor: string) => void;
  handleSubmit: () => RankedCocktail[];
  nextStep: () => void;
  prevStep: () => void;
  goToResults: () => void;
  startOver: () => void;
};

const cocktails = cocktailsData as Cocktail[];

const CocktailContext = createContext<CocktailContextType | null>(null);

export function CocktailProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [sweetness, setSweetness] = useState(5);
  const [sourness, setSourness] = useState(5);
  const [body, setBody] = useState(5);
  const [complexity, setComplexity] = useState(5);
  const [booziness, setBooziness] = useState(5);
  const [bubbles, setBubbles] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [results, setResults] = useState<RankedCocktail[]>([]);
  const [noSweetness, setNoSweetness] = useState(false);
  const [noSourness, setNoSourness] = useState(false);
  const [noBody, setNoBody] = useState(false);
  const [noComplexity, setNoComplexity] = useState(false);
  const [noBooziness, setNoBooziness] = useState(false);
  const [selectedBaseSpirits, setSelectedBaseSpirits] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedLiqueurs, setSelectedLiqueurs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const calculateDistance = useCallback((cocktail: Cocktail) => {
    const profile = cocktail.flavor_profile;
    const bubbleDifference = profile.bubbles === bubbles ? 0 : 1;

    // Calculate penalty for mismatched base spirits (higher weight)
    const baseSpiritPenalty =
      selectedBaseSpirits.length > 0 &&
      !selectedBaseSpirits.some((spirit) =>
        cocktail.base_spirits.some(
          (cocktailBaseSpirit) => cocktailBaseSpirit.name[language] === spirit
        )
      )
        ? 10
        : 0;

    // Calculate penalty for mismatched ingredients (higher weight)
    const ingredientPenalty =
      selectedIngredients.length > 0 &&
      !selectedIngredients.some((ingredient) =>
        cocktail.ingredients.some(
          (cocktailIngredient) =>
            cocktailIngredient.name[language] === ingredient
        )
      )
        ? 10
        : 0;

    // Calculate penalty for mismatched liqueurs (higher weight)
    const liqueurPenalty =
      selectedLiqueurs.length > 0 &&
      !selectedLiqueurs.some((liqueur) =>
        cocktail.liqueurs.some(
          (cocktailLiqueur) => cocktailLiqueur.name[language] === liqueur
        )
      )
        ? 10
        : 0;

    return Math.sqrt(
      (noSweetness ? 0 : Math.pow(profile.sweetness - sweetness, 2)) +
        (noSourness ? 0 : Math.pow(profile.sourness - sourness, 2)) +
        (noBody ? 0 : Math.pow(profile.body - body, 2)) +
        (noComplexity ? 0 : Math.pow(profile.complexity - complexity, 2)) +
        (noBooziness ? 0 : Math.pow(profile.booziness - booziness, 2)) +
        Math.pow(bubbleDifference, 2) +
        Math.pow(baseSpiritPenalty, 2) +
        Math.pow(ingredientPenalty, 2) +
        Math.pow(liqueurPenalty, 2)
    );
  }, [
    sweetness, sourness, body, complexity, booziness,
    bubbles, noSweetness, noSourness, noBody, noComplexity,
    noBooziness, selectedBaseSpirits, selectedIngredients,
    selectedLiqueurs, language
  ]);

  const handleSubmit = useCallback(() => {
    const rankedCocktails: RankedCocktail[] = cocktails
      .map((cocktail) => {
        // Calculate flavor penalty (higher weight)
        const flavorPenalty =
          selectedFlavors.length > 0 &&
          !selectedFlavors.some((flavor) => {
            const selectedFlavorLower = flavor.toLowerCase();
            const cocktailFlavorsLower = cocktail.flavor_descriptors.map((f) =>
              f[language].toLowerCase()
            );
            return cocktailFlavorsLower.includes(selectedFlavorLower);
          })
            ? 10
            : 0;

        return {
          ...cocktail,
          distance: calculateDistance(cocktail) + Math.pow(flavorPenalty, 2),
          flavorMatches: selectedFlavors.filter((flavor) => {
            const selectedFlavorLower = flavor.toLowerCase();
            const cocktailFlavorsLower = cocktail.flavor_descriptors.map((f) =>
              f[language].toLowerCase()
            );
            return cocktailFlavorsLower.includes(selectedFlavorLower);
          }).length,
        };
      })
      .sort((a, b) => {
        if (b.flavorMatches !== a.flavorMatches) {
          return b.flavorMatches - a.flavorMatches;
        }
        return a.distance - b.distance;
      });

    // Select top 20 and then randomize to pick 5
    const top20 = rankedCocktails.slice(0, 20);
    const random5 = top20
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(0, 5);

    setResults(random5);
    return random5;
  }, [calculateDistance, language, selectedFlavors]);

  const handleFlavorSelect = useCallback((flavor: string) => {
    setSelectedFlavors((prev) => {
      if (prev.includes(flavor)) {
        return prev.filter((f) => f !== flavor);
      } else if (prev.length < 3) {
        return [...prev, flavor];
      }
      return prev;
    });
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      const newResults = handleSubmit();
      if (newResults.length > 0) {
        setCurrentStep(4);
      }
    }
  }, [currentStep, handleSubmit]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToResults = useCallback(() => {
    const newResults = handleSubmit();
    if (newResults.length > 0) {
      setCurrentStep(4);
    }
  }, [handleSubmit]);

  const startOver = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const value = {
    // State
    sweetness,
    setSweetness,
    sourness,
    setSourness,
    body,
    setBody,
    complexity,
    setComplexity,
    booziness,
    setBooziness,
    bubbles,
    setBubbles,
    selectedFlavors,
    results,
    noSweetness,
    setNoSweetness,
    noSourness,
    setNoSourness,
    noBody,
    setNoBody,
    noComplexity,
    setNoComplexity,
    noBooziness,
    setNoBooziness,
    selectedBaseSpirits,
    setSelectedBaseSpirits,
    selectedIngredients,
    setSelectedIngredients,
    selectedLiqueurs,
    setSelectedLiqueurs,
    currentStep,
    
    // Methods
    handleFlavorSelect,
    handleSubmit,
    nextStep,
    prevStep,
    goToResults,
    startOver
  };

  return (
    <CocktailContext.Provider value={value}>
      {children}
    </CocktailContext.Provider>
  );
}

export function useCocktail() {
  const context = useContext(CocktailContext);
  if (!context) {
    throw new Error('useCocktail must be used within a CocktailProvider');
  }
  return context;
} 