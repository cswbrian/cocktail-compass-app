import React from 'react';
import { Instagram } from 'lucide-react';

interface SocialMediaLinksProps {
  instagramHandle?: string;
  threadsHandle?: string;
}

export const SocialMediaLinks: React.FC<
  SocialMediaLinksProps
> = ({ instagramHandle, threadsHandle }) => {
  if (!instagramHandle && !threadsHandle) return null;

  return (
    <div className="flex items-center gap-4 mt-2">
      {instagramHandle && (
        <div className="flex items-center gap-2">
          <Instagram className="w-4 h-4" />
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {instagramHandle}
          </a>
        </div>
      )}
      {threadsHandle && (
        <div className="flex items-center gap-2">
          <img
            src="/threads.svg"
            alt="Threads"
            width={16}
            height={16}
          />
          <a
            href={`https://threads.net/${threadsHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {threadsHandle}
          </a>
        </div>
      )}
    </div>
  );
};
