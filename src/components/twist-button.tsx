'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendGAEvent } from '@/lib/ga';
import { useLanguage } from '@/context/LanguageContext';

interface TwistButtonProps {
  cocktailSlug: string;
  children: React.ReactNode;
}

export function TwistButton({
  cocktailSlug,
  children,
}: TwistButtonProps) {
  const handleClick = () => {
    sendGAEvent(
      'cocktail_page',
      'find_twists',
      cocktailSlug,
    );
  };

  const { language } = useLanguage();

  return (
    <Button
      asChild
      variant="secondary"
      onClick={handleClick}
    >
      <Link to={`/${language}/cocktails/${cocktailSlug}/twist`}>
        <Sparkles className="w-4 h-4" />
        {children}
      </Link>
    </Button>
  );
}
