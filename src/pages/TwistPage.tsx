import { useParams, useNavigate } from 'react-router-dom';
import { TwistFinder } from '@/components/twist-finder/twist-finder';
import { cocktailService } from '@/services/cocktail-service';
import { useEffect, useState } from 'react';
import { Cocktail } from '@/types/cocktail';
import { useLanguage } from '@/context/LanguageContext';

export default function TwistPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [baseCocktail, setBaseCocktail] = useState<Cocktail | null>(null);

  useEffect(() => {
    const loadCocktail = async () => {
      if (!slug) {
        navigate(`/${language}`);
        return;
      }

      const cocktail = await cocktailService.getCocktailBySlug(slug);
      if (!cocktail) {
        navigate(`/${language}`);
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