import { Link } from "react-router-dom";
import { translations } from "@/translations";
import { ExternalLink } from "@/components/external-link";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFoundPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center px-4">
        <div>
          <h1 className="text-9xl">404</h1>
          <h2 className="mt-6 text-3xl font-bold">
            {t.pageNotFound}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.pageNotFoundDescription}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            to={`/${language}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t.backToHome}
          </Link>
          <div className="mt-4">
            <ExternalLink message={t.feedbackMessage} />
          </div>
        </div>
      </div>
    </div>
  );
} 