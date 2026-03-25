# Epi-Jarvis-Cal — California data source inventory (v1)

This is the first practical source inventory for building the MVP of **Epi-Jarvis-Cal**.

Important principle: this dashboard should prefer **stable, official, California-relevant surveillance sources** over flashy but brittle feeds.

---

## 1. MVP source strategy

For the first live build, use five source families:

1. **CDPH / county public-health advisories and notices**
2. **California-relevant wastewater surveillance**
3. **Respiratory surveillance (state + federal sources relevant to California)**
4. **Vector-borne surveillance (especially West Nile virus)**
5. **Environmental / healthcare context**

That is enough to create a genuinely useful California surveillance terminal before adding more complexity.

---

## 2. Source inventory table

| Priority | Source family | Likely owner | Geographic level | Signal types | Likely access mode | MVP suitability | Notes |
|---|---|---|---|---|---|---|---|
| 1 | CDPH advisories / disease update pages | CDPH | Statewide | alerts, notices, outbreak updates, disease-specific summaries | HTML pages / RSS if available / manual scrape | High | Best for authoritative alert ticker |
| 1 | County public health advisories | County health departments | County | local outbreaks, health officer notices, school/community warnings | HTML pages / RSS / curated links | High | Important for county intelligence layer |
| 1 | California West Nile Virus site | CDPH / vector surveillance network | State + county/regional map | human cases, dead birds, mosquito pools, sentinel chickens, horses | Website + map endpoints if available | High | Strong California-native vector source |
| 1 | Respiratory surveillance pages and dashboards | CDPH + CDC | State / region / sometimes county | influenza, COVID-19, RSV, ED trends, positivity, hospitalization context | dashboard/API/HTML | High | Core seasonal operations layer |
| 1 | Wastewater surveillance sources for California | CDPH and/or partner dashboards | plant / sewershed / county proxy | pathogen concentration, trend, anomaly, persistence | dashboard/API/CSV if available | High | Early-signal layer |
| 2 | CDC wastewater and respiratory surveillance relevant to California | CDC | state / regional / sewershed dependent | wastewater, respiratory activity, test positivity, hospitalization context | API/dashboard | High | Useful if state source is incomplete |
| 2 | HHS hospital / capacity / respiratory admission context | HHS / CDC ecosystem | state / county / hospital-referral context | hospital pressure, admissions, bed stress | API/CSV/dashboard | Medium-High | Good context, often lagged |
| 2 | Syndromic / ED indicators | state or federal public dashboards | state / region / county if public | respiratory syndrome, GI syndrome, heat illness | dashboard/API/CSV | High if public | One of the best early-warning layers |
| 2 | Air quality / smoke | CARB / EPA / AirNow / local districts | statewide / county / local | AQI, smoke episodes, PM2.5 context | API | Medium-High | Good confounder/context layer |
| 2 | Heat / weather context | NOAA / NWS / state climate sources | county / region | heat risk, temperature anomalies | API | Medium | Important for syndromic interpretation |
| 2 | Mortality / excess mortality context | CDC / state vital stats | state / region / county where public | mortality trend, excess mortality | dashboard/API | Medium | Valuable but often delayed |
| 2 | Vaccine-preventable disease pages | CDPH | statewide | measles, pertussis, meningococcal disease updates | HTML pages | Medium-High | Good alert-driven source |
| 3 | Foodborne / enteric disease updates | CDPH + counties | statewide / county | norovirus, Salmonella, Shigella, hepatitis A notices | HTML pages / advisories | Medium | High value, less structured |
| 3 | School or institutional outbreak notices | counties / schools / institutions | local | outbreaks, closures, cluster reports | HTML/manual curation | Medium-Low | Useful but messy and inconsistent |
| 3 | Curated media context | trusted media only | statewide / county / incident-specific | context only, never primary evidence | RSS/manual curation | Low | Use only as supplement |

---

## 3. Concrete source candidates already identified

## A. California West Nile Virus Website
**URL:** `https://westnile.ca.gov/`

What it provides:
- statewide annual activity summary
- human cases
- dead birds
- mosquito samples
- sentinel chickens
- horse cases
- interactive maps / vector surveillance links

Why it matters:
- this is an unusually strong California-native surveillance source
- it has clear operational value
- it maps cleanly into county/regional vector risk layers

Recommended use in Epi-Jarvis-Cal:
- vector-borne watch module
- statewide status card
- county/regional drill-down if map endpoints can be extracted
- event ticker for first detections / seasonal escalation

MVP rating: **Excellent**

---

## B. CDPH disease-specific advisory and update pages
Examples likely worth inventorying immediately:
- respiratory viruses
- measles
- pertussis
- foodborne disease notices
- public health advisories / health officer updates

Why they matter:
- authoritative
- interpretable
- ideal for the alert stack and "what changed since last sweep" module

Recommended use:
- build a curated advisory ingester
- do not wait for perfect APIs
- begin with stable pages and explicit manual-source registry

MVP rating: **Excellent**

---

## C. Wastewater surveillance sources relevant to California
Current status:
- this is clearly a core requirement for the dashboard
- exact stable endpoint(s) still need source-by-source confirmation
- likely candidates include state-operated dashboards, CDC-linked surveillance, or partner dashboards used by California jurisdictions

What to capture once confirmed:
- pathogen target
- sewershed / plant / county mapping
- measurement units
- reporting lag
- update cadence
- trend vs baseline logic

Recommended use:
- early-signal layer
- concordance engine input
- county cards should distinguish:
  - wastewater-only elevation
  - concordant wastewater + syndromic rise
  - declining wastewater with lagging healthcare burden

MVP rating: **Critical**

Action item:
- do a dedicated source-confirmation pass for California wastewater endpoints before coding the ingestion pipeline.

---

## D. Respiratory surveillance sources
This source family should include, as available:
- influenza activity
- COVID-19 activity
- RSV activity
- ED respiratory syndrome indicators
- hospitalization / severe disease context
- positivity / laboratory indicators

Recommended product role:
- statewide respiratory board
- county/regional respiratory watch
- season-mode context in top bar

Critical note:
- respiratory systems often have different lags and denominators
- the UI must never pretend these are synchronized if they are not

MVP rating: **Critical**

---

## E. Astronaut-style “sensor grid” equivalent for epidemiology
Translate the left-rail sensor concept into the following California public-health sensors:

1. Case surveillance
2. Wastewater
3. ED respiratory syndromics
4. ED GI syndromics
5. Hospital admissions / pressure
6. Lab positivity / sequencing
7. Vector surveillance
8. Air quality / smoke
9. Heat stress context
10. Advisories / outbreak notices

Each should show:
- signal state
- freshness
- coverage
- confidence
- delta from prior sweep

---

## 4. Recommended MVP source registry structure

Create one registry row per source:

```json
{
  "source_id": "cdph_west_nile",
  "name": "California West Nile Virus Website",
  "owner": "CDPH",
  "url": "https://westnile.ca.gov/",
  "domain": "vector",
  "geo_level": ["state", "county_or_region_if_available"],
  "update_cadence": "seasonal/regular",
  "access_mode": "html_or_map_endpoint",
  "signal_types": ["human_cases", "dead_birds", "mosquito_pools", "sentinel_chickens"],
  "mvp_priority": "high",
  "confidence": "high",
  "notes": "Strong candidate for first live integration"
}
```

---

## 5. Recommended build order for real integrations

### Phase 1 — easiest high-value integrations
1. California West Nile source
2. CDPH advisory pages
3. selected county advisory pages

### Phase 2 — operational surveillance layers
4. respiratory dashboard(s)
5. wastewater source(s)
6. environmental confounders (AQI / smoke / heat)

### Phase 3 — richer concordance engine
7. hospitalization / severe disease context
8. low-lag syndromic indicators
9. lab typing / sequencing where public

### Phase 4 — optional expansions
10. enteric event watch
11. school/institution cluster watch
12. mortality / excess mortality context

---

## 6. What should be built first in code

Before coding the whole dashboard, build these files:

- `data/source_registry.json`
- `data/county_registry.json`
- `backend/adapters/` for source-specific parsers
- `backend/normalizers/` for converting raw data into common signal objects

And define these first source adapters:
1. `cdph_west_nile`
2. `cdph_advisories`
3. `county_advisories`
4. `respiratory_surveillance`
5. `wastewater_surveillance`

---

## 7. Immediate next recommendation
The next smart step is to make this inventory concrete by creating:

1. a **source registry file template**, and
2. a **county advisory source list for California counties / major counties**, and
3. a **UI wireframe that assumes these exact source families**.

That will move Epi-Jarvis-Cal from concept into buildable architecture.
