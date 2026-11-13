import type { PointerEvent as RPointerEvent } from 'react';
import { DECORATIONS, type DecorationKind } from '../art/decorations';

const PLANK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='86' preserveAspectRatio='none' viewBox='0 0 400 86'>
    <filter id='i'><feTurbulence baseFrequency='.04' numOctaves='2' seed='4'/><feDisplacementMap in='SourceGraphic' scale='2.4'/></filter>
    <rect x='2' y='76' width='396' height='8' fill='#3a3550' opacity='.12'/>
    <g filter='url(#i)'>
      <rect x='2' y='66' width='396' height='11' rx='1.5' fill='#e3c79c' stroke='#5c4a3a' stroke-width='1.3'/>
      <path d='M8 71 C80 69 150 73 230 70 C300 68 350 72 392 70' stroke='#b08f63' stroke-width='.8' fill='none'/>
      <path d='M30 74 C90 73 140 75 190 74' stroke='#c7a679' stroke-width='.6' fill='none'/>
    </g>
  </svg>`,
)}")`;

type Props = {
  onItemPointerDown: (e: RPointerEvent<HTMLButtonElement>, deco: DecorationKind) => void;
  onItemClick: (deco: DecorationKind) => void;
  disabled?: boolean;
};

/** Two hand-illustrated shelves of treats. Tap to add, or drag onto the cake. */
export function DecorationPalette({ onItemPointerDown, onItemClick, disabled }: Props) {
  const shelves: { title: string; items: DecorationKind[] }[] = [
    { title: 'candles, bows & sweet things', items: DECORATIONS.filter((d) => d.shelf === 1) },
    { title: 'flowers, fruit, moons & stars', items: DECORATIONS.filter((d) => d.shelf === 2) },
  ];
  return (
    <div className="flex flex-col gap-4" role="group" aria-label="Cake decorations">
      {shelves.map((shelf) => (
        <div key={shelf.title}>
          <p className="hand mb-1 pl-1 text-[19px] text-[#737c5a]">{shelf.title} ✧</p>
          <ul
            className="grid gap-x-1"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
              gridAutoRows: '86px',
              backgroundImage: PLANK,
              backgroundSize: '100% 86px',
              backgroundRepeat: 'repeat-y',
            }}
          >
            {shelf.items.map((d) => {
              const ratio = d.w / d.h;
              const h = d.candle ? 58 : Math.min(42, 26 + d.w * 0.4);
              const w = d.candle ? h * ratio : h;
              return (
                <li key={d.id} className="flex items-end justify-center pb-[20px]">
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Add ${d.label}`}
                    title={d.label}
                    onPointerDown={(e) => onItemPointerDown(e, d)}
                    onClick={() => onItemClick(d)}
                    className="group relative flex h-[66px] w-[52px] items-end justify-center disabled:opacity-40"
                    style={{ touchAction: 'none', cursor: 'grab' }}
                  >
                    <span
                      className="block transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[-4deg] group-active:scale-95"
                      style={{ width: w, height: h, filter: 'drop-shadow(0 2px 1.2px rgba(60,50,40,.25))' }}
                    >
                      {d.render()}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
