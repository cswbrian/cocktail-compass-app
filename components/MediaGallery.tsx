"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Card } from "@/components/ui/card";

interface MediaItem {
  url: string;
  type: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  title?: string;
  className?: string;
}

export function MediaGallery({ media, title, className = "" }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (media.length === 0) return null;

  const slides: SlideImage[] = media
    .filter((item) => item.type === "image")
    .map((item) => ({
      src: item.url,
      type: "image" as const,
    }));

  return (
    <Card className={`p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="grid grid-cols-3 gap-4">
        {media.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer"
            onClick={() => {
              setCurrentIndex(index);
              setLightboxOpen(true);
            }}
          >
            {item.type === "image" ? (
              <div className="relative w-full h-full">
                <Image
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  fill
                  className="object-cover rounded-lg hover:opacity-90 transition-opacity"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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