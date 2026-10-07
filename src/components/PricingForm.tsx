import type { PricingParams } from '../lib/pricing';
import { CARD, LEGEND, FIELD, FIELD_LABEL, CONTROL } from '../ui';

interface Props {
  params: PricingParams;
  onChange: (params: PricingParams) => void;
}

const FIELDS: { key: keyof PricingParams; label: string; step?: number }[] = [
  { key: 'fuelMarkupPct', label: 'Fuel markup (%)' },
  { key: 'collateralPct', label: 'Collateral fee (% of collateral)' },
  { key: 'rewardBase', label: 'Base reward (ISK)', step: 1_000_000 },
  { key: 'rewardPerM3', label: 'Reward per m³ (ISK)' },
  { key: 'perJumpFee', label: 'Per-jump fee (ISK)', step: 100_000 },
  { key: 'minReward', label: 'Minimum reward (ISK)', step: 1_000_000 },
];

export default function PricingForm({ params, onChange }: Props) {
  return (
    <fieldset className={CARD}>
      <legend className={LEGEND}>Pricing</legend>
      <div className="grid grid-cols-2 gap-x-3">
        {FIELDS.map(({ key, label, step }) => (
          <label key={key} className={FIELD}>
            <span className={FIELD_LABEL}>{label}</span>
            <input
              className={CONTROL}
              type="number"
              min={0}
              step={step ?? 1}
              value={params[key]}
              onChange={(e) => onChange({ ...params, [key]: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
