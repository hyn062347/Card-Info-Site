#!/usr/bin/env python3
import csv, os, psycopg2, sys
from psycopg2.extras import execute_batch

csv_path = sys.argv[1]
conn = psycopg2.connect(os.environ["DATABASE_URL"])
cur  = conn.cursor()

# 테이블이 없으면 생성
cur.execute("""
CREATE TABLE IF NOT EXISTS card_prices (
  scryfall_id UUID PRIMARY KEY,
  uuid        UUID  NOT NULL,
  normal      NUMERIC,
  foil        NUMERIC,
  updated_at  TIMESTAMPTZ DEFAULT now()
)
""")

rows = []
with open(csv_path) as f:
    r = csv.DictReader(f)
    for row in r:
        rows.append((
            row["scryfall_id"], row["uuid"],
            row["normal"] or None, row["foil"] or None
        ))

execute_batch(cur, """
INSERT INTO card_prices (scryfall_id, uuid, normal, foil)
VALUES (%s, %s, %s, %s)
ON CONFLICT (scryfall_id) DO UPDATE
  SET uuid       = EXCLUDED.uuid,
      normal     = EXCLUDED.normal,
      foil       = EXCLUDED.foil,
      updated_at = now();
""", rows)

conn.commit()
conn.close()