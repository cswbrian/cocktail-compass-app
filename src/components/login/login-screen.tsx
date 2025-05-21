"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth-service";
import { toast } from "sonner";

export function LoginScreen() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await AuthService.signInWithProvider('google');
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
          {t.featureBookmark}
        </li>
        <li className="flex items-center justify-start">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-2" />
          {t.personalizedRecommendations}
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
    </div>
  );
} 