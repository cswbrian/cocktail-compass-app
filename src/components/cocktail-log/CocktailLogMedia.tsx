import { useState } from 'react';
import Lightbox, {
  SlideImage,
} from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface CocktailLogMediaProps {
  media: { url: string; type: 'image' | 'video' }[];
  size?: 'sm' | 'lg';
  className?: string;
}

export function CocktailLogMedia({
  media,
  size = 'sm',
  className = '',
}: CocktailLogMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const sizeClasses = {
    sm: {
      container: 'max-h-[200px]',
      grid: 'auto-cols-[200px]',
      image: '200px',
    },
    lg: {
      container: 'max-h-[300px]',
      grid: 'auto-cols-[300px]',
      image: '300px',
    },
  };

  const slides: SlideImage[] = media
    .filter(item => item.type === 'image')
    .map(item => ({
      src: item.url,
      type: 'image' as const,
    }));

  return (
    <div className={`-mx-6 ${className}`}>
      <div className="overflow-x-auto">
        <div
          className={`${media.length === 1 ? 'flex justify-start pl-6' : `grid grid-flow-col ${sizeClasses[size].grid} gap-2 pl-6`}`}
        >
          {media.map((item, index) => (
            <div
              key={index}
              className={`relative cursor-pointer ${media.length === 1 ? 'w-[200px]' : ''}`}
              onClick={e => {
                e.stopPropagation();
                if (item.type === 'image') {
                  setCurrentIndex(index);
                  setLightboxOpen(true);
                }
              }}
            >
              {item.type === 'image' ? (
                <div className="relative w-full h-full">
                  <img
                    src={item.url}
                    alt={`Media ${index + 1}`}
                    className="object-cover rounded-lg hover:opacity-90 transition-opacity"
                    sizes={sizeClasses[size].image}
                  />
                </div>
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                  onClick={e => e.stopPropagation()}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={currentIndex}
        carousel={{
          spacing: 16,
          padding: 16,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
      />
    </div>
  );
}
