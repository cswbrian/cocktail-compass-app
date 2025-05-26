import { GlobalVisitForm } from '@/components/visit/GlobalVisitForm';
import { useVisitForm } from '@/context/VisitFormContext';
import { useEffect } from 'react';

export default function NewVisitPage() {
  const { openForm } = useVisitForm();

  useEffect(() => {
    openForm();
  }, [openForm]);

  return <GlobalVisitForm />;
} 