"use client";

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/translations'
import { Menu } from '@/components/ui/menu'
import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function Header() {
  const { language } = useLanguage()
  const t = translations[language]
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-medium">{t.appName}</Link>
        {!isInstalled && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="text-sm text-muted-foreground hover:text-muted-foreground/80 flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            {t.installApp}
          </button>
        )}
      </div>
      <Menu />
    </header>
  )
}
