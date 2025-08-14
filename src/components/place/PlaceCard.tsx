import { Place } from '@/types/place';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { PlaceStatusDisplay } from '@/components/common/PlaceStatusDisplay';
import { MapPin } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  variant?: 'default' | 'compact';
}

export function PlaceCard({ place, variant = 'default' }: PlaceCardProps) {
  const { language } = useLanguage();
  return (
    <Link
      to={`/${language}/places/${place.place_id}`}
      className={cn(
        'block rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] group'
      )}
    >
      <div className="relative border border-white/20 rounded-3xl bg-white/5 backdrop-blur-xs p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/30">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-70" />
        <div className="relative space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-white/90">{place.name}</h3>
            <PlaceStatusDisplay place={place} />
          </div>
          {place.secondary_text && (
            <div className="text-sm text-white/60 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-white/50" />
              <span>{place.secondary_text}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 