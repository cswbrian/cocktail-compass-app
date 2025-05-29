import ReactGA from 'react-ga4';
import { AuthService } from '@/services/auth-service';

// Initialize GA4 with your measurement ID
export const initGA = () => {
  const gaId = import.meta.env.VITE_GA_ID;
  if (!gaId) {
    console.warn('GA4 measurement ID not found in environment variables');
    return;
  }
  ReactGA.initialize(gaId);
};

// Set user ID for tracking
export const setUserId = (userId: string) => {
  ReactGA.set({ userId });
};

// Helper function to send events
export const sendGAEvent = async (
  category: string,
  action: string,
  label?: string,
) => {
  // Get current user ID from auth service
  const user = await AuthService.getCurrentSession();
  const userId = user?.id;

  
  const eventParams: any = {
    category,
    action,
    label,
  };

  if (userId) {
    eventParams.userId = userId;
  }

  ReactGA.event(eventParams);
};

// Track page views with user ID
export const trackPageView = async (path: string) => {
  // Get current user ID from auth service
  const user = await AuthService.getCurrentSession();
  const userId = user?.id;

  const pageViewParams: any = {
    page: path,
  };

  if (userId) {
    pageViewParams.userId = userId;
  }

  ReactGA.send({ hitType: "pageview", ...pageViewParams });
};
