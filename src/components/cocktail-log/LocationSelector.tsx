'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { placeService } from '@/services/place-service';
import { Place } from '@/types/place';
import { GooglePlacesModal } from './GooglePlacesModal';
import { toast } from 'sonner';

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

interface LocationSelectorProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
}

export function LocationSelector({
  value,
  onChange,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGooglePlacesOpen, setIsGooglePlacesOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setIsLoading(true);
        const { data } = await placeService.getAllPlaces();
        setPlaces(data);
      } catch (error) {
        console.error('Error loading places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPlaces();
    }
  }, [isOpen]);

  const handleSearch = (query: string) => {
    setSearchValue(query);
  };

  const handleSelectPlace = (place: Place) => {
    const locationData: LocationData = {
      name: place.name,
      place_id: place.place_id,
      lat: place.lat,
      lng: place.lng,
      main_text: place.main_text || '',
      secondary_text: place.secondary_text || '',
    };
    onChange(locationData);
    setIsOpen(false);
    setSearchValue('');
  };

  const handleGooglePlaceSelect = async (location: LocationData, e?: React.MouseEvent) => {
    // Stop event propagation and prevent default
    e?.preventDefault();
    e?.stopPropagation();

    try {
      // The place is already saved in GooglePlacesModal
      // Just update the form value and UI state
      onChange(location);
      setIsOpen(false);
      setSearchValue('');

      // Refresh the places list
      const { data } = await placeService.getAllPlaces();
      setPlaces(data);
    } catch (error) {
      console.error('Error handling place selection:', error);
      toast.error(t.errorSavingLog);
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (place.main_text || '').toLowerCase().includes(searchValue.toLowerCase()) ||
    (place.secondary_text || '').toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {value?.name || t.selectLocation}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t.searchLocation}
                value={searchValue}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              ) : filteredPlaces.length > 0 ? (
                <div className="mt-2">
                  {filteredPlaces.map(place => (
                    <button
                      key={place.id}
                      onClick={() => handleSelectPlace(place)}
                      className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {place.secondary_text}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {searchValue ? t.noLocationsFound : t.searchLocation}
                </div>
              )}
              <div className="pt-2 border-t" />
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setIsGooglePlacesOpen(true);
                  setIsOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t.addNewLocation}
              </Button>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      <GooglePlacesModal
        isOpen={isGooglePlacesOpen}
        onClose={() => setIsGooglePlacesOpen(false)}
        onLocationSelect={(location: LocationData, e?: React.MouseEvent) => {
          void handleGooglePlaceSelect(location, e);
        }}
        initialSearch={searchValue}
      />
    </div>
  );
}
