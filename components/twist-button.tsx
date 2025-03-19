"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { sendGAEvent } from '@next/third-parties/google';

interface TwistButtonProps {
  href: string;
  cocktailName: string;
  children: React.ReactNode;
}

export function TwistButton({ href, cocktailName, children }: TwistButtonProps) {
  const handleClick = () => {
    sendGAEvent('cocktail_page', {
      action: 'find_twists',
      cocktail_name: cocktailName
    });
  };

  return (
    <Button asChild variant="secondary" onClick={handleClick}>
      <Link href={href}>
        <Sparkles className="w-4 h-4" />
        {children}
      </Link>
    </Button>
  );
} 