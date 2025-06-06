'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { RankedCocktail } from '@/types/cocktail';
import { useLanguage } from '@/context/LanguageContext';
import { rankCocktails } from '@/lib/cocktail-ranking';
import { cocktailService } from '@/services/cocktail-service';
import { translations } from '@/translations';

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
  bubbles: boolean | null;
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
  handleSubmit: () => Promise<RankedCocktail[]>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  goToResults: () => Promise<void>;
  startOver: () => void;
};

const CocktailContext =
  createContext<CocktailContextType | null>(null);

interface CocktailExplorerState {
  sweetness: number | null;
  sourness: number | null;
  body: number | null;
  complexity: number | null;
  booziness: number | null;
  bubbles: boolean | null;
  selectedFlavors: string[];
  selectedBaseSpirits: string[];
  selectedIngredients: string[];
  selectedLiqueurs: string[];
  currentStep: number;
  results: RankedCocktail[];
}

export function CocktailProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CocktailExplorerState>(
    {
      sweetness: 5,
      sourness: 5,
      body: 5,
      complexity: 5,
      booziness: 5,
      bubbles: null,
      selectedFlavors: [],
      selectedBaseSpirits: [],
      selectedIngredients: [],
      selectedLiqueurs: [],
      currentStep: 1,
      results: [],
    },
  );

  const { language } = useLanguage();
  const t = translations[language];

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

  const handleFlavorSelect = useCallback(
    (flavor: string) => {
      setState(prev => ({
        ...prev,
        selectedFlavors: prev.selectedFlavors.includes(
          flavor,
        )
          ? prev.selectedFlavors.filter(f => f !== flavor)
          : prev.selectedFlavors.length < 3
            ? [...prev.selectedFlavors, flavor]
            : prev.selectedFlavors,
      }));
    },
    [],
  );

  const setSelectedBaseSpirits = (value: string[]) =>
    setState(prev => ({
      ...prev,
      selectedBaseSpirits: value,
    }));

  const setSelectedIngredients = (value: string[]) =>
    setState(prev => ({
      ...prev,
      selectedIngredients: value,
    }));

  const setSelectedLiqueurs = (value: string[]) =>
    setState(prev => ({
      ...prev,
      selectedLiqueurs: value,
    }));

  const startOver = useCallback(() => {
    setState({
      sweetness: null,
      sourness: null,
      body: null,
      complexity: null,
      booziness: null,
      bubbles: null,
      selectedFlavors: [],
      selectedBaseSpirits: [],
      selectedIngredients: [],
      selectedLiqueurs: [],
      currentStep: 1,
      results: [],
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const cocktails = await cocktailService.getRecommendableCocktails();
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
      language,
    });

    setState(prev => ({ ...prev, results: rankedResults }));
    return rankedResults;
  }, [state, language]);

  const nextStep = useCallback(async () => {
    if (state.currentStep < 3) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }));
      // Push new state to history
      window.history.pushState(
        { step: state.currentStep + 1 },
        '',
        '',
      );
    } else {
      const newResults = await handleSubmit();
      if (newResults.length > 0) {
        setState(prev => ({ ...prev, currentStep: 4 }));
        // Push new state to history
        window.history.pushState({ step: 4 }, '', '');
      }
    }
  }, [state.currentStep, handleSubmit]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
      window.history.back();
    }
  }, [state.currentStep]);

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.step) {
        setState(prev => ({
          ...prev,
          currentStep: event.state.step,
        }));
      } else {
        setState(prev => ({ ...prev, currentStep: 1 }));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () =>
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
  }, []);

  const goToResults = useCallback(async () => {
    const newResults = await handleSubmit();
    if (newResults.length > 0) {
      setState(prev => ({ ...prev, currentStep: 4 }));
      // Push new state to history
      window.history.pushState({ step: 4 }, '', '');
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
    startOver,
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
    throw new Error(
      'useCocktail must be used within a CocktailProvider',
    );
  }
  return context;
}
