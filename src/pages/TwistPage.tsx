import { useParams, useNavigate } from 'react-router-dom';
import { TwistFinder } from '@/components/twist-finder/twist-finder';
// Explorer-only: local static data instead of Supabase
// import { cocktailService } from '@/services/cocktail-service';
import { staticCocktailService } from '@/services/static-cocktail-service';
import { useEffect, useState } from 'react';
import { Cocktail } from '@/types/cocktail';
import { useLanguage } from '@/context/LanguageContext';

export default function TwistPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [baseCocktail, setBaseCocktail] = useState<Cocktail | null>(null);

  useEffect(() => {
    const loadCocktail = () => {
      if (!slug) {
        navigate(`/${language}/explorer`);
        return;
      }

      // was: await cocktailService.getCocktailBySlug(slug)
      const cocktail =
        staticCocktailService.getStaticCocktailBySlug(slug) ??
        null;
      if (!cocktail) {
        navigate(`/${language}/explorer`);
        return;
      }

      setBaseCocktail(cocktail);
    };
    loadCocktail();
  }, [slug, language, navigate]);

  if (!baseCocktail) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TwistFinder baseCocktail={baseCocktail} />
    </div>
  );
} 