#!/usr/bin/env python3
"""Check an exercise translation file against src/data/exercises.json.
Usage: python3 scripts/check-exercise-i18n.py <translations.json> <source-chunk.json>"""
import json, sys
tr = json.load(open(sys.argv[1])); src = json.load(open(sys.argv[2]))
bad = 0
for e in src:
    t = tr.get(e["id"])
    if not t: print("MISSING", e["id"], e["title"]); bad += 1; continue
    if not t.get("title", "").strip(): print("EMPTY TITLE", e["id"]); bad += 1
    if len(t.get("steps", [])) != len(e["steps"]): print("STEP COUNT", e["id"], e["title"], len(t.get("steps", [])), "!=", len(e["steps"])); bad += 1
    elif any(not s.strip() for s in t["steps"]): print("EMPTY STEP", e["id"]); bad += 1
extra = set(tr) - {e["id"] for e in src}
if extra: print("EXTRA IDS", extra); bad += 1
print("OK" if not bad else f"{bad} problem(s)", f"({len(tr)} exercises)")
sys.exit(1 if bad else 0)
