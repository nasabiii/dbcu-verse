import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { content } from '../../content';
import type { Placed } from '../../lib/cake';
import { usePrefersReducedMotion } from '../../lib/motion';
import { DECO_BY_ID } from '../art/decorations';
import { Starfield } from '../art/Starfield';
import { sparklePath } from '../art/Stickers';
import { HandButton } from '../ui/HandButton';
import { WriteOn } from '../ui/WriteOn';
import { CakeStage } from './CakeStage';

type Phase = 'dimming' | 'lit' | 'out' | 'stardust';

/**
 * The lights go down, the camera leans in, candles ignite.
 * Tap each flame (or use the button) — then the smoke becomes stars.
 */
export function CandleWishScene({ items, onDone }: { items: Placed[]; onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const candles = useMemo(() => items.filter((i) => DECO_BY_ID[i.kind]?.candle), [items]);
  const [lit, setLit] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<Phase>('dimming');
  const [showWish, setShowWish] = useState(false);
  const [showBlow, setShowBlow] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 300) : ms));

  // ignite, one by one
  useEffect(() => {
    const t0 = 1900;
    candles.forEach((c, i) => later(() => setLit((l) => ({ ...l, [c.id]: true })), t0 + i * 260));
    const allLit = t0 + candles.length * 260 + 500;
    later(() => setPhase('lit'), allLit);
    later(() => setShowWish(true), allLit + 300);
    later(() => setShowBlow(true), allLit + 2900);
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const litCount = candles.filter((c) => lit[c.id]).length;
  const allOut = phase === 'lit' && litCount === 0;

  useEffect(() => {
    if (!allOut) return;
    setPhase('out');
    later(() => setPhase('stardust'), 1500);
    later(onDone, 1500 + 4600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOut]);

  const blow = (id: string) => setLit((l) => ({ ...l, [id]: false }));
  const blowAll = () => candles.forEach((c, i) => later(() => blow(c.id), i * 160));

  const glow = candles.length ? litCount / candles.length : 0;

  // particle origins (candle tips) in px, relative to the viewport
  const [tips, setTips] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    if (phase !== 'stardust' || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    setTips(
      candles.map((c) => {
        const d = DECO_BY_ID[c.kind];
        return { x: r.left + (c.x / 400) * r.width, y: r.top + ((c.y - d.h) / 420) * r.height };
      }),
    );
  }, [phase, candles]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* the room dims into midnight */}
      <motion.div className="sky sky-wash absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: phase === 'stardust' ? 1 : 0.25 }} transition={{ duration: 3 }}>
        <Starfield density={phase === 'stardust' ? 1.1 : 0.4} shootingStars={false} />
      </motion.div>
      {/* warm candlelight pool */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: glow * 0.9 }}
        transition={{ duration: 1.2 }}
        style={{ background: 'radial-gradient(40% 38% at 50% 52%, rgba(255,200,130,.28), rgba(255,180,110,.08) 55%, transparent 75%)' }}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <div className="pointer-events-none absolute left-0 right-0 top-[max(7vh,56px)] z-30 px-6 text-center">
          <AnimatePresence>
            {showWish && phase !== 'stardust' && (
              <motion.div key="wish" exit={{ opacity: 0, transition: { duration: 1 } }}>
                <WriteOn duration={2.2} className="script-soft text-[clamp(40px,7vw,84px)] leading-none">
                  {content.cake.wishLine}
                </WriteOn>
              </motion.div>
            )}
            {phase === 'stardust' && (
              <motion.p key="dust" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.8 }} className="hand text-[clamp(22px,3vw,30px)] text-[#f8dbe2]">
                {content.cake.afterWishLine} ✧
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showBlow && phase === 'lit' && (
              <motion.p key="blow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="hand mt-3 text-[clamp(21px,2.6vw,28px)] text-[#f3dfc0]">
                {content.cake.blowLine} ✧
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          layoutId="cake-stage"
          className="relative z-10 mt-[8vh] w-[min(90vw,58vh,600px)]"
          transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          animate={phase === 'stardust' ? { opacity: 0.0, y: 40, scale: 0.94 } : { opacity: 1, y: 0, scale: 1 }}
        >
          <CakeStage ref={stageRef} items={items} lit={phase === 'stardust' ? null : lit} onBlow={blow} dim={0.32 - glow * 0.12} />
        </motion.div>

        <div className="absolute bottom-[max(4vh,env(safe-area-inset-bottom))] left-0 right-0 z-30 flex justify-center">
          <AnimatePresence>
            {showBlow && phase === 'lit' && litCount > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                <HandButton onClick={blowAll} size="md">
                  blow out all candles
                </HandButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {phase === 'lit' && litCount > 0 ? `${litCount} candle${litCount === 1 ? '' : 's'} still lit.` : ''}
        {phase === 'out' ? 'All candles are out. Your wish is made.' : ''}
      </p>

      {phase === 'stardust' && <Stardust tips={tips} reduced={reduced} />}
    </div>
  );
}

/** Smoke turning into glowing dust and rising stars. */
function Stardust({ tips, reduced }: { tips: { x: number; y: number }[]; reduced: boolean }) {
  const parts = useMemo(() => {
    const out: { x: number; y: number; dx: number; rise: number; size: number; delay: number; dur: number; star: boolean; gold: boolean }[] = [];
    const n = reduced ? 6 : Math.min(90, 18 * Math.max(1, tips.length) + 20);
    for (let i = 0; i < n; i++) {
      const t = tips[i % Math.max(1, tips.length)] ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      out.push({
        x: t.x + (Math.random() - 0.5) * 16,
        y: t.y,
        dx: (Math.random() - 0.5) * window.innerWidth * 0.7,
        rise: t.y + 40 + Math.random() * 120,
        size: 2 + Math.random() * (Math.random() < 0.25 ? 12 : 4),
        delay: Math.random() * 1.6,
        dur: 3 + Math.random() * 2.2,
        star: Math.random() < 0.35,
        gold: Math.random() < 0.55,
      });
    }
    return out;
  }, [tips, reduced]);
  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      {parts.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 1, 0.9, 0], x: [0, p.dx * 0.2, p.dx], y: [0, -p.rise * 0.4, -p.rise], scale: [0.4, 1, p.star ? 1.4 : 1] }}
          transition={{ duration: p.dur, delay: p.delay, ease: [0.3, 0.1, 0.3, 1] }}
        >
          {p.star ? (
            <svg viewBox="0 0 20 20" className="h-full w-full" style={{ filter: 'drop-shadow(0 0 4px rgba(255,220,150,.9))' }}>
              <path d={sparklePath(10, 9.5, 1.8)} fill={p.gold ? '#f3d58a' : '#fffaf0'} />
            </svg>
          ) : (
            <div className="h-full w-full rounded-full" style={{ background: p.gold ? '#f6dc98' : '#f4f1ff', boxShadow: `0 0 ${p.size * 2}px ${p.gold ? 'rgba(246,210,140,.9)' : 'rgba(220,225,255,.8)'}` }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
