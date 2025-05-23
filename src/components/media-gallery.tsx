'use client';

import { useState } from 'react';
import Lightbox, {
  SlideImage,
} from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaItem {
  url: string;
  type: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  title?: string;
  className?: string;
}

export function MediaGallery({
  media,
  title,
  className = '',
}: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<
    Record<string, boolean>
  >({});

  if (media.length === 0) return null;

  const slides: SlideImage[] = media
    .filter(item => item.type === 'image')
    .map(item => ({
      src: item.url,
      type: 'image' as const,
    }));

  const handleImageLoad = (url: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [url]: true,
    }));
  };

  return (
    <Card className={`p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-3 gap-4">
        {media.map((item, index) => (
          <div
            key={index}
            className="relative cursor-pointer"
            onClick={() => {
              if (
                item.type === 'image' &&
                loadedImages[item.url]
              ) {
                setCurrentIndex(index);
                setLightboxOpen(true);
              }
            }}
          >
            {item.type === 'image' ? (
              <div className="relative w-full h-full">
                {!loadedImages[item.url] && (
                  <Skeleton className="absolute inset-0 rounded-lg" />
                )}
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className={`object-cover rounded-lg transition-opacity ${
                    loadedImages[item.url]
                      ? 'opacity-100'
                      : 'opacity-0'
                  } hover:opacity-90`}
                  style={{ width: '100%', height: '100%' }}
                  onLoad={() => handleImageLoad(item.url)}
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                controls
              />
            )}
          </div>
        ))}
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
    </Card>
  );
}
