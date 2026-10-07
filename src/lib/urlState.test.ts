import { describe, it, expect } from 'vitest';
import { parseFormState, encodeFormState, DEFAULT_FORM } from './urlState';
import type { FormState } from './urlState';

describe('parseFormState', () => {
  it('returns defaults for an empty query', () => {
    expect(parseFormState('')).toEqual(DEFAULT_FORM);
  });

  it('falls back to the default ship for an unknown ship name', () => {
    expect(parseFormState('?ship=Orca').shipName).toBe('Rhea');
  });

  it('clamps skill levels into 0..5 and ignores non-numeric', () => {
    const s = parseFormState('?jdc=9&jfc=-3&jf=abc');
    expect(s.skills.jdc).toBe(5);
    expect(s.skills.jfc).toBe(0);
    expect(s.skills.jf).toBe(DEFAULT_FORM.skills.jf);
  });

  it('normalizes objective, defaulting to fuel for unknown values', () => {
    expect(parseFormState('?obj=jumps').objective).toBe('jumps');
    expect(parseFormState('?obj=wormhole').objective).toBe('fuel');
  });

  it('reads route, cargo, pricing and price params', () => {
    const s = parseFormState('?from=Jita&to=1DQ1-A&cargo=5000&markup=15&collateralPct=2&price=750');
    expect(s.origin).toBe('Jita');
    expect(s.dest).toBe('1DQ1-A');
    expect(s.cargo).toBe('5000');
    expect(s.params.fuelMarkupPct).toBe(15);
    expect(s.params.collateralPct).toBe(2);
    expect(s.price).toBe('750');
  });
});

describe('round-trip', () => {
  it('encode -> parse preserves a fully-specified state', () => {
    const state: FormState = {
      shipName: 'Ark',
      skills: { jdc: 4, jfc: 5, jf: 3, racial: 2 },
      origin: 'Amarr',
      dest: 'Hophib',
      cargo: '120000',
      collateral: '2500000000',
      objective: 'jumps',
      routeMode: 'gate',
      preference: 'Safer',
      params: { fuelMarkupPct: 30, rewardBase: 5_000_000, rewardPerM3: 2, collateralPct: 1.5, perJumpFee: 250_000, minReward: 10_000_000 },
      price: '812.5',
    };
    expect(parseFormState(`?${encodeFormState(state)}`)).toEqual(state);
  });

  it('drops empty origin/dest/price from the query', () => {
    const qs = encodeFormState(DEFAULT_FORM);
    const q = new URLSearchParams(qs);
    expect(q.has('from')).toBe(false);
    expect(q.has('to')).toBe(false);
    expect(q.has('price')).toBe(false);
  });

  it('parses routing mode and preference, defaulting unknowns', () => {
    expect(parseFormState('?mode=gate&pref=LessSecure').routeMode).toBe('gate');
    expect(parseFormState('?mode=gate&pref=LessSecure').preference).toBe('LessSecure');
    expect(parseFormState('?mode=warp&pref=fast').routeMode).toBe('jump');
    expect(parseFormState('?mode=warp&pref=fast').preference).toBe('Shorter');
  });
});
