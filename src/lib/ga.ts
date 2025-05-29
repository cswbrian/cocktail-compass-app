import ReactGA from 'react-ga4';

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
export const sendGAEvent = (
  category: string,
  action: string,
  label?: string,
  userId?: string,
) => {
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
export const trackPageView = (path: string, userId?: string) => {
  const pageViewParams: any = {
    page: path,
  };

  if (userId) {
    pageViewParams.userId = userId;
  }

  ReactGA.send({ hitType: "pageview", ...pageViewParams });
};
