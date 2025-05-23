'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { useCocktail } from '@/context/CocktailContext';
import { useEffect } from 'react';
import Step1 from '@/components/cocktail-explorer/step1';
import Step2 from '@/components/cocktail-explorer/step2';
import Step3 from '@/components/cocktail-explorer/step3';
import Results from '@/components/cocktail-explorer/results';
import Navigation from '@/components/cocktail-explorer/navigation';

export function CocktailExplorer() {
  const { language } = useLanguage();
  const t = translations[language];
  const { currentStep, results, setCurrentStep } =
    useCocktail();

  useEffect(() => {
    if (results.length > 0 && currentStep !== 4) {
      const stored = sessionStorage.getItem(
        'cocktailExplorerResults',
      );
      if (stored) {
        setCurrentStep(4);
      }
    }
  }, [results.length, currentStep, setCurrentStep]);

  const renderCurrentStep = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {(() => {
            switch (currentStep) {
              case 1:
                return <Step1 />;
              case 2:
                return <Step2 />;
              case 3:
                return <Step3 />;
              case 4:
                return <Results />;
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div>
      <div className="px-6">
        <motion.h1
          className="mt-8 text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.chooseYourPreference}
        </motion.h1>
        <div className="mt-8 flex-1 overflow-y-auto pb-24">
          {renderCurrentStep()}
        </div>
      </div>
      <div className="fixed bottom-16 left-0 right-0 px-6 max-w-4xl mx-auto">
        <Navigation />
      </div>
    </div>
  );
}
