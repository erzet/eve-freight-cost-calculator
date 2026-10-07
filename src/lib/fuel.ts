import type { Ship } from './ships';

// Maximum single-jump range in light-years for a ship at Jump Drive Calibration level `jdc`.
export function maxJumpRangeLy(ship: Ship, jdc: number): number {
  return ship.baseRangeLy * (1 + 0.2 * jdc);
}

// Isotope fuel (units) consumed by a single jump of `distLy` light-years.
// `jfc` = Jump Fuel Conservation (0-5), `jf` = Jump Freighters (0-5).
export function legFuel(distLy: number, ship: Ship, jfc: number, jf: number): number {
  return distLy * ship.consumption * (1 - 0.1 * jfc) * (1 - 0.1 * jf);
}
