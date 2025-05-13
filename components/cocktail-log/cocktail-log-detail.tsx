"use client";

import { CocktailLog } from "@/types/cocktail-log";
import { Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CocktailLogForm } from "./cocktail-log-form";
import { useState, useEffect } from "react";
import { CocktailLogMedia } from "./cocktail-log-media";
import { CocktailLogInfo } from "./cocktail-log-info";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { formatCocktailName } from "@/lib/utils";

interface CocktailLogDetailProps {
  log: CocktailLog;
  isOpen: boolean;
  onClose: () => void;
  onLogSaved?: (log: CocktailLog) => void;
  onLogDeleted?: (logId: string) => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
}

export function CocktailLogDetail({
  log,
  isOpen,
  onClose,
  onLogSaved,
  onLogDeleted,
  onLogsChange
}: CocktailLogDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      // Push a new history state when detail opens
      window.history.pushState({ detail: true }, '');
    }

    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

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
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0"
                    onClick={onClose}
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
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4 max-w-3xl mx-auto">
                  {
                    log.cocktail.is_custom ? (
                      <h3 className="text-xl font-semibold mb-4">{formatCocktailName(log.cocktail.name, language)}</h3>
                    ) : (
                      <Link 
                        href={`/${language}/cocktails/${log.cocktail.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="text-xl font-semibold mb-4">{formatCocktailName(log.cocktail.name, language)}</h3>
                      </Link>
                    )
                  }
                  <CocktailLogInfo
                    rating={log.rating}
                    location={log.location}
                    bartender={log.bartender}
                    comments={log.comments}
                    tags={log.tags}
                    drinkDate={log.drinkDate ? new Date(log.drinkDate) : null}
                    showHeadings
                  />

                  {log.media && log.media.length > 0 && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <CocktailLogMedia media={log.media} size="lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Edit Form */}
          <CocktailLogForm
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            existingLog={log}
            onLogSaved={(updatedLog) => {
              setIsEditing(false);
              onLogSaved?.(updatedLog);
            }}
            onLogDeleted={(logId) => {
              setIsEditing(false);
              onClose();
              onLogDeleted?.(logId);
            }}
            onLogsChange={onLogsChange}
            onSuccess={() => {
              setIsEditing(false);
              onClose();
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
} 