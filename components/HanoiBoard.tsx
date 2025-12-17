'use client';

import type { Rod } from '@/lib/hanoiApi';

type RodState = Record<Rod, number[]>;
type Props = {
  disks: number;
  rods: RodState;
  selectedRod: Rod | null;
  onRodClick: (rod: Rod) => void;
}

export function HanoiBoard({ disks, rods, selectedRod, onRodClick }: Props) {
  const all = [...rods.A, ...rods.B, ...rods.C];
  const max = all.length ? Math.max(...all) : 1;

  return (
    <div className='flex-3'>
      <div
        className='flex border-b-8 border-black/70 rounded-lg'
        style={{height: `${disks * 1.625 + 5}rem`, minHeight: '60vh'}}
      >
        {(['A', 'B', 'C'] as Rod[]).map((rod) => (
          <div
            key={rod}
            onClick={() => onRodClick(rod)}
            className="relative flex-1 flex items-end justify-center py-0.5 cursor-pointer rounded-t-4xl group"
          >
            {/* Rods */}
            <div className={`absolute bottom-0 h-[97%] w-5 rounded-t-full bg-black ${selectedRod === rod ? 'opacity-90' : 'opacity-50 group-hover:opacity-70'} transition-opacity duration-300`} />
            
            {/* Disks */}
            <div className='absolute w-full'>
              {[...rods[rod]].reverse().map((disk) => (
                <div
                  key={disk}
                  className="h-6 mx-auto mt-0.5 flex items-center justify-end px-2 bg-black/90 rounded-full text-xs text-white"
                  style={{
                    width: `${10 + (disk / max) * 85}%`,
                    transition: 'all 250ms ease',
                  }}
                >
                  {disk}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
