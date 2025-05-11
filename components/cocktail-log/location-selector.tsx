"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, X, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import usePlacesAutocomplete, { getGeocode, getLatLng, Suggestion } from "use-places-autocomplete";

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
  label?: string;
}

export function LocationSelector({ value, onChange, label }: LocationSelectorProps) {
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["bar", "night_club", "restaurant", "cafe"],
      locationBias: userLocation ? {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: 50000 // 50km radius
      } : undefined,
    },
    debounce: 300,
  });

  console.log(data)
  const getUserLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      setUserLocation({ lat, lng });
      
      // Get address from coordinates
      const results = await getGeocode({ location: { lat, lng } });
      if (results[0]) {
        const locationData: LocationData = {
          name: results[0].formatted_address,
          place_id: results[0].place_id,
          lat,
          lng,
          main_text: results[0].formatted_address,
          secondary_text: ""
        };
        onChange(locationData);
        setIsLocationDrawerOpen(false);
      }
    } catch (error) {
      console.error("Error getting user location:", error);
    }
  }, [onChange]);

  const handleLocationSearch = (searchTerm: string) => {
    setValue(searchTerm);
  };

  const handleSelect = async (placeId: string, description: string, mainText: string, secondaryText: string) => {
    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = await getLatLng(results[0]);
      
      const locationData: LocationData = {
        name: mainText,
        place_id: placeId,
        lat,
        lng,
        main_text: mainText,
        secondary_text: secondaryText
      };
      
      onChange(locationData);
      setIsLocationDrawerOpen(false);
      clearSuggestions();
    } catch (error) {
      console.error("Error getting location details:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Drawer open={isLocationDrawerOpen} onOpenChange={setIsLocationDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {value?.name || t.selectLocation}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-dvh">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0"
                  onClick={() => setIsLocationDrawerOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="flex-1 text-center text-lg font-semibold">
                  {t.selectLocation}
                </h2>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
              <div className="relative flex-none">
                <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t.searchLocation}
                  value={searchValue}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  className="pl-9"
                  disabled={!ready}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={getUserLocation}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {t.useCurrentLocation}
              </Button>
              <ScrollArea className="flex-1">
                {status === "OK" ? (
                  <div className="space-y-2">
                    {data.map((suggestion: Suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => handleSelect(
                          suggestion.place_id,
                          suggestion.description,
                          suggestion.structured_formatting.main_text,
                          suggestion.structured_formatting.secondary_text
                        )}
                        className={cn(
                          "w-full text-left p-2 rounded-md hover:bg-accent transition-colors",
                          "flex flex-col"
                        )}
                      >
                        <span className="font-medium">{suggestion.structured_formatting.main_text}</span>
                        <span className="text-sm text-muted-foreground">{suggestion.structured_formatting.secondary_text}</span>
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
        </DrawerContent>
      </Drawer>
    </div>
  );
} 