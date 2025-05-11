"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { LoginScreen } from "@/components/login/login-screen";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { toast } from "sonner";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (user) {
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl'); // Clean up
        router.push(returnUrl);
        
        // Show welcome back toast
        toast.success(t.welcomeBack, {
          description: user.user_metadata?.name ? `${t.welcomeBackMessage} ${user.user_metadata.name}!` : t.welcomeBackMessage,
          duration: 3000,
        });
      }
    }
  }, [user, router, language, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
} 