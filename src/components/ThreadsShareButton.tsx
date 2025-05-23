import { Button } from '@/components/ui/button';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { useAuth } from '@/context/AuthContext';

interface ThreadsShareButtonProps {
  logId: string;
  userId: string;
}

export function ThreadsShareButton({
  logId,
  userId,
}: ThreadsShareButtonProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];

  if (!user || user.id !== userId) {
    return null;
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await cocktailLogService.shareToThreads(
        logId,
        language,
      );
    } catch (error) {
      console.error('Error sharing to Threads:', error);
      toast.error(t.shareToThreadsFailed);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="flex items-center gap-2 border-none"
    >
      <img
        src="/threads.svg"
        alt="Threads"
        width={16}
        height={16}
      />
      <span>{t.shareToThreads}</span>
    </Button>
  );
}
