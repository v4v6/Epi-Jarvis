const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString());
const COLORS = ['#152534', '#1a4338', '#5d5224', '#6f3b1d', '#6b2030'];

const LAYERS = {
  composite: {
    label: 'Composite score',
    accessor: (row) => (row.human_cases || 0) * 5 + (row.horses || 0) * 4 + (row.mosquito_samples || 0) * 1 + (row.dead_birds || 0) * 0.5 + (row.sentinel_chickens || 0) * 2,
    legend: ['none', 'low', 'moderate', 'high', 'severe'],
  },
  human_cases: {
    label: 'Human cases',
    accessor: (row) => row.human_cases || 0,
    legend: ['0', '1', '2–5', '6–10', '>10'],
  },
  mosquito_samples: {
    label: 'Mosquito samples',
    accessor: (row) => row.mosquito_samples || 0,
    legend: ['0', '1–5', '6–25', '26–100', '>100'],
  },
  dead_birds: {
    label: 'Dead birds',
    accessor: (row) => row.dead_birds || 0,
    legend: ['0', '1', '2–5', '6–15', '>15'],
  },
  sentinel_chickens: {
    label: 'Sentinel chickens',
    accessor: (row) => row.sentinel_chickens || 0,
    legend: ['0', '1', '2–4', '5–10', '>10'],
  },
  horses: {
    label: 'Horses',
    accessor: (row) => row.horses || 0,
    legend: ['0', '1', '2', '3', '4+'],
  },
};

const state = {
  activeLayer: 'composite',
  selectedCounty: null,
  counties: [],
  geojson: null,
  dataByCounty: new Map(),
};

function valueForLayer(row, layerKey) {
  return LAYERS[layerKey].accessor(row || {});
}

function levelFromLayerValue(layerKey, value) {
  if (layerKey === 'composite') {
    if (value >= 100) return 4;
    if (value >= 40) return 3;
    if (value >= 10) return 2;
    if (value > 0) return 1;
    return 0;
  }
  if (layerKey === 'human_cases') {
    if (value > 10) return 4;
    if (value >= 6) return 3;
    if (value >= 2) return 2;
    if (value >= 1) return 1;
    return 0;
  }
  if (layerKey === 'mosquito_samples') {
    if (value > 100) return 4;
    if (value >= 26) return 3;
    if (value >= 6) return 2;
    if (value >= 1) return 1;
    return 0;
  }
  if (layerKey === 'dead_birds') {
    if (value > 15) return 4;
    if (value >= 6) return 3;
    if (value >= 2) return 2;
    if (value >= 1) return 1;
    return 0;
  }
  if (layerKey === 'sentinel_chickens') {
    if (value > 10) return 4;
    if (value >= 5) return 3;
    if (value >= 2) return 2;
    if (value >= 1) return 1;
    return 0;
  }
  if (layerKey === 'horses') {
    if (value >= 4) return 4;
    if (value === 3) return 3;
    if (value === 2) return 2;
    if (value === 1) return 1;
    return 0;
  }
  return 0;
}

function buildSummary(summary, counties) {
  document.getElementById('last-updated').textContent = summary.last_updated_text || 'unknown';
  const activeCountyCount = counties.filter((c) => valueForLayer(c, 'composite') > 0).length;
  document.getElementById('active-county-count').textContent = `${activeCountyCount} counties active`;

  const cards = [
    ['Human cases', fmt(summary.human_cases)],
    ['Dead birds', fmt(summary.dead_birds)],
    ['Mosquito samples', fmt(summary.mosquito_samples)],
    ['Sentinel chickens', fmt(summary.sentinel_chickens)],
    ['Horses', fmt(summary.horses)],
    ['Season', summary.season_label || '—'],
  ];

  document.getElementById('summary-grid').innerHTML = cards.map(([label, value]) => `
    <div class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}</div>
    </div>
  `).join('');
}

function renderCountyDetail(row) {
  const composite = valueForLayer(row, 'composite');
  const layerValue = valueForLayer(row, state.activeLayer);
  const layerLabel = LAYERS[state.activeLayer].label;
  document.getElementById('county-detail').innerHTML = `
    <div class="detail-name">${row.county}</div>
    <p class="detail-copy">${layerLabel}: <strong>${fmt(layerValue)}</strong> · Composite score: <strong>${composite.toFixed(1)}</strong></p>
    <div class="detail-grid">
      <div class="detail-stat"><span>Human cases</span><strong>${fmt(row.human_cases)}</strong></div>
      <div class="detail-stat"><span>Dead birds</span><strong>${fmt(row.dead_birds)}</strong></div>
      <div class="detail-stat"><span>Mosquito samples</span><strong>${fmt(row.mosquito_samples)}</strong></div>
      <div class="detail-stat"><span>Sentinel chickens</span><strong>${fmt(row.sentinel_chickens)}</strong></div>
      <div class="detail-stat"><span>Horses</span><strong>${fmt(row.horses)}</strong></div>
      <div class="detail-stat"><span>Layer source</span><strong>CDPH West Nile</strong></div>
    </div>
  `;

  document.getElementById('insight-list').innerHTML = [
    row.human_cases ? `Human cases present in ${row.county}.` : `No human cases shown for ${row.county} in the current extracted feed.`,
    row.mosquito_samples ? `Mosquito positives suggest active vector circulation.` : `No mosquito sample count currently shown.`,
    row.dead_birds ? `Dead bird detections may provide early ecological signal.` : `No dead bird signal currently shown.`,
  ].map((x) => `<li>${x}</li>`).join('');
}

function updateLegend() {
  const legend = document.getElementById('map-legend');
  const items = LAYERS[state.activeLayer].legend;
  legend.innerHTML = items.map((label, i) => `<span><i class="swatch level-${i}"></i> ${label}</span>`).join('');
}

function updateTopList() {
  const ranked = [...state.counties].sort((a, b) => valueForLayer(b, state.activeLayer) - valueForLayer(a, state.activeLayer));
  document.getElementById('top-counties').innerHTML = ranked.slice(0, 8).map((row) => `<li><strong>${row.county}</strong> — ${LAYERS[state.activeLayer].label.toLowerCase()} ${fmt(valueForLayer(row, state.activeLayer))}</li>`).join('');
  return ranked;
}

function mercatorProject(lon, lat) {
  const lambda = lon * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  return [lambda, Math.log(Math.tan(Math.PI / 4 + phi / 2))];
}

function flattenCoords(coords, out = []) {
  if (typeof coords[0] === 'number') out.push(coords);
  else coords.forEach((c) => flattenCoords(c, out));
  return out;
}

function buildProjection(features, width, height, padding = 20) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const feature of features) {
    const pts = flattenCoords(feature.geometry.coordinates).map(([lon, lat]) => mercatorProject(lon, lat));
    for (const [x, y] of pts) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const scale = Math.min((width - padding * 2) / (maxX - minX), (height - padding * 2) / (maxY - minY));
  return ([lon, lat]) => {
    const [x, y] = mercatorProject(lon, lat);
    return [padding + (x - minX) * scale, height - padding - (y - minY) * scale];
  };
}

function polygonPath(ring, project) {
  return ring.map((pt, i) => {
    const [x, y] = project(pt);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

function featurePath(geometry, project) {
  if (geometry.type === 'Polygon') return geometry.coordinates.map((ring) => polygonPath(ring, project)).join(' ');
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flatMap((poly) => poly.map((ring) => polygonPath(ring, project))).join(' ');
  return '';
}

function centroidFromGeometry(geometry) {
  const pts = flattenCoords(geometry.coordinates);
  let lon = 0, lat = 0;
  for (const p of pts) {
    lon += p[0];
    lat += p[1];
  }
  return [lon / pts.length, lat / pts.length];
}

function renderMap() {
  const svg = document.getElementById('county-map');
  const width = 900;
  const height = 700;
  const project = buildProjection(state.geojson.features, width, height, 24);
  const ranked = updateTopList();
  const defaultCounty = state.selectedCounty || ranked.find((r) => valueForLayer(r, state.activeLayer) > 0)?.county || ranked[0]?.county;
  state.selectedCounty = defaultCounty;

  svg.innerHTML = state.geojson.features.map((feature) => {
    const county = feature.properties.name;
    const row = state.dataByCounty.get(county) || { county };
    const value = valueForLayer(row, state.activeLayer);
    const level = levelFromLayerValue(state.activeLayer, value);
    const d = featurePath(feature.geometry, project);
    const [cx, cy] = project(centroidFromGeometry(feature.geometry));
    const showLabel = valueForLayer(row, 'composite') >= 40 || ['Los Angeles', 'San Diego', 'Orange', 'Fresno', 'Kern', 'Tulare', 'Sacramento', 'Santa Clara', 'Alameda', 'San Bernardino'].includes(county);
    return `
      <g class="county-group" data-county="${county}">
        <path class="county-shape ${county === defaultCounty ? 'active' : ''}" data-county="${county}" d="${d}" fill="${COLORS[level]}">
          <title>${county} — ${LAYERS[state.activeLayer].label} ${fmt(value)}</title>
        </path>
        ${showLabel ? `<text class="map-label" x="${cx.toFixed(1)}" y="${cy.toFixed(1)}">${county}</text>` : ''}
      </g>
    `;
  }).join('');

  svg.querySelectorAll('.county-shape').forEach((node) => {
    node.addEventListener('click', () => {
      state.selectedCounty = node.dataset.county;
      renderMap();
      const row = state.dataByCounty.get(state.selectedCounty) || { county: state.selectedCounty };
      renderCountyDetail(row);
    });
  });

  if (defaultCounty) renderCountyDetail(state.dataByCounty.get(defaultCounty));
  updateLegend();
}

function wireLayerControls() {
  document.querySelectorAll('.layer-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layer-chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeLayer = btn.dataset.layer;
      renderMap();
    });
  });
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

async function main() {
  const [summary, counties, geojson] = await Promise.all([
    loadJson('../data/cdph_west_nile_summary.json'),
    loadJson('../data/cdph_west_nile_counties.json'),
    loadJson('../data/california_counties.geojson'),
  ]);
  state.counties = counties;
  state.geojson = geojson;
  state.dataByCounty = new Map(counties.map((row) => [row.county, row]));
  buildSummary(summary, counties);
  wireLayerControls();
  renderMap();
}

main().catch((err) => {
  console.error(err);
  document.getElementById('county-detail').innerHTML = `
    <div class="detail-name">Prototype load error</div>
    <p class="detail-copy">${err.message}</p>
  `;
});
