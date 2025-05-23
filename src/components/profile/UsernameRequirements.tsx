import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

export const UsernameRequirements: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <ul className="list-disc pl-5 space-y-1">
        <li>{t.usernameMaxLength}</li>
        <li>{t.usernameLowercaseOnly}</li>
        <li>{t.usernameNoConsecutivePeriods}</li>
        <li>{t.usernameNoPeriodsStartEnd}</li>
      </ul>
      <p className="text-sm mt-2">
        {t.usernameVisibilityNote}
      </p>
    </div>
  );
};
