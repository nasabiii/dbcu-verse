import type { Photo } from '../../content';
import { Polaroid } from '../art/Polaroid';

const tilts = [-4, 3, -2, 5, -5, 2, -3, 4];
const tapes = ['rgba(239,196,206,.75)', 'rgba(183,212,237,.75)', 'rgba(228,191,104,.6)', 'rgba(115,124,90,.4)'];

/** A loose scatter of small polaroids. Each opens the unaltered full photo. */
export function PhotoGallery({ photos, onOpen, offset = 0 }: { photos: Photo[]; onOpen: (index: number) => void; offset?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
      {photos.map((p, i) => (
        <li key={p.src} className="flex justify-center" style={{ marginTop: i % 3 === 1 ? 14 : 0 }}>
          <Polaroid
            photo={p}
            width="min(100%, 190px)"
            rotate={tilts[i % tilts.length]}
            aspect={1}
            tape={i % 2 ? 'right' : true}
            tapeColor={tapes[i % tapes.length]}
            onOpen={() => onOpen(i + offset)}
          />
        </li>
      ))}
    </ul>
  );
}
