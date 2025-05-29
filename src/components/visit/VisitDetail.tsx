'use client';

import { Visit } from '@/types/visit';
import { Button } from '@/components/ui/button';
import { Edit, MapPin, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import {
  DateInfo,
  CommentInfo,
} from '@/components/cocktail-log/CocktailLogInfo';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CocktailLogCard } from '@/components/cocktail-log/CocktailLogCard';
import { VisitForm } from './VisitForm';
import { translations } from '@/translations';
import { VisibilityIndicator } from '../common/VisibilityIndicator';
import { sendGAEvent } from '@/lib/ga';

interface VisitDetailProps {
  visit: Visit;
  isOpen?: boolean;
  onClose?: () => void;
  onVisitSaved?: (visit: Visit) => void;
  onVisitDeleted?: (visitId: string) => void;
}

export function VisitDetail({
  visit,
  isOpen = true,
  onClose,
  onVisitSaved,
  onVisitDeleted,
}: VisitDetailProps) {
  const { language } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const t =
    translations[language as keyof typeof translations];

  const isOwnVisit = user?.id === visit.user.id;

  // Track visit detail view
  useEffect(() => {
    if (isOpen) {
      sendGAEvent('Visit Detail', 'View', `ID: ${visit.id}, Own: ${isOwnVisit}`);
    }
  }, [isOpen, visit.id, isOwnVisit]);

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
    // Track edit button click
    sendGAEvent('Visit Detail', 'Edit Click', `ID: ${visit.id}`);
    window.history.pushState(
      {},
      '',
      `/${language}/visits/${visit.id}/edit`,
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

  const handleVisitSaved = (updatedVisit: Visit) => {
    // Track visit save
    sendGAEvent('Visit Detail', 'Save', `ID: ${updatedVisit.id}`);
    if (onVisitSaved) {
      onVisitSaved(updatedVisit);
    }
    handleCloseEdit();
  };

  // Track location click
  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendGAEvent('Visit Detail', 'Location Click', visit.location?.name || 'Unnamed Location');
  };

  // Track user profile click
  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendGAEvent('Visit Detail', 'User Click', visit.user.username);
  };

  if (isEditing) {
    return (
      <VisitForm
        isOpen={true}
        onClose={handleCloseEdit}
        onSuccess={() => handleVisitSaved(visit)}
        existingVisit={visit}
      />
    );
  }

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
            {t.visitDetails}
          </h2>
          {isOwnVisit && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0"
              onClick={handleEditClick}
            >
              <Edit className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2">
            {!isOwnVisit && (
              <Link
                to={`/${language}/drinkers/${visit.user.username}`}
                className="font-bold"
                onClick={handleUserClick}
              >
                <span>{visit.user.username}</span>
              </Link>
            )}
            {visit.visitDate && (
              <DateInfo
                date={new Date(visit.visitDate)}
                className="text-base text-muted-foreground"
              />
            )}
            {isOwnVisit && (
              <VisibilityIndicator visibility={visit.visibility} />
            )}
          </div>

          <h2 className="inline-flex items-center gap-2 text-2xl mt-4 mb-6">
            <MapPin className="size-4 text-muted-foreground" />
            <Link
              to={`/${language}/places/${visit.location?.place_id}`}
              className="text-primary hover:underline transition-colors"
              onClick={handleLocationClick}
            >
              {visit.location?.name || 'Unnamed Location'}
            </Link>
          </h2>

          <div className="space-y-4">
            {visit.comments && (
              <CommentInfo comments={visit.comments} />
            )}

            {visit.logs.length > 0 && (
              <div>
                <div className="space-y-4">
                  {visit.logs.map(log => (
                    <CocktailLogCard
                      key={log.id}
                      log={log}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
