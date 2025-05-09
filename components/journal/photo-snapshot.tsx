import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface PhotoSnapshotProps {
  photos: { url: string; type: string }[];
}

export function PhotoSnapshot({ photos }: PhotoSnapshotProps) {
  const { language } = useLanguage();
  const t = translations[language];

  if (photos.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t.recentPhotos}</h3>
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <img
            key={index}
            src={photo.url}
            alt={`Cocktail photo ${index + 1}`}
            className="w-full aspect-square object-cover rounded-lg"
          />
        ))}
      </div>
    </Card>
  );
} 