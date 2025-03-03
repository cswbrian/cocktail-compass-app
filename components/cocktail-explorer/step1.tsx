import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";

export default function Step1() {
  const { language } = useLanguage();
  const t = translations[language];

  const {
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
  } = useCocktail();

  return (
    <div className="space-y-8">
      {/* Sweetness Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={noSweetness ? "text-gray-700" : ""}>{t.sweetness}</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-sweetness"
                checked={noSweetness}
                onCheckedChange={(checked) => {
                  setNoSweetness(checked);
                  if (checked) setSweetness(5);
                }}
              />
              <Label htmlFor="no-sweetness">{t.noPreference}</Label>
            </div>
          </div>
          <Slider
            value={[sweetness]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={noSweetness ? "bg-gray-700" : "bg-rose-500"}
            onValueChange={(value) => setSweetness(value[0])}
            disabled={noSweetness}
          />
          <div
            className={`grid grid-cols-5 text-xs mt-1 ${
              noSweetness ? "text-gray-700" : "text-muted-foreground"
            }`}
          >
            <span className="text-left">{t.noSweet}</span>
            <span className="text-center">{t.lightSweet}</span>
            <span className="text-center">{t.mediumSweet}</span>
            <span className="text-center">{t.sweet}</span>
            <span className="text-right">{t.verySweet}</span>
          </div>
        </div>
      </motion.div>

      {/* Sourness Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={noSourness ? "text-gray-700" : ""}>{t.sourness}</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-sourness"
                checked={noSourness}
                onCheckedChange={(checked) => {
                  setNoSourness(checked);
                  if (checked) setSourness(5);
                }}
              />
              <Label htmlFor="no-sourness">{t.noPreference}</Label>
            </div>
          </div>
          <Slider
            value={[sourness]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={noSourness ? "bg-gray-700" : "bg-yellow-500"}
            onValueChange={(value) => setSourness(value[0])}
            disabled={noSourness}
          />
          <div
            className={`grid grid-cols-5 text-xs mt-1 ${
              noSourness ? "text-gray-700" : "text-muted-foreground"
            }`}
          >
            <span className="text-left">{t.noSour}</span>
            <span className="text-center">{t.lightSour}</span>
            <span className="text-center">{t.mediumSour}</span>
            <span className="text-center">{t.sour}</span>
            <span className="text-right">{t.verySour}</span>
          </div>
        </div>
      </motion.div>

      {/* Body Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={noBody ? "text-gray-700" : ""}>{t.body}</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-body"
                checked={noBody}
                onCheckedChange={(checked) => {
                  setNoBody(checked);
                  if (checked) setBody(5);
                }}
              />
              <Label htmlFor="no-body">{t.noPreference}</Label>
            </div>
          </div>
          <Slider
            value={[body]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={noBody ? "bg-gray-700" : "bg-emerald-500"}
            onValueChange={(value) => setBody(value[0])}
            disabled={noBody}
          />
          <div
            className={`grid grid-cols-5 text-xs mt-1 ${
              noBody ? "text-gray-700" : "text-muted-foreground"
            }`}
          >
            <span className="text-left">{t.thinBody}</span>
            <span className="text-center">{t.lightBody}</span>
            <span className="text-center">{t.mediumBody}</span>
            <span className="text-center">{t.heavyBody}</span>
            <span className="text-right">{t.fullBody}</span>
          </div>
        </div>
      </motion.div>

      {/* Complexity Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={noComplexity ? "text-gray-700" : ""}>{t.complexity}</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-complexity"
                checked={noComplexity}
                onCheckedChange={(checked) => {
                  setNoComplexity(checked);
                  if (checked) setComplexity(5);
                }}
              />
              <Label htmlFor="no-complexity">{t.noPreference}</Label>
            </div>
          </div>
          <Slider
            value={[complexity]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={noComplexity ? "bg-gray-700" : "bg-sky-500"}
            onValueChange={(value) => setComplexity(value[0])}
            disabled={noComplexity}
          />
          <div
            className={`grid grid-cols-5 text-xs mt-1 ${
              noComplexity ? "text-gray-700" : "text-muted-foreground"
            }`}
          >
            <span className="text-left">{t.simpleComplex}</span>
            <span className="text-center">{t.someComplex}</span>
            <span className="text-center">{t.mediumComplex}</span>
            <span className="text-center">{t.complex}</span>
            <span className="text-right">{t.veryComplex}</span>
          </div>
        </div>
      </motion.div>

      {/* Booziness Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={noBooziness ? "text-gray-700" : ""}>{t.booziness}</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-booziness"
                checked={noBooziness}
                onCheckedChange={(checked) => {
                  setNoBooziness(checked);
                  if (checked) setBooziness(5);
                }}
              />
              <Label htmlFor="no-booziness">{t.noPreference}</Label>
            </div>
          </div>
          <Slider
            value={[booziness]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={noBooziness ? "bg-gray-700" : "bg-orange-500"}
            onValueChange={(value) => setBooziness(value[0])}
            disabled={noBooziness}
          />
          <div
            className={`grid grid-cols-5 text-xs mt-1 ${
              noBooziness ? "text-gray-700" : "text-muted-foreground"
            }`}
          >
            <span className="text-left">{t.noAlcohol}</span>
            <span className="text-center">{t.lightAlcohol}</span>
            <span className="text-center">{t.mediumAlcohol}</span>
            <span className="text-center">{t.strongAlcohol}</span>
            <span className="text-right">{t.veryStrong}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 