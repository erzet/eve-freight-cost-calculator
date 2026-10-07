# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-10-07

### Added
- GitHub Pages hosting: Actions workflow builds on push to `main` and deploys
  `dist` to Pages. Vite `base` is set to `/eve-freight-cost-calculator/` for
  Pages builds (`GITHUB_PAGES=true`); local dev/build stay at `/`.

## [1.0.1] - 2026-10-07

### Added
- Release automation: `npm version <patch|minor|major>` now runs the test suite
  first (`preversion`) and folds `CHANGELOG.md` into the version commit
  (`version` hook), producing a `vX.Y.Z` commit and tag in one command. The app
  footer and `__APP_VERSION__` track `package.json` automatically.

## [1.0.0] - 2026-10-07

Initial release. A fully client-side (React + Vite + TypeScript) jump-freighter
freight cost calculator.

### Added
- Jump-drive route finder: client-side Dijkstra over a spatial-hash graph of all
  k-space systems, limited to `baseRange * (1 + 0.2*JDC)` per jump, with the
  non-high-sec destination (cyno) rule. Runs in a Web Worker.
- Stargate routing via ESI `POST /route` (compatibility date 2025-09-30) with
  `Shorter` / `Safer` / `LessSecure` preferences, selectable alongside the custom
  jump-drive mode.
- Fuel model for the four jump freighters (Ark, Rhea, Anshar, Nomad) using the
  verified isotope consumption formula; configurable JDC / JFC / JF skills.
- Pricing model: fuel markup, base/per-m³ reward, collateral %, per-jump fee and
  minimum reward, producing hauler cost and a suggested customer charge.
- Live Jita isotope prices from Fuzzwork aggregates, with an always-editable
  custom price (seeded from the live price) and a manual fallback.
- Build-time dataset generator (`npm run build:data`) pulling ~5,485 k-space
  systems from ESI.
- Shareable state: all form inputs are encoded in the URL and restored on load.
- DOTLAN EveMaps deep links for both jump and stargate routes.
- Cargo-capacity and fuel-bay warnings.
- Version surfaced in the UI footer and exposed via `__APP_VERSION__`.

[1.0.0]: https://semver.org/
