import { MapPin, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
interface LocationInfoProps {
  location: {
    name: string;
    place_id: string;
  } | null;
  showHeadings?: boolean;
  className?: string;
}

export function LocationInfo({
  location,
  className,
}: LocationInfoProps) {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];

  if (!location) return null;
  
  return (
    <div
      className={cn('flex items-center gap-2', className)}
    >
      <MapPin className="size-4 text-muted-foreground" />
      <Link
        to={`/${language}/places/${location.place_id}`}
        className="hover:text-primary transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {location.name}
      </Link>
    </div>
  );
}

interface DateInfoProps {
  date: Date | null;
  showHeadings?: boolean;
  className?: string;
}

export function DateInfo({
  date,
  showHeadings = false,
  className,
}: DateInfoProps) {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];

  if (!date) return null;

  return (
    <div
      className={cn('flex items-center gap-2', className)}
    >
      {showHeadings && (
        <span className="text-muted-foreground">
          {t.drinkDate}
        </span>
      )}
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span>{format(date, 'PPP')}</span>
    </div>
  );
}

interface CommentInfoProps {
  comments: string | null;
  className?: string;
  commentClassName?: string;
}

export function CommentInfo({
  comments,
  className,
  commentClassName,
}: CommentInfoProps) {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];

  if (!comments) return null;

  const formatCommentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        const cleanUrl = part.replace(/^https?:\/\//, '');
        const displayUrl =
          cleanUrl.length > 15
            ? cleanUrl.substring(0, 12) + '...'
            : cleanUrl;
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
            onClick={e => e.stopPropagation()}
          >
            {displayUrl}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p
        className={cn(
          'whitespace-pre-wrap break-words max-w-full',
          commentClassName,
        )}
      >
        {formatCommentWithLinks(comments)}
      </p>
    </div>
  );
}

interface VisibilityInfoProps {
  visibility: 'public' | 'private';
  showHeadings?: boolean;
  className?: string;
}

export function VisibilityInfo({
  visibility,
  showHeadings = false,
  className,
}: VisibilityInfoProps) {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];

  return (
    <div
      className={cn('flex items-center gap-2', className)}
    >
      {showHeadings && (
        <span className="text-muted-foreground">
          {t.visibility}
        </span>
      )}
      <Eye className="h-4 w-4 text-muted-foreground" />
      <span>
        {visibility === 'public'
          ? t.visibilityPublic
          : t.visibilityPrivate}
      </span>
    </div>
  );
}

// Keep the original component for backward compatibility
interface CocktailLogInfoProps {
  location: string | null;
  comments: string | null;
  drinkDate: Date | null;
  visibility?: 'public' | 'private';
  showHeadings?: boolean;
  className?: string;
  commentClassName?: string;
}

export function CocktailLogInfo({
  location,
  comments,
  drinkDate,
  visibility,
  showHeadings = false,
  className,
  commentClassName,
}: CocktailLogInfoProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <LocationInfo
        location={location}
        showHeadings={showHeadings}
      />
      <DateInfo
        date={drinkDate}
        showHeadings={showHeadings}
      />
      <CommentInfo
        comments={comments}
        showHeadings={showHeadings}
        commentClassName={commentClassName}
      />
      {/* {visibility && (
        <VisibilityInfo visibility={visibility} showHeadings={showHeadings} />
      )} */}
    </div>
  );
}
