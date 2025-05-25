import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link } from 'react-router-dom';

interface TopPlacesProps {
  places: {
    name: string;
    count: number;
    place_id: string;
  }[];
}

function generateMockPlaces() {
  return [
    {
      name: 'The Hidden Bar',
      count: 8,
      place_id: 'mock-1',
    },
    {
      name: 'Skyline Lounge',
      count: 6,
      place_id: 'mock-2',
    },
    {
      name: 'Cocktail Corner',
      count: 5,
      place_id: 'mock-3',
    },
    { name: 'Mixology Lab', count: 4, place_id: 'mock-4' },
    { name: 'Spirit Haven', count: 3, place_id: 'mock-5' },
  ];
}

export function TopPlaces({ places }: TopPlacesProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const hasData = places.length > 0;
  const displayPlaces = hasData
    ? places
    : generateMockPlaces();

  return (
    <Card className="p-6 relative">
      <h3 className="text-lg font-semibold mb-4">
        {t.topBarsWithMostDrinks}
      </h3>
      <div className="relative">
        <div className="space-y-4">
          {displayPlaces.map(place => (
            <div
              key={place.place_id}
              className="flex justify-between items-center"
            >
              <Link
                to={
                  hasData
                    ? `/${language}/places/${place.place_id}`
                    : '#'
                }
                className={`text-primary ${hasData ? 'hover:underline' : 'pointer-events-none'}`}
              >
                {place.name}
              </Link>
              <span className="text-muted-foreground">
                {place.count} {t.drinks}
              </span>
            </div>
          ))}
        </div>
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="text-center p-6 max-w-md">
              <p className="font-bold text-accent-foreground">
                {t.noDataMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
