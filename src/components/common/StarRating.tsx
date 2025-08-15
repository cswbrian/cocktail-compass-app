import React from 'react';
import {
  Star,
  StarHalf,
  Star as StarOutline,
} from 'lucide-react';
import { translations } from '@/translations';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

interface StarRatingProps {
  value: number | null; // 0 to 5, can be 0.5 increments, or null for no rating
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  size?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 24,
  className = '',
}) => {
  const { language } = useLanguage();
  const clearLabel =
    translations[language as keyof typeof translations]
      .clearRating;
  
  // In read-only mode, don't show anything if there's no rating or rating is 0
  if (readOnly && (value === null || value === 0)) {
    return null;
  }
  
  // Helper to render each star
  const renderStar = (starIndex: number) => {
    const full = value !== null && value >= starIndex + 1;
    const half =
      value !== null && !full && value >= starIndex + 0.5;

    const handleClick = () => {
      if (readOnly || !onChange) return;
      onChange(starIndex + 1);
    };
    const handleHalfClick = (e: React.MouseEvent) => {
      if (readOnly || !onChange) return;
      e.stopPropagation();
      onChange(starIndex + 0.5);
    };
    return (
      <span
        key={starIndex}
        className="relative inline-block cursor-pointer group"
        style={{ width: size, height: size }}
      >
        <span
          onClick={handleClick}
          style={{
            display: 'inline-block',
            width: size,
            height: size,
          }}
        >
          {full ? (
            <Star
              className="text-white fill-white"
              size={size}
            />
          ) : half ? (
            <StarHalf
              className="text-white fill-white"
              size={size}
            />
          ) : (
            <StarOutline
              className="text-gray-300"
              size={size}
            />
          )}
        </span>
        {!readOnly && (
          <span
            className="absolute left-0 top-0 w-1/2 h-full z-10 group-hover:bg-yellow-100/20"
            style={{ width: size / 2, height: size }}
            onClick={handleHalfClick}
          />
        )}
      </span>
    );
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2, 3, 4].map(renderStar)}
      {!readOnly && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-muted-foreground ml-2 px-1 text-sm"
          onClick={() => onChange && onChange(null)}
          tabIndex={0}
        >
          {clearLabel}
        </Button>
      )}
    </div>
  );
};
