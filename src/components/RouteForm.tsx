import { useMemo } from 'react';
import type { Objective } from '../lib/pathfind';
import type { RouteMode, RoutePreference } from '../lib/esiRoute';
import { CARD, LEGEND, FIELD, FIELD_LABEL, CONTROL } from '../ui';

interface Props {
  origin: string;
  dest: string;
  cargo: string;
  collateral: string;
  objective: Objective;
  routeMode: RouteMode;
  preference: RoutePreference;
  onOrigin: (v: string) => void;
  onDest: (v: string) => void;
  onCargo: (v: string) => void;
  onCollateral: (v: string) => void;
  onObjective: (v: Objective) => void;
  onRouteMode: (v: RouteMode) => void;
  onPreference: (v: RoutePreference) => void;
  systemNames: string[];
}

// Minimum characters before the autocomplete list is populated — avoids
// rendering thousands of <option> nodes for one- or two-letter prefixes.
const MIN_FILTER_CHARS = 3;
const MAX_OPTIONS = 50;

function matchSystems(names: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_FILTER_CHARS) return [];
  const out: string[] = [];
  for (const name of names) {
    if (name.toLowerCase().includes(q)) {
      out.push(name);
      if (out.length >= MAX_OPTIONS) break;
    }
  }
  return out;
}

export default function RouteForm(props: Props) {
  const { origin, dest, cargo, collateral, objective, systemNames } = props;
  const originOptions = useMemo(() => matchSystems(systemNames, origin), [systemNames, origin]);
  const destOptions = useMemo(() => matchSystems(systemNames, dest), [systemNames, dest]);
  return (
    <fieldset className={CARD}>
      <legend className={LEGEND}>Route</legend>
      <label className={FIELD}>
        <span className={FIELD_LABEL}>Origin system</span>
        <input className={CONTROL} list="origin-names" value={origin} onChange={(e) => props.onOrigin(e.target.value)} placeholder="e.g. Jita" />
        <datalist id="origin-names">
          {originOptions.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </label>
      <label className={FIELD}>
        <span className={FIELD_LABEL}>Destination system</span>
        <input className={CONTROL} list="dest-names" value={dest} onChange={(e) => props.onDest(e.target.value)} placeholder="e.g. 1DQ1-A" />
        <datalist id="dest-names">
          {destOptions.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </label>
      <label className={FIELD}>
        <span className={FIELD_LABEL}>Cargo volume (m³)</span>
        <input className={CONTROL} type="number" min={0} value={cargo} onChange={(e) => props.onCargo(e.target.value)} />
      </label>
      <label className={FIELD}>
        <span className={FIELD_LABEL}>Collateral (ISK)</span>
        <input className={CONTROL} type="number" min={0} value={collateral} onChange={(e) => props.onCollateral(e.target.value)} />
      </label>
      <label className={FIELD}>
        <span className={FIELD_LABEL}>Routing method</span>
        <select className={CONTROL} value={props.routeMode} onChange={(e) => props.onRouteMode(e.target.value === 'gate' ? 'gate' : 'jump')}>
          <option value="jump">Jump drive (custom)</option>
          <option value="gate">Stargate (ESI)</option>
        </select>
      </label>
      {props.routeMode === 'jump' ? (
        <label className={FIELD}>
          <span className={FIELD_LABEL}>Optimize for</span>
          <select className={CONTROL} value={objective} onChange={(e) => props.onObjective(e.target.value === 'jumps' ? 'jumps' : 'fuel')}>
            <option value="fuel">Minimum fuel</option>
            <option value="jumps">Minimum jumps</option>
          </select>
        </label>
      ) : (
        <label className={FIELD}>
          <span className={FIELD_LABEL}>Route preference</span>
          <select
            className={CONTROL}
            value={props.preference}
            onChange={(e) => props.onPreference(e.target.value === 'Safer' ? 'Safer' : e.target.value === 'LessSecure' ? 'LessSecure' : 'Shorter')}
          >
            <option value="Shorter">Shorter</option>
            <option value="Safer">Safer (high-sec)</option>
            <option value="LessSecure">Less secure</option>
          </select>
        </label>
      )}
    </fieldset>
  );
}
