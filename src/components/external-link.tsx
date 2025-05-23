import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { FEEDBACK_FORM_URL } from '@/constants';

interface ExternalLinkProps {
  message: string;
}

export function ExternalLink({
  message,
}: ExternalLinkProps) {
  return (
    <p className="text-sm text-muted-foreground">
      <a
        href={FEEDBACK_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline flex flex-wrap items-center gap-x-1"
      >
        {message}
        <ExternalLinkIcon className="w-4 h-4" />
      </a>
    </p>
  );
}
