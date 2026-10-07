import type { Ship } from './ships';

export interface System {
  id: number;
  name: string;
  sec: number;
  x: number;
  y: number;
  z: number;
}

export type Objective = 'fuel' | 'jumps';

export interface RouteRequest {
  systems: System[];
  originId: number;
  destId: number;
  maxRangeLy: number;
  ship: Ship;
  jfc: number;
  jf: number;
  objective: Objective;
}

export interface RouteLeg {
  fromId: number;
  fromName: string;
  toId: number;
  toName: string;
  distLy: number;
  fuel: number;
}

export type RouteFailReason = 'unknown-system' | 'highsec-destination' | 'no-route' | 'esi-error';

export type RouteResult =
  | { found: true; legs: RouteLeg[]; totalFuel: number; totalDistLy: number; jumps: number }
  | { found: false; reason: RouteFailReason };

// Spawns the pathfinder worker, runs one request, resolves with the result, and
// terminates the worker. Each call is independent (no shared state).
export function findRoute(req: RouteRequest): Promise<RouteResult> {
  const { promise, resolve, reject } = Promise.withResolvers<RouteResult>();
  const worker = new Worker(new URL('../worker/pathfinder.worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.onmessage = (ev: MessageEvent<RouteResult>) => {
    resolve(ev.data);
    worker.terminate();
  };
  worker.onerror = (err) => {
    reject(err);
    worker.terminate();
  };
  worker.postMessage(req);
  return promise;
}
