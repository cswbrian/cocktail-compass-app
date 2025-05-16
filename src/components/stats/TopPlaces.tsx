import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Link } from "react-router-dom";

interface TopPlacesProps {
  places: { name: string; count: number; place_id: string }[];
}

export function TopPlaces({ places }: TopPlacesProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t.topBarsWithMostDrinks}</h3>
      <div className="space-y-4">
        {places.map((place) => (
          <div key={place.place_id} className="flex justify-between items-center">
            <Link 
              to={`/${language}/places/${place.place_id}`}
              className="text-primary hover:underline"
            >
              {place.name}
            </Link>
            <span className="text-muted-foreground">
              {place.count} {t.drinks}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
} 