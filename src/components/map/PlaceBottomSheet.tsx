import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceMarker } from '@/types/map';
import { mapService } from '@/services/map-service';
import useSWR from 'swr';
import { CACHE_KEYS, fetchers } from '@/lib/swr-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/common/StarRating';
import { BookmarkButton } from '@/components/bookmark/bookmark-button';
import { PlaceStatusDisplay } from '@/components/common/PlaceStatusDisplay';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link } from 'react-router-dom';
import { sendGAEvent } from '@/lib/ga';
import { ExternalLink, MapPin, Clock, Phone, Globe, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { buildGoogleMapsUrl } from '@/lib/utils';

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
  const [isNavigating, setIsNavigating] = useState(false); // Track navigation state
  const [currentPlace, setCurrentPlace] = useState<PlaceMarker | null>(place); // Local place state
  
  // Update local place state when prop changes
  useEffect(() => {
    setCurrentPlace(place);
  }, [place]);
  
  // Navigation state - circular navigation (always available)
  const currentIndex = currentPlace ? places.findIndex(p => p.id === currentPlace.id) : -1;
  const hasMultiplePlaces = places.length > 1;

  // Fetch place details with stats
  const { data: placeWithStats, isLoading } = useSWR(
    currentPlace ? CACHE_KEYS.PLACE_WITH_STATS(currentPlace.id) : null,
    currentPlace ? () => fetchers.getPlaceWithStats(currentPlace.id) : null,
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

  // Navigation handlers - circular navigation through places
  const handlePrevPlace = useCallback(() => {
    
    if (hasMultiplePlaces) {
      const prevPlace = places[(currentIndex - 1 + places.length) % places.length];
      
      setIsNavigating(true);
      sendGAEvent('Map', 'bottom_sheet_navigate', `prev_${prevPlace.name}`);
      
      // Update local state immediately
      setCurrentPlace(prevPlace);
      
      // Notify parent immediately
      onPlaceChange?.(prevPlace);
      
      // Reset navigation state after animation
      setTimeout(() => {
        setIsNavigating(false);
      }, 200);
    }
  }, [hasMultiplePlaces, places, currentIndex, onPlaceChange, currentPlace]);

  const handleNextPlace = useCallback(() => {
    
    if (hasMultiplePlaces) {
      const nextPlace = places[(currentIndex + 1) % places.length];
      
      setIsNavigating(true);
      sendGAEvent('Map', 'bottom_sheet_navigate', `next_${nextPlace.name}`);
      
      // Update local state immediately
      setCurrentPlace(nextPlace);
      
      // Notify parent immediately
      onPlaceChange?.(nextPlace);
      
      // Reset navigation state after animation
      setTimeout(() => {
        setIsNavigating(false);
      }, 200);
    }
  }, [hasMultiplePlaces, places, currentIndex, onPlaceChange, currentPlace]);

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

  if (!currentPlace || !isOpen) {
    return null;
  }

  // Safety check: ensure the current place is in the filtered places
  if (!places.find(p => p.id === currentPlace.id)) {
    return null;
  }

  const displayPlace = placeWithStats
    ? ({ ...(placeWithStats as any), ...(currentPlace as any) } as any) // prefer dynamic fields from map row (e.g., is_open)
    : currentPlace;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="bottom-sheet-backdrop fixed inset-0 z-50 pointer-events-none">
          {/* No backdrop overlay - let map remain visible */}
          
          {/* Bottom Sheet */}
          <motion.div
            key={`${currentPlace.id}-${isNavigating}`} // Key changes when place changes or navigating
            ref={sheetRef}
            className="absolute bottom-16 left-4 right-4 rounded-3xl shadow-2xl pointer-events-auto bg-gray-900/95 backdrop-blur-sm border border-white/20"
            style={{ 
              maxHeight: '60vh',
              minHeight: '100px'
            }}
            initial={{ 
              y: '100%', 
              opacity: 0,
              scale: 0.95
            }}
            animate={{ 
              y: 0, 
              opacity: 1,
              scale: 1
            }}
            exit={{ 
              y: '100%', 
              opacity: 0,
              scale: 0.95
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
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
              {/* Navigation Loading Indicator */}
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-0 left-0 right-0 z-10 flex justify-center"
                >
                  <div className="bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    {t.loading || 'Loading...'}
                  </div>
                </motion.div>
              )}
              
              {/* Content with smooth transitions */}
              <motion.div
                key={currentPlace.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  ease: "easeOut"
                }}
              >
                {/* Header with Navigation */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white/90 flex-1 pr-2">
                      {displayPlace.name}
                    </h2>
                    <div className="flex items-center gap-1">
                      {/* Previous Place Button */}
                      <button
                        onClick={handlePrevPlace}
                        disabled={!hasMultiplePlaces || isNavigating}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          hasMultiplePlaces && !isNavigating
                            ? 'text-white/90 hover:bg-white/10 hover:text-white' 
                            : 'text-white/30 cursor-not-allowed'
                        }`}
                        title={hasMultiplePlaces ? "Previous place" : "No more places in this direction"}
                      >
                        {isNavigating ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white/90" />
                        ) : (
                          <ChevronLeft className="w-5 h-5" />
                        )}
                      </button>

                      {/* Next Place Button */}
                      <button
                        onClick={handleNextPlace}
                        disabled={!hasMultiplePlaces || isNavigating}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          hasMultiplePlaces && !isNavigating
                            ? 'text-white/90 hover:bg-white/10 hover:text-white' 
                            : 'text-white/30 cursor-not-allowed'
                        }`}
                        title={hasMultiplePlaces ? "Next place" : "No more places in this direction"}
                      >
                        {isNavigating ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white/90" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
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
                    <p className="text-sm text-white/50 mb-1">{displayPlace.secondary_text}</p>
                  )}
                  {displayPlace.description && (
                    <p className="text-sm text-white/60 mb-2">{displayPlace.description}</p>
                  )}

                  {/* Open/Closed Status and Today's Hours */}
                  <div className="flex items-center justify-between mb-2">
                    <PlaceStatusDisplay 
                      place={displayPlace}
                    />
                  </div>
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
                      // Open in maps app - use helper for URL building
                      const url = buildGoogleMapsUrl({
                        name: displayPlace.name,
                        place_id: (displayPlace as any).place_id,
                        lat: displayPlace.lat,
                        lng: displayPlace.lng,
                      });
                      window.open(url, '_blank');
                    }}
                    variant="outline"
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border border-blue-500/20"
                  >
                    {t.viewOnGoogleMaps}
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
