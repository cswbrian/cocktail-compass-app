import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CITY_QUICK_ZOOM, City } from '@/config/map-config';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { sendGAEvent } from '@/lib/ga';

interface CitySelectorProps {
  onCitySelect: (city: City) => void;
  currentCity?: City | null;
  userPosition?: { latitude: number; longitude: number } | null;
}

// Country flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  'HK': '🇭🇰',
  'TW': '🇹🇼',
  'JP': '🇯🇵',
  'TH': '🇹🇭',
};

// City name translation keys mapping
const CITY_TRANSLATION_KEYS: Record<string, string> = {
  'Hong Kong': 'hongKong',
  'Taipei': 'taipei',
  'Tainan': 'tainan',
  'Kaohsiung': 'kaohsiung',
  'Macau': 'macau',
  'Tokyo': 'tokyo',
  'Bangkok': 'bangkok',
  'Chiang Mai': 'chiangMai',
};

// Calculate distance between two coordinates in kilometers
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

export function CitySelector({ onCitySelect, currentCity, userPosition }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const handleCitySelect = (city: { name: string; lat: number; lng: number; zoom: number; country: string }) => {
    onCitySelect(city as City);
    setIsOpen(false);
    
    // Track analytics event
    sendGAEvent('Map', 'city_jump', city.name.toLowerCase().replace(/\s+/g, '_'));
  };

  // Get cities with distance calculations if user position is available
  const citiesWithDistance = CITY_QUICK_ZOOM.cities.map(city => {
    let distance: number | null = null;
    
    if (userPosition) {
      distance = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        city.lat,
        city.lng
      );
    }
    
    return { ...city, distance };
  });

  // Sort cities by distance if user position is available
  const sortedCities = userPosition 
    ? citiesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : citiesWithDistance;

  const currentCityName = currentCity 
    ? (t[CITY_TRANSLATION_KEYS[currentCity.name] as keyof typeof t] || currentCity.name)
    : (t.selectCity || 'Select City');

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          title={t.quickJump || 'Quick Jump to City'}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">
            {currentCityName}
          </span>
          <svg 
            className="w-4 h-4 transition-transform duration-200" 
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-72 p-0" 
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-3 border-b border-gray-100">
          {userPosition && (
            <p className="text-xs text-gray-500 mt-1">
              {t.sortedByDistance || 'Sorted by distance from your location'}
            </p>
          )}
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {sortedCities.map((cityWithDistance) => {
            const city = { name: cityWithDistance.name, lat: cityWithDistance.lat, lng: cityWithDistance.lng, zoom: cityWithDistance.zoom, country: cityWithDistance.country };
            return (
              <button
                key={`${city.country}-${city.name}`}
                onClick={() => handleCitySelect(city)}
                className={`w-full px-3 py-3 text-left hover:bg-gray-50 hover:text-black transition-colors duration-150 flex items-center justify-between group ${
                  currentCity?.name === city.name ? 'bg-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{COUNTRY_FLAGS[city.country]}</span>
                  <div className="text-left">
                    <div className="font-medium transition-colors">
                      {t[CITY_TRANSLATION_KEYS[city.name] as keyof typeof t] || city.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {cityWithDistance.distance !== null && (
                    <span className="text-xs text-black bg-gray-100 px-2 py-1 rounded-full">
                      {formatDistance(cityWithDistance.distance)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
