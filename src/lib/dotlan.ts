import type { RouteLeg } from './pathfind';

const DOTLAN_JUMP = 'https://evemaps.dotlan.net/jump';
const DOTLAN_ROUTE = 'https://evemaps.dotlan.net/route';

// Builds a DOTLAN EveMaps jump-planner URL reproducing the computed route, e.g.
//   https://evemaps.dotlan.net/jump/Nomad,544/C-J6MT:H-93YV
// Skill digits encode as <JDC><JFC><JF> (verified against dotlan). Every leg's
// systems become colon-separated waypoints so dotlan shows the same chain.
export function dotlanJumpUrl(shipName: string, jdc: number, jfc: number, jf: number, legs: RouteLeg[]): string | null {
  if (legs.length === 0) return null;
  const waypoints = [legs[0].fromName, ...legs.map((l) => l.toName)];
  const path = waypoints.map((n) => encodeURIComponent(n)).join(':');
  return `${DOTLAN_JUMP}/${encodeURIComponent(shipName)},${jdc}${jfc}${jf}/${path}`;
}

// Builds a DOTLAN EveMaps stargate-route URL from an ordered list of system
// names, e.g. https://evemaps.dotlan.net/route/Jita:Ikuchi:Amarr
export function dotlanRouteUrl(legs: RouteLeg[]): string | null {
  if (legs.length === 0) return null;
  const waypoints = [legs[0].fromName, ...legs.map((l) => l.toName)];
  return `${DOTLAN_ROUTE}/${waypoints.map((n) => encodeURIComponent(n)).join(':')}`;
}
