import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { SvgDefs } from './components/art/SvgDefs';
import { CakeScene } from './components/scenes/CakeScene';
import { IntroScene } from './components/scenes/IntroScene';
import type { Stop } from './components/scenes/PlanetExplorer';
import { PlaylistScene } from './components/scenes/PlaylistScene';
import { UniverseScene } from './components/scenes/UniverseScene';
import { AmbientSoundToggle } from './components/ui/AmbientSoundToggle';
import { SceneNavigation, type SceneId } from './components/ui/SceneNavigation';
import { readStore, useProgress, writeStore } from './lib/storage';

export default function App() {
  const { progress, mark } = useProgress();
  // the current scene survives a refresh within the same visit
  const [scene, setScene] = useState<SceneId>(() => {
    const s = readStore<SceneId>('scene', 'intro', 'session');
    return ['intro', 'cake', 'universe', 'playlist'].includes(s) ? s : 'intro';
  });
  const [stop, setStop] = useState<Stop>(() => readStore<Stop>('stop', 0, 'session'));
  const [chromeHidden, setChromeHidden] = useState(false);

  useEffect(() => writeStore('scene', scene, 'session'), [scene]);
  useEffect(() => writeStore('stop', stop, 'session'), [stop]);

  const go = useCallback(
    (s: SceneId) => {
      if (s === 'universe' && !progress.wishMade) s = 'cake';
      if (s === 'playlist') mark({ playlistVisited: true });
      setScene(s);
    },
    [progress.wishMade, mark],
  );

  const tone = scene === 'cake' || scene === 'playlist' ? 'paper' : 'night';

  return (
    <MotionConfig reducedMotion="user">
      <SvgDefs />
      <main className="h-screen-d relative overflow-hidden">
        <AnimatePresence>
          {scene === 'intro' && <IntroScene key="intro" returning={progress.wishMade} onEnter={(to) => go(to)} />}
          {scene === 'cake' && (
            <CakeScene
              key="cake"
              onDecorated={() => {
                mark({ cakeDecorated: true });
                setChromeHidden(true);
              }}
              onWishMade={() => {
                mark({ wishMade: true });
                setChromeHidden(false);
                setStop(0);
                setScene('universe');
              }}
            />
          )}
          {scene === 'universe' && (
            <UniverseScene
              key="universe"
              stop={stop}
              onStop={setStop}
              onOpenPlaylist={() => go('playlist')}
              progress={progress}
              mark={mark}
            />
          )}
          {scene === 'playlist' && (
            <PlaylistScene
              key="playlist"
              onBack={() => {
                setStop(1);
                go('universe');
              }}
            />
          )}
        </AnimatePresence>

        {/* stays mounted so the music keeps playing; only fades out during the wish */}
        <div
          className={`fixed inset-x-0 top-0 z-[55] flex items-start justify-between px-2 pt-[max(6px,env(safe-area-inset-top))] transition-opacity duration-1000 sm:px-4 sm:pt-3 ${chromeHidden ? 'pointer-events-none opacity-0' : 'pointer-events-none'}`}
          aria-hidden={chromeHidden || undefined}
        >
          <div className={chromeHidden ? '' : 'pointer-events-auto'}>{scene !== 'intro' && <SceneNavigation scene={scene} progress={progress} onGo={go} tone={tone} />}</div>
          <div className={chromeHidden ? '' : 'pointer-events-auto'}>
            <AmbientSoundToggle tone={tone} />
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
