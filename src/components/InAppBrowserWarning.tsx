import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface InAppBrowserWarningProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InAppBrowserWarning({ isOpen, onOpenChange }: InAppBrowserWarningProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t.linkCopied, {
      description: t.linkCopiedDescription,
      duration: 2000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.inAppBrowserDetected}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            {t.inAppBrowserWarning}
          </p>
          <p>
            {t.inAppBrowserWarningDescription}
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground flex-1 truncate">
                {import.meta.env.VITE_BASE_URL}
              </span>
              <Button
                onClick={handleCopyUrl}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">{t.copyLink}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 