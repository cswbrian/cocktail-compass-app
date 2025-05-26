'use client';

import { Button } from '@/components/ui/button';
import { NotebookPenIcon } from 'lucide-react';
import { useVisitForm } from '@/context/VisitFormContext';
import { useLanguage } from '@/context/LanguageContext';

export function AddLogButton() {
  const { openForm } = useVisitForm();
  const { language } = useLanguage();

  const handleClick = () => {
    window.history.pushState(
      {},
      '',
      `/${language}/visits/new`,
    );
    openForm();
  };

  return (
    <Button
      className="h-10 w-10 rounded-full shadow-lg"
      onClick={handleClick}
    >
      <NotebookPenIcon className="h-5 w-5" />
    </Button>
  );
}
