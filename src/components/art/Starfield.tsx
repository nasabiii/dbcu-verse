import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import { mulberry32 } from '../../lib/random';
import { isLowPower, usePrefersReducedMotion } from '../../lib/motion';

type Star = {
  x: number; // 0..1 of tile width
  y: number; // 0..1 of height
  kind: 'dot' | 'sparkle' | 'streak' | 'cross';
  size: number;
  base: number;
  s1: number;
  s2: number;
  p1: number;
  p2: number;
  color: string;
  rot: number;
  glow: boolean;
};

const COLORS = ['#fffdf6', '#fffdf6', '#fffaf0', '#f7efd8', '#e9dcb3', '#d9e7f6', '#f3d6de'];

function makeStars(seed: number, count: number, layer: number): Star[] {
  const rnd = mulberry32(seed + layer * 101);
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    const r = rnd();
    let kind: Star['kind'] = 'dot';
    if (layer === 1) kind = r < 0.14 ? 'sparkle' : r < 0.3 ? 'streak' : r < 0.36 ? 'cross' : 'dot';
    if (layer === 2) kind = r < 0.45 ? 'sparkle' : r < 0.6 ? 'cross' : 'dot';
    const size =
      kind === 'dot'
        ? (0.35 + rnd() * (layer === 0 ? 0.7 : 1.1)) * (layer + 1) * 0.7
        : kind === 'streak'
          ? 3 + rnd() * 5
          : (layer === 2 ? 5 : 3) + rnd() * (layer === 2 ? 6 : 3.5);
    out.push({
      x: rnd(),
      y: Math.pow(rnd(), 1.15),
      kind,
      size,
      base: 0.35 + rnd() * 0.65,
      s1: 0.25 + rnd() * 0.9,
      s2: 0.6 + rnd() * 1.7,
      p1: rnd() * Math.PI * 2,
      p2: rnd() * Math.PI * 2,
      color: COLORS[Math.floor(rnd() * COLORS.length)],
      rot: (rnd() - 0.5) * 0.5,
      glow: kind === 'sparkle' && rnd() < 0.7,
    });
  }
  return out;
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, rot: number) {
  const w = R * 0.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -R);
  ctx.quadraticCurveTo(w, -w, R, 0);
  ctx.quadraticCurveTo(w, w, 0, R);
  ctx.quadraticCurveTo(-w, w, -R, 0);
  ctx.quadraticCurveTo(-w, -w, 0, -R);
  ctx.fill();
  ctx.restore();
}

type Props = {
  className?: string;
  density?: number; // 1 = default
  seed?: number;
  /** horizontal pan in px (universe exploration) */
  panX?: MotionValue<number>;
  /** pointer parallax, -1..1 */
  tiltX?: MotionValue<number>;
  tiltY?: MotionValue<number>;
  /** fraction of the canvas height that has stars (0..1); fades out lower down */
  fadeBottom?: boolean;
  shootingStars?: boolean;
};

/**
 * Irregular, slowly twinkling, hand-painted-feeling star sky.
 * Three parallax layers drawn into a single viewport-sized canvas.
 */
export function Starfield({ className, density = 1, seed = 7, panX, tiltX, tiltY, fadeBottom, shootingStars = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const low = isLowPower();
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2);
    let w = 0;
    let h = 0;
    let layers: Star[][] = [];
    const factors = [0.12, 0.35, 0.75];

    const glowSprite = document.createElement('canvas');
    glowSprite.width = glowSprite.height = 64;
    {
      const g = glowSprite.getContext('2d')!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,246,220,0.55)');
      grad.addColorStop(0.35, 'rgba(255,236,190,0.16)');
      grad.addColorStop(1, 'rgba(255,236,190,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = (w * h) / (1200 * 800);
      const k = density * Math.max(0.45, Math.min(area, 1.6)) * (low ? 0.6 : 1);
      layers = [makeStars(seed, Math.round(260 * k), 0), makeStars(seed, Math.round(150 * k), 1), makeStars(seed, Math.round(34 * k), 2)];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = performance.now() + 6000 + Math.random() * 8000;

    let raf = 0;
    let last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < (low ? 50 : 33)) return; // ~30fps is plenty for twinkles
      last = now;
      render(now);
    };

    const render = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      ctx.clearRect(0, 0, w, h);
      const pan = panX ? panX.get() : 0;
      const tx = tiltX ? tiltX.get() : 0;
      const ty = tiltY ? tiltY.get() : 0;
      const tileW = w * 2;
      layers.forEach((stars, li) => {
        const f = factors[li];
        const off = pan * f + tx * (li + 1) * 6;
        const offY = ty * (li + 1) * 4;
        for (const s of stars) {
          let x = (s.x * tileW + off) % tileW;
          if (x < 0) x += tileW;
          if (x > w + 20) continue;
          const y = s.y * h + offY;
          let fade = 1;
          if (fadeBottom) fade = Math.max(0, Math.min(1, (1 - s.y) * 2.2));
          const tw = reduced ? 0.85 : 0.6 + 0.4 * (0.6 * Math.sin(t * s.s1 + s.p1) + 0.4 * Math.sin(t * s.s2 + s.p2));
          const a = Math.max(0, s.base * tw * fade);
          if (a < 0.02) continue;
          ctx.globalAlpha = a;
          ctx.fillStyle = s.color;
          ctx.strokeStyle = s.color;
          if (s.kind === 'dot') {
            ctx.beginPath();
            ctx.arc(x, y, s.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (s.kind === 'sparkle') {
            if (s.glow) {
              const gs = s.size * 5;
              ctx.drawImage(glowSprite, x - gs / 2, y - gs / 2, gs, gs);
            }
            sparkle(ctx, x, y, s.size * (0.85 + 0.15 * tw), s.rot);
          } else if (s.kind === 'cross') {
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - s.size * 0.5, y);
            ctx.lineTo(x + s.size * 0.5, y);
            ctx.moveTo(x, y - s.size * 0.6);
            ctx.lineTo(x, y + s.size * 0.6);
            ctx.stroke();
          } else {
            // little hand-painted brush streak
            ctx.globalAlpha = a * 0.55;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + s.size * 0.5, y - s.size);
            ctx.stroke();
          }
        }
      });

      if (shootingStars && !reduced) {
        if (!shoot && now > nextShoot) {
          shoot = { x: w * (0.2 + Math.random() * 0.7), y: h * Math.random() * 0.35, vx: -(3 + Math.random() * 2), vy: 1.4 + Math.random(), life: 1 };
        }
        if (shoot) {
          shoot.x += shoot.vx * 2.2;
          shoot.y += shoot.vy * 2.2;
          shoot.life -= 0.022;
          const grad = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 18, shoot.y - shoot.vy * 18);
          grad.addColorStop(0, 'rgba(255,248,226,0.9)');
          grad.addColorStop(1, 'rgba(255,248,226,0)');
          ctx.globalAlpha = Math.max(0, Math.sin(shoot.life * Math.PI));
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(shoot.x - shoot.vx * 18, shoot.y - shoot.vy * 18);
          ctx.stroke();
          if (shoot.life <= 0) {
            shoot = null;
            nextShoot = now + 9000 + Math.random() * 14000;
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      render(0);
      const unsubs = [panX, tiltX, tiltY].filter(Boolean).map((mv) => mv!.on('change', () => render(0)));
      return () => {
        ro.disconnect();
        unsubs.forEach((u) => u());
      };
    }
    raf = requestAnimationFrame(draw);
    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, [density, seed, panX, tiltX, tiltY, reduced, fadeBottom, shootingStars]);

  return <canvas ref={ref} className={className ?? 'absolute inset-0 h-full w-full'} aria-hidden />;
}
