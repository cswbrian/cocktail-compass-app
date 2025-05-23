import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer mt-8 ml-4"
    >
      <ArrowLeft />
    </div>
  );
}
