import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top on both pathname and search changes
    window.scrollTo({
      top: 0,
      behavior: 'instant' // Use instant to prevent smooth scrolling animation
    });
  }, [pathname, search]);

  return null;
} 