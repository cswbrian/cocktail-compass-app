import { motion } from "framer-motion";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    selectedBaseSpirits,
    selectedLiqueurs,
    selectedIngredients,
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
          value={selectedBaseSpirits}
        />
        <MultiSelect
          options={getUniqueOptions(summary.liqueurs, language)}
          onValueChange={setSelectedLiqueurs}
          placeholder={t.pleaseSelectLiqueurs}
          enableSelectAll={false}
          value={selectedLiqueurs}
        />
        <MultiSelect
          options={getUniqueOptions(summary.ingredients, language)}
          onValueChange={setSelectedIngredients}
          placeholder={t.pleaseSelectIngredients}
          enableSelectAll={false}
          value={selectedIngredients}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.withBubbles}</Label>
        <RadioGroup
          defaultValue="no-preference"
          value={bubbles === null ? "no-preference" : bubbles ? "with-bubbles" : "no-bubbles"}
          onValueChange={(value: "no-preference" | "with-bubbles" | "no-bubbles") => {
            const bubblesState = {
              "no-preference": null,
              "with-bubbles": true,
              "no-bubbles": false
            }[value];
            
            setBubbles(bubblesState as boolean);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no-preference" id="no-preference" />
            <Label htmlFor="no-preference">{t.noPreference}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="with-bubbles" id="with-bubbles" />
            <Label htmlFor="with-bubbles">{t.hasBubbles}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no-bubbles" id="no-bubbles" />
            <Label htmlFor="no-bubbles">{t.noBubbles}</Label>
          </div>
        </RadioGroup>
      </div>
    </motion.div>
  );
}; 