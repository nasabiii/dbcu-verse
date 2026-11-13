import type { ReactNode } from 'react';
import { Bow, CrescentMoon, Daisy, Heart, wobblyStarPath } from './Stickers';

/** Every decoration that can sit on the cake. Sizes are in cake-SVG units (cake viewBox is 400 wide). */
export type DecorationKind = {
  id: string;
  label: string;
  shelf: 1 | 2;
  w: number;
  h: number;
  /** candles stand on the top surface; everything else can go anywhere on the cake */
  zone: 'top' | 'any';
  candle?: { color: string; stripe: string };
  render: () => ReactNode;
};

const INK = '#3a3550';

const full = { width: '100%', height: '100%', display: 'block', overflow: 'visible' } as const;

function Candle({ color, stripe }: { color: string; stripe: string }) {
  const id = `c-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 16 64" style={full} aria-hidden>
      <defs>
        <clipPath id={id}>
          <rect x="3.2" y="8" width="9.6" height="56" rx="2.4" />
        </clipPath>
        <linearGradient id={`${id}-sh`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
      </defs>
      <path d="M8 8 C7.6 6 8.4 4.5 8 2.4" stroke="#2b2b2b" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="16" height="64" fill={color} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M-2 ${12 + i * 7} L18 ${4 + i * 7}`} stroke={stripe} strokeWidth="2.6" />
        ))}
        <rect x="0" y="0" width="16" height="64" fill={`url(#${id}-sh)`} />
      </g>
      <rect x="3.2" y="8" width="9.6" height="56" rx="2.4" fill="none" stroke={INK} strokeWidth=".9" filter="url(#ink)" />
      <path d="M4.5 9.5 C6 11 9 11 11.5 9.4" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" fill="none" />
    </svg>
  );
}

const Svg = ({ children, vb = 40 }: { children: ReactNode; vb?: number }) => (
  <svg viewBox={`0 0 ${vb} ${vb}`} style={full} aria-hidden>
    {children}
  </svg>
);

const art = {
  cherry: () => (
    <Svg>
      <g filter="url(#ink)" stroke={INK} strokeWidth=".9" strokeLinecap="round">
        <path d="M14 26 C15 16 20 9 27 5 M27 26 C26 17 26 10 27 5" fill="none" stroke="#5e6b3c" strokeWidth="1.4" />
        <path d="M27 5 C31 3 35 5 36 8 C32 9 29 8 27 5Z" fill="#8a9a5b" />
        <circle cx="13" cy="29" r="7.2" fill="#c8455a" />
        <circle cx="27.5" cy="29" r="7.2" fill="#b83a50" />
      </g>
      <path d="M9.5 26.5 C10.5 25 12 24.6 13 24.8 M24 26.3 C25 25 26.5 24.6 27.5 24.8" stroke="#fff" strokeOpacity=".8" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  ),
  strawberry: () => (
    <Svg>
      <g filter="url(#ink)" stroke={INK} strokeWidth=".9" strokeLinejoin="round">
        <path d="M20 37 C11 31 6 22 8 15 C10 10 16 10 20 11 C24 10 30 10 32 15 C34 22 29 31 20 37Z" fill="#e2566c" />
        <path d="M12 12 C14 7 17 9 20 6 C23 9 26 7 28 12 C25 14 22 12 20 15 C18 12 15 14 12 12Z" fill="#7d8f4e" />
      </g>
      {[
        [15, 18], [21, 19], [26, 18], [13, 24], [19, 25], [25, 24], [17, 30], [22, 31],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx=".8" ry="1.2" fill="#f9e2a1" />
      ))}
      <path d="M11 17 C11.5 15 12.5 14 14 13.8" stroke="#fff" strokeOpacity=".7" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </Svg>
  ),
  blueberry: () => (
    <Svg>
      <g filter="url(#ink)" stroke="#1d2346" strokeWidth=".9">
        {[
          [14, 24, 7.5], [26, 25, 7.5], [20, 15, 7],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={['#4c5f9e', '#3d4f8c', '#5a6eaa'][i]} />
        ))}
      </g>
      {[
        [14, 24], [26, 25], [20, 15],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x - 2} ${y - 3} l2 1.4 l2 -1.4 l-.8 2.2`} stroke="#1d2346" strokeWidth=".8" fill="none" />
          <circle cx={x - 3} cy={y + 1} r="1.2" fill="#fff" opacity=".45" />
        </g>
      ))}
    </Svg>
  ),
  peach: () => (
    <Svg>
      <g filter="url(#ink)" stroke={INK} strokeWidth=".9" strokeLinejoin="round">
        <path d="M5 26 C8 14 20 7 34 9 C30 19 20 29 5 26Z" fill="#f4a985" />
        <path d="M9 24 C12 16 21 11 30 12 C27 19 19 26 9 24Z" fill="#fbd3a3" stroke="none" />
      </g>
      <path d="M12 21 C16 17 21 15 26 14" stroke="#fff6e4" strokeOpacity=".8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  ),
  flower: () => (
    <Svg>
      <g filter="url(#ink)" stroke="#8c5a68" strokeWidth=".9">
        {Array.from({ length: 5 }).map((_, i) => (
          <circle key={i} cx="20" cy="11" r="7.4" fill="#f2c3cf" transform={`rotate(${i * 72} 20 20)`} />
        ))}
        <circle cx="20" cy="20" r="5" fill="#f4d37f" />
      </g>
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={i} d="M20 7 L20 12" stroke="#d98ea2" strokeWidth=".8" transform={`rotate(${i * 72} 20 20)`} />
      ))}
      <circle cx="18.5" cy="18.5" r="1.3" fill="#fff8e0" />
    </Svg>
  ),
  dollop: () => (
    <Svg>
      <g filter="url(#ink)" stroke="#8a8478" strokeWidth=".9" strokeLinejoin="round" fill="#fffaf1">
        <path d="M6 32 C4 26 10 24 13 25 C12 21 17 19 20 20 C20 15 24 13 26 15 C28 17 27 20 27 21 C31 21 34 25 33 28 C36 29 35 33 32 34 L8 34 C6 34 5 33 6 32Z" />
        <path d="M10 30 C15 28 25 28 31 30 M14 25 C18 23.5 23 23.5 27 25" fill="none" />
        <path d="M23 15 C24 13 26 12 27 11" fill="none" />
      </g>
      <path d="M12 27 C14 26 16 26 17 26" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  ),
  pearls: () => (
    <Svg>
      <defs>
        <radialGradient id="pearl" cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#f0ebe3" />
          <stop offset="1" stopColor="#bdb6c9" />
        </radialGradient>
      </defs>
      {[
        [12, 24, 5.5], [24, 27, 5], [19, 15, 4.6], [30, 17, 3.6], [8, 13, 3.2],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="url(#pearl)" stroke="#9a93ab" strokeWidth=".6" />
      ))}
    </Svg>
  ),
  star: (fill: string, stroke: string) => () => (
    <Svg>
      <path d={wobblyStarPath(20, 21, 17, 7.8, 5)} fill={fill} stroke={stroke} strokeWidth="1" strokeLinejoin="round" filter="url(#ink)" />
      <path d="M15 14 L17 18" stroke="#fff" strokeOpacity=".85" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
};

export const DECORATIONS: DecorationKind[] = [
  { id: 'candle-pink', label: 'Pink candle', shelf: 1, w: 19, h: 80, zone: 'top', candle: { color: '#f2c0cc', stripe: '#fdf0f2' }, render: () => <Candle color="#f2c0cc" stripe="#fdf0f2" /> },
  { id: 'candle-blue', label: 'Blue candle', shelf: 1, w: 19, h: 80, zone: 'top', candle: { color: '#a9c9ea', stripe: '#eef5fc' }, render: () => <Candle color="#a9c9ea" stripe="#eef5fc" /> },
  { id: 'candle-butter', label: 'Butter-yellow candle', shelf: 1, w: 19, h: 80, zone: 'top', candle: { color: '#f3d98e', stripe: '#fff8e2' }, render: () => <Candle color="#f3d98e" stripe="#fff8e2" /> },
  { id: 'candle-lilac', label: 'Lilac candle', shelf: 1, w: 19, h: 80, zone: 'top', candle: { color: '#cdb9e3', stripe: '#f6f0fb' }, render: () => <Candle color="#cdb9e3" stripe="#f6f0fb" /> },
  { id: 'candle-mint', label: 'Mint candle', shelf: 1, w: 19, h: 80, zone: 'top', candle: { color: '#b8dccb', stripe: '#f0faf4' }, render: () => <Candle color="#b8dccb" stripe="#f0faf4" /> },
  { id: 'heart', label: 'Sparkling heart', shelf: 1, w: 45, h: 45, zone: 'any', render: () => <Heart size="100%" sparkle /> },
  { id: 'heart-blue', label: 'Blue heart', shelf: 1, w: 39, h: 39, zone: 'any', render: () => <Heart size="100%" color="#a9c9ea" ink="#3f4b74" /> },
  { id: 'dollop', label: 'Frosting dollop', shelf: 1, w: 48, h: 48, zone: 'any', render: art.dollop },
  { id: 'pearls', label: 'Edible pearls', shelf: 1, w: 39, h: 39, zone: 'any', render: art.pearls },
  { id: 'bow', label: 'Pink bow', shelf: 1, w: 60, h: 60, zone: 'any', render: () => <Bow size="100%" /> },
  { id: 'ribbon', label: 'Blue ribbon bow', shelf: 1, w: 57, h: 57, zone: 'any', render: () => <Bow size="100%" color="#b7d4ed" ink="#3f4b74" /> },
  { id: 'daisy', label: 'Daisy', shelf: 2, w: 45, h: 45, zone: 'any', render: () => <Daisy size="100%" /> },
  { id: 'flower', label: 'Pink flower', shelf: 2, w: 45, h: 45, zone: 'any', render: art.flower },
  { id: 'cherry', label: 'Cherries', shelf: 2, w: 48, h: 48, zone: 'any', render: art.cherry },
  { id: 'strawberry', label: 'Strawberry', shelf: 2, w: 45, h: 45, zone: 'any', render: art.strawberry },
  { id: 'blueberry', label: 'Blueberries', shelf: 2, w: 39, h: 39, zone: 'any', render: art.blueberry },
  { id: 'peach', label: 'Peach slice', shelf: 2, w: 45, h: 45, zone: 'any', render: art.peach },
  { id: 'star-gold', label: 'Gold star', shelf: 2, w: 42, h: 42, zone: 'any', render: art.star('url(#gold-foil)', '#8a6a2a') },
  { id: 'star-silver', label: 'Silver star', shelf: 2, w: 39, h: 39, zone: 'any', render: art.star('url(#silver-foil)', '#5f6b84') },
  { id: 'moon', label: 'Crescent moon', shelf: 2, w: 45, h: 45, zone: 'any', render: () => <CrescentMoon size="100%" /> },
];

export const DECO_BY_ID = Object.fromEntries(DECORATIONS.map((d) => [d.id, d])) as Record<string, DecorationKind>;
