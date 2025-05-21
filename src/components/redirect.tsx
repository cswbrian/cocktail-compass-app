'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Loading } from '@/components/ui/loading';

interface RedirectProps {
  to: string;
}

export function Redirect({ to }: RedirectProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    // If 'to' already includes a language prefix, use it as is
    // Otherwise, prepend the current language
    const redirectPath = to.startsWith('/en/') || to.startsWith('/zh/') 
      ? to 
      : `/${language}${to}`;
    
    navigate(redirectPath);
  }, [navigate, language, to]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
} 