'use client';

import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Menu } from '@/components/ui/menu';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}

// Extend the Window interface to include MSStream
declare global {
  interface Window {
    MSStream?: unknown;
  }
}

export function Header() {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  // Check if we're on the map page (which has transparent header)
  const isMapPage = location.pathname.includes('/map');

  useEffect(() => {
    // Check if app is installed
    if (
      window.matchMedia('(display-mode: standalone)')
        .matches ||
      window.navigator.standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if device is iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt,
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, we need to show a custom message since we can't programmatically trigger the Add to Home Screen prompt
      const isSafari =
        /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent,
        );
      if (isSafari) {
        // Show instructions for iOS Safari
        alert(
          t.addToHomeScreenInstructions ||
            'To install this app, tap the Share button and select "Add to Home Screen"',
        );
      } else {
        // For other iOS browsers, use the share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: t.appName,
              text: t.installApp,
              url: window.location.href,
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        }
      }
    } else if (deferredPrompt) {
      // For Android/Chrome
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
        }
      } catch (error) {
        console.error(
          'Error showing install prompt:',
          error,
        );
      }
    }
  };

  return (
    <header className={`flex justify-between items-center px-6 py-4 fixed top-0 left-0 right-0 z-50 ${isMapPage ? 'bg-transparent' : 'bg-black'}`}>
      <div className="flex items-center gap-2">
        <Link to={`/${language}`} className="font-medium text-white drop-shadow-lg">
          {t.appName}
        </Link>
        {!isInstalled && (deferredPrompt || isIOS) && (
          <button
            onClick={handleInstallClick}
            className="text-sm text-white/80 hover:text-white flex items-center gap-1 drop-shadow-lg"
          >
            <Download className="h-3 w-3" />
            {t.installApp}
          </button>
        )}
      </div>
      <Menu />
    </header>
  );
}
