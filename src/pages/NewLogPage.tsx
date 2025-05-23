import { GlobalCocktailLogForm } from '@/components/cocktail-log/GlobalCocktailLogForm';
import { useCocktailLogs } from '@/context/CocktailLogContext';
import { useEffect } from 'react';

export default function NewLogPage() {
  const { openCreateForm } = useCocktailLogs();

  useEffect(() => {
    openCreateForm();
  }, [openCreateForm]);

  return <GlobalCocktailLogForm />;
}
