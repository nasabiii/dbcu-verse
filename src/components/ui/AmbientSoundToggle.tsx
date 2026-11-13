import { useEffect, useState } from 'react';
import { content } from '../../content';
import { ambient } from '../../lib/sound';

/** Optional, initially muted night-sky sound. */
export function AmbientSoundToggle({ tone = 'night' }: { tone?: 'night' | 'paper' }) {
  const [on, setOn] = useState(false);
  const [song, setSong] = useState(false);
  useEffect(() => () => ambient.stop(), []);
  const toggle = async () => {
    if (on) {
      ambient.stop();
      setOn(false);
      setSong(false);
      return;
    }
    setOn(true);
    await ambient.start();
    setSong(ambient.mode === 'file');
  };
  const { title, artist } = content.optionalAudio;
  const color = tone === 'night' ? '#efc4ce' : '#8c5a68';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : `Turn sound on${title ? ` (${title} by ${artist})` : ''}`}
      className="hand flex min-h-[44px] items-center gap-1.5 px-2 text-[17px] transition-colors duration-700"
      style={{ color }}
    >
      <svg width="26" height="22" viewBox="0 0 26 22" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" filter="url(#ink)">
          <path d="M3 8 L7 8 L12 4 L12 18 L7 14 L3 14Z" />
          {on ? (
            <>
              <path d="M15.5 8 C17 9.5 17 12.5 15.5 14" />
              <path d="M18.5 5.5 C21.5 8.5 21.5 13.5 18.5 16.5" />
            </>
          ) : (
            <path d="M16 8 L21 14 M21 8 L16 14" opacity=".75" />
          )}
        </g>
      </svg>
      <span className="max-w-[46vw] truncate">{on ? (song ? `♪ ${title} — ${artist}` : 'sound on') : 'sound off'}</span>
    </button>
  );
}
