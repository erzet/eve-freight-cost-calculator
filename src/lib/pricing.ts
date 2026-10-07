export interface PricingParams {
  fuelMarkupPct: number;
  rewardBase: number;
  rewardPerM3: number;
  collateralPct: number;
  perJumpFee: number;
  minReward: number;
}

export const DEFAULT_PRICING: PricingParams = {
  fuelMarkupPct: 20,
  rewardBase: 0,
  rewardPerM3: 0,
  collateralPct: 1,
  perJumpFee: 0,
  minReward: 0,
};

export interface QuoteInput {
  fuelUnits: number;
  isotopePrice: number;
  jumps: number;
  volumeM3: number;
  collateral: number;
  params: PricingParams;
}

export interface Quote {
  fuelCost: number;
  suggestedCharge: number;
  margin: number;
}

export function computeQuote(input: QuoteInput): Quote {
  const { fuelUnits, isotopePrice, jumps, volumeM3, collateral, params } = input;
  const fuelCost = fuelUnits * isotopePrice;
  const computed =
    fuelCost * (1 + params.fuelMarkupPct / 100) +
    params.rewardBase +
    params.rewardPerM3 * volumeM3 +
    (params.collateralPct / 100) * collateral +
    params.perJumpFee * jumps;
  const suggestedCharge = Math.max(params.minReward, computed);
  return { fuelCost, suggestedCharge, margin: suggestedCharge - fuelCost };
}
