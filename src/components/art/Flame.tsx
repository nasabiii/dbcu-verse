import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef } from 'react';

/** Golden candle flame with irregular flicker + extinguish smoke. Positioned by its parent. */
export function Flame({ lit, onBlow, label, scale = 1 }: { lit: boolean; onBlow: () => void; label: string; scale?: number }) {
  const timing = useMemo(
    () => ({
      flicker: `${(1.05 + Math.random() * 0.7).toFixed(2)}s`,
      glow: `${(1.7 + Math.random() * 1.2).toFixed(2)}s`,
      delay: `${(-Math.random() * 2).toFixed(2)}s`,
    }),
    [],
  );
  const wasLit = useRef(false);
  if (lit) wasLit.current = true;
  const w = 22 * scale;
  const h = 44 * scale;
  return (
    <div className="pointer-events-none absolute" style={{ width: w, height: h, left: -w / 2, top: -h }}>
      {/* warm light pool */}
      <AnimatePresence>
        {lit && (
          <motion.div
            key="glow"
            className="flame-glow absolute rounded-full"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 1.4 } }}
            transition={{ duration: 1.2 }}
            style={{
              width: w * 7,
              height: w * 7,
              left: w / 2 - (w * 7) / 2,
              top: h * 0.62 - (w * 7) / 2,
              background: 'radial-gradient(circle, rgba(255,214,140,.42) 0%, rgba(255,190,110,.16) 35%, rgba(255,190,110,0) 70%)',
              animationDuration: timing.glow,
              animationDelay: timing.delay,
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lit && (
          <motion.svg
            key="flame"
            viewBox="0 0 30 60"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: 'visible' }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0.1, scaleX: 0.5, opacity: 0, y: -4, transition: { duration: 0.45, ease: 'easeIn' } }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1] }}
            aria-hidden
          >
            <g className="flame-body" style={{ animationDuration: timing.flicker, animationDelay: timing.delay }}>
              <path d="M15 4 C20 16 25.5 27 24.5 37 C23.5 47 19.5 54 15 54 C10.5 54 6.5 47 5.5 37 C4.5 27 10 16 15 4Z" fill="url(#flame-grad)" opacity=".95" />
              <path d="M15 22 C18 30 20 37 19.5 43 C19 49 17 52 15 52 C13 52 11 49 10.5 43 C10 37 12 30 15 22Z" fill="url(#flame-core)" />
              <ellipse cx="15" cy="52" rx="3.2" ry="2.2" fill="#8fb4ef" opacity=".55" />
            </g>
          </motion.svg>
        )}
      </AnimatePresence>

      {/* smoke wisps after blowing out */}
      <AnimatePresence>
        {!lit && wasLit.current && (
          <motion.svg key="smoke" viewBox="0 0 40 120" className="absolute" style={{ width: w * 2, height: h * 3, left: -w / 2, top: -h * 2 + h * 0.6, overflow: 'visible' }} aria-hidden>
            {[
              'M20 118 C14 100 26 90 20 74 C14 58 27 48 21 30 C17 18 23 10 22 2',
              'M21 118 C27 104 15 92 22 80 C29 66 17 56 23 42',
              'M19 118 C15 108 22 100 18 90 C14 80 20 74 18 64',
            ].map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="#e8e6ef"
                strokeWidth={1.6 - i * 0.3}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.85, y: 6 }}
                animate={{ pathLength: 1, opacity: 0, y: -26 - i * 6 }}
                transition={{ duration: 2.6 + i * 0.5, delay: i * 0.12, ease: 'easeOut' }}
              />
            ))}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* generous hit target */}
      <button
        type="button"
        onClick={onBlow}
        disabled={!lit}
        aria-label={label}
        className="pointer-events-auto absolute rounded-full"
        style={{ width: 48, height: 56, left: w / 2 - 24, top: h / 2 - 34, cursor: lit ? 'pointer' : 'default', background: 'transparent', border: 0 }}
      />
    </div>
  );
}
