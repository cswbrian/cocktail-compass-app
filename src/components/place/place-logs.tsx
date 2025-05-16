'use client';

import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";

interface PlaceLogsProps {
  placeId: string;
}

export function PlaceLogs({ placeId }: PlaceLogsProps) {
  return <CocktailLogList type="place" id={placeId} />;
} 