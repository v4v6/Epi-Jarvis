# Epi-Jarvis-Cal — UI wireframe spec (v1)

## Purpose
This document describes the first wireframe for the California epidemiological intelligence terminal.

---

## Screen 1 — Main operations dashboard

### Top bar
**Left:**
- EPI-JARVIS-CAL
- mode chip: `RESPIRATORY SEASON` or `VECTOR SEASON` or `BASELINE`

**Center:**
- region tabs:
  - California
  - Bay Area
  - Central Valley
  - Southern California
  - Sacramento Region
  - Central Coast

**Right:**
- last sweep time
- source count active
- reporting completeness chip
- statewide status chip:
  - Baseline
  - Elevated
  - Multi-county watch
  - Active investigation

---

## Left rail — Surveillance sensor grid
Each row format:
- status dot
- sensor name
- sublabel
- metric count / delta
- freshness badge

Rows:
1. Case Surveillance
2. Wastewater
3. Respiratory ED
4. GI ED
5. Hospital Pressure
6. Lab / Sequencing
7. Vector Surveillance
8. Air Quality / Smoke
9. Heat Context
10. Advisories

Example row:
`● Wastewater    12 elevated basins    updated 2d`

Click behavior:
- clicking a row recolors the center map and updates right-rail cards

---

## Center panel — California county intelligence map
Default mode:
- county choropleth by composite signal score

Map controls:
- zoom
- county click
- overlay selector
- anomaly mode toggle
- pathogen / syndrome selector

Supported overlays:
- composite watch score
- respiratory
- enteric
- vector
- healthcare pressure
- advisories only
- wastewater only
- data completeness

County hover tooltip should show:
- county name
- current watch level
- top 3 active signals
- confidence
- last updated

County click should open a detail drawer with:
- county overview
- signal timeline
- source list
- notable advisories
- concordance summary
- lag / caveat notes

---

## Right rail — Alert stack and interpretation cards
Top block: **What changed since last sweep**
- 3 counties newly elevated
- 1 advisory added
- wastewater rose in 4 basins
- no major statewide changes

Second block: **Top alerts**
Cards with:
- title
- geography
- signal category
- confidence
- reason flagged

Third block: **Interpretation / next look**
Examples:
- Respiratory signal concordant in 3 Southern California counties
- GI uptick appears syndromic-only; lab confirmation absent
- Vector activity elevated but human cases stable

Fourth block: **Data caveats**
Examples:
- 2 counties have stale hospitalization feeds
- wastewater coverage incomplete in northern region
- advisory stream delayed in 1 county source

---

## Bottom panels

### Bottom panel A — Live advisory ticker
Feed items from:
- CDPH
- counties
- CDC
- curated official notices

Fields:
- source
- time
- county/state tag
- topic
- short text
- external link icon

### Bottom panel B — Trend explorer
Tabbed mini-charts:
- wastewater
- ED respiratory
- admissions
- vector detections
- advisories over time

### Bottom panel C — Signal concordance matrix
Rows = counties
Columns = signal systems
Cells =
- rising
- flat
- falling
- stale
- unavailable

This matrix is one of the most useful operational panels.

---

## Screen 2 — County drilldown page

Header:
- county name
- region
- current watch level
- confidence
- last update

Sections:
1. County summary card
2. Top signals this week
3. Time series by source
4. Advisories and notices
5. Environmental context
6. Data quality / lag notes
7. Peer county comparison

---

## Screen 3 — Source integrity / diagnostics page
This page is for analysts, not public-facing users.

Show:
- all source registries
- last successful pull
- freshness
- parsing errors
- source lag
- coverage completeness
- county mapping quality

This will be essential for trust.

---

## Design notes

### Interaction tone
- calm, analytical, operations-focused
- no sensational flashing red terminal nonsense
- severity should mean something

### Visual hierarchy
- map and signal rails must dominate
- ticker is secondary
- cards should explain, not just alert

### Core UX rule
Every alert card should answer:
1. what changed?
2. where?
3. according to which source?
4. how confident are we?
5. what should be checked next?

---

## MVP rendering recommendation
First build a static prototype with:
- fake but realistic California county data
- all major layout zones present
- one interactive county click flow
- one overlay toggle flow
- 6–10 sample alert cards

Only after that should live source integration begin.
