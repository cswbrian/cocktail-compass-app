import { useLanguage } from '@/context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import privacyPolicyEn from '@/content/privacy-policy/en.md?raw';
import privacyPolicyZh from '@/content/privacy-policy/zh.md?raw';

const contentMap = {
  en: privacyPolicyEn,
  zh: privacyPolicyZh,
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const content = contentMap[language] || privacyPolicyEn;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
