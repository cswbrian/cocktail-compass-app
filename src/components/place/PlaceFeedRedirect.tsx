import { Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export function PlaceFeedRedirect() {
  const { language } = useLanguage();
  const { placeId } = useParams();

  // Get the preferred feed page from localStorage, default to 'recommend'
  const preferredFeed =
    localStorage.getItem('preferred-feed') || 'recommend';

  return (
    <Navigate
      to={`/${language}/places/${placeId}/feeds/${preferredFeed}`}
      replace
    />
  );
}
