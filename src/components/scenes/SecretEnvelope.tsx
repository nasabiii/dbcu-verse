import { motion } from 'framer-motion';
import { useState } from 'react';
import { content } from '../../content';
import { EnvelopeArt, Sparkle } from '../art/Stickers';

/** A tiny ivory envelope hiding among the stars. Not a button-looking button. */
export function SecretEnvelope({ onOpen, hidden, opened }: { onOpen: () => void; hidden?: boolean; opened?: boolean }) {
  const [near, setNear] = useState(false);
  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        layoutId="secret-envelope"
        onClick={onOpen}
        onPointerEnter={() => setNear(true)}
        onPointerLeave={() => setNear(false)}
        onFocus={() => setNear(true)}
        onBlur={() => setNear(false)}
        aria-label="A small sealed envelope. Open the hidden letter."
        className="relative flex h-[64px] w-[72px] items-center justify-center"
        style={{ opacity: hidden ? 0 : 1, rotate: -9 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }}
        whileHover={{ scale: 1.12, rotate: -3 }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-[-40%] rounded-full"
          animate={{ opacity: near ? 1 : 0.35, scale: near ? 1.1 : 0.9 }}
          transition={{ duration: 0.8 }}
          style={{ background: 'radial-gradient(closest-side, rgba(255,232,180,.55), rgba(239,196,206,.15) 60%, transparent)' }}
        />
        <EnvelopeArt size={58} className="relative" />
        <Sparkle size={12} color="#ffe9b5" className="twinkle absolute -right-1 -top-1" />
      </motion.button>
      <motion.p
        className="hand pointer-events-none mt-1 max-w-[150px] text-center text-[16px] leading-tight text-[#e7d9c4]"
        animate={{ opacity: near ? 1 : opened ? 0.45 : 0.7 }}
      >
        {opened ? 'read it again?' : content.letterClue}
      </motion.p>
    </div>
  );
}
