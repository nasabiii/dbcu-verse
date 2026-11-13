import { useEffect, useRef, useState } from 'react';
import { content } from '../../content';
import { readStore, writeStore } from '../../lib/storage';
import { ambient } from '../../lib/sound';

type State = 'off' | 'waiting' | 'on';

// events browsers accept as "the visitor meant it" for starting audio
const GESTURES = ['pointerup', 'touchend', 'mousedown', 'keydown', 'click'] as const;

/**
 * Sound toggle. With autoplay on, the song starts as soon as the browser
 * allows — right away if permitted, otherwise on the first tap or key press.
 * Turning it off is remembered for the rest of the visit.
 */
export function AmbientSoundToggle({ tone = 'night' }: { tone?: 'night' | 'paper' }) {
  const { title, artist, autoplay } = content.optionalAudio;
  const [state, setState] = useState<State>('off');
  const [song, setSong] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const play = async () => {
    const r = await ambient.start();
    if (r === 'playing') {
      setState('on');
      setSong(ambient.mode === 'file');
    } else setState('waiting');
    return r;
  };

  // autoplay: try now, otherwise on the first gesture anywhere on the page
  useEffect(() => {
    if (!autoplay || readStore('soundOff', false, 'session')) return;
    let cancelled = false;
    const onGesture = (e: Event) => {
      if (btnRef.current?.contains(e.target as Node)) return; // the toggle handles its own clicks
      if (stateRef.current !== 'waiting') return cleanup();
      play().then((r) => r === 'playing' && cleanup());
    };
    const cleanup = () => GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    play().then((r) => {
      if (cancelled || r === 'playing') return;
      GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
    });
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async () => {
    if (state === 'on') {
      ambient.stop();
      setState('off');
      setSong(false);
      writeStore('soundOff', true, 'session');
      return;
    }
    writeStore('soundOff', false, 'session');
    await play();
  };

  const on = state === 'on';
  const color = tone === 'night' ? '#efc4ce' : '#8c5a68';
  const label = on ? (song ? `♪ ${title} — ${artist}` : 'sound on') : state === 'waiting' ? 'tap for music ♪' : 'sound off';
  return (
    <button
      ref={btnRef}
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
      <span className="max-w-[46vw] truncate">{label}</span>
    </button>
  );
}
