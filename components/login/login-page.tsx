"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // If user is already logged in, redirect back
    if (user) {
      const returnUrl = localStorage.getItem('returnUrl') || `/${language}`;
      localStorage.removeItem('returnUrl'); // Clean up
      router.push(returnUrl);
    }
  }, [user, router, language]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Redirect will happen automatically via the useEffect above
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="flex flex-col mt-20 px-6">
      <h1 className="text-3xl mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
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
        {/* Add more feature items here based on your translations */}
      </ul>
      <Button
        variant="outline"
        className="w-full max-w-sm"
        onClick={handleGoogleLogin}
      >
        <Image
          src="/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="mr-2"
        />
        {t.signInWithGoogle}
      </Button>
    </div>
  );
} 