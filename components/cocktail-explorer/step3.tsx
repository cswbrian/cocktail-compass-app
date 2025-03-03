import { motion } from "framer-motion";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";
import summary from "@/data/summary.json";

const getUniqueOptions = (
  items: { name: { [key: string]: string } }[],
  language: string
) => {
  const uniqueMap = new Map<string, { label: string; value: string }>();
  items.forEach((item) => {
    const label = item.name[language];
    const value = item.name.en;
    if (!uniqueMap.has(label)) {
      uniqueMap.set(label, { label, value });
    }
  });
  return Array.from(uniqueMap.values());
};

export default function Step3() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    setSelectedBaseSpirits,
    setSelectedLiqueurs,
    setSelectedIngredients,
    bubbles,
    setBubbles,
  } = useCocktail();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.step3Title || "Select Ingredients"}</h2>
      <div className="space-y-4">
        <MultiSelect
          options={getUniqueOptions(summary.base_spirits, language)}
          onValueChange={setSelectedBaseSpirits}
          placeholder={t.pleaseSelectBaseSpirits}
          enableSelectAll={false}
        />
        <MultiSelect
          options={getUniqueOptions(summary.liqueurs, language)}
          onValueChange={setSelectedLiqueurs}
          placeholder={t.pleaseSelectLiqueurs}
          enableSelectAll={false}
        />
        <MultiSelect
          options={getUniqueOptions(summary.ingredients, language)}
          onValueChange={setSelectedIngredients}
          placeholder={t.pleaseSelectIngredients}
          enableSelectAll={false}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="bubbles" checked={bubbles} onCheckedChange={setBubbles} />
        <Label htmlFor="bubbles">{t.withBubbles}</Label>
      </div>
    </motion.div>
  );
}; 