import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import type { Photo } from '../../content';
import { Washi } from './Stickers';

type Props = {
  photo: Photo;
  width?: number | string;
  rotate?: number;
  tape?: boolean | 'left' | 'right';
  tapeColor?: string;
  aspect?: number; // h / w of the picture window
  className?: string;
  style?: CSSProperties;
  onOpen?: () => void;
  layoutId?: string;
  caption?: ReactNode;
  heart?: boolean;
  label?: string;
  imgPosition?: string;
};

/**
 * A slightly rotated, hand-framed instant photo. The picture itself is shown
 * untouched (only cropped by the frame); tapping it opens the full image.
 */
export function Polaroid({
  photo,
  width = 200,
  rotate = -3,
  tape = true,
  tapeColor,
  aspect = 1,
  className = '',
  style,
  onOpen,
  layoutId,
  caption,
  heart,
  label,
  imgPosition = 'center',
}: Props) {
  const Tag = onOpen ? motion.button : motion.div;
  return (
    <Tag
      type={onOpen ? 'button' : undefined}
      onClick={onOpen}
      aria-label={onOpen ? label ?? `Open photo: ${photo.alt}` : undefined}
      className={`group relative block select-none text-left ${onOpen ? 'cursor-zoom-in' : ''} ${className}`}
      style={{ width, rotate, ...style }}
      whileHover={onOpen ? { rotate: rotate * 0.4, y: -4, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
    >
      <div
        className="relative bg-[#fbf8f1] p-[6%] pb-[4%]"
        style={{
          boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 10px 22px -8px rgba(10,14,40,.55), 0 2px 4px rgba(10,14,40,.25)',
          backgroundImage: 'var(--grain)',
          backgroundSize: '240px',
        }}
      >
        <motion.div layoutId={layoutId} className="relative w-full overflow-hidden bg-[#1b2140]" style={{ aspectRatio: `1 / ${aspect}` }}>
          <img
            src={photo.thumb ?? photo.src}
            alt={photo.alt}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: imgPosition }}
          />
          <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 18px rgba(30,20,10,.25)' }} />
        </motion.div>
        <div className="hand min-h-[1.6em] pt-[5%] text-center text-[clamp(14px,1.6vw,20px)] leading-none text-[#3b3f5c]">
          {caption ?? photo.caption}
          {heart && <span className="ml-1 text-[#d78b9d]">♡</span>}
        </div>
      </div>
      {tape && (
        <Washi
          width="42%"
          color={tapeColor}
          rotate={tape === 'right' ? 38 : tape === 'left' ? -38 : -3}
          className="absolute"
          style={
            tape === 'right'
              ? { top: '-3%', right: '-12%' }
              : tape === 'left'
                ? { top: '-3%', left: '-12%' }
                : { top: '-14px', left: '29%' }
          }
        />
      )}
    </Tag>
  );
}
