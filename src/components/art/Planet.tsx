import { useId, type CSSProperties } from 'react';
import { mulberry32 } from '../../lib/random';

type Variant = 'main' | 'music' | 'moon' | 'mini';

const palettes: Record<Variant, { hi: string; mid: string; edge: string; blot: string[]; crater: string; ink: string }> = {
  main: { hi: '#eef0ec', mid: '#a9c4e4', edge: '#56729f', blot: ['#b7d4ed', '#f5f0e7', '#8eadd8', '#dfe9f3', '#7f9ccc'], crater: '#87a1cb', ink: '#2e3a63' },
  music: { hi: '#fbeef0', mid: '#efc4ce', edge: '#b6828f', blot: ['#f5d6dd', '#e3aebb', '#fff6f2', '#d99eac'], crater: '#d19aa8', ink: '#6e4352' },
  moon: { hi: '#fbf6ea', mid: '#e3dccb', edge: '#a69e8a', blot: ['#efe7d6', '#d6ccb4', '#f8f3e8', '#c9bfa5'], crater: '#c3b89d', ink: '#5a5444' },
  mini: { hi: '#fff7e3', mid: '#efd9a4', edge: '#c49a52', blot: ['#f4e2b8', '#e8c77d', '#fff4dc'], crater: '#d5b06a', ink: '#6b5124' },
};

export function Planet({
  variant = 'main',
  size = 400,
  seed = 3,
  className,
  style,
  bands = false,
  outline = true,
}: {
  variant?: Variant;
  size?: number | string;
  seed?: number;
  className?: string;
  style?: CSSProperties;
  bands?: boolean;
  outline?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const pal = palettes[variant];
  const rnd = mulberry32(seed);
  const blots = Array.from({ length: 9 }).map(() => ({
    cx: 60 + rnd() * 280,
    cy: 60 + rnd() * 280,
    rx: 40 + rnd() * 90,
    ry: 25 + rnd() * 60,
    rot: rnd() * 180,
    c: pal.blot[Math.floor(rnd() * pal.blot.length)],
    o: 0.25 + rnd() * 0.35,
  }));
  const craters = Array.from({ length: variant === 'music' ? 4 : 9 }).map(() => {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * 150;
    return { cx: 200 + Math.cos(a) * d, cy: 200 + Math.sin(a) * d, r: 7 + rnd() * 22, sq: 0.7 + rnd() * 0.25 };
  });

  return (
    <svg viewBox="-10 -10 420 420" width={size} height={size} className={className} style={{ overflow: 'visible', ...style }} aria-hidden>
      <defs>
        <radialGradient id={`base-${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor={pal.hi} />
          <stop offset="0.55" stopColor={pal.mid} />
          <stop offset="1" stopColor={pal.edge} />
        </radialGradient>
        <radialGradient id={`shade-${id}`} cx="30%" cy="25%" r="90%">
          <stop offset="0.55" stopColor="#0b1230" stopOpacity="0" />
          <stop offset="1" stopColor="#0b1230" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={`rim-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0.86" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#e9f1ff" stopOpacity="0.35" />
        </radialGradient>
        <clipPath id={`clip-${id}`}>
          <circle cx="200" cy="200" r="196" />
        </clipPath>
        <filter id={`blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* soft halo */}
      <circle cx="200" cy="200" r="204" fill="none" stroke={pal.mid} strokeOpacity=".18" strokeWidth="14" filter={`url(#blur-${id})`} />

      <g clipPath={`url(#clip-${id})`}>
        <circle cx="200" cy="200" r="200" fill={`url(#base-${id})`} filter="url(#watercolor)" />
        <g filter={`url(#blur-${id})`}>
          {blots.map((b, i) => (
            <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.c} opacity={b.o} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`} />
          ))}
        </g>
        {bands &&
          [120, 175, 240, 300].map((y, i) => (
            <path
              key={y}
              d={`M-10 ${y} C 100 ${y - 22 + i * 6} 300 ${y + 26 - i * 5} 410 ${y - 8}`}
              stroke={i % 2 ? '#fff6f2' : '#d99eac'}
              strokeWidth={i % 2 ? 10 : 16}
              strokeOpacity=".45"
              fill="none"
              filter="url(#ink-strong)"
            />
          ))}
        {craters.map((c, i) => (
          <g key={i} filter="url(#ink)">
            <ellipse cx={c.cx} cy={c.cy} rx={c.r} ry={c.r * c.sq} fill={pal.crater} opacity=".55" />
            <path
              d={`M${c.cx - c.r * 0.9} ${c.cy - c.r * 0.1} A ${c.r} ${c.r * c.sq} 0 0 1 ${c.cx + c.r * 0.8} ${c.cy - c.r * 0.35}`}
              stroke={pal.hi}
              strokeWidth="2.2"
              fill="none"
              opacity=".85"
            />
            <ellipse cx={c.cx} cy={c.cy} rx={c.r} ry={c.r * c.sq} fill="none" stroke={pal.ink} strokeWidth=".9" opacity=".45" />
          </g>
        ))}
        <rect x="0" y="0" width="400" height="400" fill="#000" filter="url(#granulate)" opacity=".5" />
        <circle cx="200" cy="200" r="200" fill={`url(#shade-${id})`} />
        <circle cx="200" cy="200" r="200" fill={`url(#rim-${id})`} />
      </g>
      {outline && (
        <>
          <circle cx="200" cy="200" r="196" fill="none" stroke={pal.ink} strokeWidth="1.6" opacity=".55" filter="url(#ink-strong)" />
          <circle cx="201" cy="199" r="203" fill="none" stroke="#f5f0e7" strokeWidth=".9" opacity=".55" filter="url(#ink)" />
        </>
      )}
    </svg>
  );
}
