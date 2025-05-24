import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { userSettingsService } from '@/services/user-settings-service';
import { useAuth } from '@/context/AuthContext';

export type UserSettings = {
  username?: string;
  instagram_handle?: string;
  threads_handle?: string;
} | null;

type UserSettingsContextType = {
  userSettings: UserSettings;
  refreshUserSettings: () => Promise<void>;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings>
  >;
};

const UserSettingsContext =
  createContext<UserSettingsContextType>({
    userSettings: null,
    refreshUserSettings: async () => {},
    setUserSettings: () => {},
  });

export function UserSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [userSettings, setUserSettings] =
    useState<UserSettings>(null);

  const refreshUserSettings = async () => {
    if (user) {
      const settings =
        await userSettingsService.getUserSettings();
      setUserSettings(settings);
    } else {
      setUserSettings(null);
    }
  };

  useEffect(() => {
    refreshUserSettings();
    // eslint-disable-next-line
  }, [user]);

  return (
    <UserSettingsContext.Provider
      value={{
        userSettings,
        refreshUserSettings,
        setUserSettings,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  return useContext(UserSettingsContext);
}
