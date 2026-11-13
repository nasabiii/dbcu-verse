import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { content } from '../../content';
import type { Progress } from '../../lib/storage';
import { usePrefersReducedMotion } from '../../lib/motion';
import { Planet } from '../art/Planet';
import { Polaroid } from '../art/Polaroid';
import { Bow, Butterfly, CrescentMoon, Daisy, GoldStar, InkArrow, MusicNote, PaperStar, Sparkle, Washi } from '../art/Stickers';
import { HandButton } from '../ui/HandButton';
import { NoBreakWords } from '../ui/WriteOn';
import { Lightbox } from '../ui/Lightbox';
import { LetterScene } from './LetterScene';
import { PlanetExplorer, type Stop } from './PlanetExplorer';
import { SecretEnvelope } from './SecretEnvelope';

type Props = {
  stop: Stop;
  onStop: (s: Stop) => void;
  onOpenPlaylist: () => void;
  progress: Progress;
  mark: (p: Partial<Progress>) => void;
};

const STOP_NAMES: Record<Stop, string> = { [-1]: 'a memory', 0: 'you', 1: 'songs' } as Record<Stop, string>;

/** Scene 3 — the personal planet and the little universe around it. */
export function UniverseScene({ stop, onStop, onOpenPlaylist, progress, mark }: Props) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ photos: typeof content.sharedPhotos; i: number } | null>(null);
  const [newStar, setNewStar] = useState(false);

  const openLetter = () => {
    setLetterOpen(true);
    mark({ letterOpened: true });
  };
  const closeLetter = () => {
    setLetterOpen(false);
    if (!progress.letterClosedOnce) setNewStar(true);
    mark({ letterClosedOnce: true, completed: true });
  };

  return (
    <motion.section
      aria-label="Our little universe"
      className="sky sky-wash fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.9 } }}
      transition={{ duration: 1.8 }}
    >
      <PlanetExplorer
        stop={stop}
        onStop={onStop}
        locked={letterOpen || !!lightbox}
        onFirstPan={() => !progress.exploredUniverse && mark({ exploredUniverse: true })}
        background={({ vw, vh }) => <FarSky vw={vw} vh={vh} />}
        overlay={<ExploreChrome stop={stop} onStop={onStop} explored={progress.exploredUniverse} />}
      >
        {({ vw, vh }) => (
          <>
            <Panel offset={-1} vw={vw}>
              <MemoryStar vw={vw} vh={vh} onPhoto={(photos, i) => setLightbox({ photos, i })} />
            </Panel>
            <Panel offset={0} vw={vw}>
              <HomePlanet
                vw={vw}
                vh={vh}
                letterOpen={letterOpen}
                onOpenLetter={openLetter}
                letterOpened={progress.letterOpened}
                showGoldStar={progress.letterClosedOnce || newStar}
                freshStar={newStar}
                onPhoto={() => setLightbox({ photos: [content.heroPhoto], i: 0 })}
              />
            </Panel>
            <Panel offset={1} vw={vw}>
              <MusicPlanet vw={vw} vh={vh} onOpen={onOpenPlaylist} />
            </Panel>
          </>
        )}
      </PlanetExplorer>

      {createPortal(<AnimatePresence>{letterOpen && <LetterScene key="letter" onClose={closeLetter} />}</AnimatePresence>, document.body)}
      <Lightbox photos={lightbox?.photos ?? []} index={lightbox ? lightbox.i : null} onClose={() => setLightbox(null)} onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))} />
    </motion.section>
  );
}

function Panel({ offset, vw, children }: { offset: number; vw: number; children: ReactNode }) {
  return (
    <div className="absolute inset-y-0" data-stop={offset} style={{ left: offset * vw, width: vw }}>
      {children}
    </div>
  );
}

/* ───────────────────────── far sky (slow parallax) ───────────────────────── */

function FarSky({ vw, vh }: { vw: number; vh: number }) {
  return (
    <div aria-hidden>
      {[
        { x: -0.9, y: 0.15, s: 0.9, c: 'rgba(183,212,237,.12)' },
        { x: 0.25, y: 0.05, s: 0.7, c: 'rgba(239,196,206,.08)' },
        { x: 0.9, y: 0.35, s: 1, c: 'rgba(120,140,210,.14)' },
        { x: 1.6, y: 0.1, s: 0.8, c: 'rgba(239,196,206,.08)' },
      ].map((n, i) => (
        <div
          key={i}
          className="absolute rounded-[50%]"
          style={{ left: n.x * vw, top: n.y * vh, width: vw * n.s, height: vw * n.s * 0.45, background: `radial-gradient(closest-side, ${n.c}, transparent)`, filter: 'blur(20px)' }}
        />
      ))}
      <div className="absolute opacity-80" style={{ left: -0.55 * vw, top: vh * 0.62 }}>
        <Planet variant="mini" size={Math.min(70, vw * 0.12)} seed={5} />
      </div>
      <div className="absolute opacity-70" style={{ left: 1.2 * vw, top: vh * 0.14 }}>
        <Planet variant="main" size={Math.min(54, vw * 0.1)} seed={8} />
      </div>
      <div className="absolute" style={{ left: 0.62 * vw, top: vh * 0.82 }}>
        <CrescentMoon size={30} />
      </div>
    </div>
  );
}

/* ───────────────────────────── the home planet ───────────────────────────── */

function layoutFor(vw: number, vh: number) {
  const narrow = vw < 640;
  const P = narrow ? vw * 1.45 : Math.min(vw * 0.74, 1040, vh * 1.25);
  const planetTop = vh * (narrow ? 0.5 : 0.52);
  const polaroidW = narrow ? Math.min(vw * 0.5, 210) : Math.min(Math.max(vw * 0.17, 190), 270, vh * 0.32);
  return { narrow, P, planetTop, polaroidW };
}

function HomePlanet({
  vw,
  vh,
  letterOpen,
  onOpenLetter,
  letterOpened,
  showGoldStar,
  freshStar,
  onPhoto,
}: {
  vw: number;
  vh: number;
  letterOpen: boolean;
  onOpenLetter: () => void;
  letterOpened: boolean;
  showGoldStar: boolean;
  freshStar: boolean;
  onPhoto: () => void;
}) {
  const { narrow, P, planetTop, polaroidW } = layoutFor(vw, vh);
  const titleSize = narrow ? Math.min(vw * 0.128, 60) : Math.min(vw * 0.085, 128, vh * 0.14);
  const cx = vw / 2;

  return (
    <div className="absolute inset-0">
      {/* birthday message */}
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 1.6 }}
        className="hand absolute inset-x-0 px-6 text-center text-[clamp(18px,2.2vw,24px)] leading-snug text-[#d7def0]/85 [text-wrap:balance]"
        style={{ top: Math.max(70, vh * 0.07) }}
      >
        ✧ <NoBreakWords text={content.birthdayMessage} /> ✧
      </motion.p>

      {/* the planet */}
      <motion.div
        className="absolute"
        style={{ left: cx - P / 2, top: planetTop, width: P, height: P, zIndex: 10 }}
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2.6, ease: [0.2, 0.7, 0.2, 1], delay: 0.3 }}
      >
        <div className="absolute inset-[-10%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(183,212,237,.18), transparent 75%)' }} />
        <Planet variant="main" size="100%" seed={13} />
      </motion.div>

      <Orbiters cx={cx} cy={planetTop + P * 0.02} rx={Math.min(P * 0.52, vw * 0.47)} ry={Math.min(P * 0.52, vw * 0.47) * 0.2} />

      {/* the polaroid sits on the planet's horizon */}
      <motion.div
        className="absolute"
        style={{ left: cx - polaroidW / 2, bottom: vh - planetTop - polaroidW * 0.18, width: polaroidW, zIndex: 20 }}
        initial={{ opacity: 0, y: 30, rotate: -12 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ delay: 1, duration: 1.8, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="drift" style={{ animationDuration: '9s' }}>
          <Polaroid photo={content.heroPhoto} width="100%" rotate={0} aspect={0.82} tape tapeColor="rgba(239,196,206,.8)" heart onOpen={onPhoto} label="See the birthday photo bigger" />
        </div>
      </motion.div>

      {/* a soft shadow on the planet so the lettering reads */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-[15]"
        style={{ left: cx - P * 0.45, width: P * 0.9, top: planetTop + polaroidW * 0.15, height: titleSize * 2.8, background: 'radial-gradient(closest-side, rgba(18,25,54,.5), transparent)' }}
      />
      {/* hero lettering, overlapping the planet */}
      <motion.h1
        className="pointer-events-none absolute inset-x-0 z-30 px-3 text-center"
        style={{ top: planetTop + polaroidW * 0.25 + (narrow ? 20 : 4) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.4 }}
      >
        <motion.span
          className="script-title on-dark block whitespace-nowrap"
          style={{ fontSize: titleSize, marginLeft: narrow ? '-6%' : '-14%' }}
          initial={{ clipPath: 'inset(-30% 100% -40% -5%)' }}
          animate={{ clipPath: 'inset(-30% -5% -40% -5%)' }}
          transition={{ delay: 2, duration: 2, ease: [0.45, 0.05, 0.25, 1] }}
        >
          Happy Birthday,
        </motion.span>
        <motion.span
          className="script-title on-dark block whitespace-nowrap"
          style={{ fontSize: titleSize * 1.08, marginLeft: narrow ? '8%' : '18%', marginTop: -titleSize * 0.12 }}
          initial={{ clipPath: 'inset(-30% 100% -40% -5%)' }}
          animate={{ clipPath: 'inset(-30% -5% -40% -5%)' }}
          transition={{ delay: 3.6, duration: 2.1, ease: [0.45, 0.05, 0.25, 1] }}
        >
          {content.birthdayNickname}
        </motion.span>
      </motion.h1>

      {/* the secret envelope, hiding up among the stars */}
      <motion.div
        className="absolute z-40"
        style={narrow ? { right: 10, top: Math.max(110, planetTop - polaroidW * 1.4 - 40) } : { left: cx + polaroidW / 2 + Math.min(vw * 0.16, 240), top: planetTop - vh * 0.3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 2 }}
      >
        <SecretEnvelope onOpen={onOpenLetter} hidden={letterOpen} opened={letterOpened} />
      </motion.div>

      {/* a brand-new star, after the letter has been read */}
      <AnimatePresence>
        {showGoldStar && (
          <motion.div
            className="absolute z-40 flex flex-col items-center"
            style={narrow ? { left: 8, top: Math.max(110, planetTop - polaroidW * 1.4 - 30) } : { right: cx + polaroidW / 2 + Math.min(vw * 0.15, 220), top: planetTop - vh * 0.34 }}
            initial={freshStar ? { opacity: 0, scale: 0.2, y: 60 } : { opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: freshStar ? 2.4 : 1.2, delay: freshStar ? 0.6 : 2, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="relative">
              <div className="absolute inset-[-80%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,226,150,.45), transparent)' }} />
              <GoldStar size={narrow ? 46 : 58} seed={17} className="twinkle relative" />
            </div>
            <p className="hand mt-1 max-w-[150px] text-center text-[16px] leading-tight text-[#f3dfb0] sm:max-w-[180px] sm:text-[18px]">{content.finalStarNote}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Little things in orbit — behind the photo at the back of the orbit, in front at the front. */
function Orbiters({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  const reduced = usePrefersReducedMotion();
  const t = useMotionValue(0);
  useAnimationFrame((time) => {
    if (!reduced) t.set(time / 1000);
  });
  const items: { node: ReactNode; phase: number; label: string }[] = [
    { node: <GoldStar size={30} seed={2} />, phase: 0, label: 'star' },
    { node: <Bow size={40} />, phase: 1.05, label: 'ribbon' },
    { node: <MusicNote size={30} color="#efc4ce" double />, phase: 2.1, label: 'note' },
    { node: <Daisy size={30} />, phase: 3.15, label: 'flower' },
    { node: <CrescentMoon size={30} />, phase: 4.2, label: 'moon' },
    { node: <PaperStar size={30} seed={14} />, phase: 5.25, label: 'paper star' },
  ];
  return (
    <>
      {items.map((it) => (
        <OrbitItem key={it.label} t={t} phase={it.phase} cx={cx} cy={cy} rx={rx} ry={ry}>
          {it.node}
        </OrbitItem>
      ))}
    </>
  );
}

function OrbitItem({ t, phase, cx, cy, rx, ry, children }: { t: MotionValue<number>; phase: number; cx: number; cy: number; rx: number; ry: number; children: ReactNode }) {
  const speed = (Math.PI * 2) / 70;
  const angle = useTransform(t, (v) => v * speed + phase);
  const x = useTransform(angle, (a) => cx + Math.cos(a) * rx - 20);
  const y = useTransform(angle, (a) => cy + Math.sin(a) * ry - 20);
  const scale = useTransform(angle, (a) => 0.78 + (Math.sin(a) + 1) * 0.17);
  const zIndex = useTransform(angle, (a) => (Math.sin(a) > 0 ? 25 : 5));
  const opacity = useTransform(angle, (a) => 0.65 + (Math.sin(a) + 1) * 0.175);
  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 flex h-10 w-10 items-center justify-center" style={{ x, y, scale, zIndex, opacity }}>
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── the memory star ───────────────────────────── */

function MemoryStar({ vw, vh, onPhoto }: { vw: number; vh: number; onPhoto: (photos: typeof content.sharedPhotos, i: number) => void }) {
  const [flipped, setFlipped] = useState(false);
  const narrow = vw < 640;
  const w = narrow ? Math.min(vw * 0.56, 230) : Math.min(260, vh * 0.32);
  const extra = content.sharedPhotos.slice(2, 4);
  return (
    <div className="absolute inset-0">
      <p className="hand absolute inset-x-0 text-center text-[clamp(20px,2.4vw,26px)] text-[#f3dfb0]" style={{ top: Math.max(76, vh * 0.08) }}>
        {content.memoryStar.label}
      </p>

      {/* the hanging mobile */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: vh * 0.15 }}>
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-[-70%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,226,150,.4), transparent)' }} aria-hidden />
            <GoldStar size={narrow ? 74 : 96} seed={23} className="twinkle relative" />
          </div>
          <div className="sway flex flex-col items-center" style={{ animationDuration: '7s' }}>
            <div className="h-10 w-px bg-[#e7d9c4]/70" />
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? 'Turn the photo back over' : 'Turn the photo over to read the memory'}
              aria-pressed={flipped}
              className="relative"
              style={{ width: w, perspective: 900 }}
            >
              <motion.div className="relative" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}>
                <div style={{ backfaceVisibility: 'hidden' }}>
                  <Polaroid photo={content.memoryStar.photo} width="100%" rotate={-2} aspect={0.8} tape={false} />
                </div>
                <div className="paper-sheet absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) rotate(-2deg)', boxShadow: '0 10px 22px -8px rgba(10,14,40,.55)' }}>
                  <Sparkle size={18} color="#e4bf68" />
                  <p className="hand text-[clamp(19px,2vw,23px)] leading-snug text-[#3b3f5c]">{content.memoryStar.message}</p>
                </div>
              </motion.div>
            </button>
          </div>
          <p className="hand mt-3 text-[17px] text-[#c9d2ea]/80">{flipped ? 'tap to turn it back' : 'tap the photo to turn it over'}</p>
        </div>
      </div>

      {/* two smaller hanging polaroids */}
      {!narrow &&
        extra.map((p, i) => (
          <div key={p.src} className="absolute" style={{ left: i ? '78%' : '9%', top: vh * (i ? 0.2 : 0.3) }}>
            <div className="flex flex-col items-center">
              <PaperStar size={34} seed={30 + i} />
              <div className="sway flex flex-col items-center" style={{ animationDuration: `${6 + i * 1.6}s`, animationDelay: `${-i * 2}s` }}>
                <div className="h-8 w-px bg-[#e7d9c4]/60" />
                <Polaroid photo={p} width={Math.min(150, vw * 0.12)} rotate={i ? 5 : -6} tape={false} onOpen={() => onPhoto(extra, i)} />
              </div>
            </div>
          </div>
        ))}
      <Butterfly size={34} className="drift absolute" style={{ left: '22%', top: vh * 0.72 }} />
    </div>
  );
}

/* ───────────────────────────── the music planet ───────────────────────────── */

function MusicPlanet({ vw, vh, onOpen }: { vw: number; vh: number; onOpen: () => void }) {
  const S = Math.min(vw * 0.62, vh * 0.46, 420);
  const reduced = usePrefersReducedMotion();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <p className="hand mb-2 text-center text-[clamp(21px,2.6vw,28px)] text-[#f8dbe2]" style={{ marginTop: -vh * 0.04 }}>
        songs that remind me of you
      </p>
      <InkArrow dir="down" size={44} className="mb-2 opacity-80" />
      <button type="button" onClick={onOpen} aria-label="Visit the music planet: songs that remind me of you" className="group relative" style={{ width: S, height: S }}>
        <div className="absolute inset-[-14%] rounded-full opacity-70 transition-opacity duration-700 group-hover:opacity-100" style={{ background: 'radial-gradient(closest-side, rgba(239,196,206,.3), transparent)' }} />
        <StaffRing half="back" />
        <motion.div className="absolute inset-0" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 80, damping: 14 }}>
          <Planet variant="music" size="100%" seed={31} bands />
        </motion.div>
        {/* musical ring: five staff lines (front half drawn over the planet) */}
        <StaffRing half="front" />
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute"
            style={{ left: `${18 + i * 16}%`, top: '30%' }}
            animate={reduced ? undefined : { y: [0, -S * 0.5], opacity: [0, 1, 0], rotate: [-10, 12] }}
            transition={{ duration: 5 + i * 0.7, repeat: Infinity, delay: i * 1.3, ease: 'easeOut' }}
            aria-hidden
          >
            <MusicNote size={22 + (i % 2) * 6} color={i % 2 ? '#f5e6c8' : '#efc4ce'} double={i % 2 === 0} />
          </motion.div>
        ))}
        <Washi width={70} rotate={-18} color="rgba(228,191,104,.6)" pattern="stars" className="absolute right-[6%] top-[10%]" />
      </button>
      <div className="mt-4">
        <HandButton onClick={onOpen} size="md">
          listen ✧
        </HandButton>
      </div>
    </div>
  );
}

function StaffRing({ half }: { half: 'front' | 'back' }) {
  return (
    <svg viewBox="0 0 400 140" className="pointer-events-none absolute left-1/2 top-1/2 w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg]" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`ring-${half}`}>
          <rect x="-20" y={half === 'front' ? 70 : -20} width="440" height={half === 'front' ? 100 : 90} />
        </clipPath>
      </defs>
      <g clipPath={`url(#ring-${half})`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx="200" cy="70" rx={186 - i * 4} ry={44 - i * 2.4} fill="none" stroke="#f5e6c8" strokeOpacity={0.6 - i * 0.06} strokeWidth=".9" filter="url(#ink)" />
        ))}
      </g>
    </svg>
  );
}

/* ─────────────────────────── hints & navigation ─────────────────────────── */

function ExploreChrome({ stop, onStop, explored }: { stop: Stop; onStop: (s: Stop) => void; explored: boolean }) {
  const order: Stop[] = [-1, 0, 1];
  return (
    <>
      {stop > -1 && (
        <button
          type="button"
          onClick={() => onStop((stop - 1) as Stop)}
          aria-label={`Travel left to ${STOP_NAMES[(stop - 1) as Stop]}`}
          className="group absolute left-1 top-1/2 z-50 flex min-h-[64px] min-w-[56px] -translate-y-1/2 flex-col items-center justify-center sm:left-4"
        >
          <InkArrow dir="left" size={48} className="transition-transform duration-500 group-hover:-translate-x-1" />
          <span className="hand hidden text-[16px] text-[#efc4ce]/80 sm:block">{STOP_NAMES[(stop - 1) as Stop]}</span>
        </button>
      )}
      {stop < 1 && (
        <button
          type="button"
          onClick={() => onStop((stop + 1) as Stop)}
          aria-label={`Travel right to ${STOP_NAMES[(stop + 1) as Stop]}`}
          className="group absolute right-1 top-1/2 z-50 flex min-h-[64px] min-w-[56px] -translate-y-1/2 flex-col items-center justify-center sm:right-4"
        >
          <InkArrow dir="right" size={48} className="transition-transform duration-500 group-hover:translate-x-1" />
          <span className="hand hidden text-[16px] text-[#efc4ce]/80 sm:block">{stop === 0 && !explored ? 'follow the stars' : STOP_NAMES[(stop + 1) as Stop]}</span>
        </button>
      )}

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[22vh]" style={{ background: 'linear-gradient(transparent, rgba(11,18,48,.72))' }} />
      <nav aria-label="Where you are in the little universe" className="absolute bottom-[max(14px,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2">
        <AnimatePresence>
          {!explored && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 5.5, duration: 1.4 } }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              className="hand mb-1 whitespace-nowrap text-center text-[19px] text-[#e7d9c4]/85"
            >
              drag to explore ✧
            </motion.p>
          )}
        </AnimatePresence>
        <ul className="flex items-end gap-3">
          {order.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => onStop(s)} aria-current={s === stop ? 'location' : undefined} aria-label={`Go to ${STOP_NAMES[s]}`} className="flex min-h-[44px] min-w-[52px] flex-col items-center justify-end">
                <motion.svg viewBox="0 0 20 20" width={s === stop ? 18 : 12} height={s === stop ? 18 : 12} animate={{ rotate: s === stop ? 45 : 0 }} aria-hidden>
                  <path d="M10 1 Q11 9 19 10 Q11 11 10 19 Q9 11 1 10 Q9 9 10 1Z" fill={s === stop ? '#e4bf68' : '#c9d2ea'} opacity={s === stop ? 1 : 0.5} />
                </motion.svg>
                <span className={`hand text-[15px] leading-none ${s === stop ? 'text-[#f3dfb0]' : 'text-[#c9d2ea]/60'}`}>{STOP_NAMES[s]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
