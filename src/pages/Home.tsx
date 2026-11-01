import { Navigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { language } = useLanguage();
  // Explorer-only: was feeds
  return <Navigate to={`/${language}/explorer`} replace />;
}
