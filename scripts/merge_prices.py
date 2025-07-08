#!/usr/bin/env python3
import csv, json, sys, pathlib

ck_csv, scry_json, out_csv = map(pathlib.Path, sys.argv[1:])

# uuid -> (normal, foil)
price_map = {}
with ck_csv.open() as f:
    for row in csv.DictReader(f):
        price_map[row["uuid"]] = (row["normal"] or None, row["foil"] or None)

# scryfall -> uuid
scry2uuid = json.loads(scry_json.read_text())

with out_csv.open("w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["scryfall_id", "uuid", "normal", "foil"])
    for scry, uuid in scry2uuid.items():
        if uuid in price_map:
            normal, foil = price_map[uuid]
            w.writerow([scry, uuid, normal, foil])