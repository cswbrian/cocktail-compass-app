import { Button } from '@/components/ui/button';
import { NotebookPenIcon } from 'lucide-react';
import { useVisitForm } from '@/context/VisitFormContext';
import { sendGAEvent } from '@/lib/ga';

export function AddVisitButton() {
  const { openForm } = useVisitForm();

  const handleClick = () => {
    sendGAEvent('Visit', 'Add Visit Button Click', 'Open Visit Form');
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
