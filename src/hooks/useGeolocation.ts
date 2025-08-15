import { useState, useEffect, useCallback, useRef } from 'react';
import { GeolocationState, GeolocationPosition } from '@/types/map';
import { geolocationService } from '@/services/geolocation-service';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  immediate?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    watch = false,
    immediate = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
    permissionStatus: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Update state safely only if component is mounted
  const updateState = useCallback((updates: Partial<GeolocationState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!geolocationService.isSupported()) {
      updateState({
        error: new Error('Geolocation is not supported') as unknown as GeolocationPositionError,
        loading: false,
      });
      return null;
    }

    updateState({ loading: true, error: null });

    try {
      const position = await geolocationService.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      updateState({
        position,
        loading: false,
        error: null,
      });
      
      return position;
    } catch (error) {
      updateState({
        error: error as GeolocationPositionError,
        loading: false,
      });
      return null;
    }
  }, [enableHighAccuracy, timeout, maximumAge, updateState]);

  // Start watching position
  const startWatching = useCallback(() => {
    if (!geolocationService.isSupported()) {
      updateState({
        error: new Error('Geolocation is not supported') as unknown as GeolocationPositionError,
      });
      return;
    }

    updateState({ loading: true, error: null });

    try {
      watchIdRef.current = geolocationService.watchPosition(
        (position: GeolocationPosition) => {
          updateState({
            position,
            loading: false,
            error: null,
          });
        },
        (error: GeolocationPositionError) => {
          updateState({
            error,
            loading: false,
          });
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    } catch (error) {
      updateState({
        error: error as GeolocationPositionError,
        loading: false,
      });
    }
  }, [enableHighAccuracy, timeout, maximumAge, updateState]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch();
      watchIdRef.current = null;
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const permission = await geolocationService.requestPermission();
      updateState({ permissionStatus: permission });
      return permission;
    } catch (error) {
      updateState({
        error: error as GeolocationPositionError,
      });
      return 'denied' as PermissionState;
    }
  }, [updateState]);

  // Initialize permission status and get last known position
  useEffect(() => {
    const permissionStatus = geolocationService.getPermissionStatus();
    const lastKnownPosition = geolocationService.getLastKnownPosition();
    
    updateState({ 
      permissionStatus,
      position: lastKnownPosition // Initialize with last known position if available
    });
  }, [updateState]);

  // Handle immediate position request
  useEffect(() => {
    if (immediate) {
      getCurrentPosition();
    }
  }, [immediate, getCurrentPosition]);

  // Handle watch mode
  useEffect(() => {
    if (watch) {
      startWatching();
    }

    return () => {
      if (watch) {
        stopWatching();
      }
    };
  }, [watch, startWatching, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopWatching();
    };
  }, [stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission,
    isSupported: geolocationService.isSupported(),
    getErrorMessage: (error: GeolocationPositionError) => 
      geolocationService.getErrorMessage(error),
  };
}
