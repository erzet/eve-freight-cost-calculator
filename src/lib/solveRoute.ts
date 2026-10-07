import { LY_METERS, distanceLy } from './distance';
import { legFuel } from './fuel';
import type { RouteLeg, RouteRequest, RouteResult } from './pathfind';

// A system is high-sec when its security status rounds to >= 0.5 (one decimal).
function isHighsec(sec: number): boolean {
  return Math.round(sec * 10) / 10 >= 0.5;
}

// Binary min-heap keyed by tentative distance, storing node indices.
class MinHeap {
  private nodes: number[] = [];
  private keys: number[] = [];

  get size(): number {
    return this.nodes.length;
  }

  push(node: number, key: number): void {
    this.nodes.push(node);
    this.keys.push(key);
    let i = this.nodes.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.keys[parent] <= this.keys[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): number {
    const top = this.nodes[0];
    const lastNode = this.nodes.pop()!;
    const lastKey = this.keys.pop()!;
    if (this.nodes.length > 0) {
      this.nodes[0] = lastNode;
      this.keys[0] = lastKey;
      let i = 0;
      const n = this.nodes.length;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let smallest = i;
        if (l < n && this.keys[l] < this.keys[smallest]) smallest = l;
        if (r < n && this.keys[r] < this.keys[smallest]) smallest = r;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    const tn = this.nodes[a];
    this.nodes[a] = this.nodes[b];
    this.nodes[b] = tn;
    const tk = this.keys[a];
    this.keys[a] = this.keys[b];
    this.keys[b] = tk;
  }
}

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

// Finds the optimal jump-drive route for `req`. Pure (no DOM/worker globals) so
// it can run on the main thread, in a worker, or under test.
export function solveRoute(req: RouteRequest): RouteResult {
  const { systems, originId, destId, maxRangeLy, ship, jfc, jf, objective } = req;

  const indexById = new Map<number, number>();
  for (let i = 0; i < systems.length; i++) indexById.set(systems[i].id, i);

  const originIdx = indexById.get(originId);
  const destIdx = indexById.get(destId);
  if (originIdx === undefined || destIdx === undefined) {
    return { found: false, reason: 'unknown-system' };
  }
  if (isHighsec(systems[destIdx].sec)) {
    return { found: false, reason: 'highsec-destination' };
  }
  if (originId === destId) {
    return { found: true, legs: [], totalFuel: 0, totalDistLy: 0, jumps: 0 };
  }

  // Spatial hash grid: any system within maxRange of a cell lies in the 27
  // neighboring cells (cell size == maxRange).
  const cell = maxRangeLy * LY_METERS;
  const grid = new Map<string, number[]>();
  for (let i = 0; i < systems.length; i++) {
    const s = systems[i];
    const key = cellKey(Math.floor(s.x / cell), Math.floor(s.y / cell), Math.floor(s.z / cell));
    const bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  }

  const dist = new Float64Array(systems.length).fill(Infinity);
  const prev = new Int32Array(systems.length).fill(-1);
  const visited = new Uint8Array(systems.length);
  dist[originIdx] = 0;

  const heap = new MinHeap();
  heap.push(originIdx, 0);

  while (heap.size > 0) {
    const u = heap.pop();
    if (visited[u]) continue;
    visited[u] = 1;
    if (u === destIdx) break;

    const su = systems[u];
    const cx = Math.floor(su.x / cell);
    const cy = Math.floor(su.y / cell);
    const cz = Math.floor(su.z / cell);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = grid.get(cellKey(cx + dx, cy + dy, cz + dz));
          if (!bucket) continue;
          for (const v of bucket) {
            if (v === u || visited[v]) continue;
            const sv = systems[v];
            // Destination of any jump must not be high-sec (cyno rule). The
            // origin may be high-sec, but it is only ever a source, never a
            // neighbor target here.
            if (isHighsec(sv.sec)) continue;
            const d = distanceLy(su, sv);
            if (d > maxRangeLy) continue;
            const weight = objective === 'fuel' ? legFuel(d, ship, jfc, jf) : 1;
            const nd = dist[u] + weight;
            if (nd < dist[v]) {
              dist[v] = nd;
              prev[v] = u;
              heap.push(v, nd);
            }
          }
        }
      }
    }
  }

  if (prev[destIdx] === -1 && destIdx !== originIdx) {
    return { found: false, reason: 'no-route' };
  }

  // Reconstruct path origin -> dest.
  const path: number[] = [];
  for (let at: number = destIdx; at !== -1; at = prev[at]) path.push(at);
  path.reverse();

  const legs: RouteLeg[] = [];
  let totalFuel = 0;
  let totalDistLy = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    const from = systems[path[i]];
    const to = systems[path[i + 1]];
    const d = distanceLy(from, to);
    const fuel = legFuel(d, ship, jfc, jf);
    totalFuel += fuel;
    totalDistLy += d;
    legs.push({ fromId: from.id, fromName: from.name, toId: to.id, toName: to.name, distLy: d, fuel });
  }

  return { found: true, legs, totalFuel, totalDistLy, jumps: legs.length };
}
