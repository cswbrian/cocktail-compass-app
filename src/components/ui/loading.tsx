interface LoadingProps {
  className?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({
  className = '',
  fullScreen = false,
  size = 'md',
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-12 h-12 text-xl',
  };

  const content = (
    <div
      className={`flex flex-col items-center gap-3 text-primary ${className}`}
    >
      <span
        className={`${sizeClasses[size]} animate-[fadeInOut_2s_ease-in-out_infinite] translate-x-[-50%]`}
      >
        Loading...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs z-50">
        {content}
      </div>
    );
  }

  return content;
}
