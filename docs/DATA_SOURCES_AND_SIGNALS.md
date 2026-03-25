# Epi-Jarvis-Cal — Data sources and signal model

## 1. California-first source classes

### Tier 1 — Core public-health surveillance
Highest priority sources for MVP:
- CDPH dashboards and surveillance pages
- California wastewater surveillance sources
- CDC state-level surveillance feeds relevant to California
- county public health department dashboards / advisories
- HHS / NHSN hospitalization indicators if applicable
- emergency department syndromic indicators where public

### Tier 2 — Strong contextual sources
- mortality / excess mortality feeds
- weather / heat context
- air quality / wildfire smoke context
- mosquito/vector surveillance feeds
- school absenteeism if legitimately available and stable

### Tier 3 — Curated event feeds
- CDPH news / health advisories
- county health officer notices
- CDC HAN / outbreak notices
- WHO outbreak notices relevant to travel/importation context
- trusted media only as context, never as primary disease evidence

## 2. Signal classes
Each incoming data source should map to a signal class.

### A. Burden signals
- cases
- case rate
- test positivity
- hospital admissions
- ICU load
- mortality

### B. Early signals
- wastewater concentration
- syndromic ED visits
- hotline/search/community reporting if ever added and carefully labeled

### C. Confirmation / characterization signals
- lab subtype / lineage / sequencing
- outbreak investigation notes
- facility cluster confirmation
- vector positive pools

### D. Context signals
- reporting lag
- completeness
- holiday distortion
- smoke / heat / school reopening / travel context

## 3. Signal object schema
Recommended internal schema for any dashboard event:

```json
{
  "signal_id": "string",
  "county": "Los Angeles",
  "region": "Southern California",
  "domain": "respiratory",
  "topic": "influenza",
  "signal_type": "wastewater",
  "metric_name": "normalized_concentration",
  "value": 1.82,
  "baseline_comparison": "+2.1 SD",
  "trend": "rising",
  "confidence": "moderate",
  "concordance": "partial",
  "data_lag_days": 4,
  "coverage": "good",
  "source": "CDPH wastewater",
  "updated_at": "ISO-8601",
  "explanation": "Wastewater rose above recent baseline while ED respiratory trend is flat and hospitalization data are lagged."
}
```

## 4. Composite county signal score
Do not build a black-box score. Build a transparent weighted summary.

Suggested components:
- anomaly magnitude
- persistence across time
- concordance across systems
- severity relevance
- source quality
- timeliness

Output should be decomposable, e.g.:
- burden score
- growth score
- concordance score
- confidence score

## 5. Alert logic examples

### Example: respiratory watch
Trigger a county respiratory watch when:
- wastewater rises above threshold AND
- syndromic respiratory visits increase OR test positivity rises

### Example: enteric cluster watch
Trigger when:
- county advisory published OR
- unusual GI syndrome activity + foodborne report + neighboring county increase

### Example: vector alert
Trigger when:
- positive vector pools increase AND
- human cases reported OR strong environmental suitability signal

## 6. Critical caution rules
- Never compare sources with different lags without labeling lag.
- Never treat media reports as outbreak confirmation.
- Never hide missingness.
- Never smooth away meaningful discontinuities without annotation.
- Never present a composite score without showing the components.

## 7. MVP recommendation
For the first version, focus on 5 dependable streams:
1. county/state advisories
2. wastewater
3. respiratory syndromic / hospitalization proxy
4. selected reportable disease updates
5. vector/environmental context

That is enough to make the dashboard useful before adding more complexity.
