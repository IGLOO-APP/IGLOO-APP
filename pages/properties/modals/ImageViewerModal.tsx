import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  return (
    <div
      className='fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn'
      onClick={onClose}
    >
      <button
        className='absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110]'
        onClick={onClose}
      >
        <X size={24} />
      </button>

      <div className='relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl'>
        <img
          src={images[currentIndex]}
          alt='Property Fullscreen'
          className='w-full h-full object-contain'
        />
      </div>

      {images.length > 1 && (
        <div className='absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev(e);
            }}
            className='pointer-events-auto p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-110'
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext(e);
            }}
            className='pointer-events-auto p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-110'
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
};
