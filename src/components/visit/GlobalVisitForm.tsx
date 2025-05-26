import { useVisitForm } from '@/context/VisitFormContext';
import { VisitForm } from './VisitForm';
import { useNavigate, useLocation } from 'react-router-dom';

export function GlobalVisitForm() {
  const { formState, closeForm, mutate } = useVisitForm();
  const { isOpen } = formState;
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    closeForm();
    // Only navigate back if we're on the /visits/new route
    if (location.pathname.endsWith('/visits/new')) {
      navigate(-1);
    }
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