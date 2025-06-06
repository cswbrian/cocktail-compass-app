import { CocktailLog } from '@/types/cocktail-log';
import { Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CocktailLogMedia } from './CocktailLogMedia';
import {
  LocationInfo,
  DateInfo,
  CommentInfo,
  VisibilityInfo,
} from './CocktailLogInfo';
import { translations } from '@/translations';
import { useLanguage } from '@/context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { formatBilingualText } from '@/lib/utils';

interface PrivateCocktailLogDetailProps {
  log: CocktailLog;
  isOpen?: boolean;
  onClose?: () => void;
  onLogSaved?: (log: CocktailLog) => void;
  onLogDeleted?: (logId: string) => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
}

export function PrivateCocktailLogDetail({
  log,
  isOpen = true,
  onClose,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
}: PrivateCocktailLogDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const location = useLocation();

  useEffect(() => {
    setIsEditing(location.pathname.endsWith('/edit'));
  }, [location]);

  useEffect(() => {
    const handlePopState = () => {
      if (isEditing) {
        setIsEditing(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () =>
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
  }, [isEditing]);

  const handleEditClick = () => {
    window.history.pushState(
      {},
      '',
      `/${language}/logs/${log.id}/edit`,
    );
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    window.history.back();
    setIsEditing(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  const content = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="flex-1 text-center text-lg font-semibold">
            {t.logs}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0"
            onClick={handleEditClick}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 max-w-3xl mx-auto">
          {log.cocktail.is_custom ? (
            <h3 className="text-xl font-semibold mb-4">
              {formatBilingualText(
                log.cocktail.name,
                language,
              )}
            </h3>
          ) : (
            <Link
              to={`/${language}/cocktails/${log.cocktail.slug}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="text-xl font-semibold mb-4">
                {formatBilingualText(
                  log.cocktail.name,
                  language,
                )}
              </h3>
            </Link>
          )}
          <LocationInfo
            location={log.location}
            showHeadings
          />
          <DateInfo
            date={
              log.drinkDate ? new Date(log.drinkDate) : null
            }
            showHeadings
          />
          <CommentInfo
            comments={log.comments}
            showHeadings
          />

          {log.media && log.media.length > 0 && (
            <div
              className="mt-4"
              onClick={e => e.stopPropagation()}
            >
              <CocktailLogMedia
                media={log.media}
                size="lg"
              />
            </div>
          )}

          <VisibilityInfo
            visibility={
              log.visibility as 'public' | 'private'
            }
            showHeadings
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 bg-background overflow-hidden"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
