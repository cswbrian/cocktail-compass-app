"use client";

import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface ShareButtonProps {
  url: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ShareButton({ url, onClick }: ShareButtonProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.linkCopied || "Link copied!", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (err) {
      console.error(err);
      toast.error(t.copyFailed || "Failed to copy link");
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="secondary"
      size="icon"
    >
      <Link className="w-4 h-4" />
    </Button>
  );
} 