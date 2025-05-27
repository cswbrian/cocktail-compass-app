import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { mutate } from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';
import { useLanguage } from './LanguageContext';
import { useLocation } from 'react-router-dom';

interface VisitFormState {
  isOpen: boolean;
}

interface VisitFormContextType {
  formState: VisitFormState;
  openForm: () => void;
  closeForm: () => void;
  mutate: () => Promise<void>;
}

const VisitFormContext = createContext<
  VisitFormContextType | undefined
>(undefined);

export function VisitFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [formState, setFormState] =
    useState<VisitFormState>({
      isOpen: false,
    });
  const { language } = useLanguage();
  const location = useLocation();

  const openForm = useCallback(() => {
    setFormState({ isOpen: true });
    window.history.pushState(
      { formOpen: true },
      '',
      `/${language}/visits/new`,
    );
  }, [language]);

  const closeForm = useCallback(() => {
    setFormState({ isOpen: false });
    window.history.back();
  }, [location.pathname]);

  const handleMutate = useCallback(async () => {
    await mutate(CACHE_KEYS.VISITS);
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (formState.isOpen) {
        closeForm();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () =>
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
  }, [formState.isOpen, closeForm]);

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
    throw new Error(
      'useVisitForm must be used within a VisitFormProvider',
    );
  }
  return context;
}
