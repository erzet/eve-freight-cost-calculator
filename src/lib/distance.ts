// One light-year in meters (EVE uses the IAU value).
export const LY_METERS = 9.4607304725808e15;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// Straight-line distance between two solar-system positions, in light-years.
export function distanceLy(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) / LY_METERS;
}
