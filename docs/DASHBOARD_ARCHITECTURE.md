# Epi-Jarvis-Cal — Dashboard architecture

## 1. Overall product model
The closest analogue to the CRUCIX-style dashboard is not “news terminal for public health”, but:

**California epidemiological situational awareness terminal**

Three layers should be visible at all times:
1. **Signal layer** — what changed
2. **Context layer** — how to interpret it
3. **Action layer** — what an analyst should inspect next

## 2. Recommended top-level layout

### Top bar
Persistent summary strip with:
- California status mode: Baseline / Elevated / Active investigation / Multi-county concern
- last refresh time
- reporting completeness status
- active source count
- current season context (respiratory season / arbovirus season / wildfire smoke / heat)

### Left rail: Surveillance systems
A stacked “sensor grid” for public health surveillance inputs:
- Case surveillance
- Wastewater
- Emergency department syndromics
- Hospitalization / ICU pressure
- Lab positivity / typing / sequencing
- Mortality / excess mortality
- Vector surveillance
- Environmental context
- Public health advisories
- Media / verified incident watch

Each row should show:
- signal status dot
- short descriptor
- count / delta / anomaly score
- coverage or data quality tag

### Center: California map / county intelligence surface
Primary map should support:
- county coloring by active signal score
- click for county drilldown
- overlays by syndrome/pathogen
- small badges for alerts, wastewater spikes, hospitalization pressure, vector positives, school or facility cluster markers if supported

Map modes:
- statewide choropleth
- anomaly mode
- respiratory mode
- enteric mode
- vector mode
- healthcare pressure mode

### Right rail: Alert stack + trend cards
- active alerts
- county comparisons
- outbreak watchlist
- trend inflection cards
- notable data caveats

### Bottom / secondary panels
- live ticker for CDPH / county / CDC / WHO / health officer notices
- trend plots
- source-specific detail panes
- "why this is flagged" explanation panel

## 3. Core dashboard modules

### Module A — California epidemiological status board
Should answer:
- What is elevated statewide right now?
- Which counties are unusual?
- Are signals concordant across systems?

Suggested headline cards:
- Respiratory activity
- Gastrointestinal / enteric activity
- Healthcare pressure
- Wastewater anomaly count
- New advisory count
- Multi-county cluster count
- Vector risk status
- Data freshness / completeness

### Module B — County intelligence map
Primary operational map.
Each county should show a composite view with drilldown into:
- current leading signals
- recent deltas
- available sources
- lag/quality notes
- peer county comparison

### Module C — Event watch / incident ticker
A health-specific version of a live ticker.
Should include only evidence-weighted sources, such as:
- CDPH HAN / advisories / updates
- county health officer statements
- CDC notices
- wastewater program updates
- healthcare facility or lab network alerts if available
- curated, verified outbreak reporting notes

### Module D — Signal concordance engine
This is what makes the dashboard genuinely epidemiological.
For each county/pathogen/syndrome, ask:
- Do cases, syndromic data, wastewater, and hospitalization all agree?
- Is only one system elevated?
- Is this a real emerging pattern or a single noisy datapoint?

Suggested outputs:
- Concordant increase
- Early wastewater-only signal
- Syndromic-only bump
- Lab-confirmed uptick
- Healthcare-impacting wave
- Weak / uncertain signal

### Module E — What changed since last sweep?
CRUCIX-like "sweep delta" equivalent.
Useful cards:
- 4 counties newly elevated
- 2 wastewater basins crossed threshold
- 1 county advisory added
- pediatric ED respiratory syndrome increased in 3 regions
- no meaningful statewide changes since last sweep

## 4. Suggested epidemiological domains

### Respiratory
- influenza
- COVID-19
- RSV
- adenovirus where available
- pertussis where relevant

### Enteric / foodborne
- norovirus
- salmonellosis
- shigellosis
- campylobacteriosis
- hepatitis A where relevant

### Vaccine-preventable / cluster-sensitive
- measles
- pertussis
- meningococcal disease

### Vector-borne / seasonal
- West Nile virus
- dengue travel-associated and local concern
- flea/tick related risk where relevant

### Environmental and syndromic overlays
- wildfire smoke exposure context
- heat-related illness
- respiratory ED visits
- gastrointestinal syndrome ED visits

## 5. Evidence and trust design
Every panel should display:
- source type
- reporting lag
- update cadence
- coverage completeness
- confidence tier

Confidence tiers example:
- **High confidence**: concordant multi-source signal with recent data
- **Moderate confidence**: one strong source or two partial sources
- **Low confidence**: sparse, lagged, or contradictory signals
- **Insufficient data**: do not infer trend

## 6. Visual language
Borrow the terminal aesthetic, but adapt it scientifically.

### Keep
- dark ops-terminal look
- strong spatial center panel
- compact signal rails
- status chips
- live sweep / refresh feel

### Change
- less war-room sensationalism
- more uncertainty labeling
- no red flashing everywhere
- use calm scientific severity colors

Suggested palette:
- slate / charcoal base
- cyan for monitored signals
- amber for watch/elevated
- magenta or red only for true high concern
- green only for stable/within expected bounds, used sparingly

## 7. Most important design principle
Do not show raw “danger”. Show:
- **signal**
- **strength**
- **agreement**
- **uncertainty**
- **next analytical question**

That is what will make Epi-Jarvis-Cal actually useful to epidemiologists.
