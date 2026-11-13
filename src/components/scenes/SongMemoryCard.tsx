import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Song } from '../../content';
import { Butterfly, CrescentMoon, Daisy, Heart, MusicNote, Sparkle, Washi, sparklePath } from '../art/Stickers';

const TINTS: Record<NonNullable<Song['tint']>, [string, string, string]> = {
  blush: ['#f6dbe1', '#e6a9b8', '#8c5a68'],
  powder: ['#e3eef8', '#9fc0e3', '#3f4b74'],
  gold: ['#f8ecc9', '#e2bb63', '#7a5a22'],
  olive: ['#e8ead8', '#a3ab82', '#4f563b'],
  indigo: ['#c9d2ea', '#3c4f8a', '#121936'],
  lilac: ['#ece3f5', '#bba5d9', '#5a4a78'],
};

/** Hand-painted placeholder cover when no album art was supplied. */
export function CoverArt({ song, index }: { song: Song; index: number }) {
  if (song.cover) return <img src={song.cover} alt={`Cover art for ${song.title}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} loading="lazy" />;
  const [a, b, ink] = TINTS[song.tint ?? 'blush'];
  const icons = [
    <CrescentMoon key="m" size="46%" color="#fbf3dc" ink={ink} />,
    <Heart key="h" size="44%" color="#fbeef1" ink={ink} sparkle />,
    <Daisy key="d" size="46%" ink={ink} />,
    <MusicNote key="n" size="42%" color={ink} double />,
    <Butterfly key="b" size="48%" color="#fbf3ef" ink={ink} />,
    <svg key="s" viewBox="0 0 40 40" width="40%" height="40%" aria-hidden>
      <path d={sparklePath(20, 18, 3.6)} fill="#fff8e6" />
    </svg>,
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: `radial-gradient(90% 80% at 30% 25%, ${a}, ${b})` }} aria-hidden>
      <div className="absolute inset-0 opacity-50 mix-blend-multiply" style={{ backgroundImage: 'var(--wash-warm)', backgroundSize: '400px' }} />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'var(--grain)', backgroundSize: '200px' }} />
      <div className="relative flex h-full w-full items-center justify-center">{icons[index % icons.length]}</div>
      <span className="typewriter absolute bottom-[6%] left-[8%] text-[10px] tracking-wider" style={{ color: ink, opacity: 0.7 }}>
        side {String.fromCharCode(65 + (index % 2))} · {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}

const tilt = [-3, 2.5, -1.5, 3.5, -2.5, 1.8, -3.2, 2.2];

export function SongMemoryCard({ song, index, onOpen }: { song: Song; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`${song.title} by ${song.artist}. Open the memory.`}
      className="group relative block w-full max-w-[250px] text-left"
      style={{ rotate: tilt[index % tilt.length] }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.12 }}
      whileHover={{ y: -6, rotate: tilt[index % tilt.length] * 0.4 }}
    >
      <div className="bg-[#fdfaf3] p-[7%] pb-[5%]" style={{ boxShadow: '0 12px 22px -12px rgba(42,47,74,.55), 0 2px 4px rgba(42,47,74,.12)', backgroundImage: 'var(--grain)', backgroundSize: '240px' }}>
        <motion.div layoutId={`cover-${index}`} className="relative aspect-square w-full overflow-hidden">
          <CoverArt song={song} index={index} />
        </motion.div>
        <div className="typewriter mt-3 space-y-0.5 text-[13px] leading-snug text-[#2f3150]">
          <p>
            <span className="text-[#8b8076]">Name:</span> {song.title}
          </p>
          <p>
            <span className="text-[#8b8076]">Artist:</span> {song.artist}
          </p>
        </div>
      </div>
      <Washi width={64} rotate={index % 2 ? 8 : -10} color={index % 2 ? 'rgba(183,212,237,.75)' : 'rgba(239,196,206,.8)'} className="absolute -top-3 left-1/2 -translate-x-1/2" />
      <motion.span className="absolute -right-3 -top-4" aria-hidden animate={{ y: [0, -5, 0], rotate: [-6, 8, -6] }} transition={{ duration: 3 + (index % 3), repeat: Infinity, ease: 'easeInOut' }}>
        <MusicNote size={26} color="#2a2f4a" double={index % 2 === 0} />
      </motion.span>
      <span className="hand absolute -bottom-7 left-0 right-0 text-center text-[16px] text-[#8c5a68] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
        open the memory ✧
      </span>
    </motion.button>
  );
}

/** Expanded scrapbook memory for one song. */
export function SongMemoryOpen({ song, index, onClose }: { song: Song | null; index: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!song) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [song, onClose]);

  return createPortal(
    <AnimatePresence>
      {song && (
        <motion.div key="open" role="dialog" aria-modal="true" aria-label={`${song.title} — a memory`} className="fixed inset-0 z-[70] overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <div className="fixed inset-0 bg-[#121936]/55 backdrop-blur-[1.5px]" />
          <div className="relative flex min-h-full items-center justify-center px-4 py-16">
            <div className="relative flex w-full max-w-[760px] flex-col items-center gap-0 md:flex-row md:items-start md:gap-0" onClick={(e) => e.stopPropagation()}>
              {/* enlarged cover */}
              <div className="relative z-10 w-[min(72vw,320px)] shrink-0 -rotate-2 bg-[#fdfaf3] p-3 pb-10" style={{ boxShadow: '0 30px 50px -20px rgba(0,0,0,.6)', backgroundImage: 'var(--grain)' }}>
                <motion.div layoutId={`cover-${index}`} className="relative aspect-square w-full overflow-hidden" transition={{ type: 'spring', stiffness: 110, damping: 20 }}>
                  <CoverArt song={song} index={index} />
                </motion.div>
                <p className="typewriter absolute bottom-3 left-3 right-3 truncate text-[13px] text-[#2f3150]">
                  {song.title} — {song.artist}
                </p>
                <Washi width={80} rotate={-30} color="rgba(239,196,206,.8)" className="absolute -left-6 -top-2" />
              </div>

              {/* unfolding note */}
              <motion.div
                className="paper-sheet relative -mt-6 w-[min(88vw,420px)] px-7 pb-7 pt-9 md:-ml-8 md:mt-10 md:pl-14"
                style={{ transformOrigin: '50% 0%', boxShadow: '0 24px 40px -20px rgba(0,0,0,.55)' }}
                initial={{ scaleY: 0.05, opacity: 0, rotateX: 70 }}
                animate={{ scaleY: 1, opacity: 1, rotateX: 0 }}
                exit={{ scaleY: 0.1, opacity: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.3, 0.1, 0.2, 1] }}
              >
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#c8bba4]/60 to-transparent" />
                <p className="hand text-[15px] uppercase tracking-[0.2em] text-[#9b8f86]">why it’s you</p>
                <p className="hand-vi mt-2 text-[clamp(19px,2.2vw,22px)] leading-relaxed text-[#2f3150]">{song.memory}</p>
                {song.lyrics && (
                  <blockquote className="mt-5 border-l-2 border-[#efc4ce] pl-4 font-serif text-[19px] italic leading-relaxed text-[#5b4b5f]">“{song.lyrics}”</blockquote>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {song.link ? (
                    <a href={song.link} target="_blank" rel="noopener noreferrer" className="hand inline-flex min-h-[44px] items-center gap-2 text-[22px] text-[#8c5a68] underline decoration-[#efc4ce] decoration-2 underline-offset-4">
                      {song.link.includes('spotify.com') ? 'Listen on Spotify ↗' : 'Listen to this song ↗'}
                    </a>
                  ) : (
                    <span />
                  )}
                  <button ref={closeRef} type="button" onClick={onClose} className="hand min-h-[44px] text-[20px] text-[#5b4b5f]">
                    fold it back ✕
                  </button>
                </div>
              </motion.div>

              {/* little stars dancing around */}
              {[...Array(7)].map((_, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{ left: `${8 + ((i * 37) % 86)}%`, top: `${(i * 23) % 90}%` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1.2, 0.9, 1], rotate: [0, 30, 0] }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 1.4 }}
                >
                  <Sparkle size={10 + (i % 3) * 6} color={i % 2 ? '#e4bf68' : '#fff7e6'} />
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
