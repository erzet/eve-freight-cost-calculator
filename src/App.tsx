import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import systemsRaw from './data/systems.json';
import { SHIPS, FUEL_BAY_UNITS } from './lib/ships';
import { maxJumpRangeLy } from './lib/fuel';
import { findRoute } from './lib/pathfind';
import type { Objective, RouteResult, System } from './lib/pathfind';
import { computeQuote } from './lib/pricing';
import type { PricingParams, Quote } from './lib/pricing';
import { fetchIsotopePrices } from './lib/prices';
import { fmtInt } from './lib/format';
import type { Skills } from './types';
import { BUTTON } from './ui';
import { parseFormState, encodeFormState } from './lib/urlState';
import { dotlanJumpUrl, dotlanRouteUrl } from './lib/dotlan';
import { fetchEsiRoute, gateRouteResult } from './lib/esiRoute';
import type { RouteMode, RoutePreference } from './lib/esiRoute';
import ShipSkillsForm from './components/ShipSkillsForm';
import RouteForm from './components/RouteForm';
import PricingForm from './components/PricingForm';
import PriceStatus from './components/PriceStatus';
import ResultsPanel from './components/ResultsPanel';

// Generated dataset; its shape matches `System` by construction.
const SYSTEMS = systemsRaw as System[];

export default function App() {
  const initial = useMemo(() => parseFormState(window.location.search), []);

  const [shipName, setShipName] = useState(initial.shipName);
  const [skills, setSkills] = useState<Skills>(initial.skills);
  const [origin, setOrigin] = useState(initial.origin);
  const [dest, setDest] = useState(initial.dest);
  const [cargo, setCargo] = useState(initial.cargo);
  const [collateral, setCollateral] = useState(initial.collateral);
  const [objective, setObjective] = useState<Objective>(initial.objective);
  const [params, setParams] = useState<PricingParams>(initial.params);
  const [routeMode, setRouteMode] = useState<RouteMode>(initial.routeMode);
  const [preference, setPreference] = useState<RoutePreference>(initial.preference);

  const [prices, setPrices] = useState<Record<number, number> | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [customPrice, setCustomPrice] = useState(initial.price);

  const [result, setResult] = useState<RouteResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const ship = useMemo(() => SHIPS.find((s) => s.name === shipName) ?? SHIPS[0], [shipName]);

  const nameToSystem = useMemo(() => {
    const map = new Map<string, System>();
    for (const s of SYSTEMS) map.set(s.name.toLowerCase(), s);
    return map;
  }, []);

  const idToSystem = useMemo(() => {
    const map = new Map<number, System>();
    for (const s of SYSTEMS) map.set(s.id, s);
    return map;
  }, []);

  const systemNames = useMemo(() => SYSTEMS.map((s) => s.name).sort((a, b) => a.localeCompare(b)), []);

  const loadPrices = useCallback(async () => {
    setPriceLoading(true);
    setPriceError(null);
    try {
      const p = await fetchIsotopePrices();
      setPrices(p);
    } catch (err) {
      setPrices(null);
      setPriceError(err instanceof Error ? err.message : 'fetch failed');
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPrices();
  }, [loadPrices]);

  // If the URL supplied an explicit price, respect it until the ship's isotope
  // actually changes; otherwise seed from the live Jita price on fetch.
  const seededIsotope = useRef<number | null>(initial.price ? ship.isotopeTypeId : null);
  useEffect(() => {
    if (!prices) return;
    if (seededIsotope.current === ship.isotopeTypeId) return;
    const p = prices[ship.isotopeTypeId];
    if (p !== undefined) {
      setCustomPrice(String(p));
      seededIsotope.current = ship.isotopeTypeId;
    }
  }, [prices, ship.isotopeTypeId]);

  // Mirror the form into the URL (replaceState: shareable, no history spam).
  useEffect(() => {
    const qs = encodeFormState({ shipName, skills, origin, dest, cargo, collateral, objective, routeMode, preference, params, price: customPrice });
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`);
  }, [shipName, skills, origin, dest, cargo, collateral, objective, routeMode, preference, params, customPrice]);

  const maxRangeLy = maxJumpRangeLy(ship, skills.jdc);
  const effectivePrice = Number(customPrice) || 0;
  const effectiveCargoM3 = ship.baseCargoM3 * (1 + 0.05 * skills.racial);
  const cargoM3 = Number(cargo) || 0;
  const collateralIsk = Number(collateral) || 0;

  const onCalculate = useCallback(async () => {
    const o = nameToSystem.get(origin.trim().toLowerCase());
    const d = nameToSystem.get(dest.trim().toLowerCase());
    if (!o || !d) {
      setResult({ found: false, reason: 'unknown-system' });
      return;
    }
    setCalculating(true);
    try {
      if (routeMode === 'gate') {
        const ids = await fetchEsiRoute(o.id, d.id, preference);
        setResult(gateRouteResult(ids, idToSystem));
      } else {
        const r = await findRoute({
          systems: SYSTEMS,
          originId: o.id,
          destId: d.id,
          maxRangeLy,
          ship,
          jfc: skills.jfc,
          jf: skills.jf,
          objective,
        });
        setResult(r);
      }
    } catch (err) {
      setResult({ found: false, reason: routeMode === 'gate' ? 'esi-error' : 'no-route' });
      console.error('route calculation failed', err);
    } finally {
      setCalculating(false);
    }
  }, [nameToSystem, origin, dest, maxRangeLy, ship, skills.jfc, skills.jf, objective, routeMode, preference, idToSystem]);

  const quote: Quote | null = useMemo(() => {
    if (!result || !result.found) return null;
    return computeQuote({
      fuelUnits: result.totalFuel,
      isotopePrice: effectivePrice,
      jumps: result.jumps,
      volumeM3: cargoM3,
      collateral: collateralIsk,
      params,
    });
  }, [result, effectivePrice, cargoM3, collateralIsk, params]);

  const dotlanUrl = useMemo(() => {
    if (!result || !result.found) return null;
    return routeMode === 'gate'
      ? dotlanRouteUrl(result.legs)
      : dotlanJumpUrl(ship.name, skills.jdc, skills.jfc, skills.jf, result.legs);
  }, [result, routeMode, ship.name, skills.jdc, skills.jfc, skills.jf]);

  const warnings = useMemo(() => {
    const out: string[] = [];
    if (!result || !result.found) return out;
    if (cargoM3 > effectiveCargoM3) {
      out.push(
        `Cargo ${fmtInt(cargoM3)} m³ exceeds this ship's capacity ${fmtInt(effectiveCargoM3)} m³ (base ${fmtInt(ship.baseCargoM3)} m³ + Racial Freighter ${skills.racial}).`,
      );
    }
    if (routeMode === 'jump' && result.totalFuel > FUEL_BAY_UNITS) {
      out.push(
        `Total fuel ${fmtInt(result.totalFuel)} units exceeds the ${fmtInt(FUEL_BAY_UNITS)}-unit fuel bay; a multi-leg route requires refueling between jumps.`,
      );
    }
    if (routeMode === 'jump' && effectivePrice <= 0) {
      out.push('No isotope price set — fuel cost is zero. Enter a manual price.');
    }
    return out;
  }, [result, routeMode, cargoM3, effectiveCargoM3, ship.baseCargoM3, skills.racial, effectivePrice]);

  return (
    <main className="mx-auto max-w-5xl px-5 pt-6 pb-16">
      <h1 className="mb-1 text-2xl font-semibold">EVE Jump-Freighter Freight Cost Calculator</h1>
      <p className="text-slate-400">
        {routeMode === 'gate'
          ? 'Stargate routing via ESI — gate-to-gate, no jump fuel.'
          : `Jump-drive routing. Max single-jump range ${maxRangeLy.toFixed(1)} ly (${ship.name}, JDC ${skills.jdc}).`}
      </p>

      <div className="mt-5 grid grid-cols-1 items-start gap-6 md:grid-cols-[360px_1fr]">
        <div>
          <ShipSkillsForm ships={SHIPS} shipName={shipName} onShipName={setShipName} skills={skills} onSkills={setSkills} />
          <RouteForm
            origin={origin}
            dest={dest}
            cargo={cargo}
            collateral={collateral}
            objective={objective}
            onOrigin={setOrigin}
            onDest={setDest}
            onCargo={setCargo}
            onCollateral={setCollateral}
            onObjective={setObjective}
            routeMode={routeMode}
            onRouteMode={setRouteMode}
            preference={preference}
            onPreference={setPreference}
            systemNames={systemNames}
          />
          <PriceStatus
            ship={ship}
            fetchedPrice={prices ? prices[ship.isotopeTypeId] : null}
            loading={priceLoading}
            error={priceError}
            price={customPrice}
            onPrice={setCustomPrice}
            onRefresh={() => void loadPrices()}
          />
          <PricingForm params={params} onChange={setParams} />
          <button type="button" className={`${BUTTON} w-full py-3 text-base`} onClick={() => void onCalculate()} disabled={calculating}>
            {calculating ? 'Calculating…' : 'Calculate'}
          </button>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900 px-[18px] py-4">
          <h2 className="mb-3 text-lg font-semibold">Results</h2>
          <ResultsPanel result={result} quote={quote} warnings={warnings} calculating={calculating} dotlanUrl={dotlanUrl} mode={routeMode} />
        </div>
      </div>

      <footer className="mt-8 text-xs text-slate-500">
        EVE Jump-Freighter Freight Cost Calculator v{__APP_VERSION__}
      </footer>
    </main>
  );
}
