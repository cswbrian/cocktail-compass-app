import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CITY_QUICK_ZOOM, City, CityArea } from '@/config/map-config';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { sendGAEvent } from '@/lib/ga';

interface CitySelectorProps {
  onCitySelect: (city: City | CityArea) => void;
  currentCity?: City | CityArea | null;
  currentArea?: CityArea | null;
  userPosition?: { latitude: number; longitude: number } | null;
}

// Country flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  'HK': '🇭🇰',
  'MO': '🇲🇴',
  'TW': '🇹🇼',
  'JP': '🇯🇵',
  'TH': '🇹🇭',
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

export function CitySelector({ onCitySelect, currentCity, currentArea, userPosition }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  
  // Update selected key when currentCity or currentArea changes
  useEffect(() => {
    if (currentArea) {
      setSelectedKey(currentArea.key);
    } else if (currentCity) {
      setSelectedKey(currentCity.key);
    } else {
      setSelectedKey(null);
    }
  }, [currentCity, currentArea]);

  const handleCitySelect = (city: City | CityArea) => {
    onCitySelect(city);
    setIsOpen(false);
    
    // Track analytics event with enhanced data
    const eventLabel = city.key.toLowerCase().replace(/\s+/g, '_');
    
    sendGAEvent('Map', 'city_jump', eventLabel);
    
    // Additional tracking for area selections
    if (!('areas' in city)) {
      // This is an area selection
      sendGAEvent('Map', 'area_jump', eventLabel);
    }
  };

  // Track when city selector is opened
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // Track analytics event when city selector is opened
    if (open) {
      sendGAEvent('Map', 'city_selector_opened', 'city_selector');
      
      // Track if user has areas available
      const citiesWithAreas = CITY_QUICK_ZOOM.cities.filter(city => 'areas' in city && city.areas && city.areas.length > 0);
      if (citiesWithAreas.length > 0) {
        sendGAEvent('Map', 'areas_available', `${citiesWithAreas.length}_cities_with_areas`);
      }
    }
  };

  // Handle city/area selection and close sheet
  const handleSelection = (city: City | CityArea) => {
    // Log the selected button
    console.log('Selected button:', {
      key: city.key,
      name: 'name' in city ? city.name : 'N/A',
      type: 'areas' in city ? 'City' : 'Area',
      coordinates: { lat: city.lat, lng: city.lng, zoom: city.zoom },
      country: 'country' in city ? city.country : 'N/A'
    });
    
    // Store the selected key
    setSelectedKey(city.key);
    
    // First close the sheet
    setIsOpen(false);
    // Small delay to ensure sheet closes before handling selection
    setTimeout(() => {
      handleCitySelect(city);
    }, 100);
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

  const currentCityName = currentArea 
    ? `${t[currentArea.key as keyof typeof t] || currentArea.key}, ${t[currentCity?.key as keyof typeof t] || currentCity?.key}`
    : currentCity 
      ? (t[currentCity.key as keyof typeof t] || currentCity.key)
      : (t.selectCity || 'Select City');

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="h-[85vh] w-full rounded-t-[10px] p-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {t.selectCity || 'Select City'}
            </SheetTitle>
          </div>
          {userPosition && (
            <p className="text-xs text-gray-500 mt-1">
              {t.sortedByDistance || 'Sorted by distance from your location'}
            </p>
          )}
        </SheetHeader>
        
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-4 gap-y-2">
          {sortedCities.map((cityWithDistance) => {
            return (
              <div key={`${cityWithDistance.country}-${cityWithDistance.key}`}>
                {/* City Header */}
                <button
                  onClick={() => handleSelection(cityWithDistance)}
                  className={`w-full px-4 py-2 text-left  hover:text-black transition-colors duration-150 flex items-center justify-between group rounded-lg ${
                    selectedKey === cityWithDistance.key 
                      ? 'bg-primary text-white' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{COUNTRY_FLAGS[cityWithDistance.country]}</span>
                    <div className="text-left">
                      <div className="font-semibold text-lg transition-colors">
                        {t[cityWithDistance.key as keyof typeof t] || cityWithDistance.key}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cityWithDistance.distance !== null && (
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        selectedKey === cityWithDistance.key
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-black'
                      }`}>
                        {formatDistance(cityWithDistance.distance)}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* City Areas */}
                {'areas' in cityWithDistance && cityWithDistance.areas && cityWithDistance.areas.length > 0 && (
                  <div className="mt-3 ml-8">
                    <div className="flex flex-wrap gap-2">
                      {cityWithDistance.areas.map((area: CityArea) => (
                        <Button
                          key={`${cityWithDistance.key}-${area.key}`}
                          onClick={() => handleSelection(area)}
                          variant={selectedKey === area.key ? "default" : "outline"}
                          size="sm"
                          className={`${
                            selectedKey === area.key 
                              ? 'bg-primary text-white border-primary' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {t[area.key as keyof typeof t] || area.key}
                          {userPosition && (
                            <span className={`ml-2  ${
                              selectedKey === area.key 
                                ? 'text-white/70' 
                                : 'opacity-70'
                            }`}>
                              {formatDistance(calculateDistance(
                                userPosition.latitude,
                                userPosition.longitude,
                                area.lat,
                                area.lng
                              ))}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}