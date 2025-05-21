"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, X } from "lucide-react";
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
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [userLocation] = useState<{ lat: number; lng: number } | null>(null);
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
      } : {
        // Default to Hong Kong as the primary location
        center: { lat: 22.3193, lng: 114.1694 },
        radius: 1000000, // 1000km radius to cover nearby countries
        // Add location biases for countries and popular cocktail cities
        locations: [
          // Hong Kong (already set as center)
          { lat: 22.3193, lng: 114.1694 }, // Hong Kong Central
          { lat: 22.2783, lng: 114.1747 }, // Hong Kong TST
          
          // Taiwan
          { lat: 23.6978, lng: 120.9605 }, // Taiwan center
          { lat: 25.0330, lng: 121.5654 }, // Taipei
          { lat: 22.9997, lng: 120.2269 }, // Tainan
          { lat: 22.6273, lng: 120.3014 }, // Kaohsiung
          
          // Japan
          { lat: 36.2048, lng: 138.2529 }, // Japan center
          { lat: 35.6762, lng: 139.6503 }, // Tokyo
          { lat: 34.6937, lng: 135.5023 }, // Osaka
          { lat: 35.0116, lng: 135.7681 }, // Kyoto
          { lat: 33.5902, lng: 130.4017 }, // Fukuoka
          
          // Thailand
          { lat: 15.8700, lng: 100.9925 }, // Thailand center
          { lat: 13.7563, lng: 100.5018 }, // Bangkok
          { lat: 7.9519, lng: 98.3381 },   // Phuket
          { lat: 18.7961, lng: 98.9797 },  // Chiang Mai
          
          // Singapore
          { lat: 1.3521, lng: 103.8198 },  // Singapore
          
          // South Korea
          { lat: 35.9078, lng: 127.7669 }, // South Korea center
          { lat: 37.5665, lng: 126.9780 }, // Seoul
          { lat: 35.1796, lng: 129.0756 }, // Busan
          
          // China
          { lat: 35.8617, lng: 104.1954 }, // China center
          { lat: 31.2304, lng: 121.4737 }, // Shanghai
          { lat: 39.9042, lng: 116.4074 }, // Beijing
          { lat: 22.5431, lng: 114.0579 }, // Shenzhen
          { lat: 23.1291, lng: 113.2644 }, // Guangzhou
          
          // Malaysia
          { lat: 4.2105, lng: 101.9758 },  // Malaysia center
          { lat: 3.1390, lng: 101.6869 },  // Kuala Lumpur
          { lat: 5.4141, lng: 100.3288 },  // Penang
          
          // Philippines
          { lat: 12.8797, lng: 121.7740 }, // Philippines center
          { lat: 14.5995, lng: 120.9842 }, // Manila
          { lat: 10.3157, lng: 123.8854 }, // Cebu
          
          // Vietnam
          { lat: 16.4637, lng: 107.5909 }, // Vietnam center
          { lat: 10.8231, lng: 106.6297 }, // Ho Chi Minh City
          { lat: 16.0544, lng: 108.2022 }, // Da Nang
          
          // Indonesia
          { lat: -0.7893, lng: 113.9213 }, // Indonesia center
          { lat: -6.2088, lng: 106.8456 }, // Jakarta
          { lat: -8.4095, lng: 115.1889 }, // Bali
          
          // Other popular cocktail destinations in Asia
          { lat: 27.7172, lng: 85.3240 },  // Kathmandu
          { lat: 47.9184, lng: 106.9177 }, // Ulaanbaatar
          { lat: 17.9757, lng: 102.6331 }, // Vientiane
          { lat: 11.5564, lng: 104.9282 }, // Phnom Penh
          { lat: 16.8661, lng: 96.1951 },  // Yangon
          
          // Popular international cocktail cities
          { lat: 40.7128, lng: -74.0060 }, // New York
          { lat: 51.5074, lng: -0.1278 },  // London
          { lat: 48.8566, lng: 2.3522 },   // Paris
          { lat: 19.4326, lng: -99.1332 }, // Mexico City
          { lat: 41.3851, lng: 2.1734 },   // Barcelona
          { lat: 59.9139, lng: 10.7522 },  // Oslo
          { lat: 37.7749, lng: -122.4194 } // San Francisco
        ]
      },
    },
    debounce: 300,
  });

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