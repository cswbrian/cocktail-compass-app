import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import {
  userSettingsService,
  UsernameValidationError,
} from '@/services/user-settings-service';
import { toast } from 'sonner';
import { UsernameRequirements } from './UsernameRequirements';
import { Instagram } from 'lucide-react';

interface UpdateProfileDialogProps {
  username: string;
  instagramHandle: string;
  threadsHandle: string;
  onUsernameChange: (username: string) => void;
  onInstagramChange: (handle: string) => void;
  onThreadsChange: (handle: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateProfileDialog: React.FC<
  UpdateProfileDialogProps
> = ({
  username,
  instagramHandle,
  threadsHandle,
  onUsernameChange,
  onInstagramChange,
  onThreadsChange,
  isOpen,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [localUsername, setLocalUsername] =
    useState(username);
  const [localInstagram, setLocalInstagram] =
    useState(instagramHandle);
  const [localThreads, setLocalThreads] =
    useState(threadsHandle);

  useEffect(() => {
    setLocalUsername(username);
    setLocalInstagram(instagramHandle);
    setLocalThreads(threadsHandle);
  }, [username, instagramHandle, threadsHandle]);

  const handleUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalUsername(e.target.value.toLowerCase());
  };

  const handleInstagramChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalInstagram(e.target.value);
  };

  const handleThreadsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalThreads(e.target.value);
  };

  const handleProfileUpdate = async () => {
    try {
      // Update username if changed
      if (localUsername !== username) {
        await userSettingsService.updateUsername(
          localUsername,
        );
        onUsernameChange(localUsername);
        toast.success(t.usernameUpdated);
      }

      // Update social handles if changed
      if (
        localInstagram !== instagramHandle ||
        localThreads !== threadsHandle
      ) {
        await userSettingsService.updateInstagramUrl(
          localInstagram,
          localThreads,
        );
        onInstagramChange(localInstagram);
        onThreadsChange(localThreads);
        toast.success(t.instagramUrlUpdated);
      }

      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      if (error instanceof UsernameValidationError) {
        toast.error(error.message);
      } else {
        toast.error(t.usernameUpdateFailed);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.editProfile}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              value={localUsername}
              onChange={handleUsernameChange}
              className="mb-2"
              placeholder={t.enterNewUsername}
            />
            <UsernameRequirements />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Instagram className="w-4 h-4" />
              <Input
                type="text"
                value={localInstagram}
                onChange={handleInstagramChange}
                placeholder={t.enterNewInstagramName}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/threads.svg"
                alt="Threads"
                width={16}
                height={16}
              />
              <Input
                type="text"
                value={localThreads}
                onChange={handleThreadsChange}
                placeholder={t.enterNewThreadsName}
              />
            </div>
          </div>
          <Button
            onClick={handleProfileUpdate}
            className="w-full"
            variant="default"
          >
            {t.update}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
