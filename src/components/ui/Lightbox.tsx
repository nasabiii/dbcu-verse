import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Photo } from '../../content';

/** Full-size, unaltered view of a photo. Esc / tap outside / button closes it. */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
  layoutPrefix,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  layoutPrefix?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && photos.length > 1) onIndex(((index ?? 0) + 1) % photos.length);
      if (e.key === 'ArrowLeft' && photos.length > 1) onIndex(((index ?? 0) - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [open, index, photos.length, onClose, onIndex]);

  const photo = index !== null ? photos[index] : null;
  return createPortal(
    <AnimatePresence>
      {photo && (
        <motion.div
          key="lb"
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[#0b1230]/85 backdrop-blur-[2px]" />
          <motion.figure
            layoutId={layoutPrefix ? `${layoutPrefix}-${index}` : undefined}
            className="relative max-h-full max-w-[min(92vw,1100px)] bg-[#fbf8f1] p-3 pb-12 sm:p-4 sm:pb-14"
            style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)', backgroundImage: 'var(--grain)' }}
            initial={layoutPrefix ? undefined : { scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: -0.6 }}
            exit={layoutPrefix ? undefined : { scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={photo.src} alt={photo.alt} className="block max-h-[calc(100dvh-160px)] w-auto max-w-full object-contain" draggable={false} />
            {photo.caption && <figcaption className="hand absolute bottom-3 left-0 right-0 text-center text-[24px] text-[#3b3f5c]">{photo.caption}</figcaption>}
          </motion.figure>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="hand absolute right-4 top-4 z-10 min-h-[44px] min-w-[44px] text-[22px] text-[#f8dbe2]"
            style={{ top: 'max(16px, env(safe-area-inset-top))' }}
          >
            close ✕
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); onIndex(((index ?? 0) - 1 + photos.length) % photos.length); }} className="hand absolute bottom-6 left-4 z-10 min-h-[44px] px-3 text-[22px] text-[#f8dbe2] sm:bottom-auto sm:left-6">‹ before</button>
              <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); onIndex(((index ?? 0) + 1) % photos.length); }} className="hand absolute bottom-6 right-4 z-10 min-h-[44px] px-3 text-[22px] text-[#f8dbe2] sm:bottom-auto sm:right-6">after ›</button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
