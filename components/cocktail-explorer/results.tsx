import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailCard } from "@/components/cocktail-card";
import { useCocktail } from "@/context/CocktailContext";

export default function Results() {
  const { language } = useLanguage();
  const t = translations[language];
  const { results } = useCocktail();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.resultsTitle || "Your Cocktail Matches"}</h2>
      <div id="results-section" className="flex flex-col gap-y-6 pb-20">
        {results.map((cocktail, index) => (
          <motion.div
            key={cocktail.name[language]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CocktailCard cocktail={cocktail} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 