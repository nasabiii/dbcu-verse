import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { content } from '../../content';
import { usePrefersReducedMotion } from '../../lib/motion';
import { Polaroid } from '../art/Polaroid';
import { Bow, DoodleStar, Heart, Sparkle, Stamp, Washi, sparklePath } from '../art/Stickers';
import { InkLink } from '../ui/HandButton';
import { Lightbox } from '../ui/Lightbox';
import { PhotoGallery } from './PhotoGallery';

type Step = 'approach' | 'crack' | 'flap' | 'slide' | 'unfold' | 'read' | 'closing';

/**
 * Scene 5 — the hidden letter. Envelope travels to the centre, the wax seal
 * cracks, the flap opens, a letter slides out and unfolds, then the words are
 * written in. Skippable at every point.
 */
export function LetterScene({ onClose }: { onClose: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState<Step>(reduced ? 'read' : 'approach');
  const timers = useRef<number[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const seq: [Step, number][] = [
      ['crack', 1300],
      ['flap', 2000],
      ['slide', 2800],
      ['unfold', 3900],
      ['read', 5000],
    ];
    seq.forEach(([s, t]) => timers.current.push(window.setTimeout(() => setStep((cur) => (cur === 'closing' ? cur : s)), t)));
    const ts = timers.current;
    return () => ts.forEach(clearTimeout);
  }, [reduced]);

  const close = () => {
    if (step === 'closing') return;
    timers.current.forEach(clearTimeout);
    setStep('closing');
    window.setTimeout(onClose, reduced ? 50 : 1300);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightbox === null) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const envelopeStage = step === 'approach' || step === 'crack' || step === 'flap' || step === 'slide';
  const letterPhotos = content.sharedPhotos.slice(0, 2);
  const galleryPhotos = content.sharedPhotos.slice(2, 8);
  const allPhotos = [...letterPhotos, ...galleryPhotos];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="A letter just for you"
      className="fixed inset-0 z-[60]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {/* the sky darkens */}
      <motion.div
        className="absolute inset-0 bg-[#060b22]"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 'closing' ? 0 : 0.78 }}
        transition={{ duration: step === 'closing' ? 1.2 : 1 }}
        onClick={step === 'read' ? undefined : () => setStep('read')}
      />

      {envelopeStage && (
        <div className="absolute inset-0 flex items-center justify-center p-6" onClick={() => setStep('read')}>
          <BigEnvelope step={step} />
        </div>
      )}

      {envelopeStage && (
        <button
          type="button"
          onClick={() => setStep('read')}
          className="hand absolute bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-10 min-h-[44px] -translate-x-1/2 px-4 text-[19px] text-[#e7d9c4]/80"
        >
          skip to the letter ›
        </button>
      )}

      <AnimatePresence>
        {(step === 'unfold' || step === 'read' || step === 'closing') && (
          <motion.div key="sheet" className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex min-h-full justify-center px-3 pb-24 pt-[max(28px,env(safe-area-inset-top))] sm:px-6 sm:pt-[6vh]">
              <motion.article
                className="relative w-full max-w-[760px]"
                style={{ transformOrigin: '50% 0%', perspective: 1200 }}
                initial={{ scaleY: 0.3, y: 120, opacity: 0, rotateX: 28 }}
                animate={step === 'closing' ? { scaleY: 0.25, y: 140, opacity: 0, rotateX: 30 } : { scaleY: 1, y: 0, opacity: 1, rotateX: 0 }}
                transition={{ duration: step === 'closing' ? 1.1 : 1.3, ease: [0.3, 0.1, 0.2, 1] }}
              >
                <LetterSheet
                  writing={step === 'read'}
                  onPhoto={setLightbox}
                  letterPhotos={letterPhotos}
                  galleryPhotos={galleryPhotos}
                  onClose={close}
                />
              </motion.article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Lightbox photos={allPhotos} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
    </motion.div>
  );
}

/* ─────────────────────────────── envelope ─────────────────────────────── */

function BigEnvelope({ step }: { step: Step }) {
  const cracked = step !== 'approach';
  const open = step === 'flap' || step === 'slide';
  const sliding = step === 'slide';
  return (
    <motion.div
      layoutId="secret-envelope"
      className="relative"
      style={{ width: 'min(86vw, 520px)', aspectRatio: '1.45 / 1', perspective: 900 }}
      transition={{ type: 'spring', stiffness: 60, damping: 16 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* back + lining */}
      <div className="absolute inset-0 rounded-[3px] bg-[#efe8da]" style={{ boxShadow: '0 30px 50px -20px rgba(0,0,0,.7)' }} />
      <svg viewBox="0 0 145 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M2 2 L72.5 56 L143 2Z" fill="#2c4280" />
        <path d="M2 2 L72.5 56 L143 2Z" fill="url(#gold-foil)" opacity=".05" />
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={20 + ((i * 37) % 105)} cy={6 + ((i * 13) % 30)} r={0.5 + (i % 3) * 0.25} fill="#fff" opacity=".7" />
        ))}
      </svg>

      {/* the letter inside */}
      <motion.div
        className="paper-sheet absolute left-[7%] right-[7%] top-[6%] h-[86%] rounded-[2px] p-[6%]"
        style={{ boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}
        animate={{ y: sliding ? '-62%' : '0%', zIndex: sliding ? 3 : 1 }}
        transition={{ duration: 1, ease: [0.3, 0.1, 0.2, 1] }}
      >
        <p className="script-title text-[clamp(22px,5vw,34px)]">{content.letterText.greeting}</p>
        {[80, 92, 70, 86, 60].map((w, i) => (
          <div key={i} className="mt-[5%] h-[2px] rounded bg-[#c9bfae]" style={{ width: `${w}%`, opacity: 0.6 }} />
        ))}
      </motion.div>

      {/* front pocket */}
      <svg viewBox="0 0 145 100" preserveAspectRatio="none" className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <path d="M0 0 L72.5 54 L145 0 L145 100 L0 100Z" fill="#f4efe4" />
        <path d="M0 100 L60 46 M145 100 L85 46" stroke="#cfc6b2" strokeWidth=".6" fill="none" />
        <path d="M0 0 L72.5 54 L145 0" stroke="#d8cfbc" strokeWidth=".6" fill="none" />
      </svg>

      {/* flap */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[58%]"
        style={{ transformOrigin: '50% 0%', transformStyle: 'preserve-3d', zIndex: open ? 0 : 4 }}
        animate={{ rotateX: open ? 178 : 0 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      >
        <svg viewBox="0 0 145 58" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ backfaceVisibility: 'hidden' }} aria-hidden>
          <path d="M0 0 L145 0 L72.5 56Z" fill="#ece5d6" stroke="#cdc3ae" strokeWidth=".6" />
        </svg>
        <svg viewBox="0 0 145 58" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }} aria-hidden>
          <path d="M0 0 L145 0 L72.5 56Z" fill="#33498a" />
        </svg>
      </motion.div>

      {/* wax seal */}
      <div className="absolute left-1/2 top-[56%] z-[5] -translate-x-1/2 -translate-y-1/2" style={{ width: 'clamp(46px, 12vw, 70px)', aspectRatio: '1' }}>
        {[0, 1].map((half) => (
          <motion.svg
            key={half}
            viewBox="0 0 60 60"
            className="absolute inset-0 h-full w-full"
            style={{ clipPath: half ? 'polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 56% 64%, 44% 40%)' : 'polygon(0 0, 52% 0, 44% 40%, 56% 64%, 46% 100%, 0 100%)' }}
            animate={cracked ? { x: half ? 14 : -14, y: 40, rotate: half ? 24 : -24, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: cracked ? 1.1 : 0.3, ease: [0.5, 0, 0.6, 1], delay: cracked ? 0.25 : 0 }}
            aria-hidden
          >
            <path d="M30 3 C40 2 50 8 55 17 C60 27 58 40 51 48 C44 56 33 59 23 56 C12 53 4 44 3 32 C2 20 10 9 19 5 C22 4 26 3 30 3Z" fill="#1d2a5c" />
            <circle cx="30" cy="30" r="19" fill="#26366e" stroke="#14204a" strokeWidth="1.2" />
            <path d={sparklePath(30, 12, 2.4)} fill="#8ea2d8" />
            <circle cx="22" cy="21" r="3" fill="#fff" opacity=".18" />
          </motion.svg>
        ))}
        {/* crack line flash */}
        <motion.svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full" initial={{ opacity: 0 }} animate={step === 'crack' ? { opacity: [0, 1, 0] } : { opacity: 0 }} transition={{ duration: 0.5 }} aria-hidden>
          <path d="M31 2 L27 22 L35 30 L26 44 L30 58" stroke="#ffe9b5" strokeWidth="1.4" fill="none" />
        </motion.svg>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────── the letter ─────────────────────────────── */

function LetterSheet({
  writing,
  onPhoto,
  letterPhotos,
  galleryPhotos,
  onClose,
}: {
  writing: boolean;
  onPhoto: (i: number) => void;
  letterPhotos: typeof content.sharedPhotos;
  galleryPhotos: typeof content.sharedPhotos;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const paragraphs = content.letterText.paragraphs;
  const words = useMemo(() => paragraphs.map((p) => p.split(/\s+/)), [paragraphs]);
  const offsets = useMemo(() => {
    const o: number[] = [];
    let n = 0;
    words.forEach((w) => {
      o.push(n);
      n += w.length;
    });
    return { starts: o, total: n };
  }, [words]);
  const [shown, setShown] = useState(reduced ? Number.MAX_SAFE_INTEGER : 0);
  const done = shown >= offsets.total;

  useEffect(() => {
    if (!writing || done) return;
    const id = window.setInterval(() => setShown((s) => s + 1), 70);
    return () => window.clearInterval(id);
  }, [writing, done]);

  const skip = () => setShown(Number.MAX_SAFE_INTEGER);
  const afterPara = (i: number) => shown >= offsets.starts[i] + words[i].length;
  const photosAfter = Math.min(Math.max(content.letterText.photosAfterParagraph, 1), paragraphs.length) - 1;

  return (
    <div className="relative isolate px-[clamp(22px,6vw,64px)] pb-14 pt-[clamp(36px,6vw,64px)] text-[#2f3150]">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.55))' }}>
        <div className="paper-sheet deckle absolute inset-0" />
      </div>
      {/* subtle fold creases */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[#c8bba4]/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-gradient-to-r from-transparent via-[#c8bba4]/50 to-transparent" />

      {/* corner scrapbook */}
      <div aria-hidden className="absolute right-[4%] top-[18px] flex items-start gap-2">
        <span className="typewriter mt-3 hidden text-[13px] text-[#7a7262] sm:inline">{content.birthdayDate}</span>
        <div className="relative rotate-6">
          <Stamp size={44} />
          <Washi width={44} rotate={-24} pattern="stripes" color="rgba(183,212,237,.7)" className="absolute -left-4 top-0" />
        </div>
      </div>
      <Bow size={60} className="absolute -left-4 -top-5 -rotate-12" />

      <div className="pointer-events-none sticky top-3 z-20 flex h-0 justify-start">
        {!done && writing && (
          <button
            type="button"
            onClick={skip}
            className="hand pointer-events-auto -ml-3 h-[44px] rounded-full bg-[#f8f4eb]/90 px-4 text-[18px] text-[#8c5a68] underline decoration-dotted underline-offset-4"
            style={{ boxShadow: '0 4px 12px -6px rgba(42,47,74,.4)' }}
          >
            skip the writing ›
          </button>
        )}
      </div>

      <h2 className="script-title mt-16 text-[clamp(44px,8vw,76px)] sm:mt-12">{content.letterText.greeting}</h2>

      <div className="mt-6 space-y-5 font-serif text-[clamp(19px,2.2vw,22px)] leading-[1.75] text-[#2f3150]">
        {paragraphs.map((_, pi) => (
          <Fragment key={pi}>
            <p>
              {words[pi].map((w, wi) => {
                const idx = offsets.starts[pi] + wi;
                const vis = idx < shown;
                return (
                  <span key={wi} style={{ opacity: vis ? 1 : 0, filter: vis ? 'none' : 'blur(3px)', transition: 'opacity .6s ease, filter .6s ease' }}>
                    {w}{' '}
                  </span>
                );
              })}
            </p>
            {pi === photosAfter && letterPhotos.length > 0 && (
              <motion.div
                className="relative !my-10 flex flex-wrap items-start justify-center gap-x-8 gap-y-10 sm:gap-x-14"
                initial={false}
                animate={{ opacity: afterPara(pi) ? 1 : 0, y: afterPara(pi) ? 0 : 10 }}
                transition={{ duration: 1 }}
              >
                {letterPhotos.map((p, i) => (
                  <div key={p.src} className="relative">
                    <Polaroid photo={p} width="min(40vw, 230px)" rotate={i ? 4 : -5} aspect={i ? 1.25 : 0.95} tape={i ? 'right' : 'left'} tapeColor={i ? 'rgba(183,212,237,.75)' : 'rgba(239,196,206,.8)'} onOpen={() => onPhoto(i)} heart={i === 0} />
                  </div>
                ))}
                <Heart size={26} className="absolute left-[46%] top-[-10px] rotate-12" />
                <DoodleStar size={22} className="absolute bottom-[10%] left-[48%]" color="#8c5a68" />
              </motion.div>
            )}
          </Fragment>
        ))}
      </div>

      <motion.div initial={false} animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }} transition={{ duration: 1.2 }} aria-hidden={!done}>
        <div className="mt-10 flex flex-col items-end pr-[4%] text-right">
          <p className="script-title text-[clamp(34px,5.5vw,52px)]">{content.letterText.closing}</p>
          <p className="script-title mt-1 text-[clamp(44px,7vw,68px)]">{content.senderName}</p>
          <div className="mt-1 flex items-center gap-2">
            <Heart size={18} />
            <span className="typewriter text-[13px] text-[#7a7262]">{content.birthdayDate}</span>
          </div>
        </div>

        {galleryPhotos.length > 0 && (
          <section className="mt-14" aria-label="A few more memories">
            <div className="mb-6 flex items-center gap-2">
              <Sparkle size={16} color="#e4bf68" />
              <h3 className="hand text-[26px] text-[#4a4560]">a few more of us</h3>
              <span className="hand text-[17px] text-[#9b8f86]">(tap any of them)</span>
            </div>
            <PhotoGallery photos={galleryPhotos} onOpen={onPhoto} offset={letterPhotos.length} />
          </section>
        )}

        <p className="mx-auto mt-14 max-w-[30ch] text-center font-serif text-[clamp(21px,2.6vw,26px)] italic leading-snug text-[#3c4066]">{content.closingLine}</p>
      </motion.div>

      <div className="mt-10 flex justify-center">
        <InkLink onClick={onClose} className="text-[24px] text-[#8c5a68]" ariaLabel="Close the letter">
          Close the letter ✧
        </InkLink>
      </div>
    </div>
  );
}
