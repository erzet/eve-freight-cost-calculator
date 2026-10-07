// Live isotope prices from Fuzzwork market aggregates (CORS-enabled).
// Returns the cheapest sell order (sell.min) per isotope typeId — the price a
// hauler pays to buy fuel. Rejects on network/parse failure; the UI then falls
// back to a manual price input.

const ISOTOPE_TYPE_IDS = [16274, 17887, 17888, 17889];
const THE_FORGE = 10000002;

export async function fetchIsotopePrices(regionId = THE_FORGE): Promise<Record<number, number>> {
  const types = ISOTOPE_TYPE_IDS.join(',');
  const url = `https://market.fuzzwork.co.uk/aggregates/?region=${regionId}&types=${types}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fuzzwork HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, { sell?: { min?: string } }>;
  const out: Record<number, number> = {};
  for (const id of ISOTOPE_TYPE_IDS) {
    const min = data[String(id)]?.sell?.min;
    const price = Number(min);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Missing sell price for type ${id}`);
    }
    out[id] = price;
  }
  return out;
}
