'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

interface CocktailExplorerState {
  sweetness: number | null;
  sourness: number | null;
  body: number | null;
  complexity: number | null;
  booziness: number | null;
  bubbles: boolean;
  selectedFlavors: string[];
  selectedBaseSpirits: string[];
  selectedIngredients: string[];
  selectedLiqueurs: string[];
  currentStep: number;
  results: RankedCocktail[];
}

const defaultState: CocktailExplorerState = {
  sweetness: 5,
  sourness: 5,
  body: 5,
  complexity: 5,
  booziness: 5,
  bubbles: false,
  selectedFlavors: [],
  selectedBaseSpirits: [],
  selectedIngredients: [],
  selectedLiqueurs: [],
  currentStep: 1,
  results: []
};

export function CocktailProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  // Initialize all state from a single storage item
  const initializeState = (): CocktailExplorerState => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cocktailExplorerState');
      return stored ? JSON.parse(stored) : defaultState;
    }
    return defaultState;
  };

  const [state, setState] = useState<CocktailExplorerState>(initializeState);

  // Update sessionStorage whenever state changes
  useEffect(() => {
    sessionStorage.setItem('cocktailExplorerState', JSON.stringify(state));
  }, [state]);

  // Individual setters that update the consolidated state
  const setSweetness = (value: number | null) => 
    setState(prev => ({ ...prev, sweetness: value }));
  
  const setSourness = (value: number | null) =>
    setState(prev => ({ ...prev, sourness: value }));
  
  const setBody = (value: number | null) =>
    setState(prev => ({ ...prev, body: value }));
  
  const setComplexity = (value: number | null) =>
    setState(prev => ({ ...prev, complexity: value }));
  
  const setBooziness = (value: number | null) =>
    setState(prev => ({ ...prev, booziness: value }));
  
  const setBubbles = (value: boolean) =>
    setState(prev => ({ ...prev, bubbles: value }));
  
  const setCurrentStep = (step: number) =>
    setState(prev => ({ ...prev, currentStep: step }));

  const handleFlavorSelect = useCallback((flavor: string) => {
    setState(prev => ({
      ...prev,
      selectedFlavors: prev.selectedFlavors.includes(flavor)
        ? prev.selectedFlavors.filter(f => f !== flavor)
        : prev.selectedFlavors.length < 3
          ? [...prev.selectedFlavors, flavor]
          : prev.selectedFlavors
    }));
  }, []);

  const setSelectedBaseSpirits = (value: string[]) =>
    setState(prev => ({ ...prev, selectedBaseSpirits: value }));

  const setSelectedIngredients = (value: string[]) =>
    setState(prev => ({ ...prev, selectedIngredients: value }));

  const setSelectedLiqueurs = (value: string[]) =>
    setState(prev => ({ ...prev, selectedLiqueurs: value }));

  const startOver = useCallback(() => {
    sessionStorage.removeItem('cocktailExplorerState');
    setState(defaultState);
  }, []);

  const handleSubmit = useCallback(() => {
    const rankedResults = rankCocktails(cocktails, {
      sweetness: state.sweetness,
      sourness: state.sourness,
      body: state.body,
      complexity: state.complexity,
      booziness: state.booziness,
      bubbles: state.bubbles,
      selectedBaseSpirits: state.selectedBaseSpirits,
      selectedIngredients: state.selectedIngredients,
      selectedLiqueurs: state.selectedLiqueurs,
      selectedFlavors: state.selectedFlavors,
      language
    });

    setState(prev => ({ ...prev, results: rankedResults }));
    return rankedResults;
  }, [state, language]);

  const nextStep = useCallback(() => {
    if (state.currentStep < 3) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      const newResults = handleSubmit();
      if (newResults.length > 0) {
        setState(prev => ({ ...prev, currentStep: 4 }));
      }
    }
  }, [state.currentStep, handleSubmit]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  const goToResults = useCallback(() => {
    const newResults = handleSubmit();
    if (newResults.length > 0) {
      setState(prev => ({ ...prev, currentStep: 4 }));
    }
  }, [handleSubmit]);

  const value = {
    // State values
    sweetness: state.sweetness,
    sourness: state.sourness,
    body: state.body,
    complexity: state.complexity,
    booziness: state.booziness,
    bubbles: state.bubbles,
    selectedFlavors: state.selectedFlavors,
    results: state.results,
    selectedBaseSpirits: state.selectedBaseSpirits,
    selectedIngredients: state.selectedIngredients,
    selectedLiqueurs: state.selectedLiqueurs,
    currentStep: state.currentStep,
    
    // Setters
    setSweetness,
    setSourness,
    setBody,
    setComplexity,
    setBooziness,
    setBubbles,
    setSelectedBaseSpirits,
    setSelectedIngredients,
    setSelectedLiqueurs,
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