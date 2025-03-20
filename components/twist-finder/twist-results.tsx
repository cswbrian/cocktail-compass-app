import { Cocktail } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailCard } from "@/components/cocktail-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BasedCocktailCard } from "./based-cocktail-card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface TwistResultsProps {
  twists: Array<{ cocktail: Cocktail; distance: number }>;
  baseCocktail: Cocktail;
  onFindAgain: () => void;
}

export function TwistResults({
  twists,
  baseCocktail,
  onFindAgain,
}: TwistResultsProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [isBaseCardExpanded, setIsBaseCardExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <button
        onClick={() => setIsBaseCardExpanded(!isBaseCardExpanded)}
        className="w-full text-left group"
      >
        <h2 className="text-3xl mb-2 group-hover:opacity-80 transition-opacity">
          <span className="font-medium">{baseCocktail.name.en}</span>
          <span className="font-extralight"> {t.twists}</span>
        </h2>
        {language === "zh" && (
          <p className="text-muted-foreground mb-4">{baseCocktail.name.zh}</p>
        )}
      </button>

      <div className="mb-8">
        <button
          onClick={() => setIsBaseCardExpanded(!isBaseCardExpanded)}
          className="flex items-center gap-2 mb-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isBaseCardExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
          <span>{t.seeMore}</span>
        </button>

        <AnimatePresence>
          {isBaseCardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <BasedCocktailCard cocktail={baseCocktail} hideTitle />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button className="mb-8" variant="secondary" onClick={onFindAgain}>
        {t.reset}
      </Button>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {twists.map(({ cocktail, distance }, index) => (
          <motion.div
            key={cocktail.name.en}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CocktailCard cocktail={cocktail} distance={distance} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
