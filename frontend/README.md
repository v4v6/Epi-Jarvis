# Frontend static prototype

## What this is
A first static UI prototype for Epi-Jarvis-Cal using the live normalized West Nile outputs.

## Files
- `public/index.html`
- `src/styles.css`
- `src/app.js`
- `data/cdph_west_nile_summary.json`
- `data/cdph_west_nile_counties.json`

## Prototype features
- operations-style top bar
- left surveillance rail
- statewide summary cards
- actual California county SVG map driven by live extracted counts
- selectable metric layers: composite, human cases, mosquitoes, dead birds, sentinel chickens, horses
- county click detail panel
- top-county ranking list that updates by active layer
- local bundled county GeoJSON for static rendering

## Notes
This is intentionally a static prototype, not a framework app yet.

To make it runnable in a browser without bundling, the easiest next step is to serve the `frontend/` directory with a simple local web server and, if needed, convert JSON imports to fetch-based loading depending on the browser/runtime.
