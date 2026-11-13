import type { CSSProperties, ReactNode } from 'react';
import { mulberry32 } from '../../lib/random';

const INK = '#2a2f4a';

type P = { size?: number | string; className?: string; style?: CSSProperties; title?: string };

/** Irregular hand-drawn star path (softened points). */
export function wobblyStarPath(cx: number, cy: number, R: number, r: number, seed = 1, points = 5) {
  const rnd = mulberry32(seed);
  const pts: [number, number][] = [];
  const rot = -Math.PI / 2 + (rnd() - 0.5) * 0.25;
  for (let i = 0; i < points * 2; i++) {
    const rad = (i % 2 === 0 ? R : r) * (0.9 + rnd() * 0.18);
    const a = rot + (i * Math.PI) / points + (rnd() - 0.5) * 0.08;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i <= pts.length; i++) {
    const p = pts[i % pts.length];
    const prev = pts[i - 1];
    const mx = (prev[0] + p[0]) / 2 + (rnd() - 0.5) * 0.8;
    const my = (prev[1] + p[1]) / 2 + (rnd() - 0.5) * 0.8;
    d += ` Q${mx.toFixed(2)} ${my.toFixed(2)} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  }
  return d + 'Z';
}

/** 4-point sparkle path */
export const sparklePath = (c = 20, R = 18, w = 3.2) =>
  `M${c} ${c - R} Q${c + w * 0.6} ${c - w * 0.6} ${c + R} ${c} Q${c + w * 0.6} ${c + w * 0.6} ${c} ${c + R} Q${c - w * 0.6} ${c + w * 0.6} ${c - R} ${c} Q${c - w * 0.6} ${c - w * 0.6} ${c} ${c - R}Z`;

const Svg = ({ size = 40, vb = 40, className, style, title, children }: P & { vb?: number; children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${vb} ${vb}`}
    className={className}
    style={style}
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

/** White paper-cutout star with a cut edge and soft paper shadow. */
export function PaperStar({ seed = 2, gold = false, ...p }: P & { seed?: number; gold?: boolean }) {
  const d = wobblyStarPath(20, 21, 17, 7.6, seed);
  return (
    <Svg {...p} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.35))', ...p.style }}>
      <path d={d} fill="#fbf7ef" stroke="#fffdf8" strokeWidth="3.2" strokeLinejoin="round" />
      <path d={wobblyStarPath(20, 21, 14.2, 6.3, seed)} fill={gold ? 'url(#gold-foil)' : '#f2ede2'} />
      {!gold && <path d={wobblyStarPath(20, 21, 14.2, 6.3, seed)} fill="none" stroke="#d9d1c0" strokeWidth=".6" />}
    </Svg>
  );
}

/** Hand-inked gold star */
export function GoldStar({ seed = 4, outline = true, ...p }: P & { seed?: number; outline?: boolean }) {
  return (
    <Svg {...p}>
      <path
        d={wobblyStarPath(20, 21, 16.5, 7.2, seed)}
        fill="url(#gold-foil)"
        stroke={outline ? '#8a6a2a' : 'none'}
        strokeWidth="1.1"
        strokeLinejoin="round"
        filter="url(#ink)"
      />
    </Svg>
  );
}

/** Outline-only doodle star (like pen on paper) */
export function DoodleStar({ seed = 7, color = INK, ...p }: P & { seed?: number; color?: string }) {
  return (
    <Svg {...p}>
      <path
        d={wobblyStarPath(20, 21, 15, 6.4, seed)}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#ink)"
      />
    </Svg>
  );
}

export function Sparkle({ color = '#fffaf0', ...p }: P & { color?: string }) {
  return (
    <Svg {...p}>
      <path d={sparklePath(20, 18, 3)} fill={color} />
    </Svg>
  );
}

export function Bow({ color = '#efc4ce', ink = '#9a6474', ...p }: P & { color?: string; ink?: string }) {
  return (
    <Svg {...p} vb={48}>
      <g filter="url(#ink)" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 20 C16 8 4 9 5 18 C6 26 16 26 24 22Z" fill={color} />
        <path d="M24 20 C32 8 44 9 43 18 C42 26 32 26 24 22Z" fill={color} />
        <path d="M22 22 C18 30 14 38 11 44 L16 42 L18 46 C21 38 23 30 24 24Z" fill={color} />
        <path d="M26 22 C30 30 34 38 37 44 L32 42 L30 46 C27 38 25 30 24 24Z" fill={color} />
        <ellipse cx="24" cy="21" rx="4" ry="4.4" fill={color} />
        <path d="M10 15 C13 17 16 18 20 19 M38 15 C35 17 32 18 28 19" fill="none" strokeWidth="0.9" opacity=".6" />
      </g>
    </Svg>
  );
}

export function Heart({ color = '#e9a6b6', ink = '#8c5a68', sparkle = false, ...p }: P & { color?: string; ink?: string; sparkle?: boolean }) {
  return (
    <Svg {...p}>
      <path
        d="M20 34 C10 27 4 21 5 14 C6 8 13 6 17 10 C18.5 11.5 19.5 13 20 14 C20.5 13 21.5 11.5 23 10 C27 6 34 8 35 14 C36 21 30 27 20 34Z"
        fill={color}
        stroke={ink}
        strokeWidth="1.3"
        strokeLinejoin="round"
        filter="url(#ink)"
      />
      <path d="M11 13 C12 11 14 10.5 15.5 11.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".75" />
      {sparkle && (
        <>
          <path d={sparklePath(33, 5, 1)} fill="#fff6d8" />
          <path d={sparklePath(6, 4, 0.8)} transform="translate(0 22)" fill="#fff6d8" />
        </>
      )}
    </Svg>
  );
}

export function CrescentMoon({ color = '#f4dc9a', ink = '#8a6a2a', ...p }: P & { color?: string; ink?: string }) {
  return (
    <Svg {...p}>
      <path
        d="M26 5 C15 6 8 14 8 22 C8 31 16 37 25 36 C29 35.6 32 34 34 31 C24 33 16 27 16 19 C16 13 20 8 26 5Z"
        fill={color}
        stroke={ink}
        strokeWidth="1.2"
        strokeLinejoin="round"
        filter="url(#ink)"
      />
      <circle cx="14" cy="24" r="1.4" fill={ink} opacity=".25" />
      <circle cx="18" cy="30" r="1" fill={ink} opacity=".2" />
    </Svg>
  );
}

export function Daisy({ petal = '#fffaf0', center = '#e9c56f', ink = '#6f6a55', ...p }: P & { petal?: string; center?: string; ink?: string }) {
  return (
    <Svg {...p}>
      <g filter="url(#ink)" stroke={ink} strokeWidth="0.9">
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx="20" cy="10.5" rx="3.6" ry="8" fill={petal} transform={`rotate(${i * 40 + 5} 20 20)`} />
        ))}
        <circle cx="20" cy="20" r="5" fill={center} />
      </g>
      <circle cx="18.5" cy="18.5" r="1.4" fill="#fff6d8" opacity=".8" />
    </Svg>
  );
}

export function MusicNote({ color = '#2a2f4a', double = false, ...p }: P & { color?: string; double?: boolean }) {
  return (
    <Svg {...p}>
      <g filter="url(#ink)" fill={color} stroke={color} strokeLinecap="round">
        {double ? (
          <>
            <ellipse cx="11" cy="30" rx="5" ry="3.6" transform="rotate(-20 11 30)" />
            <ellipse cx="29" cy="26" rx="5" ry="3.6" transform="rotate(-20 29 26)" />
            <path d="M15 29 L15 9 L33 5 L33 25" fill="none" strokeWidth="2" />
            <path d="M15 11 L33 7" strokeWidth="4" />
          </>
        ) : (
          <>
            <ellipse cx="15" cy="30" rx="5.5" ry="4" transform="rotate(-20 15 30)" />
            <path d="M20 29 L20 6 C24 10 30 11 29 18" fill="none" strokeWidth="2" />
          </>
        )}
      </g>
    </Svg>
  );
}

/** Illustrated envelope (moodboard-style ivory + blue lining) */
export function EnvelopeArt({ open = false, ...p }: P & { open?: boolean }) {
  return (
    <Svg {...p} vb={64}>
      <g filter="url(#ink)" stroke="#5b6585" strokeWidth="1.1" strokeLinejoin="round">
        {open && <path d="M6 24 L32 4 L58 24Z" fill="#3c5389" />}
        <rect x="6" y="22" width="52" height="34" rx="2" fill="#f4efe4" />
        <path d="M6 56 L28 38 M58 56 L36 38" fill="none" opacity=".55" />
        {!open && <path d="M6 22 L32 42 L58 22" fill="#ece5d6" />}
        {!open && <circle cx="32" cy="41" r="4.6" fill="#26365b" stroke="#16204a" />}
      </g>
    </Svg>
  );
}

/** Perforated postage stamp with a tiny painted moon */
export function Stamp({ tone = '#b7d4ed', ...p }: P & { tone?: string }) {
  const holes = [];
  for (let i = 0; i < 9; i++) {
    const t = 4 + i * 4;
    holes.push(<circle key={`t${i}`} cx={t} cy={2} r={1.3} />, <circle key={`b${i}`} cx={t} cy={46} r={1.3} />);
  }
  for (let i = 0; i < 11; i++) {
    const t = 4 + i * 4;
    holes.push(<circle key={`l${i}`} cx={2} cy={t} r={1.3} />, <circle key={`r${i}`} cx={38} cy={t} r={1.3} />);
  }
  return (
    <svg width={typeof p.size === 'number' ? p.size : 40} height={((typeof p.size === 'number' ? p.size : 40) * 48) / 40} viewBox="0 0 40 48" className={p.className} style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.25))', ...p.style }} aria-hidden>
      <mask id="stamp-holes">
        <rect width="40" height="48" fill="#fff" />
        <g fill="#000">{holes}</g>
      </mask>
      <g mask="url(#stamp-holes)">
        <rect width="40" height="48" fill="#fbf7ee" />
        <rect x="5" y="5" width="30" height="38" fill={tone} />
        <rect x="5" y="5" width="30" height="38" fill="#1c2750" opacity=".55" />
        <circle cx="20" cy="22" r="8" fill="#f4ecd6" />
        <circle cx="17" cy="20" r="1.6" fill="#d8ccb0" />
        <circle cx="22" cy="25" r="1.1" fill="#d8ccb0" />
        <path d={sparklePath(10, 3, 0.7)} transform="translate(17 26)" fill="#fff" />
        <path d={sparklePath(10, 2.4, 0.6)} transform="translate(0 0)" fill="#e4bf68" />
        <text x="20" y="40" textAnchor="middle" fontSize="4.4" fontFamily="Special Elite" fill="#f5f0e7">
          LUNA · 17
        </text>
      </g>
    </svg>
  );
}

/** Small blue "starry square" scrapbook chip, like a cut-out of night sky */
export function SkyChip({ size = 34, seed = 1, className, style }: P & { seed?: number }) {
  const rnd = mulberry32(seed);
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" className={className} style={{ filter: 'drop-shadow(0 1.5px 1.5px rgba(0,0,0,.2))', ...style }} aria-hidden>
      <rect x="1" y="1" width="32" height="32" fill="#2f4aa0" />
      <rect x="1" y="1" width="32" height="32" fill="url(#gold-foil)" opacity=".06" />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={2 + rnd() * 30} cy={2 + rnd() * 30} r={0.4 + rnd() * 0.7} fill="#fff" opacity={0.5 + rnd() * 0.5} />
      ))}
    </svg>
  );
}

/** Translucent washi tape strip */
export function Washi({ width = 90, color = 'rgba(239,196,206,.72)', rotate = -4, pattern = 'dots', className, style }: { width?: number | string; color?: string; rotate?: number; pattern?: 'dots' | 'stripes' | 'stars'; className?: string; style?: CSSProperties }) {
  const bg =
    pattern === 'stripes'
      ? `repeating-linear-gradient(45deg, ${color} 0 6px, rgba(255,255,255,.35) 6px 10px)`
      : pattern === 'stars'
        ? `radial-gradient(circle at 50% 50%, rgba(255,255,255,.8) 0 1.2px, transparent 1.6px) 0 0/10px 10px, ${color}`
        : `radial-gradient(circle at 50% 50%, rgba(255,255,255,.65) 0 1.6px, transparent 2px) 0 0/9px 9px, ${color}`;
  return (
    <div
      aria-hidden
      className={className}
      style={{
        width,
        height: 22,
        background: bg,
        transform: `rotate(${rotate}deg)`,
        clipPath: 'polygon(2% 8%, 7% 0, 15% 6%, 24% 1%, 100% 3%, 97% 30%, 100% 55%, 98% 100%, 70% 95%, 40% 100%, 0 96%, 3% 60%, 0 32%)',
        boxShadow: '0 1px 1px rgba(0,0,0,.08)',
        ...style,
      }}
    />
  );
}

/** Hand-drawn arrow (for navigation) */
export function InkArrow({ dir = 'right', color = '#efc4ce', size = 56, className }: { dir?: 'left' | 'right' | 'up' | 'down'; color?: string; size?: number; className?: string }) {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir];
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" className={className} style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#ink)">
        <path d="M4 20 C14 14 26 24 38 17 C44 14 48 15 54 17" />
        <path d="M45 9 C49 12 52 15 55 17 C51 19 48 23 46 27" />
        <path d="M6 23 C5 21 7 18 9 19" opacity=".5" />
      </g>
    </svg>
  );
}

/** Hand-drawn oval ring used around important buttons */
export function InkRing({ color = '#efc4ce', className }: { color?: string; className?: string }) {
  return (
    <svg className={`ink-ring ${className ?? ''}`} viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden>
      <path
        d="M30 14 C90 2 230 4 278 18 C300 26 296 56 262 66 C200 82 80 80 34 68 C4 60 2 30 24 18 C40 10 70 7 96 8"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        filter="url(#ink)"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: 0.12 }}
      />
    </svg>
  );
}

export function Butterfly({ color = '#b7d4ed', ink = '#3f4b74', ...p }: P & { color?: string; ink?: string }) {
  return (
    <Svg {...p}>
      <g filter="url(#ink)" stroke={ink} strokeWidth="1" strokeLinejoin="round">
        <path d="M20 20 C14 8 4 6 5 14 C6 20 12 22 20 21Z" fill={color} />
        <path d="M20 20 C26 8 36 6 35 14 C34 20 28 22 20 21Z" fill={color} />
        <path d="M20 21 C14 24 9 30 12 33 C15 35 19 29 20 23Z" fill={color} opacity=".85" />
        <path d="M20 21 C26 24 31 30 28 33 C25 35 21 29 20 23Z" fill={color} opacity=".85" />
        <path d="M20 15 L20 30" strokeWidth="1.6" stroke={ink} />
        <path d="M20 15 C18 11 16 9 14 8 M20 15 C22 11 24 9 26 8" fill="none" strokeWidth=".8" />
      </g>
    </Svg>
  );
}

/** Small flourish swirl for headings */
export function Flourish({ color = '#c98d9d', width = 120, className }: { color?: string; width?: number; className?: string }) {
  return (
    <svg width={width} height={width * 0.2} viewBox="0 0 120 24" className={className} aria-hidden>
      <path
        d="M2 14 C20 4 34 22 52 12 C58 8 60 4 56 4 C52 4 54 12 62 13 C80 15 96 6 118 10"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        filter="url(#ink)"
      />
    </svg>
  );
}
