import { motion } from 'framer-motion';
import type { CSSProperties, ElementType, ReactNode } from 'react';

/** Reveals lettering left-to-right as if being written, without breaking script ligatures. */
export function WriteOn({
  children,
  delay = 0,
  duration = 1.6,
  className,
  style,
  as = 'div',
  show = true,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  show?: boolean;
}) {
  const M = motion[as as 'div'] ?? motion.div;
  return (
    <M
      className={className}
      style={{ ...style, paddingRight: '0.3em', marginRight: '-0.3em' }}
      initial={{ clipPath: 'inset(-20% 100% -30% -5%)', opacity: 0, filter: 'blur(3px)' }}
      animate={show ? { clipPath: 'inset(-20% -5% -30% -5%)', opacity: 1, filter: 'blur(0px)' } : undefined}
      transition={{ delay, duration, ease: [0.45, 0.05, 0.25, 1], opacity: { delay, duration: 0.4 } }}
    >
      {children}
    </M>
  );
}

export function FadeUp({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 1.1, ease: [0.3, 0.1, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Keeps hyphenated words like “dbcu-verse” from breaking across lines. */
export function NoBreakWords({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className="whitespace-nowrap">
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}
