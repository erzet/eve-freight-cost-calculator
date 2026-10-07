import type { Ship } from '../lib/ships';
import { ISOTOPE_NAMES } from '../lib/ships';
import { fmtIsk } from '../lib/format';
import { CARD, LEGEND, FIELD, FIELD_LABEL, CONTROL, BUTTON } from '../ui';

interface Props {
  ship: Ship;
  fetchedPrice: number | null;
  loading: boolean;
  error: string | null;
  price: string;
  onPrice: (v: string) => void;
  onRefresh: () => void;
}

export default function PriceStatus({ ship, fetchedPrice, loading, error, price, onPrice, onRefresh }: Props) {
  const isotopeName = ISOTOPE_NAMES[ship.isotopeTypeId];
  const canResetToJita = fetchedPrice !== null && Number(price) !== fetchedPrice;
  return (
    <fieldset className={CARD}>
      <legend className={LEGEND}>Fuel price — {isotopeName}</legend>

      {loading && <p className="text-slate-400">Fetching Jita sell price…</p>}

      {!loading && fetchedPrice !== null && (
        <p className="mb-2 flex items-center gap-2 text-sm">
          <span className="text-slate-400">Jita sell:</span>
          <strong>{fmtIsk(fetchedPrice)}</strong>
          <span className="text-slate-400">/ unit</span>
          <button type="button" className={BUTTON} onClick={onRefresh}>
            Refresh
          </button>
        </p>
      )}

      {!loading && error !== null && (
        <p className="mb-2 text-sm text-amber-200">
          Live price unavailable ({error}).{' '}
          <button type="button" className={BUTTON} onClick={onRefresh}>
            Retry fetch
          </button>
        </p>
      )}

      <label className={FIELD}>
        <span className={FIELD_LABEL}>Price used (ISK/unit)</span>
        <input className={CONTROL} type="number" min={0} value={price} onChange={(e) => onPrice(e.target.value)} />
      </label>

      {canResetToJita && (
        <button type="button" className={`${BUTTON} bg-slate-700 text-slate-100`} onClick={() => onPrice(String(fetchedPrice))}>
          Reset to Jita price
        </button>
      )}
    </fieldset>
  );
}
