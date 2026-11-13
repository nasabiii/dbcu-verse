import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'alittleuniverse.';

/** Safe read: storage can throw (private mode, blocked cookies) or be empty. */
export function readStore<T>(key: string, fallback: T, store: 'local' | 'session' = 'local'): T {
  try {
    const s = store === 'local' ? window.localStorage : window.sessionStorage;
    const raw = s.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T, store: 'local' | 'session' = 'local') {
  try {
    const s = store === 'local' ? window.localStorage : window.sessionStorage;
    s.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore: the experience still works without persistence */
  }
}

/** useState that mirrors itself into localStorage. */
export function usePersistentState<T>(key: string, initial: T, store: 'local' | 'session' = 'local') {
  const [value, setValue] = useState<T>(() => readStore(key, initial, store));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeStore(key, value, store);
  }, [key, value, store]);
  return [value, setValue] as const;
}

export type Progress = {
  cakeDecorated: boolean;
  wishMade: boolean;
  exploredUniverse: boolean;
  playlistVisited: boolean;
  letterOpened: boolean;
  letterClosedOnce: boolean;
  completed: boolean;
};

export const initialProgress: Progress = {
  cakeDecorated: false,
  wishMade: false,
  exploredUniverse: false,
  playlistVisited: false,
  letterOpened: false,
  letterClosedOnce: false,
  completed: false,
};

export function useProgress() {
  const [progress, setProgress] = usePersistentState<Progress>('progress.v1', initialProgress);
  const mark = useCallback(
    (patch: Partial<Progress>) => setProgress((p) => ({ ...p, ...patch })),
    [setProgress],
  );
  return { progress: { ...initialProgress, ...progress }, mark };
}
