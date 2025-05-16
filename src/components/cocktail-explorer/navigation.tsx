import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";
import { motion } from "framer-motion";

const TOTAL_STEPS = 3;

export default function Navigation() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    currentStep,
    nextStep,
    prevStep,
    goToResults,
    startOver
  } = useCocktail();

  // Wrap the handlers in useCallback to ensure stability
  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handlePrev = useCallback(() => {
    prevStep();
  }, [prevStep]);

  const handleGoToResults = useCallback(() => {
    goToResults();
  }, [goToResults]);

  const handleStartOver = useCallback(() => {
    startOver();
  }, [startOver]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="bg-background py-4 flex justify-between"
    >
      {/* Reset button - always visible */}
      <Button variant="outline" onClick={handleStartOver}>
        {t.reset}
      </Button>

      <div className="flex gap-2 ml-auto">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handlePrev}>
            {t.previous}
          </Button>
        )}

        {currentStep < TOTAL_STEPS && (
          <Button onClick={handleNext}>
            {t.next}
          </Button>
        )}

        {currentStep === TOTAL_STEPS && (
          <Button onClick={handleGoToResults}>
            {t.findCocktail}
          </Button>
        )}
      </div>

      {currentStep === TOTAL_STEPS + 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button onClick={handleStartOver} className="ml-auto">
            {t.startOver}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};