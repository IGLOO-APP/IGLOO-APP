import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogPortal>
        <DialogOverlay className='bg-black/95 backdrop-blur-xl' />
        <DialogContent
          showCloseButton={false}
          className='fixed inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 m-0 bg-transparent border-none ring-0 shadow-none data-open:zoom-in-100 rounded-none'
        >
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='absolute top-6 right-6 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white'
          >
            <X size={24} />
          </Button>

          <div className='relative w-full h-full flex items-center justify-center p-4'>
            <img
              src={images[currentIndex]}
              alt='Property Fullscreen'
              className='max-w-full max-h-full object-contain rounded-2xl shadow-2xl'
            />
          </div>

          {images.length > 1 && (
            <div className='absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none'>
              <Button
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev(e);
                }}
                className='pointer-events-auto h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white'
              >
                <ChevronLeft size={32} />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onNext(e);
                }}
                className='pointer-events-auto h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white'
              >
                <ChevronRight size={32} />
              </Button>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
