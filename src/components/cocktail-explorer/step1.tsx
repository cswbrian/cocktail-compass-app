import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { useCocktail } from '@/context/CocktailContext';

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
  } = useCocktail();

  const handleMasterNoPreference = (checked: boolean) => {
    if (checked) {
      setSweetness(null);
      setSourness(null);
      setBody(null);
      setComplexity(null);
      setBooziness(null);
    } else {
      setSweetness(5);
      setSourness(5);
      setBody(5);
      setComplexity(5);
      setBooziness(5);
    }
  };

  return (
    <div className="space-y-8">
      {/* Master No Preference Switch */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-end items-center space-x-2">
          <Switch
            id="master-no-preference"
            checked={
              sweetness === null &&
              sourness === null &&
              body === null &&
              complexity === null &&
              booziness === null
            }
            onCheckedChange={handleMasterNoPreference}
          />
          <Label htmlFor="master-no-preference">
            {t.masterNoPreference}
          </Label>
        </div>
      </motion.div>

      {/* Sweetness Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2
              className={
                sweetness === null ? 'text-gray-700' : ''
              }
            >
              {t.sweetness}
            </h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-sweetness"
                checked={sweetness === null}
                onCheckedChange={checked =>
                  setSweetness(checked ? null : 5)
                }
              />
              <Label htmlFor="no-sweetness">
                {t.noPreference}
              </Label>
            </div>
          </div>
          <Slider
            value={[sweetness === null ? 5 : sweetness]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={
              sweetness === null
                ? 'bg-gray-700'
                : 'bg-rose-500'
            }
            onValueChange={value => setSweetness(value[0])}
            disabled={sweetness === null}
          />
          <div
            className={`grid grid-cols-5 text-sm mt-1 ${
              sweetness === null
                ? 'text-gray-700'
                : 'text-muted-foreground'
            }`}
          >
            <span className="text-left">{t.noSweet}</span>
            <span className="text-center">
              {t.lightSweet}
            </span>
            <span className="text-center">
              {t.mediumSweet}
            </span>
            <span className="text-center">{t.sweet}</span>
            <span className="text-right">
              {t.verySweet}
            </span>
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
            <h2
              className={
                sourness === null ? 'text-gray-700' : ''
              }
            >
              {t.sourness}
            </h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-sourness"
                checked={sourness === null}
                onCheckedChange={checked =>
                  setSourness(checked ? null : 5)
                }
              />
              <Label htmlFor="no-sourness">
                {t.noPreference}
              </Label>
            </div>
          </div>
          <Slider
            value={[sourness === null ? 5 : sourness]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={
              sourness === null
                ? 'bg-gray-700'
                : 'bg-yellow-500'
            }
            onValueChange={value => setSourness(value[0])}
            disabled={sourness === null}
          />
          <div
            className={`grid grid-cols-5 text-sm mt-1 ${
              sourness === null
                ? 'text-gray-700'
                : 'text-muted-foreground'
            }`}
          >
            <span className="text-left">{t.noSour}</span>
            <span className="text-center">
              {t.lightSour}
            </span>
            <span className="text-center">
              {t.mediumSour}
            </span>
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
            <h2
              className={
                body === null ? 'text-gray-700' : ''
              }
            >
              {t.body}
            </h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-body"
                checked={body === null}
                onCheckedChange={checked =>
                  setBody(checked ? null : 5)
                }
              />
              <Label htmlFor="no-body">
                {t.noPreference}
              </Label>
            </div>
          </div>
          <Slider
            value={[body === null ? 5 : body]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={
              body === null
                ? 'bg-gray-700'
                : 'bg-emerald-500'
            }
            onValueChange={value => setBody(value[0])}
            disabled={body === null}
          />
          <div
            className={`grid grid-cols-5 text-sm mt-1 ${
              body === null
                ? 'text-gray-700'
                : 'text-muted-foreground'
            }`}
          >
            <span className="text-left">{t.thinBody}</span>
            <span className="text-center">
              {t.lightBody}
            </span>
            <span className="text-center">
              {t.mediumBody}
            </span>
            <span className="text-center">
              {t.heavyBody}
            </span>
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
            <h2
              className={
                complexity === null ? 'text-gray-700' : ''
              }
            >
              {t.complexity}
            </h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-complexity"
                checked={complexity === null}
                onCheckedChange={checked =>
                  setComplexity(checked ? null : 5)
                }
              />
              <Label htmlFor="no-complexity">
                {t.noPreference}
              </Label>
            </div>
          </div>
          <Slider
            value={[complexity === null ? 5 : complexity]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={
              complexity === null
                ? 'bg-gray-700'
                : 'bg-sky-500'
            }
            onValueChange={value => setComplexity(value[0])}
            disabled={complexity === null}
          />
          <div
            className={`grid grid-cols-5 text-sm mt-1 ${
              complexity === null
                ? 'text-gray-700'
                : 'text-muted-foreground'
            }`}
          >
            <span className="text-left">
              {t.simpleComplex}
            </span>
            <span className="text-center">
              {t.someComplex}
            </span>
            <span className="text-center">
              {t.mediumComplex}
            </span>
            <span className="text-center">{t.complex}</span>
            <span className="text-right">
              {t.veryComplex}
            </span>
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
            <h2
              className={
                booziness === null ? 'text-gray-700' : ''
              }
            >
              {t.booziness}
            </h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="no-booziness"
                checked={booziness === null}
                onCheckedChange={checked =>
                  setBooziness(checked ? null : 5)
                }
              />
              <Label htmlFor="no-booziness">
                {t.noPreference}
              </Label>
            </div>
          </div>
          <Slider
            value={[booziness === null ? 5 : booziness]}
            max={10}
            step={1}
            className="w-full"
            rangeClassName={
              booziness === null
                ? 'bg-gray-700'
                : 'bg-orange-500'
            }
            onValueChange={value => setBooziness(value[0])}
            disabled={booziness === null}
          />
          <div
            className={`grid grid-cols-5 text-sm mt-1 ${
              booziness === null
                ? 'text-gray-700'
                : 'text-muted-foreground'
            }`}
          >
            <span className="text-left">{t.noAlcohol}</span>
            <span className="text-center">
              {t.lightAlcohol}
            </span>
            <span className="text-center">
              {t.mediumAlcohol}
            </span>
            <span className="text-center">
              {t.strongAlcohol}
            </span>
            <span className="text-right">
              {t.veryStrong}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
