import { useLanguage } from '@/context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import termsEn from '@/content/terms-and-conditions/en.md?raw';
import termsZh from '@/content/terms-and-conditions/zh.md?raw';

const contentMap = {
  en: termsEn,
  zh: termsZh,
};

export default function TermsAndConditionsPage() {
  const { language } = useLanguage();
  const content = contentMap[language] || termsEn;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
