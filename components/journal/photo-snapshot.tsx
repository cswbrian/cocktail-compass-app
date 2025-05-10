import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { MediaGallery } from "@/components/MediaGallery";

interface PhotoSnapshotProps {
  photos: { url: string; type: string }[];
}

export function PhotoSnapshot({ photos }: PhotoSnapshotProps) {
  const { language } = useLanguage();
  const t = translations[language];

  if (photos.length === 0) return null;

  return (
    <MediaGallery
      media={photos}
      title={t.recentPhotos}
    />
  );
} 