/// <reference lib="webworker" />
import { solveRoute } from '../lib/solveRoute';
import type { RouteRequest } from '../lib/pathfind';

self.onmessage = (ev: MessageEvent<RouteRequest>) => {
  self.postMessage(solveRoute(ev.data));
};
