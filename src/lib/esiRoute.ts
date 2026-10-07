import { distanceLy } from './distance';
import type { RouteLeg, RouteResult, System } from './pathfind';

// ESI stargate routing via the new POST /route endpoint (Go rewrite, 2025-09-30).
// Returns the gate-to-gate system-id path. CORS and the custom compatibility-date
// header are both allowed by ESI (verified).
export type RoutePreference = 'Shorter' | 'Safer' | 'LessSecure';
export type RouteMode = 'jump' | 'gate';

const ESI_BASE = 'https://esi.evetech.net';
const COMPATIBILITY_DATE = '2025-09-30';

export async function fetchEsiRoute(originId: number, destId: number, preference: RoutePreference): Promise<number[]> {
  const res = await fetch(`${ESI_BASE}/route/${originId}/${destId}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Compatibility-Date': COMPATIBILITY_DATE },
    body: JSON.stringify({ preference }),
  });
  if (!res.ok) throw new Error(`ESI route HTTP ${res.status}`);
  const data = (await res.json()) as { route: number[] };
  if (!Array.isArray(data.route)) throw new Error('ESI route: malformed response');
  return data.route;
}

// Converts an ESI stargate path (system ids) into the shared RouteResult shape.
// Each leg is a gate jump, so it carries no isotope fuel (fuel = 0); distLy is the
// straight-line distance between consecutive systems, for display only.
export function gateRouteResult(ids: number[], systemById: Map<number, System>): RouteResult {
  if (ids.length === 0) return { found: false, reason: 'no-route' };
  const legs: RouteLeg[] = [];
  let totalDistLy = 0;
  for (let i = 0; i + 1 < ids.length; i++) {
    const from = systemById.get(ids[i]);
    const to = systemById.get(ids[i + 1]);
    if (!from || !to) continue;
    const d = distanceLy(from, to);
    totalDistLy += d;
    legs.push({ fromId: from.id, fromName: from.name, toId: to.id, toName: to.name, distLy: d, fuel: 0 });
  }
  return { found: true, legs, totalFuel: 0, totalDistLy, jumps: legs.length };
}
