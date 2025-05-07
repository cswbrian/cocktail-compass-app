import Image from "next/image";

interface CocktailLogMediaProps {
  media: { url: string; type: 'image' | 'video' }[];
  size?: 'sm' | 'lg';
  className?: string;
}

export function CocktailLogMedia({ media, size = 'sm', className = '' }: CocktailLogMediaProps) {
  if (!media || media.length === 0) return null;

  const sizeClasses = {
    sm: {
      container: 'max-h-[200px]',
      grid: 'auto-cols-[200px]',
      image: '200px'
    },
    lg: {
      container: 'max-h-[300px]',
      grid: 'auto-cols-[300px]',
      image: '300px'
    }
  };

  return (
    <div className={`overflow-x-auto -mx-6 ${sizeClasses[size].container} ${className}`}>
      <div className={`grid grid-flow-col ${sizeClasses[size].grid} gap-2 px-6`}>
        {media.map((item, index) => (
          <div key={index} className="relative aspect-square">
            {item.type === 'image' ? (
              <div className="relative w-full h-full">
                <Image
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes={sizeClasses[size].image}
                />
              </div>
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover rounded-lg"
                controls
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 