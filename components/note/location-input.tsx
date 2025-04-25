'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { GooglePlace } from '@/types/note';
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

interface LocationInputProps {
  value: string;
  googlePlace?: GooglePlace;
  onChange: (location: string, googlePlace?: GooglePlace) => void;
}

function LocationInputComponent({ value, googlePlace, onChange }: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handlePredictionClick = useCallback(async (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesLib) return;
    
    console.log('Selected prediction:', prediction);
    
    try {
      const placesService = new placesLib.PlacesService(document.createElement('div'));
      const placeDetails = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.getDetails({ placeId: prediction.place_id }, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error('Failed to get place details'));
          }
        });
      });

      console.log('Place details:', placeDetails);
      
      const googlePlace: GooglePlace = {
        placeId: placeDetails.place_id || '',
        name: placeDetails.name || '',
        address: placeDetails.formatted_address || '',
        lat: placeDetails.geometry?.location?.lat() || 0,
        lng: placeDetails.geometry?.location?.lng() || 0,
      };
      console.log('Processed GooglePlace object:', googlePlace);
      
      onChange(prediction.description, googlePlace);
      setInputValue(prediction.description);
      setShowPredictions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  }, [placesLib, onChange]);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const autocompleteService = new placesLib.AutocompleteService();

    const handleInputChange = async () => {
      const newValue = inputRef.current?.value || '';
      setInputValue(newValue);
      
      if (!newValue) {
        setPredictions([]);
        onChange('', undefined);
        return;
      }

      try {
        const results = await autocompleteService.getPlacePredictions({
          input: newValue,
          types: ['bar'],
          componentRestrictions: { country: ['hk', 'tw', 'jp', 'th', 'cn'] }
        });

        setPredictions(results.predictions);
        setShowPredictions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      }
    };

    inputRef.current.addEventListener('input', handleInputChange);

    return () => {
      inputRef.current?.removeEventListener('input', handleInputChange);
    };
  }, [placesLib, onChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a bar..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!e.target.value) {
              onChange('', undefined);
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => inputRef.current?.focus()}
        >
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
        {showPredictions && predictions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-black rounded-md shadow-lg">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white"
                onClick={() => handlePredictionClick(prediction)}
              >
                {prediction.description}
              </div>
            ))}
          </div>
        )}
      </div>
      {googlePlace && (
        <div className="text-sm text-muted-foreground">
          <p>Selected: {googlePlace.name}</p>
          <p className="text-xs">{googlePlace.address}</p>
        </div>
      )}
    </div>
  );
}

export default function LocationInput(props: LocationInputProps) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <LocationInputComponent {...props} />
    </APIProvider>
  );
} 