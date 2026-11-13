import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { content } from '../../content';
import { usePrefersReducedMotion } from '../../lib/motion';
import { Planet } from '../art/Planet';
import { Starfield } from '../art/Starfield';
import { Bow, Butterfly, EnvelopeArt, GoldStar, PaperStar, Sparkle, Stamp, Washi, sparklePath } from '../art/Stickers';
import { HandButton, InkLink } from '../ui/HandButton';
import { NoBreakWords, WriteOn } from '../ui/WriteOn';

type Props = {
  returning: boolean;
  onEnter: (to: 'cake' | 'universe') => void;
};

/** Scene 1 — a cinematic night sky, lettering written in, and the first step inside. */
export function IntroScene({ returning, onEnter }: Props) {
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(reduced ? 4 : 0);
  const [leaving, setLeaving] = useState<null | { to: 'cake' | 'universe'; x: number; y: number }>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const ts = [600, 2600, 4300, 5200].map((t, i) => window.setTimeout(() => setStage((s) => Math.max(s, i + 1)), t));
    return () => ts.forEach(clearTimeout);
  }, [reduced]);

  const go = (to: 'cake' | 'universe') => {
    if (leaving) return;
    const r = btnRef.current?.getBoundingClientRect();
    setLeaving({ to, x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top + r.height / 2 : window.innerHeight * 0.7 });
    window.setTimeout(() => onEnter(to), reduced ? 200 : 2100);
  };

  return (
    <motion.section
      aria-label="A little something for you"
      className="sky sky-wash fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, delay: 0.5 } }}
      transition={{ duration: 1.6 }}
      onClick={() => stage < 4 && !leaving && setStage(4)}
    >
      <motion.div className="absolute inset-0" animate={leaving ? { scale: 1.18 } : { scale: 1 }} transition={{ duration: 2.2, ease: [0.5, 0, 0.3, 1] }}>
        <Starfield density={1.1} seed={11} />

        {/* watercolor clouds */}
        {[
          { l: '-10%', t: '8%', w: '60vw', c: 'rgba(120,140,200,.16)' },
          { l: '55%', t: '18%', w: '55vw', c: 'rgba(239,196,206,.07)' },
          { l: '15%', t: '48%', w: '70vw', c: 'rgba(183,212,237,.10)' },
        ].map((c, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="absolute rounded-[50%]"
            style={{ left: c.l, top: c.t, width: c.w, height: `calc(${c.w} * .42)`, background: `radial-gradient(closest-side, ${c.c}, transparent)`, filter: 'blur(18px)' }}
            animate={reduced ? undefined : { x: [0, 30, 0] }}
            transition={{ duration: 40 + i * 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* the moon, rising from below */}
        <motion.div
          aria-hidden
          className="absolute left-1/2"
          style={{ width: 'max(min(150vw, 1150px), 110vh)', top: '77%', x: '-42%' }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 3.2, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
        >
          <div className="absolute inset-[-8%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(245,240,231,.16), rgba(183,212,237,.06) 70%, transparent)' }} />
          <Planet variant="moon" size="100%" seed={21} />
          <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(11,18,48,.25) 14%, rgba(11,18,48,.7) 30%)' }} />
        </motion.div>

        {/* scrapbook bits floating in the sky */}
        <Floaty className="left-[6%] top-[12%] sm:left-[9%]" delay={1.2} r={-12}>
          <Bow size={'clamp(44px,6vw,72px)'} />
        </Floaty>
        <Floaty className="right-[7%] top-[9%]" delay={1.6} r={8}>
          <PaperStar size={'clamp(36px,4.5vw,58px)'} seed={5} gold />
        </Floaty>
        <Floaty className="left-[14%] top-[64%] hidden sm:block" delay={2} r={-6}>
          <PaperStar size={46} seed={9} />
        </Floaty>
        <Floaty className="right-[5%] top-[58%] sm:right-[11%] sm:top-[52%]" delay={2.4} r={-14}>
          <EnvelopeArt size={'clamp(54px,7vw,92px)'} />
        </Floaty>
        <Floaty className="left-[4%] top-[38%] hidden md:block" delay={2.8} r={7}>
          <div className="relative">
            <Stamp size={52} />
            <Washi width={40} rotate={-30} color="rgba(183,212,237,.7)" className="absolute -left-3 -top-2" />
          </div>
        </Floaty>
        <Floaty className="right-[22%] top-[28%] hidden md:block" delay={3.1} r={10}>
          <Butterfly size={44} color="#efc4ce" ink="#8c5a68" />
        </Floaty>
        <Floaty className="left-[30%] top-[6%] hidden sm:block" delay={1.9}>
          <GoldStar size={26} seed={3} />
        </Floaty>
        <Floaty className="right-[30%] top-[72%] hidden sm:block" delay={2.2}>
          <GoldStar size={20} seed={6} />
        </Floaty>
        <Sparkle size={18} className="twinkle absolute left-[62%] top-[14%]" />
        <Sparkle size={12} className="twinkle absolute left-[22%] top-[30%]" style={{ animationDelay: '-2s' }} />
      </motion.div>

      {/* lettering */}
      <AnimatePresence>
        {!leaving && (
          <motion.div
            className="absolute inset-x-0 top-[17%] z-10 flex flex-col items-center px-5 text-center sm:top-[18%]"
            exit={{ opacity: 0, y: -24, filter: 'blur(6px)', transition: { duration: 0.9 } }}
          >
            {stage >= 1 && (
              <WriteOn duration={1.8} className="script-soft text-[clamp(30px,5vw,54px)] leading-tight">
                {content.intro.line1}
              </WriteOn>
            )}
            {stage >= 2 && (
              <WriteOn duration={2.2} className="mt-2 sm:mt-4">
                <h1 className="script-title on-dark text-[clamp(52px,10.5vw,138px)] leading-[1.05] [text-wrap:balance]">
                  <NoBreakWords text={content.intro.line2} />
                </h1>
              </WriteOn>
            )}
            {stage >= 3 && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }} className="hand mt-3 text-[clamp(20px,2.4vw,27px)] text-[#d6dff0]/90">
                {content.intro.note} <span className="text-[#efc4ce]">♡</span> {content.intro.noteSignoff}
              </motion.p>
            )}
            <div ref={btnRef} className="mt-8 flex min-h-[120px] flex-col items-center sm:mt-10">
              {stage >= 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="flex flex-col items-center">
                  <HandButton size="lg" onClick={() => go(returning ? 'universe' : 'cake')}>
                    {returning ? content.intro.returningButton : content.intro.button} ✧
                  </HandButton>
                  {returning && (
                    <InkLink tone="night" className="mt-1 text-[18px]" onClick={() => go('cake')}>
                      or visit your cake again
                    </InkLink>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage < 4 && !leaving && (
        <button type="button" onClick={() => setStage(4)} className="hand absolute bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-10 min-h-[44px] -translate-x-1/2 px-4 text-[17px] text-[#aab4d0]/70">
          skip ›
        </button>
      )}

      {/* the guiding star: it floats toward us, and we follow it inside */}
      {leaving && <GuidingStar from={leaving} warm={leaving.to === 'cake'} reduced={reduced} />}
    </motion.section>
  );
}

function Floaty({ children, className = '', delay = 0, r = 0 }: { children: React.ReactNode; className?: string; delay?: number; r?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 14, rotate: r - 6 }}
      animate={{ opacity: 1, y: 0, rotate: r }}
      transition={{ duration: 2, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className="drift" style={{ animationDelay: `${-delay * 1.7}s`, animationDuration: `${6 + delay}s` }}>
        {children}
      </div>
    </motion.div>
  );
}

function GuidingStar({ from, warm, reduced }: { from: { x: number; y: number }; warm: boolean; reduced: boolean }) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      <motion.div
        className="absolute"
        style={{ left: from.x - 24, top: from.y - 24, width: 48, height: 48 }}
        initial={{ scale: 0.3, opacity: 0, rotate: 0 }}
        animate={
          reduced
            ? { opacity: 1, scale: 1 }
            : { x: [0, (cx - from.x) * 0.5, cx - from.x], y: [0, -60, cy - from.y], scale: [0.3, 1.4, 70], opacity: [0, 1, 1], rotate: [0, 40, 90] }
        }
        transition={{ duration: 2, times: [0, 0.45, 1], ease: [0.6, 0, 0.4, 1] }}
      >
        <div className="absolute inset-[-120%] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,236,190,.75), rgba(255,220,160,.2) 50%, transparent)' }} />
        <svg viewBox="0 0 40 40" className="relative h-full w-full" style={{ filter: 'drop-shadow(0 0 6px #ffe7a8)' }}>
          <path d={sparklePath(20, 19, 3.6)} fill="#fff6dc" />
        </svg>
      </motion.div>
      <motion.div
        className={`absolute inset-0 ${warm ? 'ivory-paper' : 'sky'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.2 : 0.7, delay: reduced ? 0 : 1.45 }}
      />
    </div>
  );
}
