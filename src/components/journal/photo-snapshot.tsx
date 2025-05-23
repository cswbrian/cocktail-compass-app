import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { MediaGallery } from '@/components/media-gallery';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface PhotoSnapshotProps {
  photos: { url: string; type: string }[];
  isLoading?: boolean;
}

export function PhotoSnapshot({
  photos,
  isLoading = false,
}: PhotoSnapshotProps) {
  const { language } = useLanguage();
  const t = translations[language];

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton
              key={index}
              className="aspect-square rounded-lg"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (photos.length === 0) return null;

  return (
    <MediaGallery media={photos} title={t.recentPhotos} />
  );
}
