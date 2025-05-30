import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { InAppBrowserWarning } from '@/components/InAppBrowserWarning';

interface GoogleLoginButtonProps {
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
  checkInAppBrowser?: boolean;
}

export function GoogleLoginButton({ 
  isLoading, 
  onClick, 
  className,
  checkInAppBrowser = false 
}: GoogleLoginButtonProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [showInAppWarning, setShowInAppWarning] = useState(false);

  const handleClick = async () => {
    if (checkInAppBrowser) {
      // For testing: Add ?test=inapp to URL to force show the warning
      const urlParams = new URLSearchParams(window.location.search);
      const isTestMode = urlParams.get('test') === 'inapp';
      if (isTestMode) {
        setShowInAppWarning(true);
        return;
      }

      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(userAgent);

      // Detect iOS in-app browser
      const isIOSInAppBrowser = isIOS && !/Safari|CriOS/.test(userAgent);

      // Detect Android in-app browser
      const isAndroidInAppBrowser = isAndroid && !/Chrome/.test(userAgent);

      if (isIOSInAppBrowser || isAndroidInAppBrowser) {
        setShowInAppWarning(true);
        return;
      }
    }
    
    onClick();
  };

  return (
    <>
      <Button
        variant="outline"
        className={className}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {t.signingIn}
          </div>
        ) : (
          <>
            <img
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            {t.signInWithGoogle}
          </>
        )}
      </Button>
      {checkInAppBrowser && (
        <InAppBrowserWarning 
          isOpen={showInAppWarning} 
          onOpenChange={setShowInAppWarning} 
        />
      )}
    </>
  );
} 