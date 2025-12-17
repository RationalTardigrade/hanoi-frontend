'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Move, Rod, SolveResponse } from '@/lib/hanoiApi';
import { solveHanoi } from '@/lib/hanoiApi';
import { HanoiBoard } from '@/components/HanoiBoard';
import { StepsList } from '@/components/StepsList';

type PlayMode = 'MANUAL' | 'AUTO';

type RodState = Record<Rod, number[]>;

function generateDisks(n: number): RodState {
  const A = Array.from({ length: n }, (_, i) => n - i);
  return { A, B: [], C: [] };
}

function canMove(rods: RodState, from: Rod, to: Rod): boolean {
  if (from === to) return false;
  const src = rods[from];
  const dst = rods[to];
  if (src.length === 0) return false;
  const moving = src[src.length - 1];
  const topDst = dst[dst.length - 1];
  return topDst === undefined || moving < topDst;
}

function applyMove(rods: RodState, move: { from: Rod; to: Rod }): RodState {
  const next: RodState = { A: [...rods.A], B: [...rods.B], C: [...rods.C] };
  const disk = next[move.from].pop();
  if (disk === undefined) return rods;
  next[move.to].push(disk);
  return next;
}

export function HanoiDemo() {
  const [disks, setDisks] = useState(5);
  const [mode, setMode] = useState<PlayMode>('MANUAL');
  const [solution, setSolution] = useState<SolveResponse | null>(null);
  const [rods, setRods] = useState<RodState>(() => generateDisks(5));
  const [selectedRod, setSelectedRod] = useState<Rod | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(300);
  const timerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    stopAuto();
    setSolution(null);
    setStepIndex(0);
    setSelectedRod(null);
    setRods(generateDisks(disks));
    setMode('MANUAL');
  }, [disks])

  const moves: Move[] = useMemo(
    () => (solution?.mode === 'SOLUTION' ? solution.moves : []),
    [solution],
  );

  async function fetchSolution() {
    resetBoard(disks);
    const res = await solveHanoi(disks);
    setSolution(res);
  }

  async function startAuto() {
    if (isRunning) return;

    stopAuto();
    const runId = (runIdRef.current += 1);

    setIsRunning(true);
    setMode('AUTO');
    setSelectedRod(null);
    setStepIndex(0);

    let res: SolveResponse;
    try {
      if (solution && solution.mode === 'SOLUTION' && solution.disks === disks) {
        res = solution;
      } else {
        res = await solveHanoi(disks);
        if (runIdRef.current !== runId) return;
        setSolution(res);
      }
    } catch {
      if (runIdRef.current === runId) stopAuto();
      return;
    }

    if (res.mode !== 'SOLUTION') {
      stopAuto();
      return;
    }

    setRods(generateDisks(res.disks));
    setStepIndex(0);

    const runStep = (i: number) => {
      if (runIdRef.current !== runId) return;
      if (i >= res.moves.length) {
        stopAuto();
        return;
      }

      const m = res.moves[i];
      setStepIndex(i);
      setSelectedRod(m.from);
      setRods((prev) => applyMove(prev, { from: m.from, to: m.to }));

      window.setTimeout(() => {
        if (runIdRef.current === runId) setSelectedRod(null);
      }, Math.min(120, autoSpeed - 50));

      timerRef.current = window.setTimeout(() => runStep(i + 1), autoSpeed);
    };

    timerRef.current = window.setTimeout(() => runStep(0), autoSpeed);
  }

  function stopAuto() {
    runIdRef.current += 1;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }

  function resetBoard(n = disks) {
    stopAuto();
    setMode('MANUAL');
    setSolution(null);
    setStepIndex(0);
    setSelectedRod(null);
    setRods(generateDisks(n));
  }

  function onRodClick(rod: Rod) {
    if (mode !== 'MANUAL') return;

    if (selectedRod === null) {
      if (rods[rod].length > 0) setSelectedRod(rod);
      return;
    }

    if (canMove(rods, selectedRod, rod)) {
      setRods((prev) => applyMove(prev, { from: selectedRod, to: rod }));
    }
    setSelectedRod(null);
  }

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  return (
    <div className='w-screen flex flex-col gap-3 p-20'>
      <h1 className='text-4xl text-center text-black/80 font-bold tracking-widest uppercase mb-7'>
        Tower of Hanoi
      </h1>

      {/* Contorls */}
      <div className='flex items-center gap-2'>

        <div className='relative flex justify-center'>
          <label htmlFor="disks" className="absolute top-0 -translate-y-full text-sm font-medium">
            Number of disks
          </label>
          
          <input
            type="number"
            min={1}
            max={50}
            value={disks}
            onChange={(e) => setDisks(Number(e.target.value))}
            onBlur={(e) => setDisks(clamp(Number(e.target.value), 1, 50))}
            className='w-32 py-1 px-4 border border-black/50 rounded-full'
          />
        </div>

        <button
          onClick={fetchSolution}
          className='py-1 px-4 border border-black/50 hover:border-transparent hover:text-white hover:bg-black/70 rounded-full transition-colors duration-100 cursor-pointer'
        >
          Get solution
        </button>

        <button 
          onClick={isRunning ? stopAuto : startAuto} 
          className={`py-1 px-4 border border-black/50 hover:border-transparent rounded-full transition-colors duration-100 cursor-pointer
              ${isRunning ? 'bg-red-900 text-white' : 'hover:text-white hover:bg-black/70'}
            `}
        >
          {isRunning ? 'Stop' : 'Auto-solve'}
        </button>

        <div className='relative flex justify-center'>
          <label htmlFor="disks" className="absolute top-0 -translate-y-full text-sm font-medium">
            Solve speed
          </label>
          
          <input
            type="number"
            min={300}
            max={2000}
            value={autoSpeed}
            onChange={(e) => setAutoSpeed(Number(e.target.value))}
            onBlur={(e) => setAutoSpeed(clamp(Number(e.target.value), 300, 2000))}
            disabled={isRunning}
            className='w-32 py-1 px-4 border border-black/50 rounded-full'
          />
        </div>

        <button
          onClick={() => resetBoard()}
          className='py-1 px-4 border border-black/50 hover:border-transparent hover:text-white hover:bg-black/70 rounded-full transition-colors duration-100 cursor-pointer'
        >
          Reset
        </button>
      </div>

      <div className='w-full flex gap-10'>
        <StepsList solution={solution} moves={moves} autoSpeed={autoSpeed} activeIndex={stepIndex} />
        <HanoiBoard disks={disks} rods={rods} selectedRod={selectedRod} onRodClick={onRodClick} />
      </div>
    </div>
  );
}
