import React from 'react';
import { Place } from '@/types/place';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

interface PlaceStatusDisplayProps {
  place: Place & { is_open?: boolean | null };
  className?: string;
}
export function PlaceStatusDisplay({
  place,
  className = '',
}: PlaceStatusDisplayProps) {
  const { language } = useLanguage();
  const t = translations[language];

  // Only show status if it's available
  if (
    place.is_open === null ||
    place.is_open === undefined
  ) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          place.is_open ? 'bg-green-400' : 'bg-red-400'
        }`}
      />
      <span
        className={`text-sm font-medium ${
          place.is_open ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {place.is_open ? t.open : t.closedNow}
      </span>
    </div>
  );
}
