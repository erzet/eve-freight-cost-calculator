// Build-time generator for src/data/systems.json.
// Fetches all k-space solar systems from ESI and emits a compact dataset
// of {id, name, sec, x, y, z} used for jump-drive distance math.
//
// Usage: node scripts/build-systems.mjs
// Requires Node 18+ (global fetch).

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ESI = 'https://esi.evetech.net/latest';
const CONCURRENCY = 30;
const MIN_SYSTEMS = 5000;
const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'systems.json');

async function fetchJson(url, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

async function main() {
  console.log('Fetching system id list...');
  const allIds = await fetchJson(`${ESI}/universe/systems/`);
  // k-space only: 30000000..30999999 (excludes wormhole 31xxxxxx and abyssal/void).
  const ids = allIds.filter((id) => id >= 30000000 && id <= 30999999);
  console.log(`Total ids: ${allIds.length}, k-space ids: ${ids.length}`);

  const systems = [];
  let skipped = 0;
  let done = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      try {
        const s = await fetchJson(`${ESI}/universe/systems/${id}/`);
        if (!s || !s.position || typeof s.security_status !== 'number') {
          skipped++;
          continue;
        }
        systems.push({
          id: s.system_id,
          name: s.name,
          sec: Math.round(s.security_status * 100) / 100,
          x: s.position.x,
          y: s.position.y,
          z: s.position.z,
        });
      } catch {
        skipped++;
      }
      done++;
      if (done % 500 === 0) console.log(`  ${done}/${ids.length} fetched (${skipped} skipped)`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`Collected ${systems.length} systems, skipped ${skipped}.`);
  if (systems.length < MIN_SYSTEMS) {
    console.error(`FATAL: only ${systems.length} systems collected (< ${MIN_SYSTEMS}); aborting without writing.`);
    process.exit(1);
  }

  systems.sort((a, b) => a.id - b.id);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(systems));
  console.log(`Wrote ${systems.length} systems to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
