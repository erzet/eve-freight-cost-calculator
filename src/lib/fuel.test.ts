import { describe, it, expect } from 'vitest';
import { maxJumpRangeLy, legFuel } from './fuel';
import { SHIPS } from './ships';

const rhea = SHIPS.find((s) => s.name === 'Rhea')!;

describe('maxJumpRangeLy', () => {
  it('is 10 ly for a JF at JDC 5', () => {
    expect(maxJumpRangeLy(rhea, 5)).toBe(10);
  });
  it('is the base 5 ly at JDC 0', () => {
    expect(maxJumpRangeLy(rhea, 0)).toBe(5);
  });
});

describe('legFuel', () => {
  it('applies JFC and JF reductions to base consumption', () => {
    // 5 ly * 10000 * (1 - 0.4) * (1 - 0.4) = 5 * 10000 * 0.6 * 0.6 = 18000
    expect(legFuel(5, rhea, 4, 4)).toBeCloseTo(18000, 6);
  });
  it('is zero for a zero-length jump', () => {
    expect(legFuel(0, rhea, 4, 4)).toBe(0);
  });
  it('equals base consumption per ly with no skills', () => {
    expect(legFuel(1, rhea, 0, 0)).toBe(10000);
  });
});
