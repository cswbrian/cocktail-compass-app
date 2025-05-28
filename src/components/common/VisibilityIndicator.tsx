import { LockKeyhole, Globe, Users } from 'lucide-react';

interface VisibilityIndicatorProps {
  visibility: 'private' | 'public' | 'friends';
  className?: string;
}

export function VisibilityIndicator({
  visibility,
  className = '',
}: VisibilityIndicatorProps) {
  switch (visibility) {
    case 'private':
      return (
        <LockKeyhole
          className={`w-4 h-4 text-muted-foreground ${className}`}
        />
      );
    case 'friends':
      return (
        <Users
          className={`w-4 h-4 text-muted-foreground ${className}`}
        />
      );
    default:
      return (
        <Globe
          className={`w-4 h-4 text-muted-foreground ${className}`}
        />
      );
  }
}
