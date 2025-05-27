import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  Suggestion,
} from 'use-places-autocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { placeService } from '@/services/place-service';
import { toast } from 'sonner';

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

interface GooglePlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData, e?: React.MouseEvent) => void;
  initialSearch?: string;
}

export function GooglePlacesModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialSearch = '',
}: GooglePlacesModalProps) {
  const [searchValue, setSearchValue] = useState(initialSearch);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const {
    ready,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['bar', 'night_club', 'restaurant', 'cafe'],
      locationBias: {
        // Default to Hong Kong as the primary location
        center: { lat: 22.3193, lng: 114.1694 },
        radius: 1000000, // 1000km radius to cover nearby countries
      },
    },
    debounce: 300,
  });

  const handleSearch = (query: string) => {
    setSearchValue(query);
    setValue(query);
  };

  const handleSelect = async (
    placeId: string,
    description: string,
    mainText: string,
    secondaryText: string,
    e?: React.MouseEvent
  ) => {
    // Stop event propagation and prevent default
    e?.preventDefault();
    e?.stopPropagation();

    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = await getLatLng(results[0]);

      const locationData: LocationData = {
        name: mainText,
        place_id: placeId,
        lat,
        lng,
        main_text: mainText,
        secondary_text: secondaryText,
      };

      // Save the place to our database first
      const savedPlace = await placeService.getOrCreatePlace({
        place_id: placeId,
        name: mainText,
        main_text: mainText,
        secondary_text: secondaryText,
        lat,
        lng,
        is_verified: false,
      });

      // Only notify parent after successful save
      onLocationSelect(locationData, e);
      
      toast.success(t.success, {
        description: t.addNewLocation,
      });

      onClose();
      setSearchValue('');
      clearSuggestions();
    } catch (error) {
      console.error('Error getting location details:', error);
      toast.error(t.errorSavingLog);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="flex-1 text-center text-lg font-semibold">
                    {t.searchLocation}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder={t.searchLocation}
                      value={searchValue}
                      onChange={e => handleSearch(e.target.value)}
                      className="pl-9"
                      disabled={!ready}
                    />
                  </div>

                  <ScrollArea className="h-[calc(100vh-200px)]">
                    {status === 'OK' ? (
                      <div className="space-y-2">
                        {data.map((suggestion: Suggestion) => (
                          <button
                            key={suggestion.place_id}
                            onClick={(e) =>
                              handleSelect(
                                suggestion.place_id,
                                suggestion.description,
                                suggestion.structured_formatting.main_text,
                                suggestion.structured_formatting.secondary_text,
                                e
                              )
                            }
                            className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                          >
                            <div className="font-medium">
                              {suggestion.structured_formatting.main_text}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {suggestion.structured_formatting.secondary_text}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        {searchValue ? t.noLocationsFound : t.searchLocation}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 