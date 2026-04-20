import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: Array<{ id: number; imageUrl: string; caption?: string }>;
  initialIndex?: number;
}

export default function ImageLightbox({ images, initialIndex = 0 }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  if (!currentImage) return null;

  return (
    <>
      {/* Trigger - Galeria de miniaturas */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => {
              setCurrentIndex(index);
              setIsOpen(true);
            }}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted hover:opacity-75 transition-opacity"
          >
            <img
              src={image.imageUrl}
              alt={image.caption || "Imagem"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3C/svg%3E";
              }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Imagem Principal */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-black">
              <img
                src={currentImage.imageUrl}
                alt={currentImage.caption || "Imagem"}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Legenda */}
            {currentImage.caption && (
              <div className="bg-black/50 text-white p-3 text-center text-sm">
                {currentImage.caption}
              </div>
            )}

            {/* Navegação */}
            <div className="flex items-center justify-between mt-4 text-white">
              <Button
                size="icon"
                variant="ghost"
                onClick={goToPrevious}
                className="hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="text-sm">
                {currentIndex + 1} / {images.length}
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={goToNext}
                className="hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
