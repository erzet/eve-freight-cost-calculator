import { describe, it, expect } from 'vitest';
import { computeQuote, DEFAULT_PRICING } from './pricing';

describe('computeQuote', () => {
  it('computes fuel cost, suggested charge and margin with default pricing', () => {
    const q = computeQuote({
      fuelUnits: 18000,
      isotopePrice: 600,
      jumps: 3,
      volumeM3: 100000,
      collateral: 1_000_000_000,
      params: DEFAULT_PRICING,
    });
    // fuelCost = 18000 * 600 = 10.8e6
    expect(q.fuelCost).toBeCloseTo(10_800_000, 3);
    // charge = 10.8e6*1.2 + 0 + 0 + 0.01*1e9 + 0 = 12.96e6 + 10e6 = 22.96e6
    expect(q.suggestedCharge).toBeCloseTo(22_960_000, 3);
    expect(q.margin).toBeCloseTo(22_960_000 - 10_800_000, 3);
  });

  it('floors the charge at minReward when it exceeds the computed value', () => {
    const q = computeQuote({
      fuelUnits: 18000,
      isotopePrice: 600,
      jumps: 3,
      volumeM3: 100000,
      collateral: 1_000_000_000,
      params: { ...DEFAULT_PRICING, minReward: 50_000_000 },
    });
    expect(q.suggestedCharge).toBe(50_000_000);
    expect(q.margin).toBeCloseTo(50_000_000 - 10_800_000, 3);
  });
});
