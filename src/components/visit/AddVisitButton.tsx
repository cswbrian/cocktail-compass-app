import { Button } from '@/components/ui/button';
import { NotebookPenIcon } from 'lucide-react';
import { useVisitForm } from '@/context/VisitFormContext';

export function AddVisitButton() {
  const { openForm } = useVisitForm();

  return (
    <Button
      className="h-10 w-10 rounded-full shadow-lg"
      onClick={openForm}
    >
      <NotebookPenIcon className="h-5 w-5" />
    </Button>
  );
}
