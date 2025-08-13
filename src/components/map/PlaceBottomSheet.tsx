import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlaceMarker } from '@/types/map';
import { mapService } from '@/services/map-service';
import useSWR from 'swr';
import { CACHE_KEYS, fetchers } from '@/lib/swr-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/common/StarRating';
import { BookmarkButton } from '@/components/bookmark/bookmark-button';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link } from 'react-router-dom';
import { sendGAEvent } from '@/lib/ga';
import { ExternalLink, MapPin, Clock, Phone, Globe, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PlaceBottomSheetProps {
  place: PlaceMarker | null;
  places: PlaceMarker[]; // All places for navigation
  onClose: () => void;
  onNavigateToPlace?: (placeId: string) => void;
  onPlaceChange?: (place: PlaceMarker) => void; // Callback when user navigates to different place
  isOpen: boolean;
}

export function PlaceBottomSheet({ 
  place, 
  places,
  onClose, 
  onNavigateToPlace,
  onPlaceChange,
  isOpen 
}: PlaceBottomSheetProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(400); // Default height
  
  // Navigation state
  const currentIndex = place ? places.findIndex(p => p.id === place.id) : -1;
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < places.length - 1;

  // Fetch place details with stats
  const { data: placeWithStats, isLoading } = useSWR(
    place ? CACHE_KEYS.PLACE_WITH_STATS(place.id) : null,
    place ? () => fetchers.getPlaceWithStats(place.id) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Touch event handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);
    
    // Prevent closing if dragging upward
    const deltaY = touchY - startY;
    if (deltaY > 0) {
      // Dragging down - add resistance
      const resistance = Math.min(deltaY * 0.6, 200);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${resistance}px)`;
      }
    }
  }, [isDragging, startY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const deltaY = currentY - startY;
    
    // Reset transform
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    
    // Close if dragged down more than 100px
    if (deltaY > 100) {
      onClose();
    }
  }, [isDragging, currentY, startY, onClose]);

  // Navigation handlers
  const handlePrevPlace = useCallback(() => {
    if (canNavigatePrev) {
      const prevPlace = places[currentIndex - 1];
      sendGAEvent('Map', 'bottom_sheet_navigate', `prev_${prevPlace.name}`);
      onPlaceChange?.(prevPlace);
    }
  }, [canNavigatePrev, places, currentIndex, onPlaceChange]);

  const handleNextPlace = useCallback(() => {
    if (canNavigateNext) {
      const nextPlace = places[currentIndex + 1];
      sendGAEvent('Map', 'bottom_sheet_navigate', `next_${nextPlace.name}`);
      onPlaceChange?.(nextPlace);
    }
  }, [canNavigateNext, places, currentIndex, onPlaceChange]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        // Only close if clicking on the backdrop, not the map
        const target = event.target as HTMLElement;
        if (target.classList.contains('bottom-sheet-backdrop')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!place || !isOpen) {
    return null;
  }

  const displayPlace = placeWithStats || place;

  return (
    <div className="bottom-sheet-backdrop fixed inset-0 z-50 pointer-events-none">
      {/* No backdrop overlay - let map remain visible */}
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`
          absolute bottom-16 left-4 right-4 rounded-3xl shadow-2xl 
          transform transition-transform duration-300 ease-out pointer-events-auto
          bg-gray-900/95 backdrop-blur-sm border border-white/20
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ 
          maxHeight: '60vh',
          minHeight: '100px'
        }}  
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          {/* <div className="w-12 h-1 bg-white/40 rounded-full" /> */}
        </div>

        {/* Gradient Background Effect */}
        <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl opacity-70" />
        
        {/* Content */}
        <div className="relative flex-1 overflow-y-auto px-4 pb-4">
          {/* Header with Navigation */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white/90 flex-1 pr-2">
                {displayPlace.name}
              </h2>
              <div className="flex items-center gap-1">
                {/* Previous Place Button */}
                <button
                  onClick={handlePrevPlace}
                  disabled={!canNavigatePrev}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    canNavigatePrev 
                      ? 'text-white/90 hover:bg-white/10 hover:text-white' 
                      : 'text-white/30 cursor-not-allowed'
                  }`}
                  title="Previous place"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Next Place Button */}
                <button
                  onClick={handleNextPlace}
                  disabled={!canNavigateNext}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    canNavigateNext 
                      ? 'text-white/90 hover:bg-white/10 hover:text-white' 
                      : 'text-white/30 cursor-not-allowed'
                  }`}
                  title="Next place"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Bookmark Button */}
                <BookmarkButton placeId={displayPlace.id} />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 text-white/60 hover:text-white/90 transition-colors rounded-full hover:bg-white/10"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {displayPlace.secondary_text && (
              <p className="text-sm text-white/50 mb-2">{displayPlace.secondary_text}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {displayPlace.is_verified && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/20">
                  ✓ {t.placeVerified}
                </Badge>
              )}
              {(displayPlace as PlaceMarker).distance !== undefined && (
                <Badge variant="outline" className="bg-white/10 text-white/70 border border-white/20">
                  <MapPin className="w-3 h-3 mr-1" />
                  {((displayPlace as PlaceMarker).distance || 0).toFixed(1)} km away
                </Badge>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
              <span className="ml-2 text-white/60">{t.loading}</span>
            </div>
          )}



          {/* Place Details */}
          <div className="space-y-3 mb-6">
            {(displayPlace as any).formatted_address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">{(displayPlace as any).formatted_address}</span>
              </div>
            )}
            
            {(displayPlace as any).opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <div className="text-white/70">
                  <div className="font-medium">Hours</div>
                  <div className="text-sm text-white/60">{(displayPlace as any).opening_hours}</div>
                </div>
              </div>
            )}
            
            {(displayPlace as any).phone_number && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <a 
                  href={`tel:${(displayPlace as any).phone_number}`}
                  className="text-blue-300 hover:text-blue-200 hover:underline"
                >
                  {(displayPlace as any).phone_number}
                </a>
              </div>
            )}
            
            {(displayPlace as any).website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <a 
                  href={(displayPlace as any).website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1"
                >
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/20">
            <Button
              asChild
              className="flex-1 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20"
              variant="outline"
            >
              <Link 
                to={`/${language}/places/${displayPlace.place_id}`}
                onClick={() => sendGAEvent('Map', 'place_detail_view', displayPlace.name)}
              >
                {t.seeMore}
              </Link>
            </Button>
            <Button
              onClick={() => {
                // Track directions click
                sendGAEvent('Map', 'directions_click', displayPlace.name);
                // Open in maps app
                const url = `https://www.google.com/maps/search/?api=1&query=${displayPlace.lat},${displayPlace.lng}`;
                window.open(url, '_blank');
              }}
              variant="outline"
              className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border border-blue-500/20"
            >
              {t.viewOnGoogleMaps}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
