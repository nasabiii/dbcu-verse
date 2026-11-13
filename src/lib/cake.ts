import { useCallback, useEffect, useRef, useState } from 'react';
import { CAKE, clampToCake } from '../components/art/Cake';
import { DECO_BY_ID } from '../components/art/decorations';
import { content } from '../content';
import { readStore, writeStore } from './storage';
import { uid } from './random';

export type Placed = {
  id: string;
  kind: string;
  x: number; // anchor in cake units (bottom-centre for candles, centre otherwise)
  y: number;
  r: number; // small hand-placed tilt
};

const KEY = 'cake.v1';

function sanitize(raw: unknown): Placed[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Placed => p && typeof p === 'object' && typeof p.kind === 'string' && DECO_BY_ID[p.kind] && isFinite(p.x) && isFinite(p.y))
    .map((p) => ({ id: String(p.id || uid()), kind: p.kind, x: p.x, y: p.y, r: isFinite(p.r) ? p.r : 0 }));
}

/** Find a pleasant empty spot for a newly tapped decoration. */
export function autoSpot(kind: string, items: Placed[]): { x: number; y: number } {
  const deco = DECO_BY_ID[kind];
  let best = { x: CAKE.cx, y: CAKE.topY, score: -1 };
  for (let i = 0; i < 28; i++) {
    let x: number;
    let y: number;
    if (deco.zone === 'top') {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * 0.92;
      x = CAKE.cx + Math.cos(a) * (CAKE.rx - 18) * d;
      y = CAKE.topY + Math.sin(a) * (CAKE.ry - 9) * d;
    } else {
      // mostly the front face, sometimes the top
      if (Math.random() < 0.3) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * 0.85;
        x = CAKE.cx + Math.cos(a) * (CAKE.rx - 24) * d;
        y = CAKE.topY + Math.sin(a) * (CAKE.ry - 12) * d;
      } else {
        x = CAKE.cx + (Math.random() * 2 - 1) * (CAKE.rx - 26);
        y = 205 + Math.random() * 120;
      }
    }
    const c = clampToCake(x, y, deco.zone);
    const nearest = items.reduce((m, it) => Math.min(m, Math.hypot(it.x - c.x, (it.y - c.y) * 1.4)), 999);
    if (nearest > best.score) best = { ...c, score: nearest };
  }
  return { x: best.x, y: best.y };
}

const tilt = (kind: string) => (DECO_BY_ID[kind]?.zone === 'top' ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 24);

/** Cake decoration state with undo history, persisted to localStorage. */
export function useCake() {
  const [items, setItems] = useState<Placed[]>(() => sanitize(readStore(KEY, [])));
  const [past, setPast] = useState<Placed[][]>([]);

  useEffect(() => writeStore(KEY, items), [items]);

  const itemsRef = useRef(items);
  const pastRef = useRef(past);
  itemsRef.current = items;
  pastRef.current = past;

  const commit = useCallback((next: Placed[] | ((prev: Placed[]) => Placed[])) => {
    const prev = itemsRef.current;
    const n = typeof next === 'function' ? next(prev) : next;
    if (n === prev) return;
    const h = [...pastRef.current.slice(-49), prev];
    pastRef.current = h;
    itemsRef.current = n;
    setPast(h);
    setItems(n);
  }, []);

  const add = useCallback(
    (kind: string, at?: { x: number; y: number }) => {
      let added: Placed | null = null;
      commit((prev) => {
        if (prev.length >= content.decorationSettings.maxDecorations) return prev;
        const deco = DECO_BY_ID[kind];
        const pos = at ? clampToCake(at.x, at.y, deco.zone) : autoSpot(kind, prev);
        added = { id: uid(), kind, x: pos.x, y: pos.y, r: tilt(kind) };
        return [...prev, added];
      });
      return added as Placed | null;
    },
    [commit],
  );

  const move = useCallback(
    (id: string, x: number, y: number) =>
      commit((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const c = clampToCake(x, y, DECO_BY_ID[p.kind].zone);
          return { ...p, ...c };
        }),
      ),
    [commit],
  );

  const remove = useCallback((id: string) => commit((prev) => prev.filter((p) => p.id !== id)), [commit]);
  const reset = useCallback(() => commit((prev) => (prev.length ? [] : prev)), [commit]);
  const undo = useCallback(() => {
    const h = pastRef.current;
    if (!h.length) return;
    const prev = h[h.length - 1];
    pastRef.current = h.slice(0, -1);
    itemsRef.current = prev;
    setPast(pastRef.current);
    setItems(prev);
  }, []);

  /** Make sure there is something to blow out. */
  const ensureCandles = useCallback(() => {
    const items = itemsRef.current;
    if (items.some((p) => DECO_BY_ID[p.kind]?.candle)) return items;
    const kinds = ['candle-pink', 'candle-blue', 'candle-butter', 'candle-lilac', 'candle-mint'];
    const n = content.decorationSettings.autoCandles;
    const extra: Placed[] = Array.from({ length: n }).map((_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = CAKE.cx - 60 + t * 120;
      const y = CAKE.topY + (i % 2 === 0 ? 4 : -8);
      return { id: uid(), kind: kinds[i % kinds.length], x, y, r: (Math.random() - 0.5) * 4 };
    });
    const next = [...items, ...extra];
    commit(next);
    return next;
  }, [commit]);

  return { items, add, move, remove, reset, undo, canUndo: past.length > 0, ensureCandles };
}
