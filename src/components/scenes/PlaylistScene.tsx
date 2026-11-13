import { motion } from 'framer-motion';
import { Fragment, useCallback, useState } from 'react';
import { content } from '../../content';
import { DoodleStar, InkArrow, MusicNote, SkyChip, Sparkle, Stamp, Washi } from '../art/Stickers';
import { InkLink } from '../ui/HandButton';
import { SongMemoryCard, SongMemoryOpen } from './SongMemoryCard';

/** Scene 4 — a vintage scrapbook playlist. */
export function PlaylistScene({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const songs = content.songs;
  const notes = content.songMemories;

  return (
    <motion.section
      aria-label={content.playlistTitle}
      className="ivory-paper fixed inset-0 overflow-y-auto overflow-x-hidden overscroll-contain"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      transition={{ duration: 1.2, ease: [0.3, 0.1, 0.2, 1] }}
    >
      <Scatter />
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-[max(16px,env(safe-area-inset-top))] sm:px-8">
        <div className="flex items-center pt-14">
          <InkLink onClick={onBack} ariaLabel="Back to our little universe" className="-ml-2">
            <span className="inline-flex items-center gap-1">
              <InkArrow dir="left" size={34} color="#8c5a68" /> Back to our little universe
            </span>
          </InkLink>
        </div>

        <header className="relative mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1.2 }}>
            {content.playlistNumber && <span className="script-title block text-[clamp(56px,9vw,112px)]">{content.playlistNumber}</span>}
            <h1 className={`script-title max-w-[14ch] text-[clamp(52px,8.5vw,108px)] leading-[1.02] sm:ml-[8%] ${content.playlistNumber ? '-mt-3 sm:-mt-6' : 'mt-2'}`}>{content.playlistTitle}</h1>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1.2 }} className="mt-3 max-w-[38ch] font-serif text-[clamp(19px,2vw,23px)] italic leading-snug text-[#737c5a] sm:ml-[8%]">
            {content.playlistSubtitle}
          </motion.p>
          <Stamp size={54} className="absolute right-[2%] top-[12%] hidden rotate-[9deg] sm:block" tone="#efc4ce" />
        </header>

        <ul className="mx-auto mt-12 grid max-w-[620px] grid-cols-1 justify-items-center gap-x-10 gap-y-14 min-[520px]:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {songs.map((s, i) => (
            <Fragment key={i}>
              <li className="flex w-full justify-center" style={{ marginTop: i % 2 === 1 ? 26 : 0 }}>
                <SongMemoryCard song={s} index={i} onOpen={() => setOpen(i)} />
              </li>
              {i % 2 === 1 && notes[(i - 1) / 2] && (
                <li className="flex w-full items-center justify-center" aria-label="A handwritten note">
                  <motion.div
                    className="relative max-w-[230px] bg-[#fbf3f4] px-6 pb-6 pt-7"
                    style={{ rotate: i % 4 === 1 ? 3 : -4, boxShadow: '0 10px 20px -12px rgba(42,47,74,.45)', backgroundImage: 'repeating-linear-gradient(transparent 0 27px, rgba(183,212,237,.55) 27px 28px), var(--grain)' }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  >
                    <Washi width={60} rotate={-6} color="rgba(228,191,104,.55)" pattern="stripes" className="absolute -top-3 left-1/2 -translate-x-1/2" />
                    <p className="typewriter text-[14px] leading-[28px] text-[#5b4b5f]">{notes[(i - 1) / 2]}</p>
                  </motion.div>
                </li>
              )}
            </Fragment>
          ))}
        </ul>

        <div className="mt-20 flex flex-col items-center gap-2">
          <DoodleStar size={26} color="#8c5a68" />
          <InkLink onClick={onBack} className="text-[24px]">
            Back to our little universe ✧
          </InkLink>
        </div>
      </div>

      <SongMemoryOpen song={open !== null ? songs[open] : null} index={open ?? 0} onClose={close} />
    </motion.section>
  );
}

function Scatter() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1600px] overflow-hidden" aria-hidden>
      <MusicNote size={30} className="absolute left-[4%] top-[34%] -rotate-12 opacity-70" />
      <MusicNote size={26} double className="absolute right-[6%] top-[46%] rotate-6 opacity-70" />
      <DoodleStar size={24} className="absolute left-[46%] top-[6%] opacity-60" seed={4} />
      <DoodleStar size={20} className="absolute right-[28%] top-[30%] opacity-50" seed={11} />
      <Sparkle size={16} color="#2a2f4a" className="absolute left-[20%] top-[24%] opacity-60" />
      <Sparkle size={22} color="#2a2f4a" className="absolute right-[12%] top-[8%] opacity-70" />
      <SkyChip size={30} seed={3} className="absolute left-[2%] top-[62%] rotate-3" />
      <SkyChip size={26} seed={8} className="absolute right-[3%] top-[78%] -rotate-6" />
      <Stamp size={36} className="absolute left-[8%] top-[90%] -rotate-6" />
    </div>
  );
}
