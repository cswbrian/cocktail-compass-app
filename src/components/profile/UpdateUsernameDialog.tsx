import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { userSettingsService, UsernameValidationError } from "@/services/user-settings-service";
import { toast } from "sonner";

interface UpdateUsernameDialogProps {
  username: string;
  onUsernameChange: (username: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateUsernameDialog: React.FC<UpdateUsernameDialogProps> = ({
  username,
  onUsernameChange,
  isOpen,
  onOpenChange,
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUsernameChange(e.target.value.toLowerCase());
  };

  const handleUsernameUpdate = async () => {
    try {
      await userSettingsService.updateUsername(username);
      toast.success(t.usernameUpdated);
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error updating username:", error);
      if (error instanceof UsernameValidationError) {
        toast.error(error.message);
      } else {
        toast.error(t.usernameUpdateFailed);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 text-sm text-muted-foreground">
          {t.updateUsername}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.updateUsername}</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          className="mb-2"
          placeholder={t.enterNewUsername}
        />
        <Button onClick={handleUsernameUpdate}>{t.update}</Button>
      </DialogContent>
    </Dialog>
  );
}; 