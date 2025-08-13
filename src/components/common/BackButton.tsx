import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export function BackButton({ to, className }: BackButtonProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const handleClose = () => {
    if (to) {
      navigate(to);
    } else {
      // Go back to previous page in browser history
      navigate(-1);
    }
  };

  return (
    <Button
      variant="link"
      onClick={handleClose}
      className={`p-0 text-muted-foreground hover:no-underline ${className || ''}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {t.back}
    </Button>
  );
} 