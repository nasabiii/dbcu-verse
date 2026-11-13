/** Hand-painted pastel-blue storybook cake. Geometry is exported so decorations can be constrained to it. */

export const CAKE_VB = { w: 400, h: 420 };
export const CAKE = { cx: 200, topY: 150, rx: 135, ry: 40, bottomY: 318, plateY: 338 };

/** Is (x, y) within the decorating area (top surface + front face)? */
export function clampToCake(x: number, y: number, zone: 'top' | 'any'): { x: number; y: number } {
  const { cx, topY, rx, ry, bottomY } = CAKE;
  if (zone === 'top') {
    const irx = rx - 16;
    const iry = ry - 8;
    const dx = x - cx;
    const dy = y - topY;
    const k = (dx * dx) / (irx * irx) + (dy * dy) / (iry * iry);
    if (k <= 1) return { x, y };
    const s = 1 / Math.sqrt(k);
    return { x: cx + dx * s * 0.98, y: topY + dy * s * 0.98 };
  }
  const minX = cx - rx + 14;
  const maxX = cx + rx - 14;
  const nx = Math.max(minX, Math.min(maxX, x));
  const u = Math.min(1, Math.abs(nx - cx) / rx);
  const top = topY - ry * Math.sqrt(1 - u * u) + 10;
  const bottom = bottomY + ry * Math.sqrt(1 - u * u) - 14;
  return { x: nx, y: Math.max(top, Math.min(bottom, y)) };
}

/** distance (in cake units) by which a point lies outside the cake's silhouette — used for "drag off to remove" */
export function outsideDistance(x: number, y: number) {
  const c = clampToCake(x, y, 'any');
  return Math.hypot(x - c.x, y - c.y);
}

function frostingPath() {
  const { cx, topY, rx, ry } = CAKE;
  const drips = [
    { x: 82, L: 26, w: 9 },
    { x: 112, L: 42, w: 10 },
    { x: 146, L: 20, w: 8 },
    { x: 176, L: 52, w: 11 },
    { x: 214, L: 30, w: 9 },
    { x: 248, L: 46, w: 10 },
    { x: 280, L: 22, w: 8 },
    { x: 310, L: 36, w: 9 },
  ];
  const pts: string[] = [];
  const N = 220;
  for (let i = 0; i <= N; i++) {
    const th = Math.PI - (i / N) * Math.PI; // left → right along the front edge
    const x = cx + Math.cos(th) * (rx + 2);
    let y = topY + Math.sin(th) * (ry + 2) + 8;
    for (const d of drips) {
      const u = (x - d.x) / d.w;
      if (Math.abs(u) < 1) y += d.L * Math.pow(1 - Math.pow(Math.abs(u), 3.2), 0.55);
    }
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  // back edge (top ellipse) right → left
  let back = '';
  for (let i = 0; i <= 60; i++) {
    const th = (i / 60) * Math.PI;
    back += ` L${(cx + Math.cos(th) * (rx + 2)).toFixed(1)} ${(topY - Math.sin(th) * (ry + 2)).toFixed(1)}`;
  }
  return `M${pts.join(' L')}${back} Z`;
}

const FROSTING = frostingPath();

export function CakeArt({ dim = 0 }: { dim?: number }) {
  const { cx, topY, rx, ry, bottomY, plateY } = CAKE;
  const dollops = Array.from({ length: 15 }).map((_, i) => {
    const th = Math.PI - ((i + 0.5) / 15) * Math.PI;
    return { x: cx + Math.cos(th) * (rx - 2), y: bottomY + Math.sin(th) * ry - 2, s: 0.85 + Math.sin(th) * 0.3 };
  });
  const pipe = Array.from({ length: 22 }).map((_, i) => {
    const th = Math.PI - ((i + 0.5) / 22) * Math.PI;
    return { x: cx + Math.cos(th) * rx, y: 262 + Math.sin(th) * ry, s: 0.7 + Math.sin(th) * 0.4 };
  });
  return (
    <svg
      viewBox={`0 0 ${CAKE_VB.w} ${CAKE_VB.h}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      style={{ overflow: 'visible', filter: dim > 0 ? `brightness(${1 - dim}) saturate(${1 - dim * 0.4})` : undefined, transition: 'filter 1.2s ease' }}
    >
      <defs>
        <linearGradient id="cake-side" x1="0" x2="1">
          <stop offset="0" stopColor="#8fb3d9" />
          <stop offset=".22" stopColor="#b6d2ec" />
          <stop offset=".45" stopColor="#c9def2" />
          <stop offset=".75" stopColor="#adcbe8" />
          <stop offset="1" stopColor="#7fa4cf" />
        </linearGradient>
        <linearGradient id="cake-side-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#2a3a6a" stopOpacity=".16" />
        </linearGradient>
        <radialGradient id="frost-top" cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset=".7" stopColor="#f6f1e8" />
          <stop offset="1" stopColor="#e6e2db" />
        </radialGradient>
        <linearGradient id="plate" x1="0" x2="1">
          <stop offset="0" stopColor="#e7dfd0" />
          <stop offset=".4" stopColor="#fbf8f1" />
          <stop offset="1" stopColor="#d9d0be" />
        </linearGradient>
      </defs>

      {/* cake stand */}
      <g filter="url(#ink)">
        <path d="M168 350 C172 372 162 384 140 394 L260 394 C238 384 228 372 232 350Z" fill="url(#plate)" stroke="#5c5a6e" strokeWidth="1.3" />
        <ellipse cx="200" cy="396" rx="70" ry="13" fill="url(#plate)" stroke="#5c5a6e" strokeWidth="1.3" />
        <ellipse cx={cx} cy={plateY + 6} rx="182" ry="44" fill="#cfc6b4" stroke="#5c5a6e" strokeWidth="1.3" />
        <ellipse cx={cx} cy={plateY} rx="182" ry="42" fill="url(#plate)" stroke="#5c5a6e" strokeWidth="1.3" />
        <ellipse cx={cx} cy={plateY - 2} rx="160" ry="33" fill="none" stroke="#a9a08c" strokeWidth=".8" strokeDasharray="2 5" />
      </g>
      {/* cake shadow on plate */}
      <ellipse cx={cx + 6} cy={bottomY + 14} rx={rx + 8} ry={ry - 4} fill="#3a3550" opacity=".18" filter="url(#soft-blur)" />

      {/* sides */}
      <path
        d={`M${cx - rx} ${topY} L${cx - rx} ${bottomY} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L${cx + rx} ${topY} Z`}
        fill="url(#cake-side)"
        filter="url(#watercolor)"
      />
      <path d={`M${cx - rx} ${topY} L${cx - rx} ${bottomY} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L${cx + rx} ${topY} Z`} fill="url(#cake-side-v)" />
      {/* painterly highlight strokes */}
      <path d="M92 196 C94 230 92 268 96 300" stroke="#eaf3fb" strokeWidth="7" strokeLinecap="round" opacity=".45" fill="none" filter="url(#ink-strong)" />
      <path d="M110 205 C111 230 110 250 112 270" stroke="#eaf3fb" strokeWidth="3" strokeLinecap="round" opacity=".35" fill="none" />

      {/* piped pearl garland around the middle */}
      {pipe.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.2 * p.s} fill="#f8f3ea" stroke="#6d7393" strokeWidth=".6" />
          <circle cx={p.x - 1} cy={p.y - 1} r={1 * p.s} fill="#fff" />
        </g>
      ))}

      {/* side ink outline */}
      <path
        d={`M${cx - rx} ${topY + 6} L${cx - rx + 1} ${bottomY} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L${cx + rx - 1} ${topY + 6}`}
        fill="none"
        stroke="#2e3a63"
        strokeWidth="1.8"
        strokeLinecap="round"
        filter="url(#ink)"
      />

      {/* frosting top with drips */}
      <path d={FROSTING} fill="url(#frost-top)" stroke="#555a78" strokeWidth="1.5" strokeLinejoin="round" filter="url(#ink)" />
      <ellipse cx={cx + 30} cy={topY - 14} rx="96" ry="20" fill="#c9d6e6" opacity=".35" filter="url(#soft-blur)" />
      <ellipse cx={cx - 30} cy={topY + 4} rx="70" ry="14" fill="#fff" opacity=".7" filter="url(#soft-blur)" />
      <ellipse cx={cx} cy={topY + 2} rx={rx - 12} ry={ry - 6} fill="none" stroke="#b9bdcc" strokeWidth=".9" strokeDasharray="1.5 6" opacity=".7" />
      <path d="M96 160 C110 172 140 178 170 180" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".8" fill="none" />

      {/* bottom piped border */}
      {dollops.map((d, i) => (
        <g key={i} filter="url(#ink)" transform={`translate(${d.x} ${d.y}) scale(${d.s})`}>
          <path d="M-11 6 C-13 -2 -6 -9 0 -9 C6 -9 13 -2 11 6 C6 9 -6 9 -11 6Z" fill="#fbf6ed" stroke="#6d7393" strokeWidth=".9" />
          <path d="M-6 -2 C-2 -5 3 -5 6 -2 M-8 3 C-3 0 3 0 8 3" fill="none" stroke="#9aa0b8" strokeWidth=".7" />
        </g>
      ))}

    </svg>
  );
}
