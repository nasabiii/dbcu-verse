import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Progress } from '../../lib/storage';

export type SceneId = 'intro' | 'cake' | 'universe' | 'playlist';

/** A tiny constellation “map” for moving between places you've already found. */
export function SceneNavigation({ scene, progress, onGo, tone }: { scene: SceneId; progress: Progress; onGo: (s: SceneId) => void; tone: 'night' | 'paper' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const places: { id: SceneId; label: string; available: boolean }[] = [
    { id: 'intro', label: 'the beginning', available: true },
    { id: 'cake', label: 'your cake', available: true },
    { id: 'universe', label: 'our little universe', available: progress.wishMade },
    { id: 'playlist', label: 'songs of you', available: progress.wishMade && (progress.exploredUniverse || progress.playlistVisited) },
  ];
  const color = tone === 'night' ? '#efc4ce' : '#8c5a68';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true" className="hand flex min-h-[44px] items-center gap-1.5 px-2 text-[17px]" style={{ color }}>
        <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden>
          <g stroke="currentColor" strokeWidth=".9" fill="none" opacity=".7">
            <path d="M3 17 L10 6 L17 12 L25 4" strokeDasharray="2 2" />
          </g>
          {[
            [3, 17],
            [10, 6],
            [17, 12],
            [25, 4],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 3} Q${x + 0.6} ${y - 0.6} ${x + 3} ${y} Q${x + 0.6} ${y + 0.6} ${x} ${y + 3} Q${x - 0.6} ${y + 0.6} ${x - 3} ${y} Q${x - 0.6} ${y - 0.6} ${x} ${y - 3}Z`} fill={i === 3 ? '#e4bf68' : 'currentColor'} />
          ))}
        </svg>
        <span>map</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            exit={{ opacity: 0, y: -6 }}
            className="paper-sheet absolute left-0 top-full mt-2 w-[220px] px-4 py-3"
            style={{ boxShadow: '0 16px 30px -12px rgba(0,0,0,.45)' }}
          >
            {places.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={!p.available || p.id === scene}
                  onClick={() => {
                    setOpen(false);
                    onGo(p.id);
                  }}
                  aria-current={p.id === scene ? 'page' : undefined}
                  className="hand flex min-h-[40px] w-full items-center gap-2 text-left text-[20px] text-[#3b3f5c] disabled:cursor-default"
                >
                  <span className={p.id === scene ? 'text-[#e4bf68]' : p.available ? 'text-[#8c5a68]' : 'text-[#c9bfae]'}>✧</span>
                  <span className={p.available ? '' : 'text-[#b9b0a3]'}>{p.available ? p.label : 'not found yet…'}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
