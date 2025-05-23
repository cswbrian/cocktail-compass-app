'use client';

import { CocktailLog } from '@/types/cocktail-log';
import { PublicCocktailLogDetail } from './PublicCocktailLogDetail';
import { PrivateCocktailLogDetail } from './PrivateCocktailLogDetail';

interface CocktailLogDetailProps {
  log: CocktailLog;
  isOpen?: boolean;
  onClose?: () => void;
  onLogSaved?: (log: CocktailLog) => void;
  onLogDeleted?: (logId: string) => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  variant?: 'public' | 'private';
}

export function CocktailLogDetail({
  log,
  isOpen = true,
  onClose,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
  variant = 'private',
}: CocktailLogDetailProps) {
  if (variant === 'public') {
    return (
      <PublicCocktailLogDetail
        log={log}
        isOpen={isOpen}
        onClose={onClose}
        onLogSaved={onLogSaved}
        onLogDeleted={onLogDeleted}
        onLogsChange={onLogsChange}
      />
    );
  }

  return (
    <PrivateCocktailLogDetail
      log={log}
      isOpen={isOpen}
      onClose={onClose}
      onLogSaved={onLogSaved}
      onLogDeleted={onLogDeleted}
      onLogsChange={onLogsChange}
    />
  );
}
