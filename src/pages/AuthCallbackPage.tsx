import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { userSettingsService } from '@/services/user-settings-service';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  const checkUserSettingsAndNavigate = async () => {
    const settings =
      await userSettingsService.getUserSettings();
    if (!settings?.username) {
      navigate(`/${language}/profile/setup`);
    } else {
      navigate(`/${language}`);
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session first
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession) {
          await checkUserSettingsAndNavigate();
          return;
        }

        // If no current session, try to exchange the code
        const {
          data: { session },
          error,
        } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          console.error('Session exchange error:', error);
          // If there's an error with the code exchange, try to get the session again
          const {
            data: { session: fallbackSession },
          } = await supabase.auth.getSession();
          if (fallbackSession) {
            await checkUserSettingsAndNavigate();
            return;
          }
          throw error;
        }

        if (!session) {
          throw new Error(
            'No session after authentication',
          );
        }

        await checkUserSettingsAndNavigate();
      } catch (error) {
        console.error(
          'Error during authentication:',
          error,
        );
        // On error, try to get the current session one last time
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await checkUserSettingsAndNavigate();
        } else {
          // If all else fails, redirect to home
          navigate(`/${language}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, language]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          {translations[language].completingAuthentication}
        </h2>
        <p className="text-gray-600">
          {translations[language].pleaseWaitWhileLoggingIn}
        </p>
      </div>
    </div>
  );
}
