'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Loading } from '@/components/ui/loading';

interface RedirectProps {
  to: string;
}

export function Redirect({ to }: RedirectProps) {
  const router = useRouter();
  const { language } = useLanguage();

  useEffect(() => {
    // If 'to' already includes a language prefix, use it as is
    // Otherwise, prepend the current language
    const redirectPath = to.startsWith('/en/') || to.startsWith('/zh/') 
      ? to 
      : `/${language}${to}`;
    
    router.push(redirectPath);
  }, [router, language, to]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
} 