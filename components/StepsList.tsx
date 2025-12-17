'use client';

import type { Move, SolveResponse } from '@/lib/hanoiApi';

type Props = {
  solution: SolveResponse | null;
  moves: Move[];
  autoSpeed: number;
  activeIndex: number;
}

export function StepsList({
  solution,
  moves,
  autoSpeed,
  activeIndex,
}: Props) {

  return (
    <div className={`flex-1 h-[60vh] flex flex-col items-center gap-2 p-5 border border-black/30 rounded-xl overflow-scroll ${solution?.mode !== 'SOLUTION' ? 'justify-center' : ''}`}>

      {(solution?.mode == 'SOLUTION')
        ? moves.map((m, i) => (
            <div
              key={i}
              className={`text-center leading-none rounded-full ${i === activeIndex ? 'text-white font-bold w-full p-2 bg-neutral-500' : 'font-light'}`}
            >
              {i + 1}. Take disk {m.disk} from rod {m.from} to rod {m.to}
            </div>
          ))
        : <div className='text-lg text-center'>
            {(solution?.mode == "REPORT")
              ? <div className='flex flex-col gap-5'>
                  <span className='font-semibold'>You chose too many disks!</span>
                  <span className='text-sm'>
                    This puzzle would Take {Number(solution.totalMoves).toLocaleString()} moves, and about {(Number(solution?.totalMoves) * autoSpeed / 3600000).toLocaleString(undefined, { maximumFractionDigits: 1 })} hours to solve. You can still try it for yourself...
                  </span>
                </div>
              : <div>
                  Go ahead and start playing or click <span className='font-bold'>Get Solution</span> to see steps to solve
                </div>
            }
          </div>
      }
    </div>
  );
}
