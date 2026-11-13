import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { CakeArt } from '../art/Cake';
import { DECO_BY_ID } from '../art/decorations';
import { Flame } from '../art/Flame';
import { sparklePath } from '../art/Stickers';
import type { Placed } from '../../lib/cake';

export type DragView = { id: string; x: number; y: number; outside: boolean } | null;

type Props = {
  items: Placed[];
  interactive?: boolean;
  drag?: DragView;
  selectedId?: string | null;
  freshId?: string | null;
  onItemPointerDown?: (e: RPointerEvent<HTMLElement>, item: Placed) => void;
  onItemPointerMove?: (e: RPointerEvent<HTMLElement>) => void;
  onItemPointerUp?: (e: RPointerEvent<HTMLElement>) => void;
  onItemKeyDown?: (e: KeyboardEvent<HTMLElement>, item: Placed) => void;
  onRemove?: (id: string) => void;
  onBackgroundPointerDown?: () => void;
  lit?: Record<string, boolean> | null;
  onBlow?: (id: string) => void;
  dim?: number;
  className?: string;
};

export const boxStyle = (kind: string, x: number, y: number) => {
  const d = DECO_BY_ID[kind];
  const top = d.candle ? y - d.h : y - d.h / 2;
  return {
    left: `${((x - d.w / 2) / 400) * 100}%`,
    top: `${(top / 420) * 100}%`,
    width: `${(d.w / 400) * 100}%`,
    height: `${(d.h / 420) * 100}%`,
  };
};

/** The cake plus every decoration on it. Used both while decorating and during the wish. */
export const CakeStage = forwardRef<HTMLDivElement, Props>(function CakeStage(
  { items, interactive, drag, selectedId, freshId, onItemPointerDown, onItemPointerMove, onItemPointerUp, onItemKeyDown, onRemove, onBackgroundPointerDown, lit, onBlow, dim = 0, className = '' },
  ref,
) {
  const [px, setPx] = useState(400);
  useEffect(() => {
    const el = (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPx(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  const unit = px / 400;

  const sorted = [...items].sort((a, b) => a.y - b.y);
  return (
    <div
      ref={ref}
      className={`relative w-full select-none ${className}`}
      style={{ aspectRatio: '400 / 420', touchAction: 'pan-y' }}
      onPointerDown={(e) => {
        if (!(e.target as Element).closest('[data-deco]')) onBackgroundPointerDown?.();
      }}
    >
      <CakeArt dim={dim} />

      <AnimatePresence>
        {sorted.map((it) => {
          const d = DECO_BY_ID[it.kind];
          const isDrag = drag?.id === it.id;
          const x = isDrag ? drag!.x : it.x;
          const y = isDrag ? drag!.y : it.y;
          const selected = selectedId === it.id;
          return (
            <motion.div
              key={it.id}
              data-deco
              className="absolute"
              style={{ ...boxStyle(it.kind, x, y), zIndex: isDrag ? 999 : Math.round(y) }}
              initial={{ opacity: 0, scale: 0.35, y: -34 }}
              animate={{ opacity: isDrag && drag!.outside ? 0.45 : 1, scale: isDrag ? (drag!.outside ? 0.8 : 1.08) : 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 19 }}
            >
              <div
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : -1}
                aria-label={interactive ? `${d.label} on the cake. Drag to move. Press Delete to remove, arrow keys to nudge.` : undefined}
                aria-pressed={interactive ? selected : undefined}
                className={`h-full w-full ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ transform: `rotate(${it.r}deg)`, transformOrigin: d.candle ? '50% 100%' : '50% 50%', touchAction: 'none', filter: 'drop-shadow(0 2px 1.5px rgba(40,40,70,.28))' }}
                onPointerDown={interactive ? (e) => onItemPointerDown?.(e, it) : undefined}
                onPointerMove={interactive ? onItemPointerMove : undefined}
                onPointerUp={interactive ? onItemPointerUp : undefined}
                onPointerCancel={interactive ? onItemPointerUp : undefined}
                onKeyDown={interactive ? (e) => onItemKeyDown?.(e, it) : undefined}
              >
                {d.render()}
              </div>

              {selected && interactive && !isDrag && (
                <>
                  <motion.svg
                    className="pointer-events-none absolute -inset-[30%] h-[160%] w-[160%]"
                    viewBox="0 0 100 100"
                    initial={{ opacity: 0, rotate: -20 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    aria-hidden
                  >
                    <ellipse cx="50" cy="50" rx="46" ry="46" fill="none" stroke="#8c5a68" strokeWidth="1.3" strokeDasharray="3 5" filter="url(#ink)" />
                  </motion.svg>
                  <button
                    type="button"
                    aria-label={`Remove ${d.label}`}
                    onClick={() => onRemove?.(it.id)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="hand absolute flex items-center justify-center rounded-full text-[18px] leading-none text-[#fdf6ef]"
                    style={{ width: 30, height: 30, right: -22, top: -22, background: '#8c5a68', boxShadow: '0 2px 4px rgba(0,0,0,.25)', zIndex: 2 }}
                  >
                    ✕
                  </button>
                </>
              )}

              {freshId === it.id && <LandingSparkles />}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* flames sit above every decoration */}
      {lit &&
        items
          .filter((it) => DECO_BY_ID[it.kind].candle)
          .map((it) => {
            const d = DECO_BY_ID[it.kind];
            const rad = (it.r * Math.PI) / 180;
            const tipX = it.x + Math.sin(rad) * d.h;
            const tipY = it.y - Math.cos(rad) * d.h + 3;
            return (
              <div key={`f-${it.id}`} className="absolute" style={{ left: `${(tipX / 400) * 100}%`, top: `${(tipY / 420) * 100}%`, zIndex: 2000 }}>
                <Flame lit={!!lit[it.id]} onBlow={() => onBlow?.(it.id)} label={`Blow out the ${d.label.toLowerCase()}`} scale={Math.max(0.7, unit * 0.95)} />
              </div>
            );
          })}
    </div>
  );
});

function LandingSparkles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 20 20"
            className="absolute left-1/2 top-1/2 h-3 w-3"
            initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 0.4 }}
            animate={{ x: `calc(-50% + ${Math.cos(a) * 34}px)`, y: `calc(-50% + ${Math.sin(a) * 34}px)`, opacity: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <path d={sparklePath(10, 9, 1.6)} fill={i % 2 ? '#e4bf68' : '#ffffff'} />
          </motion.svg>
        );
      })}
    </div>
  );
}
