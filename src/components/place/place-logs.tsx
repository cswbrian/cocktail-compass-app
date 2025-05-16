'use client';

import { CocktailLogList } from "@/components/cocktail-log/cocktail-log-list";

interface PlaceLogsProps {
  placeId: string;
}

export function PlaceLogs({ placeId }: PlaceLogsProps) {
  return <CocktailLogList type="place" id={placeId} />;
} 