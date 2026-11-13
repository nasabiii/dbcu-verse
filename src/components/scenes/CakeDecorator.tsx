import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { content } from '../../content';
import type { useCake } from '../../lib/cake';
import { clampToCake, outsideDistance } from '../art/Cake';
import { DECO_BY_ID, type DecorationKind } from '../art/decorations';
import { DoodleStar, Flourish, SkyChip, Sparkle, Stamp } from '../art/Stickers';
import { HandButton, InkLink } from '../ui/HandButton';
import { CakeStage, type DragView } from './CakeStage';
import { DecorationPalette } from './DecorationPalette';

type Cake = ReturnType<typeof useCake>;
type Ghost = { kind: string; x: number; y: number; over: boolean } | null;

export function CakeDecorator({ cake, onFinish }: { cake: Cake; onFinish: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragView>(null);
  const dragRef = useRef<DragView>(null);
  const info = useRef<{ id: string; offX: number; offY: number; sx: number; sy: number; moved: boolean } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [ghost, setGhost] = useState<Ghost>(null);
  const suppressClick = useRef(false);
  const [announce, setAnnounce] = useState('');

  const setDragBoth = (d: DragView) => {
    dragRef.current = d;
    setDrag(d);
  };

  const toCake = useCallback((cx: number, cy: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * 400, y: ((cy - r.top) / r.height) * 420, r };
  }, []);

  const sparkleOn = (id: string | undefined) => {
    if (!id) return;
    setFresh(id);
    window.setTimeout(() => setFresh((f) => (f === id ? null : f)), 1000);
  };

  /* ── placed items: move / select / drag-off-to-remove ── */
  const onItemPointerDown = (e: RPointerEvent<HTMLElement>, it: { id: string; x: number; y: number }) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    (e.currentTarget as HTMLElement).focus({ preventScroll: true });
    const p = toCake(e.clientX, e.clientY);
    info.current = { id: it.id, offX: it.x - p.x, offY: it.y - p.y, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onItemPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const i = info.current;
    if (!i) return;
    if (!i.moved && Math.hypot(e.clientX - i.sx, e.clientY - i.sy) < 5) return;
    i.moved = true;
    const p = toCake(e.clientX, e.clientY);
    const x = p.x + i.offX;
    const y = p.y + i.offY;
    const item = cake.items.find((t) => t.id === i.id);
    if (!item) return;
    const out = outsideDistance(x, y) > 36;
    const c = out ? { x, y } : clampToCake(x, y, DECO_BY_ID[item.kind].zone);
    setSelected(null);
    setDragBoth({ id: i.id, x: c.x, y: c.y, outside: out });
  };
  const onItemPointerUp = () => {
    const i = info.current;
    info.current = null;
    if (!i) return;
    const d = dragRef.current;
    setDragBoth(null);
    if (!i.moved) {
      setSelected((s) => (s === i.id ? null : i.id));
      return;
    }
    if (d?.outside) {
      cake.remove(i.id);
      setAnnounce('Decoration removed.');
    } else if (d) cake.move(i.id, d.x, d.y);
  };
  const onItemKeyDown = (e: KeyboardEvent<HTMLElement>, it: { id: string; x: number; y: number }) => {
    const step = e.shiftKey ? 16 : 6;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      cake.move(it.id, it.x + moves[e.key][0], it.y + moves[e.key][1]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      cake.remove(it.id);
      setSelected(null);
      setAnnounce('Decoration removed.');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected((s) => (s === it.id ? null : it.id));
    }
  };

  /* ── shelf items: tap to add, drag to place precisely ── */
  const onPaletteDown = (e: RPointerEvent<HTMLButtonElement>, deco: DecorationKind) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    let active = false;
    const overStage = (x: number, y: number) => {
      const r = stageRef.current?.getBoundingClientRect();
      if (!r) return false;
      const m = r.width * 0.04;
      return x > r.left - m && x < r.right + m && y > r.top - m && y < r.bottom + m;
    };
    const move = (ev: PointerEvent) => {
      if (!active && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
      active = true;
      ev.preventDefault();
      setGhost({ kind: deco.id, x: ev.clientX, y: ev.clientY, over: overStage(ev.clientX, ev.clientY) });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (!active) return;
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 60);
      setGhost(null);
      if (ev.type === 'pointerup' && overStage(ev.clientX, ev.clientY)) {
        const p = toCake(ev.clientX, ev.clientY);
        const anchorY = deco.candle ? p.y + deco.h / 2 : p.y;
        const added = cake.add(deco.id, { x: p.x, y: anchorY });
        sparkleOn(added?.id);
        setAnnounce(`${deco.label} added to the cake.`);
      }
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  const onPaletteClick = (deco: DecorationKind) => {
    if (suppressClick.current) return;
    const added = cake.add(deco.id);
    sparkleOn(added?.id);
    setAnnounce(added ? `${deco.label} added to the cake.` : 'The cake is full!');
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        cake.undo();
      }
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cake]);

  const ghostDeco = ghost ? DECO_BY_ID[ghost.kind] : null;
  const stageW = stageRef.current?.getBoundingClientRect().width ?? 400;

  return (
    <div className="relative mx-auto min-h-full max-w-6xl px-4 pb-24 pt-[max(16px,env(safe-area-inset-top))] sm:px-8 md:pt-8">
      <PaperScatter />

      <header className="relative z-10 pr-16 pt-10 md:pt-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.3 }} className="flex flex-wrap items-end gap-x-3">
          {content.cake.number && <span className="script-title text-[clamp(56px,9vw,112px)]">{content.cake.number}</span>}
          <h1 className="script-title -ml-1 text-[clamp(56px,9vw,112px)]">{content.cake.heading}</h1>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.2 }} className="mt-1 max-w-[34ch] font-serif text-[clamp(19px,2vw,24px)] italic leading-snug text-[#737c5a]">
          {content.cake.message}
        </motion.p>
      </header>

      <div className="relative z-10 mt-4 grid gap-6 md:mt-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-10">
        {/* cake (sticky on phones so tapped treats are always visible) */}
        <section aria-label="Your cake" className="sticky top-0 z-20 -mx-4 px-4 pb-2 pt-2 md:static md:mx-0 md:px-0">
          <div className="ivory-paper absolute inset-0 -z-10 md:hidden" style={{ maskImage: 'linear-gradient(#000 88%, transparent)', WebkitMaskImage: 'linear-gradient(#000 88%, transparent)' }} />
          <motion.div layoutId="cake-stage" className="mx-auto w-full max-w-[min(520px,38vh)] md:max-w-[520px]" transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}>
            <CakeStage
              ref={stageRef}
              items={cake.items}
              interactive
              drag={drag}
              selectedId={selected}
              freshId={fresh}
              onItemPointerDown={onItemPointerDown}
              onItemPointerMove={onItemPointerMove}
              onItemPointerUp={onItemPointerUp}
              onItemKeyDown={onItemKeyDown}
              onRemove={(id) => {
                cake.remove(id);
                setSelected(null);
                setAnnounce('Decoration removed.');
              }}
              onBackgroundPointerDown={() => setSelected(null)}
            />
          </motion.div>
          <AnimatePresence>
            {drag?.outside && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hand pointer-events-none absolute left-0 right-0 top-2 text-center text-[20px] text-[#8c5a68]">
                let go to take it off ✕
              </motion.p>
            )}
          </AnimatePresence>
          <div className="mx-auto mt-1 flex max-w-[520px] flex-wrap items-center justify-center gap-x-2">
            <InkLink onClick={cake.undo} disabled={!cake.canUndo} ariaLabel="Undo last change">
              ↶ undo
            </InkLink>
            <InkLink
              onClick={() => {
                cake.reset();
                setSelected(null);
              }}
              disabled={!cake.items.length}
              ariaLabel="Remove all decorations"
            >
              start over
            </InkLink>
            <span className="hand text-[18px] text-[#9b8f86]" aria-live="polite">
              {cake.items.length ? `${cake.items.length} little treasure${cake.items.length === 1 ? '' : 's'}` : 'an empty cake, waiting'}
            </span>
          </div>
        </section>

        <section aria-label="Decoration shelves" className="relative">
          <div className="mb-3 flex items-start gap-2">
            <Sparkle size={18} color="#e4bf68" className="mt-1 shrink-0" />
            <p className="hand text-[21px] leading-tight text-[#4a4560]">
              Decorate your cake! Tap a treat to add it, or drag it exactly where you want it.
              <span className="block text-[17px] text-[#8b8076]">tap a treat on the cake, then ✕ to remove it · or drag it off the cake</span>
            </p>
          </div>
          <DecorationPalette onItemPointerDown={onPaletteDown} onItemClick={onPaletteClick} />
          <div className="mt-6 flex flex-col items-center gap-1">
            <HandButton tone="paper" size="lg" onClick={onFinish}>
              Finish decorating ✧
            </HandButton>
            <span className="hand text-[17px] text-[#9b8f86]">(you can come back and change it any time)</span>
          </div>
        </section>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {ghost &&
        ghostDeco &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[90]"
            style={{
              left: ghost.x,
              top: ghost.y,
              width: (ghostDeco.w / 400) * stageW,
              height: (ghostDeco.h / 400) * stageW,
              transform: `translate(-50%, -50%) scale(${ghost.over ? 1 : 0.9}) rotate(${ghost.over ? 0 : -6}deg)`,
              transition: 'transform .2s ease',
              filter: 'drop-shadow(0 8px 6px rgba(40,40,70,.3))',
              opacity: ghost.over ? 1 : 0.8,
            }}
          >
            {ghostDeco.render()}
          </div>,
          document.body,
        )}
    </div>
  );
}

function PaperScatter() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <DoodleStar size={30} className="absolute left-[62%] top-[3%] opacity-70" seed={3} />
      <DoodleStar size={22} className="absolute left-[4%] top-[42%] opacity-60" seed={8} />
      <DoodleStar size={26} className="absolute right-[3%] top-[58%] opacity-60" seed={12} />
      <Sparkle size={20} color="#2a2f4a" className="absolute right-[34%] top-[16%] opacity-70" />
      <Sparkle size={14} color="#2a2f4a" className="absolute left-[30%] bottom-[8%] opacity-60" />
      <SkyChip size={34} seed={4} className="absolute right-[3%] top-[6%] rotate-6" />
      <SkyChip size={26} seed={9} className="absolute left-[2%] bottom-[14%] -rotate-3" />
      <Stamp size={38} className="absolute right-[18%] bottom-[4%] rotate-[8deg]" />
      <Flourish className="absolute left-[38%] top-[20%] hidden opacity-60 md:block" />
    </div>
  );
}
