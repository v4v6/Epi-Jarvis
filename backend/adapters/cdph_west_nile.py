#!/usr/bin/env python3
"""
CDPH West Nile adapter for Epi-Jarvis-Cal.

Current scope:
- fetch homepage summary metrics from https://westnile.ca.gov/
- parse statewide current-season summary
- emit normalized JSON for downstream dashboard use

This is intentionally a first adapter, not a full crawler.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from io import StringIO

import pandas as pd
import requests
from bs4 import BeautifulSoup

URL = "https://westnile.ca.gov/"


@dataclass
class WestNileSummary:
    source_id: str
    source_name: str
    fetched_at: str
    source_url: str
    season_label: Optional[str]
    last_updated_text: Optional[str]
    human_cases: Optional[int]
    dead_birds: Optional[int]
    mosquito_samples: Optional[int]
    sentinel_chickens: Optional[int]
    horses: Optional[int]
    human_case_counties: Optional[int]
    dead_bird_counties: Optional[int]
    mosquito_sample_counties: Optional[int]
    sentinel_chicken_counties: Optional[int]
    horse_counties: Optional[int]


@dataclass
class CountyWestNileCounts:
    county: str
    human_cases: Optional[int]
    dead_birds: Optional[int]
    mosquito_samples: Optional[int]
    sentinel_chickens: Optional[int]
    horses: Optional[int]


def fetch_html(url: str = URL) -> str:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return r.text


def clean_int(text: str) -> Optional[int]:
    if text is None:
        return None
    m = re.sub(r"[^0-9]", "", text)
    return int(m) if m else None


def extract_lines(html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n", strip=True)
    return [line.strip() for line in text.splitlines() if line.strip()]


def extract_summary(html: str) -> WestNileSummary:
    lines = extract_lines(html)

    def find_index(value: str, start: int = 0) -> Optional[int]:
        for i, line in enumerate(lines[start:], start=start):
            if line == value:
                return i
        return None

    season_label = None
    idx_wnv = find_index("West Nile Virus Activity")
    if idx_wnv is not None and idx_wnv > 0:
        season_label = lines[idx_wnv - 1]

    last_updated_text = None
    idx_last = find_index("Last Updated:")
    if idx_last is not None and idx_last + 2 < len(lines):
        last_updated_text = f"{lines[idx_last + 1]} {lines[idx_last + 2]}"

    weekly_updates_idx = find_index("Weekly Updates") or 0

    block_labels = {"Human Cases", "Dead Birds", "Mosquito Samples", "Sentinel Chickens", "Horses", "WNV Case Counts by County"}

    def year_to_date_value(block_label: str) -> tuple[Optional[int], Optional[int]]:
        idx = find_index(block_label, start=weekly_updates_idx)
        if idx is None:
            return None, None
        value = None
        counties = None
        j = idx + 1
        while j < len(lines):
            if lines[j] in block_labels and lines[j] != block_label:
                break
            if lines[j] == "Year-to-date:" and j + 1 < len(lines):
                value = clean_int(lines[j + 1])
            if lines[j] == "Counties:" and j + 1 < len(lines):
                counties = clean_int(lines[j + 1])
            j += 1
        return value, counties

    human_cases, human_case_counties = year_to_date_value("Human Cases")
    dead_birds, dead_bird_counties = year_to_date_value("Dead Birds")
    mosquito_samples, mosquito_sample_counties = year_to_date_value("Mosquito Samples")
    sentinel_chickens, sentinel_chicken_counties = year_to_date_value("Sentinel Chickens")
    horses, horse_counties = year_to_date_value("Horses")

    return WestNileSummary(
        source_id="cdph_west_nile",
        source_name="California West Nile Virus Website",
        fetched_at=datetime.now(timezone.utc).isoformat(),
        source_url=URL,
        season_label=season_label,
        last_updated_text=last_updated_text,
        human_cases=human_cases,
        dead_birds=dead_birds,
        mosquito_samples=mosquito_samples,
        sentinel_chickens=sentinel_chickens,
        horses=horses,
        human_case_counties=human_case_counties,
        dead_bird_counties=dead_bird_counties,
        mosquito_sample_counties=mosquito_sample_counties,
        sentinel_chicken_counties=sentinel_chicken_counties,
        horse_counties=horse_counties,
    )


def extract_county_counts(html: str) -> list[CountyWestNileCounts]:
    tables = pd.read_html(StringIO(html))
    if not tables:
        return []

    table = tables[0].copy()
    table = table.rename(columns={table.columns[0]: "county"})
    table = table[table["county"].notna()]
    table["county"] = table["county"].astype(str).str.strip()
    table = table[(table["county"] != "State Totals") & (table["county"].str.lower() != "nan")]

    def norm_num(value):
        if pd.isna(value):
            return None
        try:
            return int(value)
        except Exception:
            return clean_int(str(value))

    results: list[CountyWestNileCounts] = []
    for _, row in table.iterrows():
        results.append(CountyWestNileCounts(
            county=row["county"],
            human_cases=norm_num(row.get("Human Cases")),
            dead_birds=norm_num(row.get("Dead Birds")),
            mosquito_samples=norm_num(row.get("Mosquito Samples")),
            sentinel_chickens=norm_num(row.get("Sentinel Chickens")),
            horses=norm_num(row.get("Horses")),
        ))
    return results


def main() -> None:
    html = fetch_html()
    summary = extract_summary(html)
    county_counts = extract_county_counts(html)
    payload = json.dumps(asdict(summary), indent=2)
    county_payload = json.dumps([asdict(x) for x in county_counts], indent=2)

    project_root = Path(__file__).resolve().parents[2]
    raw_dir = project_root / "data" / "raw"
    norm_dir = project_root / "data" / "normalized"
    raw_dir.mkdir(parents=True, exist_ok=True)
    norm_dir.mkdir(parents=True, exist_ok=True)

    (raw_dir / "cdph_west_nile.html").write_text(html)
    (norm_dir / "cdph_west_nile_summary.json").write_text(payload)
    (norm_dir / "cdph_west_nile_counties.json").write_text(county_payload)

    print(json.dumps({
        "summary": asdict(summary),
        "county_count": len(county_counts),
        "sample_counties": [asdict(x) for x in county_counts[:5]]
    }, indent=2))


if __name__ == "__main__":
    main()
