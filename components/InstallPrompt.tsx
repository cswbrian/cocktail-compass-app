"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
// Extend Window interface to include MSStream
declare global {
  interface Window {
    MSStream?: unknown;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [toastId, setToastId] = useState<string | number | undefined>();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!toastId) {
        showInstallToast();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show the prompt after a short delay
    if (isIOSDevice && !toastId) {
      const timer = setTimeout(() => {
        showInstallToast();
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [language, toastId]);

  const showInstallToast = () => {
    if (isInstalled) return;

    const id = toast(
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">
          {isIOS ? t.addToHomeScreen : t.installApp}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isIOS ? t.addToHomeScreenDescription : t.installAppDescription}
        </p>
        {!isIOS && deferredPrompt && (
          <Button onClick={handleInstallClick} size="sm" className="mt-2">
            <Download className="h-4 w-4 mr-2" />
            {t.installApp}
          </Button>
        )}
      </div>,
      {
        duration: Infinity,
        position: "bottom-center",
        cancel: {
          label: t.dismiss,
          onClick: () => {
            toast.dismiss(id);
            setToastId(undefined);
          },
        },
        cancelButtonStyle: {
          background: "var(--muted)",
          color: "var(--muted-foreground)",
        },
      }
    );
    setToastId(id);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        if (toastId) {
          toast.dismiss(toastId);
          setToastId(undefined);
        }
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  return (
    <>
      <Toaster />
    </>
  );
} 