'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/loading';
import { LoginScreen } from '@/components/login/login-screen';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { toast } from 'sonner';

interface AuthWrapperProps {
  children: React.ReactNode;
  customLoading?: React.ReactNode;
}

export function AuthWrapper({
  children,
  customLoading,
}: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (user) {
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl'); // Clean up
        navigate(returnUrl);

        // Show welcome back toast
        toast.success(t.welcomeBack, {
          description: user.user_metadata?.name
            ? `${t.welcomeBackMessage} ${user.user_metadata.name}!`
            : t.welcomeBackMessage,
          duration: 3000,
        });
      }
    }
  }, [user, navigate, language, t]);

  if (loading) {
    return (
      customLoading || (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loading />
        </div>
      )
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
