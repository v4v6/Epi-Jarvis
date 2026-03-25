# Backend notes

## Current status
Initial adapter scaffold created.

## First adapter
- `adapters/cdph_west_nile.py`

## Purpose
This adapter fetches and normalizes current statewide summary metrics from the California West Nile Virus site.

Current extracted fields:
- season label
- last updated text
- human cases
- dead birds
- mosquito samples
- sentinel chickens
- horses
- county counts for each of the above blocks

## Run
```bash
python3 backend/adapters/cdph_west_nile.py
```

## Next backend steps
1. add output writing into `data/raw/` and `data/normalized/`
2. improve parsing robustness
3. inspect map/API endpoints for county-level extraction
4. add adapter interface base class
5. add county advisories registry loader
