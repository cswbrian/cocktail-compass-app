'use client'

import { createContext, useContext, useState, useCallback } from 'react';
import { Cocktail, RankedCocktail } from '@/types/cocktail';
import cocktailsData from "@/data/cocktails.json";
import { useLanguage } from "@/context/LanguageContext";
import { rankCocktails } from '@/lib/cocktail-ranking';

type CocktailContextType = {
  // State
  sweetness: number | null;
  setSweetness: (value: number | null) => void;
  sourness: number | null;
  setSourness: (value: number | null) => void;
  body: number | null;
  setBody: (value: number | null) => void;
  complexity: number | null;
  setComplexity: (value: number | null) => void;
  booziness: number | null;
  setBooziness: (value: number | null) => void;
  bubbles: boolean;
  setBubbles: (value: boolean) => void;
  selectedFlavors: string[];
  results: RankedCocktail[];
  selectedBaseSpirits: string[];
  setSelectedBaseSpirits: (value: string[]) => void;
  selectedIngredients: string[];
  setSelectedIngredients: (value: string[]) => void;
  selectedLiqueurs: string[];
  setSelectedLiqueurs: (value: string[]) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
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
  const [sweetness, setSweetness] = useState<number | null>(5);
  const [sourness, setSourness] = useState<number | null>(5);
  const [body, setBody] = useState<number | null>(5);
  const [complexity, setComplexity] = useState<number | null>(5);
  const [booziness, setBooziness] = useState<number | null>(5);
  const [bubbles, setBubbles] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [results, setResults] = useState<RankedCocktail[]>(() => {
    // Initialize results from sessionStorage if available
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cocktailExplorerResults');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [selectedBaseSpirits, setSelectedBaseSpirits] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedLiqueurs, setSelectedLiqueurs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSubmit = useCallback(() => {
    const rankedResults = rankCocktails(cocktails, {
      sweetness,
      sourness,
      body,
      complexity,
      booziness,
      bubbles,
      selectedBaseSpirits,
      selectedIngredients,
      selectedLiqueurs,
      selectedFlavors,
      language
    });

    setResults(rankedResults);
    sessionStorage.setItem('cocktailExplorerResults', JSON.stringify(rankedResults));
    return rankedResults;
  }, [
    sweetness, sourness, body, complexity, booziness,
    bubbles, selectedBaseSpirits, selectedIngredients,
    selectedLiqueurs, selectedFlavors, language
  ]);

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
    // Clear results from sessionStorage with new key name
    sessionStorage.removeItem('cocktailExplorerResults');
    setResults([]);
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
    selectedBaseSpirits,
    setSelectedBaseSpirits,
    selectedIngredients,
    setSelectedIngredients,
    selectedLiqueurs,
    setSelectedLiqueurs,
    currentStep,
    setCurrentStep,
    
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