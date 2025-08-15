import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase();
}

export function slugify(text: string) {
  return normalizeText(text)
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export function getLocalizedText(
  field: string | Record<string, string>,
  language: string,
) {
  if (typeof field === 'string') return field;
  return field?.[language] || field?.en || '';
}

export function formatBilingualText(
  name: { en: string; zh: string | null },
  language: string,
): string {
  if (language === 'en') {
    return name.en;
  }
  if (!name.zh || name.en === name.zh) {
    return name.en;
  }
  return `${name.en} / ${name.zh}`;
}

export const validLanguages = ['en', 'zh'];

// Detect user agent for browser-specific functionality
export function detectBrowser(): 'chrome' | 'edge' | 'firefox' | 'safari' | 'unknown' {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor;
  const platform = navigator.platform;
  
  // Check if we're in Chrome DevTools mobile emulation
  const isMobileEmulation = userAgent.includes('iPhone') || userAgent.includes('Android') || userAgent.includes('Mobile');
  const isDesktopPlatform = platform.includes('Mac') || platform.includes('Win') || platform.includes('Linux');
  
  // If we have mobile user agent but desktop platform, likely mobile emulation
  if (isMobileEmulation && isDesktopPlatform) {
    // Use vendor to determine actual browser
    if (vendor === 'Google Inc.') {
      return 'chrome';
    }
    if (vendor === 'Apple Computer, Inc.') {
      return 'safari';
    }
  }
  
  // Regular detection logic
  if (userAgent.includes('Edg')) {
    return 'edge';
  }
  
  if (userAgent.includes('Firefox')) {
    return 'firefox';
  }
  
  if (userAgent.includes('Chrome') || userAgent.includes('CriOS')) {
    return 'chrome';
  }
  
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('CriOS')) {
    return 'safari';
  }
  
  // Final fallback to vendor
  if (vendor === 'Google Inc.') {
    return 'chrome';
  }
  
  if (vendor === 'Apple Computer, Inc.') {
    return 'safari';
  }
  
  return 'unknown';
}

/**
 * Get browser-specific tutorial for enabling location
 * @param browser - Browser type
 * @param t - Translations object (optional)
 * @param pwaStatus - PWA status object (optional)
 * @returns Tutorial object with title and steps
 */
export function getBrowserTutorial(
  browser: string, 
  t?: any,
  pwaStatus?: { isPWA: boolean; platform: 'android' | 'ios' | 'desktop' | 'unknown' }
): { title: string; steps: string[] } {
  const isPWA = pwaStatus?.isPWA || false;
  const platform = pwaStatus?.platform || 'unknown';
  
  // PWA-specific tutorials
  if (isPWA) {
    if (platform === 'ios') {
      return {
        title: t?.pwaIOSTitle || 'Enable Location for PWA on iOS',
        steps: t?.pwaIOSSteps || [
          'Device Settings: Open iOS Settings → Privacy & Security → Location Services',
          'Ensure Location Services is turned On',
          'Find Safari in the app list and select location access option',
          'Choose "While Using the App" or "Always" (recommended: "While Using")',
          'Return to the PWA and grant permission when prompted',
          'Refresh the PWA if needed'
        ]
      };
    } else if (platform === 'android') {
      return {
        title: t?.pwaAndroidTitle || 'Enable Location for PWA on Android',
        steps: t?.pwaAndroidSteps || [
          'Device Settings: Open Android Settings → Location',
          'Ensure "Use location" is turned On',
          'Touch and hold the PWA icon on your home screen',
          'Tap "App info" or the "i" icon',
          'Tap "Permissions" → "Location"',
          'Choose: "Allow all the time", "While using app", or "Ask every time"',
          'Return to the PWA and refresh if needed'
        ]
      };
    }
  }
  
  // Regular browser tutorials (existing logic)
  switch (browser) {
    case 'chrome':
      return {
        title: t?.chromeTitle || 'Enable Location in Chrome',
        steps: t?.chromeSteps || [
          'Browser Settings: Open Chrome → More (⋮) → Settings → Advanced → Site settings → Location',
          'Ensure Location is turned On in Chrome settings',
          'Device Settings: Open Android Settings → Location → App location permissions',
          'Find this app in the list and choose permission level',
          'Select "Allow only while using the app" or "Allow all the time"',
          'Refresh the page after changing settings'
        ]
      };
    case 'edge':
      return {
        title: t?.edgeTitle || 'Enable Location in Edge',
        steps: t?.edgeSteps || [
          'Browser Settings: Open Edge → More (⋮) → Settings → Advanced → Site settings → Location',
          'Ensure Location is turned On in Edge settings',
          'Device Settings: Open Android Settings → Location → App location permissions',
          'Find this app in the list and choose permission level',
          'Select "Allow only while using the app" or "Allow all the time"',
          'Refresh the page after changing settings'
        ]
      };
    case 'firefox':
      return {
        title: t?.firefoxTitle || 'Enable Location in Firefox',
        steps: t?.firefoxSteps || [
          'Browser Settings: Open Firefox → Menu (☰) → Settings → Privacy & Security → Permissions → Location',
          'Ensure Location is set to "Ask" or "Allow"',
          'Device Settings: Open Android Settings → Location → App location permissions',
          'Find Firefox in the list and ensure location access is allowed',
          'Choose appropriate permission level for location access',
          'Refresh the page after changing settings'
        ]
      };
    case 'safari':
      return {
        title: t?.safariTitle || 'Enable Location in Safari',
        steps: t?.safariSteps || [
          'Device Settings: Open iOS Settings → Privacy & Security → Location Services',
          'Ensure Location Services is turned On',
          'Find Safari in the list and tap on it',
          'Choose "While Using the App" or "Always" for location access',
          'Enable "Precise Location" for more accurate data if desired',
          'Return to Safari and refresh the page'
        ]
      };
    default:
      return {
        title: t?.defaultTitle || 'Enable Location in Browser',
        steps: t?.defaultSteps || [
          'Click the lock icon 🔒 in the address bar',
          'Change "Location" from "Block" to "Allow"',
          'Refresh the page'
        ]
      };
  }
}

// Build a Google Maps URL that prefers Place ID for direct navigation
export function buildGoogleMapsUrl(place: {
  name: string;
  place_id?: string | null;
  lat: number;
  lng: number;
}): string {
  if (place.place_id) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
}

/**
 * Detects if the app is running as a PWA (installed to home screen)
 * @returns Object with PWA status and platform information
 */
export function detectPWAStatus(): {
  isPWA: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  isStandalone: boolean;
} {
  // Check if running in standalone mode (PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
  
  // Detect platform
  const userAgent = navigator.userAgent;
  let platform: 'android' | 'ios' | 'desktop' | 'unknown' = 'unknown';
  
  if (/Android/i.test(userAgent)) {
    platform = 'android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    platform = 'ios';
  } else if (/Windows|Mac|Linux/i.test(userAgent)) {
    platform = 'desktop';
  }
  
  return {
    isPWA: isStandalone,
    platform,
    isStandalone
  };
}
