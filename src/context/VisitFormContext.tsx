import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { mutate } from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';

interface VisitFormState {
  isOpen: boolean;
}

interface VisitFormContextType {
  formState: VisitFormState;
  openForm: () => void;
  closeForm: () => void;
  mutate: () => Promise<void>;
}

const VisitFormContext = createContext<VisitFormContextType | undefined>(
  undefined,
);

export function VisitFormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<VisitFormState>({
    isOpen: false,
  });

  const openForm = useCallback(() => {
    setFormState({ isOpen: true });
  }, []);

  const closeForm = useCallback(() => {
    setFormState({ isOpen: false });
  }, []);

  const handleMutate = useCallback(async () => {
    await mutate(CACHE_KEYS.VISITS);
  }, []);

  return (
    <VisitFormContext.Provider
      value={{
        formState,
        openForm,
        closeForm,
        mutate: handleMutate,
      }}
    >
      {children}
    </VisitFormContext.Provider>
  );
}

export function useVisitForm() {
  const context = useContext(VisitFormContext);
  if (context === undefined) {
    throw new Error('useVisitForm must be used within a VisitFormProvider');
  }
  return context;
} 