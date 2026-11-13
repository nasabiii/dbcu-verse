import { animate, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { springs, usePrefersReducedMotion, useViewport } from '../../lib/motion';
import { Starfield } from '../art/Starfield';

export const STOPS = [-1, 0, 1] as const;
export type Stop = (typeof STOPS)[number];

type Props = {
  stop: Stop;
  onStop: (s: Stop) => void;
  /** disable gestures (e.g. while the letter is open) */
  locked?: boolean;
  onFirstPan?: () => void;
  /** world layer: receives the pan value and viewport width */
  children: (ctx: { panX: MotionValue<number>; vw: number; vh: number; tiltX: MotionValue<number>; tiltY: MotionValue<number> }) => ReactNode;
  /** layers that move slower than the world (nebulae, far planets) */
  background?: (ctx: { vw: number; vh: number }) => ReactNode;
  overlay?: ReactNode;
};

/**
 * Smooth 2.5D horizontal exploration: drag / swipe / wheel / arrow keys glide
 * between three destinations with a soft spring. Stars move in parallax.
 */
export function PlanetExplorer({ stop, onStop, locked, onFirstPan, children, background, overlay }: Props) {
  const { w: vw, h: vh } = useViewport();
  const reduced = usePrefersReducedMotion();
  const panX = useMotionValue(-stop * vw);
  const bgX = useTransform(panX, (v) => v * 0.4);
  const rawTx = useMotionValue(0);
  const rawTy = useMotionValue(0);
  const tiltX = useSpring(rawTx, { stiffness: 40, damping: 18 });
  const tiltY = useSpring(rawTy, { stiffness: 40, damping: 18 });
  const tiltWorldX = useTransform(tiltX, (v) => v * -10);
  const tiltWorldY = useTransform(tiltY, (v) => v * -6);
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const drag = useRef<{ x: number; y: number; pan: number; t: number; active: boolean; id: number } | null>(null);
  const justDragged = useRef(false);

  // glide to the current stop
  useEffect(() => {
    const target = -stop * vw;
    if (reduced) {
      panX.set(target);
      return;
    }
    const c = animate(panX, target, springs.pan);
    return () => c.stop();
  }, [stop, vw, panX, reduced]);

  const go = useCallback(
    (s: number) => {
      const n = Math.max(-1, Math.min(1, s)) as Stop;
      if (n !== stopRef.current) onFirstPan?.();
      onStop(n);
      // re-run the glide even if unchanged (snap back)
      if (n === stopRef.current) animate(panX, -n * vw, springs.pan);
    },
    [onStop, onFirstPan, panX, vw],
  );

  // pointer parallax (mouse) + gyroscope where it needs no permission prompt
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rawTx.set((e.clientX / window.innerWidth) * 2 - 1);
      rawTy.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      rawTx.set(Math.max(-1, Math.min(1, e.gamma / 25)));
      rawTy.set(Math.max(-1, Math.min(1, (e.beta - 45) / 25)));
    };
    window.addEventListener('pointermove', onMove);
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    const gyro = DOE && typeof DOE.requestPermission !== 'function';
    if (gyro) window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (gyro) window.removeEventListener('deviceorientation', onOrient);
    };
  }, [reduced, rawTx, rawTy]);

  // keyboard + wheel
  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') go(stopRef.current + 1);
      if (e.key === 'ArrowLeft') go(stopRef.current - 1);
    };
    let acc = 0;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now < lock) return;
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(acc) > 60) {
        go(stopRef.current + Math.sign(acc));
        acc = 0;
        lock = now + 900;
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
    };
  }, [locked, go]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { x: e.clientX, y: e.clientY, pan: panX.get(), t: performance.now(), active: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      d.active = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      panX.stop();
    }
    let next = d.pan + dx;
    const min = -vw;
    const max = vw;
    if (next > max) next = max + (next - max) * 0.3;
    if (next < min) next = min + (next - min) * 0.3;
    panX.set(next);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.active) return;
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 80);
    const dx = e.clientX - d.x;
    const v = dx / Math.max(1, performance.now() - d.t); // px/ms
    let target = Math.round(-panX.get() / vw);
    if (Math.abs(v) > 0.45 || Math.abs(dx) > vw * 0.22) target = Math.round(-d.pan / vw) - Math.sign(dx);
    go(target);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ touchAction: 'none', cursor: locked ? 'default' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onScroll={(e) => {
        // browsers scroll overflow:hidden boxes to reveal focused elements — keep the camera ours
        e.currentTarget.scrollLeft = 0;
        e.currentTarget.scrollTop = 0;
      }}
      onFocusCapture={(e) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>('[data-stop]');
        if (el && !locked) {
          const s = Number(el.dataset.stop);
          if (s !== stopRef.current) go(s);
        }
      }}
      onClickCapture={(e) => {
        if (justDragged.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      <Starfield panX={panX} tiltX={tiltX} tiltY={tiltY} density={1.15} seed={29} />
      {background && (
        <motion.div className="pointer-events-none absolute inset-0" style={{ x: bgX }}>
          {background({ vw, vh })}
        </motion.div>
      )}
      <motion.div className="absolute inset-0" style={{ x: panX }}>
        <motion.div className="absolute inset-0" style={{ x: tiltWorldX, y: tiltWorldY }}>
          {children({ panX, vw, vh, tiltX, tiltY })}
        </motion.div>
      </motion.div>
      {overlay}
    </div>
  );
}
