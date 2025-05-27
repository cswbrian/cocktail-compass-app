import { useVisitForm } from '@/context/VisitFormContext';
import { VisitForm } from './VisitForm';

export function GlobalVisitForm() {
  const { formState, closeForm, mutate } = useVisitForm();
  const { isOpen } = formState;

  const handleClose = () => {
    closeForm();
  };

  return (
    <VisitForm
      isOpen={isOpen}
      onClose={handleClose}
      onSuccess={() => {
        mutate();
        handleClose();
      }}
    />
  );
} 