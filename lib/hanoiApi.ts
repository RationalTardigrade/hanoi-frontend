export type Rod = 'A' | 'B' | 'C';

export interface Move {
  disk: number;
  from: Rod;
  to: Rod;
}

export type SolveMode = 'SOLUTION' | 'REPORT';

export type SolveResponse =
  | {
      disks: number;
      mode: 'SOLUTION';
      totalMoves: number;
      moves: Move[];
    }
  | {
      disks: number;
      mode: 'REPORT';
      totalMoves: string;
      message: string;
    };

export async function solveHanoi(disks: number): Promise<SolveResponse> {
  const base = process.env.NEXT_PUBLIC_HANOI_API_BASE;
  if (!base) throw new Error('NEXT_PUBLIC_HANOI_API_BASE is not set');

  const res = await fetch(`${base}/hanoi/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disks }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${text}`);
  }

  return res.json();
}
