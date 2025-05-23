import ReactGA from 'react-ga4';

// Initialize GA4 with your measurement ID
export const initGA = () => {
  ReactGA.initialize('G-XXXXXXXXXX'); // Replace with your actual GA4 measurement ID
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
