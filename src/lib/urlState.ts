import { SHIPS } from './ships';
import { DEFAULT_PRICING } from './pricing';
import type { PricingParams } from './pricing';
import type { Objective } from './pathfind';
import type { RouteMode, RoutePreference } from './esiRoute';
import type { Skills } from '../types';

// The full set of shareable form inputs encoded in the URL query string.
export interface FormState {
  shipName: string;
  skills: Skills;
  origin: string;
  dest: string;
  cargo: string;
  collateral: string;
  objective: Objective;
  routeMode: RouteMode;
  preference: RoutePreference;
  params: PricingParams;
  price: string;
}

export const DEFAULT_FORM: FormState = {
  shipName: 'Rhea',
  skills: { jdc: 5, jfc: 4, jf: 4, racial: 5 },
  origin: '',
  dest: '',
  cargo: '100000',
  collateral: '1000000000',
  objective: 'fuel',
  routeMode: 'jump',
  preference: 'Shorter',
  params: DEFAULT_PRICING,
  price: '',
};

// Pricing param keys mapped to their short URL query names.
const PARAM_KEYS: Record<keyof PricingParams, string> = {
  fuelMarkupPct: 'markup',
  rewardBase: 'rewardBase',
  rewardPerM3: 'rewardPerM3',
  collateralPct: 'collateralPct',
  perJumpFee: 'perJumpFee',
  minReward: 'minReward',
};

export function parseFormState(search: string): FormState {
  const q = new URLSearchParams(search);
  const d = DEFAULT_FORM;

  const skillOf = (key: string, fallback: number): number => {
    const v = q.get(key);
    if (v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(5, Math.round(n))) : fallback;
  };
  const numOf = (key: string, fallback: number): number => {
    const v = q.get(key);
    if (v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const shipParam = q.get('ship');
  const shipName = SHIPS.some((s) => s.name === shipParam) ? (shipParam as string) : d.shipName;

  const params = {} as PricingParams;
  for (const key of Object.keys(PARAM_KEYS) as (keyof PricingParams)[]) {
    params[key] = numOf(PARAM_KEYS[key], d.params[key]);
  }

  return {
    shipName,
    skills: {
      jdc: skillOf('jdc', d.skills.jdc),
      jfc: skillOf('jfc', d.skills.jfc),
      jf: skillOf('jf', d.skills.jf),
      racial: skillOf('racial', d.skills.racial),
    },
    origin: q.get('from') ?? d.origin,
    dest: q.get('to') ?? d.dest,
    cargo: q.get('cargo') ?? d.cargo,
    collateral: q.get('collateral') ?? d.collateral,
    objective: q.get('obj') === 'jumps' ? 'jumps' : 'fuel',
    routeMode: q.get('mode') === 'gate' ? 'gate' : 'jump',
    preference:
      q.get('pref') === 'Safer' ? 'Safer' : q.get('pref') === 'LessSecure' ? 'LessSecure' : 'Shorter',
    params,
    price: q.get('price') ?? d.price,
  };
}

export function encodeFormState(state: FormState): string {
  const q = new URLSearchParams();
  q.set('ship', state.shipName);
  q.set('jdc', String(state.skills.jdc));
  q.set('jfc', String(state.skills.jfc));
  q.set('jf', String(state.skills.jf));
  q.set('racial', String(state.skills.racial));
  if (state.origin.trim()) q.set('from', state.origin.trim());
  if (state.dest.trim()) q.set('to', state.dest.trim());
  q.set('cargo', state.cargo);
  q.set('collateral', state.collateral);
  q.set('obj', state.objective);
  q.set('mode', state.routeMode);
  q.set('pref', state.preference);
  for (const key of Object.keys(PARAM_KEYS) as (keyof PricingParams)[]) {
    q.set(PARAM_KEYS[key], String(state.params[key]));
  }
  if (state.price.trim()) q.set('price', state.price.trim());
  return q.toString();
}
