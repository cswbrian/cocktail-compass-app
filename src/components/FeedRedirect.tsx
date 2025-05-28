import { Navigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export function FeedRedirect() {
  const { language } = useLanguage();
  
  // Get the preferred feed page from localStorage, default to 'recommend'
  const preferredFeed = localStorage.getItem('preferred-feed') || 'recommend';
  
  return <Navigate to={`/${language}/feeds/${preferredFeed}`} replace />;
} 