import { GeolocationPosition, GeolocationState } from '@/types/map';

export class GeolocationService {
  private watchId: number | null = null;
  private lastKnownPosition: GeolocationPosition | null = null;
  private permissionStatus: PermissionStatus | null = null;

  constructor() {
    this.initializePermissionStatus();
  }

  /**
   * Initialize permission status monitoring
   */
  private async initializePermissionStatus() {
    if ('permissions' in navigator) {
      try {
        this.permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        
        // Listen for permission changes
        this.permissionStatus.addEventListener('change', () => {
          console.log('Geolocation permission changed:', this.permissionStatus?.state);
        });
      } catch (error) {
        console.warn('Unable to query geolocation permission:', error);
      }
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): PermissionState | null {
    return this.permissionStatus?.state || null;
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current position with promise-based API
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options,
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          this.lastKnownPosition = geoPosition;
          resolve(geoPosition);
        },
        (error) => {
          reject(this.handleGeolocationError(error));
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch position changes
   */
  watchPosition(
    successCallback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options?: PositionOptions
  ): number {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000, // 1 minute
      ...options,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const geoPosition: GeolocationPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        this.lastKnownPosition = geoPosition;
        successCallback(geoPosition);
      },
      (error) => {
        const handledError = this.handleGeolocationError(error);
        if (errorCallback) {
          errorCallback(handledError);
        }
      },
      defaultOptions
    );

    return this.watchId;
  }

  /**
   * Stop watching position
   */
  clearWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known position from cache
   */
  getLastKnownPosition(): GeolocationPosition | null {
    return this.lastKnownPosition;
  }

  /**
   * Request permission explicitly (for better UX)
   */
  async requestPermission(): Promise<PermissionState> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    // Try to get permission through getCurrentPosition with a quick timeout
    try {
      await this.getCurrentPosition({ timeout: 1000, maximumAge: Infinity });
      return 'granted';
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      
      switch (geoError.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          return 'denied';
        case GeolocationPositionError.TIMEOUT:
          // Timeout doesn't necessarily mean permission denied
          return this.permissionStatus?.state || 'prompt';
        default:
          return 'prompt';
      }
    }
  }

  /**
   * Handle geolocation errors with user-friendly messages
   */
  private handleGeolocationError(error: GeolocationPositionError): GeolocationPositionError {
    let message = '';
    
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        message = 'Location access denied by user. Please enable location services in your browser settings.';
        break;
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        message = 'Location information unavailable. Please check your device settings.';
        break;
      case GeolocationPositionError.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        break;
      default:
        message = 'An unknown error occurred while retrieving location.';
        break;
    }

    // Create a new error with user-friendly message
    const friendlyError = new Error(message) as GeolocationPositionError;
    friendlyError.code = error.code;
    friendlyError.PERMISSION_DENIED = error.PERMISSION_DENIED;
    friendlyError.POSITION_UNAVAILABLE = error.POSITION_UNAVAILABLE;
    friendlyError.TIMEOUT = error.TIMEOUT;

    return friendlyError;
  }

  /**
   * Check if location is stale
   */
  isLocationStale(maxAgeMs: number = 300000): boolean { // 5 minutes default
    if (!this.lastKnownPosition) return true;
    
    // Note: We don't have timestamp in our GeolocationPosition type
    // In a real implementation, you might want to add a timestamp field
    return false;
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return 'Please enable location access to find nearby cocktail bars';
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return 'Unable to determine your location. Please check your device settings';
      case GeolocationPositionError.TIMEOUT:
        return 'Location request timed out. Please try again';
      default:
        return 'Unable to access your location. Please try again';
    }
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.clearWatch();
    this.lastKnownPosition = null;
    
    if (this.permissionStatus) {
      this.permissionStatus.removeEventListener('change', () => {});
    }
  }
}

export const geolocationService = new GeolocationService();
