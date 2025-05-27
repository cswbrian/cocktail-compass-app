'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/auth-service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function LoginScreen() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await AuthService.signInWithProvider('google');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error(t.errorSigningIn, {
        description: t.pleaseTryAgain,
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col mt-20 px-6">
      <motion.img
        src="/web-app-manifest-192x192.png"
        alt="App Icon"
        className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
        animate={{ y: [0, -16, 0], scale: [1, 1.08, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
        draggable={false}
      />
      <h1 className="text-3xl mb-6 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {t.loginToUnlockFeatures}
      </h1>
      <ul className="mb-8 space-y-2 list-none">
        <li className="flex items-center justify-start">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-2" />
          {t.freeOfCharge}
        </li>
        <li className="flex items-center justify-start">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-2" />
          {t.recordYourCocktails}
        </li>
        <li className="flex items-center justify-start">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-2" />
          {t.monthlyStats}
        </li>
        <li className="flex items-center justify-start">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-2" />
          {t.featureBookmark}
        </li>
      </ul>
      <Button
        variant="outline"
        className="w-full max-w-sm"
        onClick={handleGoogleLogin}
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
      <p
        className="text-xs text-muted-foreground text-center mt-4"
        dangerouslySetInnerHTML={{
          __html: t.loginAgreement
            .replace(
              '{terms}',
              `<a href="/${language}/terms-and-conditions" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${
                t.termsAndConditions
              }</a>`,
            )
            .replace(
              '{privacy}',
              `<a href="/${language}/privacy-policy" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${
                t.privacyPolicy
              }</a>`,
            ),
        }}
      />
    </div>
  );
}
