const iskFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

// ISK with thousands separators, rounded to whole ISK.
export function fmtIsk(n: number): string {
  return `${iskFmt.format(Math.round(n))} ISK`;
}

// Plain integer with thousands separators (fuel units, volumes).
export function fmtInt(n: number): string {
  return numFmt.format(Math.round(n));
}

export function fmtLy(n: number): string {
  return n.toFixed(2);
}
