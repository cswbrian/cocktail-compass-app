'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendGAEvent } from '@/lib/ga';

interface TwistButtonProps {
  href: string;
  cocktailName: string;
  children: React.ReactNode;
}

export function TwistButton({
  href,
  cocktailName,
  children,
}: TwistButtonProps) {
  const handleClick = () => {
    sendGAEvent(
      'cocktail_page',
      'find_twists',
      cocktailName,
    );
  };

  return (
    <Button
      asChild
      variant="secondary"
      onClick={handleClick}
    >
      <Link to={href}>
        <Sparkles className="w-4 h-4" />
        {children}
      </Link>
    </Button>
  );
}
