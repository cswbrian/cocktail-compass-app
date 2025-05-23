import { useEffect, useRef } from 'react';
import {
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { useUserSettings } from '@/context/UserSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function RequireUsername() {
  const { userSettings } = useUserSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only proceed if we have a user and userSettings is not null
    if (!user || userSettings === null) {
      return;
    }

    // If we're already on the setup page, don't redirect
    if (location.pathname.includes('/profile/setup')) {
      return;
    }

    // If user has a username, don't redirect
    if (userSettings.username) {
      return;
    }

    // If we haven't redirected yet, do it
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      navigate(`/${language}/profile/setup`, {
        replace: true,
        state: { from: location },
      });
    }
  }, [userSettings, navigate, language, location]);

  // Show loading state only while user settings are being loaded
  if (user && userSettings === null) {
    return null; // or a loading spinner
  }

  // Show content if:
  // 1. User is not authenticated (no need to check username)
  // 2. User is authenticated and has a username
  // 3. User is authenticated but userSettings is still loading
  if (
    !user ||
    userSettings?.username ||
    (user && userSettings === null)
  ) {
    return <Outlet />;
  }

  return null;
}
