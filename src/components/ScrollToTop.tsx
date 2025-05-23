import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Find the main content container and scroll it to top
    const mainContent = document.querySelector(
      '.overflow-auto',
    );
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }
  }, [pathname, search]);

  return null;
}
