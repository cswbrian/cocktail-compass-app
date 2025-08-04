'use client';

import { CocktailExplorer } from '@/components/cocktail-explorer';
import { useLanguage } from '@/context/LanguageContext';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function ExplorerPage() {
  const { language, toggleLanguage } = useLanguage();
  const { lang } = useParams();

  // Sync language with URL parameter
  useEffect(() => {
    if (
      lang &&
      (lang === 'en' || lang === 'zh') &&
      lang !== language
    ) {
      toggleLanguage();
    }
  }, [lang, language, toggleLanguage]);

  return <CocktailExplorer />;
}
