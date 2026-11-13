import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { InkRing } from '../art/Stickers';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'night' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  ring?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit';
};

/** A hand-lettered action with an inked oval drawn around it — never a corporate pill. */
export function HandButton({ children, onClick, tone = 'night', size = 'md', ring = true, disabled, className = '', ariaLabel, type = 'button' }: Props) {
  const color = tone === 'night' ? '#efc4ce' : '#8c5a68';
  const fs = size === 'lg' ? 'text-[clamp(24px,3.2vw,34px)] px-9 py-4' : size === 'sm' ? 'text-[19px] px-4 py-2' : 'text-[22px] px-6 py-3';
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`ink-btn hand relative inline-flex min-h-[44px] items-center justify-center whitespace-nowrap leading-none disabled:cursor-not-allowed disabled:opacity-40 ${fs} ${className}`}
      style={{ color: tone === 'night' ? '#f8dbe2' : '#6e4352', textShadow: tone === 'night' ? '0 0 12px rgba(239,196,206,.45)' : 'none' }}
      whileHover={disabled ? undefined : { y: -2, rotate: -0.6 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      {ring && <InkRing color={color} className="pointer-events-none absolute inset-0 h-full w-full" />}
      <span className="relative">{children}</span>
    </motion.button>
  );
}

/** Small underlined handwritten text-button (Undo / Reset / Back links). */
export function InkLink({ children, onClick, tone = 'paper', className = '', ariaLabel, disabled }: Omit<Props, 'size' | 'ring'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`hand group relative inline-flex min-h-[44px] items-center gap-1 px-2 text-[20px] leading-none transition-opacity disabled:opacity-35 ${tone === 'night' ? 'text-[#f1d3da]' : 'text-[#5b4b5f]'} ${className}`}
    >
      <span className="relative">
        {children}
        <svg className="absolute -bottom-1 left-0 h-[6px] w-full" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden>
          <path d="M1 4 C20 1 40 5 60 3 C75 2 88 4 99 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".55" className="transition-opacity group-hover:opacity-100" />
        </svg>
      </span>
    </button>
  );
}
