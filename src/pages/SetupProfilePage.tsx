import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  userSettingsService,
  UsernameValidationError,
} from '@/services/user-settings-service';
import { toast } from 'sonner';
import { UsernameRequirements } from '@/components/profile/UsernameRequirements';
import { Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserSettings } from '@/context/UserSettingsContext';

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { refreshUserSettings } = useUserSettings();
  const t = translations[language];
  const [username, setUsername] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [threadsUsername, setThreadsUsername] = useState('');

  const handleUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUsername(e.target.value.toLowerCase());
  };

  const handleInstagramUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setInstagramUsername(e.target.value);
  };

  const handleThreadsUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setThreadsUsername(e.target.value);
  };

  const handleUsernameUpdate = async () => {
    try {
      await userSettingsService.updateUsername(username);
      if (instagramUsername || threadsUsername) {
        await userSettingsService.updateInstagramUrl(
          instagramUsername,
          threadsUsername,
        );
      }
      // Refresh user settings to update the context
      await refreshUserSettings();
      toast.success(t.usernameUpdated);
      navigate(`/${language}`); // Redirect to main app after successful setup
    } catch (error: unknown) {
      console.error('Error updating username:', error);
      if (error instanceof UsernameValidationError) {
        toast.error(error.message);
      } else {
        toast.error(t.usernameUpdateFailed);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-md space-y-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col items-center">
          <img
            src="/web-app-manifest-192x192.png"
            alt="App Icon"
            className="w-24 h-24 mb-2 drop-shadow-lg animate-bounce"
            draggable={false}
          />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {t.welcomeToCocktailCompass.replace(
              '{appName}',
              t.appName,
            )}
          </h1>
          <p className="text-muted-foreground">
            {t.pleaseSetUsername}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder={t.enterNewUsername}
            className="w-full"
          />

          <UsernameRequirements />

          <div className="flex items-center space-x-2">
            <Instagram className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={instagramUsername}
              onChange={handleInstagramUsernameChange}
              placeholder={t.enterNewInstagramName}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <img
              src="/threads.svg"
              alt="Threads"
              width={16}
              height={16}
            />
            <Input
              type="text"
              value={threadsUsername}
              onChange={handleThreadsUsernameChange}
              placeholder={t.enterNewThreadsName}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleUsernameUpdate}
            className="w-full"
            disabled={!username.trim()}
          >
            {t.continue}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
