import type { RouteResult } from '../lib/pathfind';
import type { RouteMode } from '../lib/esiRoute';
import type { Quote } from '../lib/pricing';
import { ISOTOPE_VOLUME_M3 } from '../lib/ships';
import { fmtIsk, fmtInt, fmtLy } from '../lib/format';
import { WARN_BANNER } from '../ui';

interface Props {
  result: RouteResult | null;
  quote: Quote | null;
  warnings: string[];
  calculating: boolean;
  dotlanUrl: string | null;
  mode: RouteMode;
}

const REASON_TEXT: Record<string, string> = {
  'unknown-system': 'Unknown system name — check origin and destination spelling.',
  'highsec-destination': 'Destination is high-sec; a jump freighter cannot light a cyno there. Pick a low/null-sec destination.',
  'no-route': 'No route found within range. Adjust skills, ship, or destination.',
  'esi-error': 'ESI route service error — please try again in a moment.',
};

const TH = 'border-b border-slate-700 px-2 py-1.5 text-left font-semibold';
const TD = 'border-b border-slate-700 px-2 py-1.5';
const ROW = 'flex justify-between border-b border-dotted border-slate-700 pb-1';
const DT = 'text-sm text-slate-400';
const DD = 'm-0 tabular-nums';

export default function ResultsPanel({ result, quote, warnings, calculating, dotlanUrl, mode }: Props) {
  if (calculating) return <p className="text-slate-400">Calculating route…</p>;
  if (!result) return <p className="text-slate-400">Enter a route and press Calculate.</p>;

  if (!result.found) {
    return (
      <div className={WARN_BANNER}>
        <strong className="text-amber-300">No route.</strong> {REASON_TEXT[result.reason]}
      </div>
    );
  }

  const isJump = mode === 'jump';
  const totalFuelVolume = result.totalFuel * ISOTOPE_VOLUME_M3;

  return (
    <div>
      {warnings.map((w) => (
        <div key={w} className={WARN_BANNER}>
          {w}
        </div>
      ))}

      {result.legs.length === 0 ? (
        <p>Origin and destination are the same system — no travel required.</p>
      ) : (
        <table className="mb-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>#</th>
              <th className={TH}>From → To</th>
              <th className={`${TH} text-right`}>Distance (ly)</th>
              {isJump && <th className={`${TH} text-right`}>Fuel (units)</th>}
            </tr>
          </thead>
          <tbody>
            {result.legs.map((leg, i) => (
              <tr key={`${leg.fromId}-${leg.toId}-${i}`}>
                <td className={TD}>{i + 1}</td>
                <td className={TD}>
                  {leg.fromName} → {leg.toName}
                </td>
                <td className={`${TD} text-right tabular-nums`}>{fmtLy(leg.distLy)}</td>
                {isJump && <td className={`${TD} text-right tabular-nums`}>{fmtInt(leg.fuel)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <div className={ROW}>
          <dt className={DT}>{isJump ? 'Jumps' : 'Gate jumps'}</dt>
          <dd className={DD}>{result.jumps}</dd>
        </div>
        <div className={ROW}>
          <dt className={DT}>Total distance</dt>
          <dd className={DD}>{fmtLy(result.totalDistLy)} ly</dd>
        </div>
        {isJump && (
          <div className={ROW}>
            <dt className={DT}>Total fuel</dt>
            <dd className={DD}>{fmtInt(result.totalFuel)} units</dd>
          </div>
        )}
        {isJump && (
          <div className={ROW}>
            <dt className={DT}>Total fuel volume</dt>
            <dd className={DD}>{fmtInt(totalFuelVolume)} m³</dd>
          </div>
        )}
      </dl>

      {quote && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
          {isJump && (
            <div className={ROW}>
              <dt className={DT}>Fuel cost</dt>
              <dd className={DD}>{fmtIsk(quote.fuelCost)}</dd>
            </div>
          )}
          <div className={ROW}>
            <dt className={DT}>Suggested charge</dt>
            <dd className={DD}>
              <strong className="text-sky-300">{fmtIsk(quote.suggestedCharge)}</strong>
            </dd>
          </div>
          {isJump && (
            <div className={ROW}>
              <dt className={DT}>Margin</dt>
              <dd className={DD}>{fmtIsk(quote.margin)}</dd>
            </div>
          )}
        </dl>
      )}

      {!isJump && <p className="mt-2 text-sm text-slate-400">Stargate travel — no isotope fuel cost.</p>}

      {dotlanUrl && (
        <a
          className="mt-4 inline-block text-sm text-sky-400 hover:underline"
          href={dotlanUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View {isJump ? 'jump' : 'gate'} route on DOTLAN EveMaps ↗
        </a>
      )}
    </div>
  );
}
