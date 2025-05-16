import { useCocktailData } from "@/context/CocktailLogContext";
import { CocktailLogForm } from "./CocktailLogForm";
import { useNavigate, useLocation } from "react-router-dom";

export function GlobalCocktailLogForm() {
  const { formState, closeForm, mutate } = useCocktailData();
  const { isOpen, mode, selectedLog } = formState;
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    closeForm();
    // Only navigate back if we're on the /logs/new route
    if (location.pathname.endsWith('/logs/new')) {
      navigate(-1);
    }
  };

  return (
    <CocktailLogForm
      isOpen={isOpen}
      onClose={handleClose}
      existingLog={mode === 'edit' ? selectedLog : null}
      onLogSaved={() => {
        mutate();
        handleClose();
      }}
      onLogDeleted={() => {
        mutate();
        handleClose();
      }}
      onLogsChange={() => {}}
      onSuccess={handleClose}
    />
  );
} 