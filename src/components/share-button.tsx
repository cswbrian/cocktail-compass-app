"use client";

import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { sendGAEvent } from "@/lib/ga";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      
      sendGAEvent('share', 'share_cocktail', url);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      title="Share"
    >
      <Share className="h-4 w-4" />
    </Button>
  );
} 