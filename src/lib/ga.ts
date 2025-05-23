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

// Helper function to send events
export const sendGAEvent = (
  category: string,
  action: string,
  label?: string,
) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
